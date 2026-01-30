# Skill: TanStack Query Patterns

## Overview

TanStack Query (React Query) manages server state — data that lives on the backend and is fetched, cached, and synchronized. We use it for all API data fetching in the frontend. Client-only state (UI toggles, form inputs) goes in Zustand instead.

## File Structure

```
apps/web/src/lib/api/
├── client.ts                   # Base fetch wrapper
├── {resource}.ts               # Query hooks per resource
└── keys.ts                     # (optional) Centralized query keys
```

## Query Key Conventions

Query keys must be deterministic and hierarchical. Use a factory pattern:

```tsx
// Per-resource key factory
const taskKeys = {
  all:    ['tasks'] as const,
  lists:  () => [...taskKeys.all, 'list'] as const,
  list:   (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details:() => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};
```

This enables granular cache invalidation:
```tsx
// Invalidate all task queries
queryClient.invalidateQueries({ queryKey: taskKeys.all });

// Invalidate only task lists (not details)
queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

// Invalidate one specific task
queryClient.invalidateQueries({ queryKey: taskKeys.detail('task-1') });
```

## Query Patterns

### Basic Query

```tsx
import { useQuery } from '@tanstack/react-query';
import type { TaskListResponse } from '@shared/types/task';

export function useGetTasks() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: async (): Promise<TaskListResponse> => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });
}
```

### Query with Parameters

```tsx
export function useGetTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async (): Promise<Task> => {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    },
    enabled: !!id, // Don't run if id is falsy
  });
}
```

### Dependent Queries

```tsx
export function useGetTaskComments(taskId: string) {
  const { data: task } = useGetTask(taskId);

  return useQuery({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: () => fetchComments(taskId),
    enabled: !!task, // Only fetch comments after task loads
  });
}
```

## Mutation Patterns

### Basic Mutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskRequest, Task } from '@shared/types/task';

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest): Promise<Task> => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message ?? 'Failed to create task');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate task lists so they refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

### Optimistic Updates

```tsx
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTaskInput): Promise<Task> => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onMutate: async (updatedTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(updatedTask.id) });

      // Snapshot previous value
      const previousTask = queryClient.getQueryData(taskKeys.detail(updatedTask.id));

      // Optimistically update
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), (old: Task) => ({
        ...old,
        ...updatedTask,
      }));

      return { previousTask };
    },
    onError: (_err, updatedTask, context) => {
      // Rollback on error
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), context?.previousTask);
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
    },
  });
}
```

## Using Hooks in Components

```tsx
'use client';

import { useGetTasks } from '@/lib/api/task';
import { useCreateTask } from '@/lib/api/task';
import { TaskList } from '@/components/TaskList';

export function TasksPage() {
  const { data, isLoading, error } = useGetTasks();
  const createTask = useCreateTask();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      <TaskList tasks={data.data} />
      <button
        onClick={() => createTask.mutate({ title: 'New Task' })}
        disabled={createTask.isPending}
      >
        {createTask.isPending ? 'Creating...' : 'Add Task'}
      </button>
      {createTask.isError && <ErrorMessage message={createTask.error.message} />}
    </div>
  );
}
```

## QueryClient Configuration

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // Data fresh for 1 minute
      gcTime: 5 * 60 * 1000,     // Cache kept for 5 minutes
      retry: 1,                   // Retry once on failure
      refetchOnWindowFocus: false, // Disable for less aggressive refetching
    },
  },
});
```

## Common Pitfalls

1. **Using string query keys** — Always use the factory pattern. String keys like `'tasks'` make invalidation error-prone.

2. **Not handling all states** — Every `useQuery` returns `isLoading`, `error`, and `data`. Handle all three in the component.

3. **Putting server data in Zustand** — TanStack Query IS the cache for server data. Don't duplicate it in Zustand. Use Zustand only for client-only state (UI state, selections, form state).

4. **Missing `enabled` flag** — Queries run immediately by default. Use `enabled: false` to defer until dependencies are ready.

5. **Not invalidating after mutations** — Always invalidate related queries in `onSuccess` or `onSettled` so the UI stays in sync.

6. **Error not thrown in queryFn** — `fetch` doesn't throw on HTTP errors. Always check `res.ok` and throw explicitly.

## Testing Notes

- In tests, create a fresh `QueryClient` per test with `retry: false`
- Wrap components in `QueryClientProvider` in test setup
- Use MSW to mock API responses (see `msw-mocking` skill)
- Test loading, success, and error states by controlling MSW responses
