# Team Workflow

How to use the 7-phase workflow with multiple developers.

## Parallel Tracks

> For a detailed guide on running parallel sessions including branching strategies, sync points, and conflict resolution, see [Parallel Tracks](parallel-tracks.md).

The 7 phases split naturally into two parallel tracks:

```
Developer A (Frontend)          Developer B (Backend)
─────────────────────          ─────────────────────
Phase 1: Presentational UI
Phase 2: API Client & Mocks ──▶ (shared types defined here)
Phase 3: Smart Components       Phase 4: Repository Layer
                                Phase 5: Service Layer
                                Phase 6: Controller Layer
──────────── both ──────────────
Phase 7: Integration
```

### How It Works

1. **Developer A** runs Phases 1–2, defining shared types and the API contract
2. **Developer B** starts Phase 4 once shared types exist (after Phase 2)
3. Both work in parallel: A on Phase 3 (frontend wiring), B on Phases 4–6 (backend)
4. Both collaborate on Phase 7 (integration)

The key handoff point is **Phase 2** — the shared types and MSW handlers define what the backend must implement.

## Phase Ownership

Assign phases based on team strengths:

| Role | Phases | Focus |
|------|--------|-------|
| Frontend Developer | 1, 2, 3 | UI, API hooks, state management |
| Backend Developer | 4, 5, 6 | Data layer, business logic, API endpoints |
| Full-Stack / Lead | 7 | Integration, contract verification |

For solo developers, work sequentially through all 7 phases.

## Branching Strategy

### Feature Branch Per Story

```
main
  └── feat/US-001-task-management
        ├── commit: feat(ui): add TaskCard and TaskList components        (Phase 1)
        ├── commit: feat(api-client): add task hooks and MSW handlers    (Phase 2)
        ├── commit: feat(smart-components): wire TasksPage with state    (Phase 3)
        ├── commit: feat(repository): add task repository with tests     (Phase 4)
        ├── commit: feat(service): add task service with business logic  (Phase 5)
        ├── commit: feat(controller): add task controller with E2E tests (Phase 6)
        └── commit: feat(integration): connect frontend to real API      (Phase 7)
```

Each phase is a single commit. The PR shows the full progression.

### Parallel Branches (Larger Teams)

For bigger features with parallel frontend/backend work:

```
main
  └── feat/US-001-task-management
        ├── feat/US-001-frontend (Phases 1-3)
        └── feat/US-001-backend  (Phases 4-6)
```

Merge both into the feature branch, then do Phase 7 integration there.

## PR Review Workflow

### Phase-Aware Reviews

The `/pr` command generates a PR with a phase breakdown. Reviewers can check each phase independently:

- **Phase 1 review:** Are components pure? Props well-typed? Under 80 lines?
- **Phase 2 review:** Do shared types match the API contract? Are MSW handlers realistic?
- **Phase 3 review:** Are all states handled (loading/error/empty)? Clean store design?
- **Phase 4 review:** Tests written first? Real DB in tests? Schema makes sense?
- **Phase 5 review:** Business rules correct? Type transformation clean?
- **Phase 6 review:** Controllers thin? Proper status codes? DTOs validated?
- **Phase 7 review:** MSW mocks removed? CORS configured? E2E working?

### Review Checklist

Each PR includes a test plan checklist:

```markdown
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Lint clean
- [ ] Type check clean
- [ ] Manual smoke test of primary flow
- [ ] No MSW handlers in production paths
```

## Splitting Work Across Claude Code Sessions

Each Claude Code session maintains context within the conversation. When splitting work:

### Session Handoff

At the end of a session, the phase context file (`.phase-context.json`) captures what was built. The next session reads it automatically via `/implement`.

### Multi-Session Strategy

**Session 1 — Planning:**
```
/prd
/story US-001
/phased-plan US-001
```

**Session 2 — Frontend:**
```
/implement Phase 1
/validate Phase 1
/commit
/implement Phase 2
/validate Phase 2
/commit
/implement Phase 3
/validate Phase 3
/commit
```

**Session 3 — Backend:**
```
/implement Phase 4
/validate Phase 4
/commit
/implement Phase 5
/validate Phase 5
/commit
/implement Phase 6
/validate Phase 6
/commit
```

**Session 4 — Integration:**
```
/implement Phase 7
/validate Phase 7
/commit
/pr
```

## Handling Conflicts

When frontend and backend developers modify shared types:

1. **Shared types are the contract.** Phase 2 defines them. Backend must implement what's defined.
2. **If the contract needs to change,** update `libs/shared/` first, then update both frontend hooks and backend services.
3. **Phase 7 catches mismatches.** Integration testing reveals any contract drift.

## Scaling to Larger Features

For features spanning multiple stories:

```
/prd Large Feature
/story US-001 First user flow
/story US-002 Second user flow
/story US-003 Admin user flow

# Build each story through the full 7-phase pipeline
/phased-plan US-001
# ... implement all 7 phases ...

/phased-plan US-002
# ... implement all 7 phases ...

# Single PR for the entire feature, or one PR per story
/pr
```

Each story goes through the full pipeline independently. Shared components and types accumulate naturally.
