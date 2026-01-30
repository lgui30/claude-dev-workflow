# Workflow Guide

A deep-dive into the 7-phase development methodology.

## Why a Phased Approach?

AI coding assistants produce better results with focused, well-scoped tasks. When asked to "build an entire feature," they often scaffold loosely-connected code, skip tests, and lose track of data flow. When given a specific, bounded task with clear inputs and outputs, they produce focused, testable code.

The 7-phase workflow decomposes any feature into bounded tasks that build on each other.

## The Pipeline

```
/prd ──▶ /story ──▶ /phased-plan ──▶ /implement ──▶ /validate ──▶ /commit ──▶ /pr
                                         │              │
                                         ▼              │
                                    Phase Agent ────────┘
                                    + Skills            (loop per phase)
```

### Phase 1: Planning (Commands)

Three commands set up the work:

- **`/prd`** — Defines *what* to build and *why*
- **`/story`** — Breaks the PRD into testable scenarios (Given/When/Then)
- **`/phased-plan`** — Maps scenarios to concrete deliverables across 7 phases

The output is a plan with exact file paths, component names, API endpoints, and database tables — everything the implementation agents need.

### Phase 2: Implementation (Agent Loop)

For each phase (1 through 7):

1. **`/implement Phase N`** — Loads the plan, checks phase context, dispatches to the agent
2. **Agent executes** — Reads skill files, follows quality rules, builds deliverables
3. **`/validate Phase N`** — Verifies files exist, tests pass, lint clean
4. **`/commit`** — Captures the phase as a conventional commit

### Phase 3: Delivery

- **`/pr`** — Creates a pull request with phase breakdown and test plan

## The 7 Phases Explained

### Frontend-First (Phases 1–3)

Building the frontend first has two advantages:

1. **Reveals the API contract** — By the time you build the backend, you know exactly what data the frontend needs
2. **Fast visual feedback** — MSW mocks let you demo the UI before the backend exists

#### Phase 1: Presentational UI

Build pure, stateless components that render from props. No API calls, no state management, no side effects. This forces clean separation between *how things look* and *how things work*.

**Why test after?** Presentational components are visually verifiable. Write tests after implementation to lock in the behavior, not to drive the design.

**Rules:**
- Components < 80 lines
- TypeScript props interfaces
- Tailwind CSS only
- No hooks except local UI state (`useState` for dropdowns, tooltips)

#### Phase 2: API Client & Mocks

Create the data-fetching layer. TanStack Query hooks define *how* the frontend fetches data. MSW handlers provide realistic mock responses. Shared types in `libs/shared/` define the API contract that both sides must follow.

This phase is the **contract definition point** — the types created here become the source of truth for the backend.

#### Phase 3: Smart Components & State

Wire presentational components to real data. Zustand stores handle client-only state (selections, UI toggles). TanStack Query hooks provide server data. Page components compose everything together.

**Key rule:** Handle all states — loading, error, empty, and success.

### Inside-Out TDD (Phases 4–6)

The backend uses test-driven development from the inside out:

```
Phase 4 (Repository) ──▶ Phase 5 (Service) ──▶ Phase 6 (Controller)
      ▲                        ▲                       ▲
      │                        │                       │
 Real database            Mocked repos            Real HTTP (Supertest)
 (Testcontainers)         (vi.fn())               (NestJS test module)
```

Each layer is tested at its natural boundary:
- **Repositories** against a real PostgreSQL (via Testcontainers)
- **Services** with mocked repositories (fast, isolated unit tests)
- **Controllers** with real HTTP via Supertest (E2E)

#### Phase 4: Repository Layer

**Tests first.** Write tests that describe how data access should work, then implement repositories to make them pass. Testcontainers spins up real PostgreSQL — no mocking SQL queries.

This builds confidence that your queries actually work.

#### Phase 5: Service Layer

**Tests first.** Write tests with mocked repositories. Services implement business logic: validation, transformation from domain types to API response types, error handling.

The boundary between domain types and API types lives here. The service's `toResponse()` method translates internal representations to what the frontend expects.

#### Phase 6: Controller Layer

**Tests first.** Write E2E tests with Supertest that hit real HTTP endpoints. Controllers are thin — they validate input (DTOs), call the service, and return the response with the right status code.

### Integration (Phase 7)

Connect frontend to backend:
- Replace MSW mocks with real API calls
- Configure CORS, environment variables
- Verify every BDD scenario works end-to-end
- Fix contract mismatches (common: date formats, casing, missing fields)

## Context Chaining

> For the full format specification, see [Phase Context Chaining](phase-context-chaining.md).

Phases build on each other. The `/implement` command manages this through `.phase-context.json`:

```json
{
  "storyId": "US-001",
  "completedPhases": [1, 2, 3],
  "phaseOutputs": {
    "1": { "components": ["TaskCard", "TaskList"], "propsInterfaces": [...] },
    "2": { "apiHooks": ["useGetTasks"], "endpoints": [...], "sharedTypes": [...] },
    "3": { "pages": ["TasksPage"], "stores": ["useTaskUIStore"] }
  }
}
```

Each agent receives the outputs from previous phases so it knows what to build on. Phase 2 reads Phase 1's component props to design the API contract. Phase 5 reads Phase 4's repository interfaces to know what to mock.

## Testing Philosophy

| Phase | Test Type | Tool | What's Tested |
|-------|-----------|------|---------------|
| 1 | Unit | Testing Library | Component rendering, props, interactions |
| 2 | — | (Types only) | API contract types |
| 3 | Integration | Testing Library + MSW | User flows with mocked API |
| 4 | Integration | Testcontainers | SQL queries against real PostgreSQL |
| 5 | Unit | vi.fn() mocks | Business logic with mocked data access |
| 6 | E2E | Supertest | Full HTTP request/response cycle |
| 7 | E2E | Manual + automated | Complete frontend-to-database flow |

**Principle:** Test at the natural boundary of each layer. Don't mock what you can test against the real thing (database, HTTP). Mock only to isolate the layer under test (services mock repositories, not databases).

## Skills System

Each agent references **skill files** that encode best practices for specific technologies. Skills are reusable across projects — swap out `nextjs-patterns.md` for `remix-patterns.md` to change your frontend framework while keeping the same workflow.

Skills cover:
- File structure conventions
- Code patterns with examples
- Common pitfalls to avoid
- Testing approaches

See the [Customization Guide](customization.md) for how to write custom skills.

## Progress and Retrospectives

Two additional commands help track and improve the workflow:

- **`/progress`** — Shows visual phase completion status with an ASCII progress bar, file/test counts per phase, and recommends the next action
- **`/retro`** — Analyzes git history after a feature is complete: commits per phase, rework detection, contract drift, and improvement suggestions

Run `/progress` at any point during development. Run `/retro` after the PR is created to capture learnings.
