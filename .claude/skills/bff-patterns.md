# Skill: Backend-for-Frontend (BFF) Patterns

## Overview

The BFF pattern means the backend API is designed specifically for the frontend's needs. We use shared TypeScript types between frontend and backend to enforce the API contract. This skill covers response structures, error formats, pagination, and how the shared types library bridges both sides.

## Shared Types Library

```
libs/shared/src/
├── types/
│   ├── {resource}.ts         # Per-resource types
│   └── common.ts             # Shared patterns (pagination, errors)
└── index.ts                  # Barrel export
```

### Common Types

```tsx
// libs/shared/src/types/common.ts

/** Standard list response with pagination metadata */
export interface ListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** Standard error response */
export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;         // Error type (e.g., "Not Found")
  details?: string[];     // Validation error details
}

/** Standard timestamps on all resources */
export interface Timestamps {
  createdAt: string;      // ISO 8601 format
  updatedAt: string;      // ISO 8601 format
}
```

### Resource Types

```tsx
// libs/shared/src/types/task.ts
import type { Timestamps, ListResponse } from './common';

/** API response for a single task */
export interface Task extends Timestamps {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
}

/** Request body to create a task */
export interface CreateTaskRequest {
  title: string;
  description?: string;
}

/** Request body to update a task */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'completed';
}

/** API response for task list */
export type TaskListResponse = ListResponse<Task>;
```

## Response Contract Rules

### Timestamps Are Strings

The API returns ISO 8601 strings, not Date objects. Dates get serialized to strings in JSON anyway — making it explicit prevents confusion.

```tsx
// Backend service converts Date → string
private toResponse(entity: TaskEntity): Task {
  return {
    id: entity.id,
    title: entity.title,
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),  // Date → string
    updatedAt: entity.updatedAt.toISOString(),
  };
}
```

### IDs Are Strings

Even if the database uses UUIDs or integers internally, the API always returns `id: string`. This keeps the frontend decoupled from database implementation.

### Null vs Undefined

- **API responses** use `undefined` (omit the field) for optional missing values
- **Request bodies** use `undefined` for "don't change this field"
- Never send `null` in requests or responses unless it means "explicitly clear this value"

## Error Format

All errors follow the NestJS exception format:

```json
{
  "statusCode": 404,
  "message": "Task with id abc not found",
  "error": "Not Found"
}
```

For validation errors:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "title must not be empty",
    "title must be shorter than 200 characters"
  ]
}
```

### Frontend Error Handling

```tsx
export function useCreateTask() {
  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error: ErrorResponse = await res.json();
        throw new Error(error.message);
      }
      return res.json() as Promise<Task>;
    },
  });
}

// In component:
const { mutate, error } = useCreateTask();
// error.message contains the backend's error message
```

## Pagination

### Request

Pagination is passed as query parameters:

```
GET /api/tasks?page=1&pageSize=20&sort=createdAt&order=desc
```

### Response

```tsx
// Always return total count with paginated results
{
  "data": [...],
  "total": 142,
  "page": 1,
  "pageSize": 20
}
```

### Frontend Hook

```tsx
export function useGetTasks(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: taskKeys.list(params ?? {}),
    queryFn: async (): Promise<TaskListResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await fetch(`/api/tasks?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });
}
```

### Backend Controller

```tsx
@Get()
async findAll(
  @Query('page') page?: string,
  @Query('pageSize') pageSize?: string,
): Promise<TaskListResponse> {
  const pageNum = page ? parseInt(page, 10) : 1;
  const size = pageSize ? parseInt(pageSize, 10) : 20;
  return this.taskService.findAll({ page: pageNum, pageSize: size });
}
```

## API Versioning

For this starter, we keep it simple — no URL versioning. If needed later, prefix routes:

```tsx
@Controller('api/v1/tasks')  // versioned
@Controller('api/tasks')      // current (default)
```

## Type Sharing Workflow

1. **Define types in `libs/shared/`** — Single source of truth
2. **Backend imports for response types** — Services return `Task`, controllers return `TaskListResponse`
3. **Frontend imports for hook types** — `useQuery<TaskListResponse>`, `useMutation<Task, CreateTaskRequest>`
4. **MSW imports for mock data** — Handlers return data typed as `Task`

```
libs/shared/src/types/task.ts
    ↓ imported by
apps/api/.../task.service.ts    (toResponse returns Task)
apps/web/.../api/task.ts        (hooks typed with Task)
apps/web/.../mocks/handlers/    (mock data typed as Task)
```

## Common Pitfalls

1. **Different types on frontend and backend** — Never define response types separately. Always import from `libs/shared/`.

2. **Returning Date objects** — JSON serializes Date to string anyway. Be explicit: the API contract uses ISO strings, not Dates.

3. **Inconsistent error format** — Use NestJS's built-in exception classes. They automatically produce the standard error response format.

4. **Missing total count** — List endpoints must always return `total` for pagination UI to work.

5. **camelCase vs snake_case** — The API uses camelCase everywhere (TypeScript convention). If the database uses snake_case, transform in the repository or schema.

6. **Not validating request bodies** — Always use DTOs with class-validator on the backend. Never trust frontend input.
