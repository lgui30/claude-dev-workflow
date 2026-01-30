# /phased-plan — Generate 7-Phase Implementation Plan

## Arguments

- `$ARGUMENTS` — Story ID to plan (e.g., "US-001")

## Instructions

You are generating a **7-phase implementation plan** that maps a user story to the structured development workflow.

**Story input:** $ARGUMENTS

### Step 1: Read the Story

Find and read the user story at `docs/stories/{story-ID}.md`. If it doesn't exist, tell the user to run `/story` first. Also read the referenced PRD for full context.

### Step 2: Map to 7 Phases

Generate a plan at `docs/plans/PLAN-{story-ID}.md` that maps the story's BDD scenarios to concrete deliverables across all 7 phases:

```markdown
# Implementation Plan: {Story ID} — {Story Title}

## Source Story
- Story: docs/stories/{story-ID}.md
- PRD: {PRD path}

## Phase 1: Presentational UI
**Agent:** frontend-phase-1
**Goal:** Build pure UI components with no business logic

### Deliverables
- [ ] `apps/web/src/components/{ComponentName}.tsx` — {description}
- [ ] `apps/web/src/components/__tests__/{ComponentName}.test.tsx`

### BDD Mapping
- Scenario "{name}" → renders {component} with {props}

---

## Phase 2: API Client & Mocks
**Agent:** frontend-phase-2
**Goal:** Create API hooks and MSW mock handlers

### Deliverables
- [ ] `apps/web/src/lib/api/{resource}.ts` — TanStack Query hooks
- [ ] `apps/web/src/mocks/handlers/{resource}.ts` — MSW handlers
- [ ] `libs/shared/src/types/{resource}.ts` — Shared response types

### API Contract
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET    | /api/... | —       | {...}    |

---

## Phase 3: Smart Components & State
**Agent:** frontend-phase-3
**Goal:** Wire UI to state and API hooks

### Deliverables
- [ ] `apps/web/src/stores/{store}.ts` — Zustand store
- [ ] `apps/web/src/app/{route}/page.tsx` — Page component
- [ ] Integration tests for user flows

---

## Phase 4: Repository Layer (TDD)
**Agent:** backend-phase-4
**Goal:** Build data access with tests first

### Deliverables
- [ ] `apps/api/src/modules/{module}/domain/{entity}.ts`
- [ ] `apps/api/src/modules/{module}/{module}.repository.ts`
- [ ] `apps/api/src/modules/{module}/{module}.repository.spec.ts`

### Database Schema
Tables and columns needed for this feature.

---

## Phase 5: Service Layer (TDD)
**Agent:** backend-phase-5
**Goal:** Implement business logic with mocked repos

### Deliverables
- [ ] `apps/api/src/modules/{module}/{module}.service.ts`
- [ ] `apps/api/src/modules/{module}/{module}.service.spec.ts`

### Business Rules
Logic and validation rules derived from BDD scenarios.

---

## Phase 6: Controller Layer (TDD)
**Agent:** backend-phase-6
**Goal:** Thin controllers with E2E tests

### Deliverables
- [ ] `apps/api/src/modules/{module}/{module}.controller.ts`
- [ ] `apps/api/src/modules/{module}/{module}.module.ts`
- [ ] `apps/api/src/modules/{module}/{module}.e2e.spec.ts`

---

## Phase 7: Integration
**Agent:** integration-phase-7
**Goal:** Connect frontend to real backend, verify E2E

### Deliverables
- [ ] Remove/disable MSW mocks for this feature
- [ ] Configure real API endpoint
- [ ] E2E smoke test passing

### Verification
- [ ] All BDD scenarios pass as integration tests
- [ ] No MSW handlers active for production paths
```

### Step 3: Output

1. Write the plan to `docs/plans/PLAN-{story-ID}.md`
2. Print a summary: story ID, deliverable count per phase, and file path
3. Remind the user to run `/implement Phase 1` to start building
