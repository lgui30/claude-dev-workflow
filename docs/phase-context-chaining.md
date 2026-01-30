# Phase Context Chaining

How phases pass information to each other through `.phase-context.json`.

## The Problem

AI assistants lose context between sessions. When you finish Phase 2 and start Phase 3 in a new conversation, the AI doesn't know what components were built, what types were defined, or what API hooks exist. Without this context, the AI may duplicate work, use wrong names, or miss the intended architecture.

## The Solution

Each phase writes a structured summary of its outputs to `.phase-context.json`. The next phase reads this file to understand what it's building on top of.

## File Format

`.phase-context.json` lives in the project root and is updated after each phase:

```json
{
  "storyId": "US-001",
  "storyTitle": "Todo List Management",
  "planPath": "docs/plans/PLAN-US-001.md",
  "completedPhases": [1, 2, 3],
  "currentPhase": 4,
  "phaseOutputs": {
    "1": {
      "phase": "Presentational UI",
      "files": [
        "apps/web/src/components/TodoItem.tsx",
        "apps/web/src/components/TodoList.tsx",
        "apps/web/src/components/TodoForm.tsx"
      ],
      "components": ["TodoItem", "TodoList", "TodoForm"],
      "propsInterfaces": ["TodoItemProps", "TodoListProps", "TodoFormProps"],
      "testFiles": [
        "apps/web/src/components/__tests__/TodoItem.test.tsx",
        "apps/web/src/components/__tests__/TodoList.test.tsx",
        "apps/web/src/components/__tests__/TodoForm.test.tsx"
      ],
      "testCount": 12
    },
    "2": {
      "phase": "API Client & Mocks",
      "files": [
        "libs/shared/src/types/todo.ts",
        "apps/web/src/lib/api/todos.ts",
        "apps/web/src/mocks/handlers/todos.ts"
      ],
      "sharedTypes": ["Todo", "CreateTodoRequest", "UpdateTodoRequest", "TodoListResponse"],
      "apiHooks": ["useGetTodos", "useCreateTodo", "useUpdateTodo", "useDeleteTodo"],
      "endpoints": [
        { "method": "GET", "path": "/api/todos" },
        { "method": "POST", "path": "/api/todos" },
        { "method": "PATCH", "path": "/api/todos/:id" },
        { "method": "DELETE", "path": "/api/todos/:id" }
      ],
      "mswHandlers": ["todoHandlers"]
    },
    "3": {
      "phase": "Smart Components & State",
      "files": [
        "apps/web/src/stores/todo-store.ts",
        "apps/web/src/app/todos/page.tsx"
      ],
      "pages": ["TodosPage"],
      "stores": ["useTodoUIStore"],
      "testFiles": ["apps/web/src/app/todos/__tests__/page.test.tsx"],
      "testCount": 4
    }
  }
}
```

## What Each Phase Outputs

| Phase | Key Outputs | Used By |
|-------|-------------|---------|
| 1 | `components`, `propsInterfaces` | Phase 3 (wiring), Phase 2 (API design) |
| 2 | `sharedTypes`, `endpoints`, `apiHooks` | Phase 3 (hooks), Phase 4 (schema), Phase 5 (service), Phase 6 (controller) |
| 3 | `pages`, `stores` | Phase 7 (integration) |
| 4 | `entities`, `repositories`, `schema` | Phase 5 (mock repos) |
| 5 | `services`, `domainTypes` | Phase 6 (inject services) |
| 6 | `controllers`, `modules`, `dtos` | Phase 7 (API endpoint verification) |
| 7 | `integrationNotes` | `/retro` (retrospective analysis) |

## How `/implement` Uses Context

When `/implement Phase N` runs:

1. **Read** `.phase-context.json`
2. **Verify** all prerequisite phases are in `completedPhases`
3. **Pass** relevant `phaseOutputs` to the phase agent
4. **After implementation**, append this phase's outputs to the file
5. **Update** `completedPhases` and `currentPhase`

### Phase Dependency Map

```
Phase 1 (UI)           -- no dependencies
Phase 2 (API Client)   -- reads Phase 1 component props
Phase 3 (Smart Comp)   -- reads Phase 1 components + Phase 2 hooks
Phase 4 (Repository)   -- reads Phase 2 shared types + endpoints
Phase 5 (Service)      -- reads Phase 4 repository interfaces
Phase 6 (Controller)   -- reads Phase 5 service interfaces + Phase 2 endpoints
Phase 7 (Integration)  -- reads all phases
```

## Example: How Phase 5 Uses Phase 4 Context

Phase 4 outputs:
```json
{
  "4": {
    "phase": "Repository Layer",
    "entities": ["TodoEntity"],
    "repositories": ["TodoRepository"],
    "schema": {
      "table": "todos",
      "columns": ["id", "title", "completed", "created_at", "updated_at"]
    }
  }
}
```

Phase 5 agent reads this and knows:
- The repository class is `TodoRepository`
- It manages `TodoEntity` objects
- The entity has fields: `id`, `title`, `completed`, `createdAt`, `updatedAt`
- Mock the repository's methods: `create`, `findById`, `findAll`, `update`, `delete`

Without this context, the Phase 5 agent would have to guess repository method signatures or read through all the repository code manually.

## Handling Missing Context

If `.phase-context.json` doesn't exist when `/implement Phase N` is called:

- **Phase 1**: Create the file with story metadata (no prior context needed)
- **Phase 2+**: Warn the user that previous phases haven't recorded their context. Offer to scan existing files and reconstruct context, or ask the user to re-run `/implement` for earlier phases.

## Multi-Session Workflow

The context file persists across Claude Code sessions:

**Session 1** — Phases 1-3:
```
/implement Phase 1  -->  writes .phase-context.json (Phase 1 outputs)
/implement Phase 2  -->  reads Phase 1 context, writes Phase 2 outputs
/implement Phase 3  -->  reads Phase 1+2 context, writes Phase 3 outputs
```

**Session 2** — Phases 4-7 (new Claude Code conversation):
```
/implement Phase 4  -->  reads .phase-context.json, finds Phases 1-3 complete
                         uses Phase 2 endpoints to design the schema
```

The context file is the bridge between sessions. It replaces the need for the AI to re-read every file from scratch.

## Git and Context

`.phase-context.json` should be committed with each phase. This way:
- Other developers on the team can see what each phase produced
- The file serves as a machine-readable changelog
- Parallel branches can merge context files (though conflicts need manual resolution)

Add to `.gitignore` only if you prefer not to track context in version control.
