# Skill: Zustand State Management

## Overview

Zustand manages **client-only state** — UI toggles, selections, form inputs, sidebar open/close, active tabs. Server data (anything fetched from an API) lives in TanStack Query, not Zustand.

## File Structure

```
apps/web/src/stores/
├── {feature}.ts              # One store per feature
└── __tests__/
    └── {feature}.test.ts
```

## Store Creation

### Basic Store

```tsx
import { create } from 'zustand';

interface TaskUIState {
  // State
  selectedTaskId: string | null;
  isCreateFormOpen: boolean;
  filterStatus: 'all' | 'active' | 'completed';

  // Actions
  selectTask: (id: string | null) => void;
  toggleCreateForm: () => void;
  setFilterStatus: (status: TaskUIState['filterStatus']) => void;
  reset: () => void;
}

const initialState = {
  selectedTaskId: null,
  isCreateFormOpen: false,
  filterStatus: 'all' as const,
};

export const useTaskUIStore = create<TaskUIState>((set) => ({
  ...initialState,

  selectTask: (id) => set({ selectedTaskId: id }),
  toggleCreateForm: () => set((state) => ({ isCreateFormOpen: !state.isCreateFormOpen })),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  reset: () => set(initialState),
}));
```

### Store with Derived State (Selectors)

Define selectors outside the store for reusability:

```tsx
// Selectors — can compose with TanStack Query data
export const selectIsTaskSelected = (state: TaskUIState) => state.selectedTaskId !== null;
export const selectActiveFilter = (state: TaskUIState) => state.filterStatus;
```

Use in components:

```tsx
// GOOD — subscribes only to the slice it needs
const selectedTaskId = useTaskUIStore((state) => state.selectedTaskId);
const isSelected = useTaskUIStore(selectIsTaskSelected);

// BAD — subscribes to entire store, re-renders on any change
const store = useTaskUIStore();
```

## Middleware

### DevTools (Development Only)

```tsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useTaskUIStore = create<TaskUIState>()(
  devtools(
    (set) => ({
      // ... state and actions
    }),
    { name: 'TaskUIStore' }
  )
);
```

### Persist (LocalStorage)

Only persist state that should survive page refreshes:

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const usePreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'user-preferences', // localStorage key
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }), // Only persist these fields, not actions
    }
  )
);
```

## Using Stores in Components

```tsx
'use client';

import { useTaskUIStore } from '@/stores/task';
import { useGetTasks } from '@/lib/api/task';
import { TaskList } from '@/components/TaskList';
import { TaskDetail } from '@/components/TaskDetail';
import { CreateTaskForm } from '@/components/CreateTaskForm';

export function TasksPage() {
  const { data } = useGetTasks();
  const selectedTaskId = useTaskUIStore((s) => s.selectedTaskId);
  const selectTask = useTaskUIStore((s) => s.selectTask);
  const isCreateFormOpen = useTaskUIStore((s) => s.isCreateFormOpen);
  const toggleCreateForm = useTaskUIStore((s) => s.toggleCreateForm);

  return (
    <div className="flex">
      <TaskList
        tasks={data?.data ?? []}
        selectedId={selectedTaskId}
        onSelect={selectTask}
      />
      {selectedTaskId && <TaskDetail id={selectedTaskId} />}
      <button onClick={toggleCreateForm}>New Task</button>
      {isCreateFormOpen && <CreateTaskForm onClose={toggleCreateForm} />}
    </div>
  );
}
```

## Combining with TanStack Query

The boundary is clear:
- **TanStack Query** = server state (fetched data, loading/error states)
- **Zustand** = client state (UI selections, form state, preferences)

They work together but never overlap:

```tsx
// Zustand holds the selected filter
const filterStatus = useTaskUIStore((s) => s.filterStatus);

// TanStack Query fetches data based on that filter
const { data } = useGetTasks({ status: filterStatus });
```

## Testing Stores

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskUIStore } from '../task';

describe('useTaskUIStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useTaskUIStore.getState().reset();
  });

  it('selects a task', () => {
    useTaskUIStore.getState().selectTask('task-1');
    expect(useTaskUIStore.getState().selectedTaskId).toBe('task-1');
  });

  it('toggles create form', () => {
    expect(useTaskUIStore.getState().isCreateFormOpen).toBe(false);
    useTaskUIStore.getState().toggleCreateForm();
    expect(useTaskUIStore.getState().isCreateFormOpen).toBe(true);
  });

  it('resets to initial state', () => {
    useTaskUIStore.getState().selectTask('task-1');
    useTaskUIStore.getState().toggleCreateForm();
    useTaskUIStore.getState().reset();

    expect(useTaskUIStore.getState().selectedTaskId).toBeNull();
    expect(useTaskUIStore.getState().isCreateFormOpen).toBe(false);
  });
});
```

## Common Pitfalls

1. **Storing server data in Zustand** — If data comes from an API, it belongs in TanStack Query. Zustand duplicating server data leads to stale data bugs.

2. **Subscribing to the whole store** — Always use a selector: `useStore((s) => s.field)`. Without a selector, the component re-renders on every store change.

3. **Not resetting stores in tests** — Zustand stores are singletons. Always reset in `beforeEach` to avoid test pollution.

4. **Complex computed state in stores** — Keep stores simple. Derive computed values in selectors or in the component. Don't store derived state.

5. **Forgetting `partialize` with persist** — Without `partialize`, the persist middleware serializes action functions too. Always specify which fields to persist.
