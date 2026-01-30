# claude-dev-workflow

A structured 7-phase AI-assisted development workflow for Claude Code. Ship features with consistent quality using reusable slash commands, phase agents, skill knowledge bases, and a full starter monorepo.

## What This Project Is

An open-source GitHub starter kit that gives developers a **repeatable, phased workflow** for building full-stack features with Claude Code. Instead of ad-hoc prompting, users get a structured pipeline: plan → frontend phases → backend TDD phases → integration.

**Target audience:** Solo developers and dev teams adopting AI-assisted development.

## Project Status

This project is being built from scratch. All work is driven by the PRD files in `prd/`.

### Phase Dependency Graph

```
PHASE-1 (Commands + Agents)    ← START HERE, no dependencies
   ├──→ PHASE-2 (Skills)──────────┐
   └──→ PHASE-3 (Starter Monorepo)├──→ PHASE-4 (Docs)──────→ PHASE-6 (Polish)
                    │              │                                ↑
                    └──────────────┘──→ PHASE-5 (Example)──────────┘
```

### Current Progress

| Phase | Title | Status | PRD File |
|-------|-------|--------|----------|
| 1 | Core Commands & Agents | ✅ Complete | `prd/phase-1-commands-agents.json` |
| 2 | Skills Knowledge Base | ✅ Complete | `prd/phase-2-skills.json` |
| 3 | Starter Monorepo Scaffold | ✅ Complete | `prd/phase-3-starter.json` |
| 4 | Documentation & README | ✅ Complete | `prd/phase-4-docs.json` |
| 5 | Example Feature Walkthrough | ✅ Complete | `prd/phase-5-example.json` |
| 6 | Quality Polish & Advanced Features | ✅ Complete | `prd/phase-6-polish.json` |

> **Update this table** as phases are completed (change 🔲 to ✅).

## How To Work On This Project

### Starting a Session

1. Read this file (you're doing it now)
2. Read `prd/master-prd.json` to understand the full project scope
3. Check the **Current Progress** table above to see what's done and what's next
4. Read the PRD file for the next pending phase (e.g., `prd/phase-1-commands-agents.json`)
5. Execute the tasks listed in that phase's PRD

### Executing a Phase

Each phase PRD JSON contains:
- **`description`** — what this phase is about
- **`context_chain`** — what it receives from previous phases and outputs to the next
- **`deliverables`** — exact file paths and descriptions of what to create
- **`tasks`** — ordered list of work items
- **`acceptance_criteria`** — how to know the phase is done

**Workflow per phase:**
1. Read the phase PRD JSON
2. If the phase has `context_chain.receives_from`, read those completed phases for context
3. Work through the `tasks` list in order
4. Verify all `acceptance_criteria` are met
5. Commit the phase: `git add . && git commit -m "feat: [phase description]"`
6. Update the **Current Progress** table in this file (🔲 → ✅)

### Key Design Decisions

- **Phase Context Chaining:** Each phase outputs context the next phase needs. The `context_chain` field in each PRD defines this contract. When building `/implement`, it should read `.phase-context.json` files.
- **Inside-Out TDD for Backend:** Phases 4→5→6 go Repository→Service→Controller. This prevents the AI from scaffolding the entire stack at once.
- **Frontend-First:** Phases 1→2→3 build UI before backend exists, using MSW mocks. This reveals the API contract early.
- **Quality Gates:** `/validate` checks phase output before allowing the next phase. Not just "does it compile" but "does it meet the plan."

## Target Repo Structure (When Complete)

```
claude-dev-workflow/
├── CLAUDE.md                          ← You are here
├── README.md                          ← Hero README (Phase 4)
├── LICENSE                            ← MIT (Phase 4)
├── CONTRIBUTING.md                    ← Contribution guide (Phase 4)
│
├── prd/                               ← Build plans (already exist)
│   ├── master-prd.json
│   ├── phase-1-commands-agents.json
│   ├── phase-2-skills.json
│   ├── phase-3-starter.json
│   ├── phase-4-docs.json
│   ├── phase-5-example.json
│   └── phase-6-polish.json
│
├── .claude/
│   ├── commands/                      ← Slash commands (Phase 1 + 6)
│   │   ├── prd.md
│   │   ├── story.md
│   │   ├── phased-plan.md
│   │   ├── implement.md
│   │   ├── validate.md
│   │   ├── commit.md
│   │   ├── pr.md
│   │   ├── progress.md
│   │   └── retro.md
│   │
│   ├── agents/                        ← Phase agents (Phase 1)
│   │   ├── frontend-phase-1.md
│   │   ├── frontend-phase-2.md
│   │   ├── frontend-phase-3.md
│   │   ├── backend-phase-4.md
│   │   ├── backend-phase-5.md
│   │   ├── backend-phase-6.md
│   │   └── integration-phase-7.md
│   │
│   └── skills/                        ← Knowledge base (Phase 2)
│       ├── nextjs-patterns.md
│       ├── nestjs-architecture.md
│       ├── drizzle-repository.md
│       ├── vitest-testing.md
│       ├── testcontainers.md
│       ├── bff-patterns.md
│       ├── tanstack-query.md
│       ├── zustand-state.md
│       └── msw-mocking.md
│
├── starter/                           ← Monorepo starter (Phase 3)
│   ├── apps/
│   │   ├── web/                       ← Next.js app
│   │   └── api/                       ← NestJS app
│   ├── libs/
│   │   └── shared/                    ← Shared types
│   ├── package.json
│   ├── turbo.json
│   └── docker-compose.yml
│
└── docs/                              ← Documentation (Phase 4 + 6)
    ├── getting-started.md
    ├── workflow-guide.md
    ├── customization.md
    ├── team-workflow.md
    ├── command-reference.md
    ├── phase-context-chaining.md
    ├── parallel-tracks.md
    └── examples/                      ← Example feature (Phase 5)
        ├── example-prd.md
        ├── example-story.md
        ├── example-plan.md
        └── phase-commits.md
```

## Tech Stack (for the starter monorepo)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+, TanStack Query, Zustand, Tailwind CSS |
| Mocking | MSW (Mock Service Worker) |
| Backend | NestJS, Drizzle ORM |
| Database | PostgreSQL 16 (Docker Compose) |
| Testing | Vitest, Testing Library, Testcontainers, Supertest |
| Build | Turborepo, TypeScript |

## Rules

- **Always read the phase PRD before starting work.** The PRD is the source of truth.
- **Follow the dependency graph.** Don't start a phase until its dependencies are complete.
- **Commit after each phase.** One phase = one commit. Keep the git history clean.
- **Update this file** when completing phases so the next session knows where to pick up.
- **Quality over speed.** Every deliverable should be production-grade — this is an open-source project people will judge by its code quality.
