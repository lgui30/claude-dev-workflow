# Phase Commits: Todo Feature (US-001)

This document shows what each phase produced when building the todo list feature through the 7-phase workflow.

---

## Phase 1: Presentational UI

**Commit:** `feat(ui): add todo list UI components`

### Files Created

| File | Description |
|------|-------------|
| `apps/web/src/components/TodoItem.tsx` | Single todo row with toggle and delete buttons |
| `apps/web/src/components/TodoList.tsx` | List of TodoItems with empty state |
| `apps/web/src/components/TodoForm.tsx` | Input form to create a new todo |
| `apps/web/src/components/__tests__/TodoItem.test.tsx` | 5 tests: rendering, styles, toggle, delete |
| `apps/web/src/components/__tests__/TodoList.test.tsx` | 3 tests: empty state, list rendering, completed styling |
| `apps/web/src/components/__tests__/TodoForm.test.tsx` | 4 tests: submit, clear, empty reject, whitespace reject |

### What This Phase Demonstrates

- Pure components with no API calls or state management
- TypeScript props interfaces for type safety
- Tailwind CSS for styling
- Accessible markup with ARIA labels
- All components under 80 lines
- Tests written after implementation to lock in behavior

---

## Phase 2: API Client & Mocks

**Commit:** `feat(api-client): add todo API hooks with MSW mocks`

### Files Created

| File | Description |
|------|-------------|
| `libs/shared/src/types/todo.ts` | `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `TodoListResponse` |
| `apps/web/src/lib/api/todos.ts` | TanStack Query hooks: `useGetTodos`, `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo` |
| `apps/web/src/mocks/handlers/todos.ts` | MSW handlers for all CRUD endpoints |

### What This Phase Demonstrates

- Shared types as the API contract between frontend and backend
- TanStack Query key factory pattern for cache management
- MSW handlers returning realistic typed mock data
- Cache invalidation on mutations
- Error scenario handlers

---

## Phase 3: Smart Components & State

**Commit:** `feat(smart-components): wire todo UI to state management`

### Files Created

| File | Description |
|------|-------------|
| `apps/web/src/stores/todo-store.ts` | Zustand store for todo UI state (filter) |
| `apps/web/src/app/todos/page.tsx` | Todos page wiring components to hooks |
| `apps/web/src/app/todos/__tests__/page.test.tsx` | 4 tests: loading, create, empty state, error state |

### What This Phase Demonstrates

- Page component composing presentational components with data
- TanStack Query hooks providing server data
- Zustand for client-only UI state
- All states handled: loading, error, empty, success
- Integration tests using MSW for API mocking

---

## Phase 4: Repository Layer (TDD)

**Commit:** `feat(repository): add todo repository with Testcontainers tests`

### Files Created

| File | Description |
|------|-------------|
| `apps/api/src/modules/todos/domain/todo.entity.ts` | Domain entity and input types |
| `apps/api/src/modules/todos/todo.schema.ts` | Drizzle ORM table schema |
| `apps/api/src/modules/todos/todo.repository.ts` | Repository with CRUD operations |
| `apps/api/src/modules/todos/__tests__/todo.repository.spec.ts` | 8 tests with real PostgreSQL via Testcontainers |

### What This Phase Demonstrates

- Test-driven development: tests define expected behavior before implementation
- Testcontainers for real PostgreSQL in tests (not mocking)
- Drizzle ORM schema definition with type inference
- Repository pattern encapsulating all data access
- Clean test isolation via table truncation between tests

---

## Phase 5: Service Layer (TDD)

**Commit:** `feat(service): add todo service with business logic`

### Files Created

| File | Description |
|------|-------------|
| `apps/api/src/modules/todos/todo.service.ts` | Service with CRUD + domain-to-API transformation |
| `apps/api/src/modules/todos/__tests__/todo.service.spec.ts` | 8 tests with mocked repository |

### What This Phase Demonstrates

- TDD with mocked dependencies (repository)
- Domain entity → API response type transformation (`toResponse`)
- NestJS `NotFoundException` for missing resources
- Business logic isolation from data access and HTTP layers
- Fast unit tests (no database, no HTTP)

---

## Phase 6: Controller Layer (TDD)

**Commit:** `feat(controller): add todo endpoints with E2E tests`

### Files Created

| File | Description |
|------|-------------|
| `apps/api/src/modules/todos/todo.controller.ts` | REST controller: POST, GET, PATCH, DELETE |
| `apps/api/src/modules/todos/todo.module.ts` | NestJS module wiring controller, service, repository |
| `apps/api/src/modules/todos/__tests__/todo.e2e.spec.ts` | 5 E2E tests with Supertest |

### What This Phase Demonstrates

- Thin controllers: validate input, call service, return response
- Proper HTTP status codes (201 for create, 204 for delete, 404 for not found)
- NestJS module encapsulation
- E2E tests using real HTTP with Supertest
- `AppModule` updated to import `TodoModule`

---

## Phase 7: Integration

**Commit:** `feat(integration): connect todo app to real API`

### Files Modified

| File | Change |
|------|--------|
| `apps/web/src/mocks/browser.ts` | Added conditional `initMocks()` gated by `NEXT_PUBLIC_USE_MOCKS` |
| `apps/web/.env.local` | Set `NEXT_PUBLIC_API_URL=http://localhost:3001`, mocks disabled |

### What This Phase Demonstrates

- MSW conditionally disabled for production/development
- Environment-based API URL configuration
- No code changes needed — the API client already uses `NEXT_PUBLIC_API_URL`
- Frontend and backend share types from `libs/shared/`

---

## Summary

| Phase | Files | Tests | Focus |
|-------|-------|-------|-------|
| 1 — UI | 6 | 12 | Pure components, Tailwind, accessibility |
| 2 — API Client | 3 | — | Shared types, TanStack Query, MSW |
| 3 — Smart Components | 3 | 4 | Page wiring, state management, integration tests |
| 4 — Repository | 4 | 8 | Drizzle ORM, Testcontainers, real PostgreSQL |
| 5 — Service | 2 | 8 | Business logic, mocked repos, type transformation |
| 6 — Controller | 3 | 5 | REST endpoints, NestJS modules, Supertest E2E |
| 7 — Integration | 2 | — | Environment config, MSW conditional setup |
| **Total** | **23** | **37** | |
