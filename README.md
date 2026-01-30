<p align="center">
  <br />
  <br />
  <code>&nbsp;claude-dev-workflow&nbsp;</code>
  <br />
  <br />
  <strong>Stop prompting. Start shipping.</strong>
  <br />
  A structured 7-phase pipeline that turns Claude Code into a predictable feature factory.
  <br />
  <br />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="#the-7-phases"><img src="https://img.shields.io/badge/phases-7-green.svg" alt="7 Phases" /></a>
  <a href="#commands"><img src="https://img.shields.io/badge/commands-9-orange.svg" alt="9 Commands" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/stack-Next.js%20%2B%20NestJS-black.svg" alt="Tech Stack" /></a>
</p>

---

## The Problem

You open Claude Code. You type "build me a todo app." You get... something. Maybe it works, maybe it doesn't. You re-prompt, tweak, re-prompt again. The AI loses context. You lose patience. Your codebase looks like it was written by 7 different people (it was -- 7 different conversations).

**Sound familiar?**

The issue isn't Claude Code. It's that we're treating a powerful tool like a magic wand instead of giving it structure.

## The Solution

**claude-dev-workflow** gives Claude Code a repeatable, phased pipeline. Instead of "build me X," you run structured commands that break any feature into 7 focused phases -- each with a dedicated AI agent, quality gates, and technology-specific skill files.

The result: **consistent, production-grade features** -- every time.

```
Your feature idea
       |
       v
  /prd -----> /story -----> /phased-plan
                                  |
                     /implement Phase 1  (UI components)
                     /validate  Phase 1  (quality gate)
                     /commit             (conventional commit)
                           |
                     /implement Phase 2  (API hooks + mocks)
                     /validate  Phase 2
                     /commit
                           |
                        ... (repeat for all 7 phases)
                           |
                     /implement Phase 7  (integration)
                     /validate  Phase 7
                     /commit
                           |
                         /pr  -----> Ship it
```

## See It In Action

Here's a complete todo feature built through all 7 phases. This is real output from the workflow:

### Phase 1: You type `/implement Phase 1` -- Claude builds pure UI components

```tsx
// apps/web/src/components/TodoItem.tsx (auto-generated)
export function TodoItem({ id, title, completed, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
      <button
        onClick={() => onToggle(id)}
        className={`h-5 w-5 rounded-full border-2 ${
          completed ? 'border-green-500 bg-green-500' : 'border-gray-300'
        }`}
        aria-label={completed ? `Mark "${title}" as pending` : `Mark "${title}" as completed`}
      />
      <span className={completed ? 'text-gray-400 line-through' : 'text-gray-900'}>
        {title}
      </span>
      <button onClick={() => onDelete(id)} aria-label={`Delete "${title}"`}>
        Delete
      </button>
    </li>
  );
}
```

12 unit tests auto-generated. All passing.

### Phase 2: `/implement Phase 2` -- Claude creates the API layer with shared types

```ts
// libs/shared/src/types/todo.ts (auto-generated)
export interface Todo extends Timestamps {
  id: string;
  title: string;
  completed: boolean;
}

// apps/web/src/lib/api/todos.ts (auto-generated)
export function useGetTodos() {
  return useQuery({
    queryKey: todoKeys.list(),
    queryFn: () => apiClient<TodoListResponse>('/api/todos'),
  });
}
```

MSW mock handlers auto-generated. Frontend works without a backend.

### Phase 4: `/implement Phase 4` -- TDD with real PostgreSQL

```ts
// apps/api/src/modules/todos/__tests__/todo.repository.integration.spec.ts
// Tests written FIRST, then implementation auto-generated to make them pass

it('creates a todo with generated id and defaults', async () => {
  const todo = await repository.create({ title: 'Buy groceries' });
  expect(todo.id).toBeDefined();
  expect(todo.title).toBe('Buy groceries');
  expect(todo.completed).toBe(false);
});
```

Real PostgreSQL via Testcontainers. No mocking SQL. 10 integration tests.

### Phase 7: `/implement Phase 7` -- Everything connects

MSW mocks disabled. Frontend hits real API. **37 tests passing across 8 test files.** One feature, 7 clean commits, ready for PR.

> **[See the full example walkthrough](docs/examples/)** -- PRD, user story, plan, and every file generated across all 7 phases.

## Quick Start

```bash
# Clone and install
git clone https://github.com/lgui30/claude-dev-workflow.git
cd claude-dev-workflow/starter
npm install

# Start PostgreSQL
docker compose up -d

# Open Claude Code in this directory, then:
/prd Todo app with full CRUD
/story US-001 User can manage todos
/phased-plan US-001
/implement Phase 1
```

That's it. Claude Code now knows exactly what to build, in what order, and how to verify it.

## Why Developers Need This

| Without structure | With claude-dev-workflow |
|---|---|
| "Build me a full-stack app" | 7 focused phases, each with clear scope |
| AI loses context mid-feature | Phase context chaining preserves state |
| No tests or inconsistent tests | Quality gates enforce tests at every phase |
| Hallucinated APIs that don't match | Shared types defined upfront in Phase 2 |
| One massive commit | 7 conventional commits, clean PR |
| Works for you, confusing for the team | Reproducible workflow anyone can follow |
| Re-prompting when things go wrong | `/validate` catches issues before they compound |

## Commands

9 slash commands cover the entire development lifecycle:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/prd` | Generate a Product Requirements Document | Starting a new feature |
| `/story` | Create user story with BDD scenarios | After PRD is approved |
| `/phased-plan` | Map story to 7-phase plan with file paths | Before implementation |
| `/implement Phase N` | Execute a phase with the right agent | Building each phase |
| `/validate Phase N` | Quality gate -- files, tests, lint, size | After each phase |
| `/commit` | Conventional commit scoped to the phase | After validation passes |
| `/pr` | PR with phase breakdown and test plan | After all 7 phases |
| `/progress` | Visual ASCII progress bar and status | Check progress anytime |
| `/retro` | Retrospective from git history | After feature ships |

## The 7 Phases

Every feature follows this path. No exceptions, no shortcuts.

```
  FRONTEND-FIRST                        INSIDE-OUT TDD                    CONNECT
  (reveal the API contract)             (build from data layer up)        (wire it all)
  ┌──────────────────────┐              ┌──────────────────────┐          ┌──────────┐
  │ Phase 1: UI          │              │ Phase 4: Repository  │          │ Phase 7  │
  │   Pure components    │              │   Drizzle + Testcont │          │ Real API │
  │   Tailwind CSS       │              │   Real PostgreSQL    │          │ MSW off  │
  │   12+ unit tests     │              │   8+ DB tests        │          │ E2E      │
  ├──────────────────────┤              ├──────────────────────┤          └──────────┘
  │ Phase 2: API Client  │              │ Phase 5: Service     │
  │   TanStack Query     │              │   Business logic     │
  │   MSW mock handlers  │──────────────│   Mocked repos       │
  │   Shared types       │  types flow  │   8+ unit tests      │
  ├──────────────────────┤  to backend  ├──────────────────────┤
  │ Phase 3: State       │              │ Phase 6: Controller  │
  │   Zustand stores     │              │   NestJS endpoints   │
  │   Page wiring        │              │   Supertest E2E      │
  │   4+ integration     │              │   5+ E2E tests       │
  └──────────────────────┘              └──────────────────────┘
```

**Why frontend-first?** Building UI before the backend reveals exactly what data the API needs to return. The shared types from Phase 2 become the contract the backend must implement.

**Why inside-out TDD?** Repository -> Service -> Controller means each layer is tested at its natural boundary. No mocking databases when you can use Testcontainers. No mocking HTTP when you can use Supertest.

## How It Works Under the Hood

### Agents + Skills = Consistent Output

Each phase has a **dedicated agent** (`.claude/agents/`) that knows:
- What files to create
- What patterns to follow
- What quality rules to enforce

Each agent references **skill files** (`.claude/skills/`) that encode best practices:

```
.claude/
├── commands/          # 9 slash commands
│   ├── implement.md   # Phase dispatcher
│   ├── validate.md    # Quality gate
│   └── ...
├── agents/            # 7 phase-specific agents
│   ├── frontend-phase-1.md    # "Components < 80 lines, props-driven..."
│   ├── backend-phase-4.md     # "Tests first, Testcontainers, no SQL mocking..."
│   └── ...
└── skills/            # 9 technology skill files
    ├── nextjs-patterns.md     # App Router, layouts, server components
    ├── tanstack-query.md      # Query keys, cache invalidation, optimistic updates
    ├── nestjs-architecture.md # Modules, DI, thin controllers
    ├── drizzle-repository.md  # Schema, repository pattern, transactions
    ├── testcontainers.md      # Container lifecycle, test isolation
    └── ...
```

### Phase Context Chaining

The biggest problem with AI coding is **context loss between sessions**. Phase context chaining solves this:

```json
// .phase-context.json -- auto-generated, auto-read
{
  "storyId": "US-001",
  "completedPhases": [1, 2, 3],
  "phaseOutputs": {
    "1": { "components": ["TodoItem", "TodoList", "TodoForm"] },
    "2": { "sharedTypes": ["Todo", "CreateTodoRequest"], "endpoints": [...] },
    "3": { "pages": ["TodosPage"], "stores": ["useTodoUIStore"] }
  }
}
```

Phase 4 reads this and knows exactly what types to implement. Phase 5 reads Phase 4's output and knows what repository methods to mock. No re-reading files. No hallucinated interfaces.

## Tech Stack

The starter monorepo is production-ready with modern tooling:

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Next.js 14** App Router | Industry standard, great DX |
| Server State | **TanStack Query** | Cache invalidation, optimistic updates |
| Client State | **Zustand** | Minimal boilerplate, easy testing |
| Styling | **Tailwind CSS** | Utility-first, no CSS files to manage |
| Mocking | **MSW** | Network-level mocks, works in tests and browser |
| Backend | **NestJS** | Modular, testable, TypeScript-native |
| ORM | **Drizzle** | Type-safe, SQL-like, lightweight |
| Database | **PostgreSQL 16** | Via Docker Compose, one command |
| Testing | **Vitest** + **Testing Library** + **Testcontainers** + **Supertest** | Fast, real, comprehensive |
| Build | **Turborepo** | Parallel builds, caching, monorepo |
| Types | **TypeScript** strict | Shared between frontend and backend |

> **Want a different stack?** The workflow is designed to be swapped. See the [Customization Guide](docs/customization.md) -- replace Next.js with Remix, NestJS with Fastify, Drizzle with Prisma. The 7-phase structure stays the same.

## Project Structure

```
starter/
├── .claude/
│   ├── commands/        # 9 slash commands (your workflow interface)
│   ├── agents/          # 7 phase agents (the AI's instructions)
│   └── skills/          # 9 skill files (tech-specific best practices)
├── apps/
│   ├── web/             # Next.js 14 + TanStack Query + Zustand + MSW
│   └── api/             # NestJS + Drizzle ORM + Testcontainers
├── libs/
│   └── shared/          # Shared TypeScript types (the API contract)
├── docs/                # 11 documentation files
├── docker-compose.yml   # PostgreSQL 16
├── turbo.json           # Build pipeline
└── package.json         # Workspace root
```

## For Teams

The 7 phases split naturally into **parallel tracks**:

```
Developer A (Frontend)              Developer B (Backend)
─────────────────────              ─────────────────────
Phase 1: UI Components
Phase 2: API Hooks + Types ──────> (shared types become the contract)
Phase 3: Page Wiring               Phase 4: Repository (TDD)
                                    Phase 5: Service (TDD)
                                    Phase 6: Controller (TDD)
───────────── both ─────────────
Phase 7: Integration
```

Phase 2 defines the API contract. Backend implements it. Phase 7 verifies the connection. See the [Parallel Tracks Guide](docs/parallel-tracks.md) for branching strategies and sync points.

## The Example: A Complete Todo Feature

The repo includes a **fully built example** -- a todo CRUD feature implemented through all 7 phases. This isn't a toy demo. It's real, production-quality code:

| Phase | What Was Built | Files | Tests |
|-------|---------------|-------|-------|
| 1 -- UI | TodoItem, TodoList, TodoForm components | 6 | 12 |
| 2 -- API Client | TanStack Query hooks, MSW handlers, shared types | 3 | -- |
| 3 -- Smart Components | TodosPage, Zustand store, integration tests | 3 | 4 |
| 4 -- Repository | Drizzle schema, TodoRepository, Testcontainers tests | 4 | 10 |
| 5 -- Service | TodoService, domain-to-API transformation | 2 | 8 |
| 6 -- Controller | REST controller, NestJS module, E2E tests | 3 | 5 |
| 7 -- Integration | MSW disabled, env config, real API wiring | 2 | -- |
| **Total** | | **23 files** | **39 tests** |

Every file, every test, every commit -- documented in the [Example Walkthrough](docs/examples/).

## Documentation

| Guide | What You'll Learn |
|-------|------------------|
| **[Getting Started](docs/getting-started.md)** | Install, run, build your first feature |
| **[Workflow Guide](docs/workflow-guide.md)** | Deep dive into the 7-phase methodology |
| **[Command Reference](docs/command-reference.md)** | Every command with syntax and examples |
| **[Customization](docs/customization.md)** | Swap frameworks, add skills, adapt the workflow |
| **[Team Workflow](docs/team-workflow.md)** | Multi-developer patterns, PR reviews |
| **[Parallel Tracks](docs/parallel-tracks.md)** | Run frontend + backend concurrently |
| **[Phase Context Chaining](docs/phase-context-chaining.md)** | How phases preserve state across sessions |
| **[Example Walkthrough](docs/examples/)** | Complete todo feature, all 7 phases |

## FAQ

<details>
<summary><strong>Do I need to use this exact tech stack?</strong></summary>

No. The 7-phase structure, agents, and commands are stack-agnostic. The starter monorepo uses Next.js + NestJS, but you can swap any layer. The [Customization Guide](docs/customization.md) shows 6 common stack swaps with what to change.
</details>

<details>
<summary><strong>Does this work with Claude Code only?</strong></summary>

The commands and agents are built for Claude Code's slash command system. The methodology (7 phases, frontend-first, inside-out TDD) works with any AI tool -- you'd just invoke the agents differently.
</details>

<details>
<summary><strong>How is this different from just prompting Claude Code?</strong></summary>

Three things: **structure** (7 bounded phases instead of one vague request), **context** (phase chaining preserves state across sessions), and **verification** (quality gates catch issues at each phase, not at the end). The result is consistent, production-grade output instead of hit-or-miss responses.
</details>

<details>
<summary><strong>Can I use this for existing projects?</strong></summary>

Yes. Copy the `.claude/` directory into your project. The commands, agents, and skills work with any codebase structure -- they reference your project's files, not hardcoded paths.
</details>

<details>
<summary><strong>How long does it take to build a feature?</strong></summary>

A typical CRUD feature (like the todo example) takes one session through all 7 phases. Complex features with multiple stories take 2-3 sessions. The context chaining ensures no work is lost between sessions.
</details>

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The most impactful contributions:

- **New skill files** for additional technologies (Remix, Prisma, tRPC, etc.)
- **Bug reports** with reproduction steps
- **Example features** beyond the todo walkthrough

## License

[MIT](LICENSE) -- Use it, modify it, ship it.
