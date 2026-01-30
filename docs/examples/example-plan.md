# Implementation Plan: US-001 — Todo CRUD

## Source Story

- Story: docs/examples/example-story.md
- PRD: docs/examples/example-prd.md

---

## Phase 1: Presentational UI

**Agent:** frontend-phase-1
**Goal:** Build pure UI components with no business logic

### Deliverables

- [ ] `apps/web/src/components/TodoItem.tsx` — Single todo row with toggle and delete
- [ ] `apps/web/src/components/TodoList.tsx` — List of TodoItem components with empty state
- [ ] `apps/web/src/components/TodoForm.tsx` — Input form to create a new todo
- [ ] `apps/web/src/components/__tests__/TodoItem.test.tsx`
- [ ] `apps/web/src/components/__tests__/TodoList.test.tsx`
- [ ] `apps/web/src/components/__tests__/TodoForm.test.tsx`

### BDD Mapping

- Scenario 1 (empty list) → TodoList renders empty state
- Scenario 2 (create) → TodoForm handles submit
- Scenario 3 (view) → TodoList renders items via TodoItem
- Scenario 4 (complete) → TodoItem shows completed styling
- Scenario 5 (delete) → TodoItem has delete button

---

## Phase 2: API Client & Mocks

**Agent:** frontend-phase-2
**Goal:** Create API hooks and MSW mock handlers

### Deliverables

- [ ] `libs/shared/src/types/todo.ts` — Todo, CreateTodoRequest, UpdateTodoRequest, TodoListResponse
- [ ] `apps/web/src/lib/api/todos.ts` — TanStack Query hooks
- [ ] `apps/web/src/mocks/handlers/todos.ts` — MSW handlers

### API Contract

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/todos | — | `TodoListResponse` |
| POST | /api/todos | `CreateTodoRequest` | `Todo` |
| PATCH | /api/todos/:id | `UpdateTodoRequest` | `Todo` |
| DELETE | /api/todos/:id | — | 204 No Content |

---

## Phase 3: Smart Components & State

**Agent:** frontend-phase-3
**Goal:** Wire UI to state and API hooks

### Deliverables

- [ ] `apps/web/src/stores/todo-store.ts` — Zustand store for todo UI state
- [ ] `apps/web/src/app/todos/page.tsx` — Todos page component
- [ ] `apps/web/src/app/todos/__tests__/page.test.tsx` — Integration test

---

## Phase 4: Repository Layer (TDD)

**Agent:** backend-phase-4
**Goal:** Build data access with tests first

### Deliverables

- [ ] `apps/api/src/modules/todos/domain/todo.entity.ts` — Domain entity
- [ ] `apps/api/src/modules/todos/todo.schema.ts` — Drizzle schema
- [ ] `apps/api/src/modules/todos/todo.repository.ts` — Repository
- [ ] `apps/api/src/modules/todos/__tests__/todo.repository.spec.ts` — Testcontainers tests

### Database Schema

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Phase 5: Service Layer (TDD)

**Agent:** backend-phase-5
**Goal:** Implement business logic with mocked repos

### Deliverables

- [ ] `apps/api/src/modules/todos/todo.service.ts` — Service
- [ ] `apps/api/src/modules/todos/__tests__/todo.service.spec.ts` — Unit tests

### Business Rules

- Title is required and max 200 characters
- New todos default to `completed: false`
- Toggle flips the `completed` boolean

---

## Phase 6: Controller Layer (TDD)

**Agent:** backend-phase-6
**Goal:** Thin controllers with E2E tests

### Deliverables

- [ ] `apps/api/src/modules/todos/todo.controller.ts` — REST controller
- [ ] `apps/api/src/modules/todos/todo.module.ts` — NestJS module
- [ ] `apps/api/src/modules/todos/__tests__/todo.e2e.spec.ts` — Supertest E2E tests

---

## Phase 7: Integration

**Agent:** integration-phase-7
**Goal:** Connect frontend to real backend, verify E2E

### Deliverables

- [ ] Conditional MSW setup (mocks disabled by default)
- [ ] `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] All BDD scenarios verified end-to-end
