# Getting Started

Get from zero to your first feature in 5 steps.

## Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Docker | Any recent | `docker --version` |
| Claude Code | Latest | `claude --version` |

## Step 1: Clone and Install

```bash
git clone https://github.com/your-org/claude-dev-workflow.git
cd claude-dev-workflow/starter
npm install
```

This installs all dependencies for the frontend, backend, and shared libraries via npm workspaces.

## Step 2: Start the Database

```bash
npm run db:up
```

This starts a PostgreSQL 16 container via Docker Compose. The database is available at `localhost:5432` with credentials from `.env.example`.

Copy the environment template:

```bash
cp .env.example .env
```

## Step 3: Verify Everything Works

```bash
# Build all packages
npm run build

# Run all tests
npm run test

# Start dev servers (frontend on :3000, backend on :3001)
npm run dev
```

Visit `http://localhost:3000` to see the starter app. Visit `http://localhost:3001/api/health` to verify the API.

## Step 4: Generate Your First Feature

Open Claude Code in the `starter/` directory and run:

```
/prd Task management app where users can create, view, edit, and delete tasks
```

This generates a PRD at `docs/PRD-task-management.md`. Read it and adjust if needed.

Next, create a user story:

```
/story US-001 User can create and view tasks
```

This generates a story with BDD scenarios at `docs/stories/US-001.md`.

Then generate the implementation plan:

```
/phased-plan US-001
```

This creates a 7-phase plan at `docs/plans/PLAN-US-001.md` with concrete file deliverables for each phase.

## Step 5: Build It Phase by Phase

Implement each phase in order:

```
/implement Phase 1
/validate Phase 1
/commit

/implement Phase 2
/validate Phase 2
/commit

# ... continue through Phase 7

/pr
```

Each `/implement` loads the correct agent with the right context. Each `/validate` checks the output. Each `/commit` creates a scoped conventional commit. Finally, `/pr` creates a pull request with the full phase breakdown.

## What Just Happened?

You built a feature using a structured pipeline:

1. **PRD** defined what to build
2. **Story** broke it into testable scenarios
3. **Plan** mapped scenarios to 7 implementation phases
4. **Phases 1–3** built the frontend (UI → API layer → wiring)
5. **Phases 4–6** built the backend (repository → service → controller) using TDD
6. **Phase 7** connected frontend to backend
7. **PR** documented everything

Each phase agent used **skill files** that encode best practices for the tech stack, ensuring consistent, high-quality code.

## Next Steps

- Read the [Workflow Guide](workflow-guide.md) to understand the methodology
- Read the [Command Reference](command-reference.md) for detailed command docs
- Read the [Customization Guide](customization.md) to adapt to your stack
- Read the [Team Workflow](team-workflow.md) for multi-developer patterns
- Read the [Phase Context Chaining](phase-context-chaining.md) to understand how phases share state across sessions
- Read the [Parallel Tracks](parallel-tracks.md) for running frontend and backend concurrently
- Browse the [Example Walkthrough](examples/) to see a complete todo feature built through all 7 phases
