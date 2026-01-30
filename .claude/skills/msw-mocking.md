# Skill: MSW (Mock Service Worker) Patterns

## Overview

MSW intercepts network requests at the service worker level (browser) or using node interceptors (tests). We use it to mock API responses during frontend development (Phases 1–3) before the real backend exists, and in tests to control API behavior.

## File Structure

```
apps/web/src/mocks/
├── browser.ts                  # Browser service worker setup
├── node.ts                     # Node.js server setup (for tests)
├── handlers.ts                 # Aggregates all handlers
└── handlers/
    ├── {resource}.ts           # Handlers per resource
    └── {resource}.data.ts      # Mock data (optional, for complex data)
```

## Handler Setup

### Per-Resource Handlers

```tsx
// mocks/handlers/task.ts
import { http, HttpResponse, delay } from 'msw';
import type { Task, CreateTaskRequest, TaskListResponse } from '@shared/types/task';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Set up project',
    status: 'completed',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Build UI components',
    status: 'active',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const taskHandlers = [
  // GET /api/tasks — list all tasks
  http.get('/api/tasks', async () => {
    await delay(150); // Simulate network latency
    return HttpResponse.json<TaskListResponse>({
      data: mockTasks,
      total: mockTasks.length,
    });
  }),

  // GET /api/tasks/:id — get single task
  http.get('/api/tasks/:id', async ({ params }) => {
    await delay(100);
    const task = mockTasks.find((t) => t.id === params.id);
    if (!task) {
      return HttpResponse.json(
        { message: `Task ${params.id} not found` },
        { status: 404 }
      );
    }
    return HttpResponse.json(task);
  }),

  // POST /api/tasks — create task
  http.post('/api/tasks', async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as CreateTaskRequest;
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...body,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  // DELETE /api/tasks/:id — delete task
  http.delete('/api/tasks/:id', async ({ params }) => {
    await delay(100);
    const index = mockTasks.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { message: `Task ${params.id} not found` },
        { status: 404 }
      );
    }
    mockTasks.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
```

### Aggregate Handlers

```tsx
// mocks/handlers.ts
import { taskHandlers } from './handlers/task';
// import other resource handlers...

export const handlers = [
  ...taskHandlers,
  // ...otherHandlers,
];
```

## Browser Setup (Development)

```tsx
// mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

Initialize conditionally in the app:

```tsx
// app/layout.tsx or a Providers component
async function initMocks() {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
    const { worker } = await import('@/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}
```

## Node Setup (Tests)

```tsx
// mocks/node.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

Use in test setup:

```tsx
// vitest.setup.ts or per-test
import { server } from '@/mocks/node';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Dynamic Test Overrides

Override handlers per test for specific scenarios:

```tsx
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/node';

it('shows error state when API fails', async () => {
  // Override the default handler for this test only
  server.use(
    http.get('/api/tasks', () => {
      return HttpResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    })
  );

  render(<TasksPage />);
  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

it('shows empty state when no tasks exist', async () => {
  server.use(
    http.get('/api/tasks', () => {
      return HttpResponse.json({ data: [], total: 0 });
    })
  );

  render(<TasksPage />);
  await waitFor(() => {
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });
});

it('shows loading state', async () => {
  server.use(
    http.get('/api/tasks', async () => {
      await delay('infinite'); // Never resolves
      return HttpResponse.json({ data: [] });
    })
  );

  render(<TasksPage />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

## Request Matching

```tsx
// Exact path
http.get('/api/tasks', handler)

// Path parameters
http.get('/api/tasks/:id', ({ params }) => {
  const { id } = params; // string
})

// Query parameters
http.get('/api/tasks', ({ request }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const filtered = mockTasks.filter(t => !status || t.status === status);
  return HttpResponse.json({ data: filtered, total: filtered.length });
})

// Request body
http.post('/api/tasks', async ({ request }) => {
  const body = await request.json();
})

// Request headers
http.get('/api/tasks', ({ request }) => {
  const auth = request.headers.get('Authorization');
  if (!auth) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
})
```

## Common Pitfalls

1. **Mutating shared mock data** — If handlers mutate a shared array, tests affect each other. Use `server.resetHandlers()` in `afterEach` and consider fresh data per test.

2. **Forgetting `onUnhandledRequest`** — Set to `'error'` in tests to catch unhandled requests. Set to `'bypass'` in browser development to allow unrelated requests through.

3. **Not using `delay()`** — Without delay, loading states flash too fast to test. Add realistic delays in development handlers, but keep them short in tests.

4. **Wrong import path** — Use `msw/browser` for browser, `msw/node` for tests. Mixing them causes runtime errors.

5. **Handler order matters** — MSW matches the first handler that matches the request. More specific handlers should be added later (via `server.use()`) to override defaults.

6. **Missing typed responses** — Use `HttpResponse.json<Type>(data)` to type-check mock responses match the expected API contract.
