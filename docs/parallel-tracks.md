# Parallel Tracks

How to run frontend and backend development in parallel using two Claude Code sessions.

## Overview

The 7-phase workflow splits naturally into two independent tracks that can run concurrently:

```
Session A (Frontend)              Session B (Backend)
--------------------              -------------------
Phase 1: Presentational UI
Phase 2: API Client & Mocks
         |
         +-- shared types defined (sync point) --+
         |                                       |
Phase 3: Smart Components         Phase 4: Repository Layer
                                  Phase 5: Service Layer
                                  Phase 6: Controller Layer
         |                                       |
         +-- both tracks merge (sync point) -----+
         |
Phase 7: Integration (either session)
```

The key insight: **Phase 2 defines the API contract** (shared types, endpoints, MSW handlers). The backend can start as soon as these types exist, because they specify exactly what the API must return.

## Prerequisites

- Two terminal windows or tabs
- Same git repository, same branch (or parallel branches — see below)
- Shared types in `libs/shared/` accessible to both apps

## Step-by-Step Setup

### 1. Planning (Single Session)

Before splitting into parallel tracks, complete planning in one session:

```
/prd
/story US-001
/phased-plan US-001
```

This produces the plan that both sessions will reference.

### 2. Frontend Track — Phases 1–3

**Session A** runs the frontend phases:

```
/implement Phase 1
/validate Phase 1
/commit

/implement Phase 2    <-- creates shared types in libs/shared/
/validate Phase 2
/commit
```

After Phase 2 commits, **notify Session B** that shared types are ready.

```
/implement Phase 3
/validate Phase 3
/commit
```

### 3. Backend Track — Phases 4–6

**Session B** starts after Phase 2 is committed:

```
git pull              # get the shared types from Phase 2
/implement Phase 4    # reads shared types for schema design
/validate Phase 4
/commit

/implement Phase 5
/validate Phase 5
/commit

/implement Phase 6
/validate Phase 6
/commit
```

### 4. Integration — Phase 7

After both tracks complete, either session runs integration:

```
git pull              # merge any outstanding changes
/implement Phase 7
/validate Phase 7
/commit
/pr
```

## Sync Points

There are two critical sync points where tracks must coordinate:

### Sync Point 1: After Phase 2

**What's shared:** `libs/shared/src/types/{resource}.ts`

The frontend session defines:
- Response types (`Todo`, `TodoListResponse`)
- Request types (`CreateTodoRequest`, `UpdateTodoRequest`)
- Endpoint paths and methods (documented in the plan)

The backend session needs these types to:
- Design the database schema (Phase 4)
- Define service return types (Phase 5)
- Set up controller routes (Phase 6)

**How to sync:**
- Same branch: Session A commits Phase 2, Session B pulls
- Parallel branches: Session B cherry-picks the shared types commit

### Sync Point 2: Before Phase 7

**What's needed:** All frontend components and all backend endpoints must be complete.

**How to verify:**
```
/progress    # shows all 6 phases complete
```

## Branching Strategies

### Option A: Same Branch (Simple)

Both sessions work on the same feature branch. Commits are sequential even if work happens in parallel.

```
feat/US-001-todo-management
  ├── Phase 1 commit  (Session A)
  ├── Phase 2 commit  (Session A)
  ├── Phase 4 commit  (Session B, after pulling Phase 2)
  ├── Phase 3 commit  (Session A)
  ├── Phase 5 commit  (Session B)
  ├── Phase 6 commit  (Session B)
  └── Phase 7 commit  (either session)
```

**Pros:** Simple. No merge conflicts. Linear git history.
**Cons:** Sessions must pull between phases. Can't work fully independently.

### Option B: Parallel Branches (Advanced)

Each track gets its own branch, merged before Phase 7.

```
feat/US-001-todo-management (base)
  ├── feat/US-001-frontend   (Phases 1-3, Session A)
  └── feat/US-001-backend    (Phases 4-6, Session B)
```

Workflow:
1. Create the base branch from `main`
2. Session A creates `feat/US-001-frontend` from the base
3. After Phase 2, Session A pushes shared types
4. Session B creates `feat/US-001-backend` from the base, cherry-picks shared types
5. Both work independently
6. Merge both into the base branch
7. Run Phase 7 on the base branch

**Pros:** Full independence. Clear ownership.
**Cons:** Merge conflicts possible in shared files. Requires git proficiency.

## Conflict Resolution

### Common Conflict Areas

| File | Why | Resolution |
|------|-----|------------|
| `libs/shared/src/index.ts` | Both tracks add exports | Merge both exports |
| `apps/api/src/app.module.ts` | Backend adds module imports | Keep all imports |
| `.phase-context.json` | Both tracks write context | Merge `phaseOutputs` objects |

### Preventing Conflicts

1. **Shared types are append-only.** Phase 2 creates them, backend only reads them. If the backend needs type changes, discuss first.
2. **Separate directories.** Frontend touches `apps/web/`, backend touches `apps/api/`. Conflicts are rare.
3. **Phase context merging.** If both tracks update `.phase-context.json`, merge the `phaseOutputs` objects (they have different keys — `"1"`, `"2"`, `"3"` vs `"4"`, `"5"`, `"6"`).

## Communication Between Sessions

Since Claude Code sessions can't communicate directly, coordinate through:

1. **Git commits** — the primary communication channel
2. **`.phase-context.json`** — machine-readable state of completed work
3. **Commit messages** — human-readable summaries of what was built
4. **The plan file** — both sessions reference the same plan

### Handoff Checklist

When Session A finishes Phase 2 and Session B is ready to start:

- [ ] Phase 2 commit pushed to remote
- [ ] Shared types exported from `libs/shared/src/index.ts`
- [ ] `.phase-context.json` includes Phase 2 outputs with `endpoints` and `sharedTypes`
- [ ] Plan file has Phase 4 deliverables with database schema

## Timing Considerations

Typical phase durations (relative):

```
Phase 1 (UI):           ████
Phase 2 (API Client):   ███
Phase 3 (Smart Comp):   ████
Phase 4 (Repository):   █████ (Testcontainers setup)
Phase 5 (Service):      ███
Phase 6 (Controller):   ████
Phase 7 (Integration):  ██
```

The backend track (Phases 4-6) takes roughly as long as the frontend track (Phases 1-3). Phase 4 is the longest backend phase due to Testcontainers and database setup.

If the frontend finishes first, Session A can start on the next story's Phases 1-2 while Session B finishes backend work.

## Solo Developer Optimization

Even solo developers can benefit from parallel thinking:

1. Complete Phases 1-2 in one focused session (define the contract)
2. Take a break (context doesn't matter — `.phase-context.json` preserves state)
3. Start a fresh session for Phases 4-6 (backend, reading context from file)
4. Meanwhile, Phases 1-2 work is committed and can be reviewed
5. Return to Phase 3 + Phase 7 after backend is done

This mirrors the parallel tracks pattern without needing two simultaneous sessions.
