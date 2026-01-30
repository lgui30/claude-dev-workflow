# /validate — Quality Gate

## Arguments

- `$ARGUMENTS` — Phase identifier (e.g., "Phase 1", "Phase 3") and optionally the story ID

## Instructions

You are the **quality gate**. Your job is to verify that a phase's implementation meets quality standards before the team moves to the next phase. No phase should advance until validation passes.

**Input:** $ARGUMENTS

### Step 1: Parse Arguments

Extract:
- **Phase number** (1–7)
- **Story ID** — if not provided, read from `.phase-context.json`

### Step 2: Load Expected Deliverables

Read the plan at `docs/plans/PLAN-{story-ID}.md` and extract the deliverable checklist for the target phase. Each deliverable should have an exact file path.

### Step 3: Run Validation Checks

Execute these checks in order. Record pass/fail for each.

#### Check 1: File Existence

For each deliverable file path in the plan:
- Verify the file exists at the specified path
- Verify the file is non-empty (> 0 bytes)
- Record: `{passed}/{total} files`

#### Check 2: Build

Run the build to catch compilation and type errors early:
```bash
# Frontend phases (1-3)
cd apps/web && npx tsc --noEmit

# Backend phases (4-6)
cd apps/api && npx tsc --noEmit

# Phase 7: Both
npm run typecheck
```
- Record: clean or error count

#### Check 3: Tests Pass

Run tests scoped to this phase's files:

| Phase | Command |
|-------|---------|
| 1 | `npx vitest run apps/web/src/components/__tests__/` |
| 2 | (no tests — types and hooks only; verify types compile in Check 2) |
| 3 | `npx vitest run apps/web/src/app/` |
| 4 | `npx vitest run apps/api/src/modules/{module}/__tests__/{module}.repository.integration.spec.ts` |
| 5 | `npx vitest run apps/api/src/modules/{module}/__tests__/{module}.service.spec.ts` |
| 6 | `npx vitest run apps/api/src/modules/{module}/__tests__/{module}.e2e.spec.ts` |
| 7 | `npm run test` (full suite) |

- Record: `{passed}/{total} tests`
- Note: Phase 4 requires Docker running for Testcontainers. If Docker is unavailable, report as `SKIP` (not fail).

#### Check 4: Lint Clean

```bash
# Frontend phases (1-3)
cd apps/web && npx eslint --no-error-on-unmatched-pattern "src/**/*.{ts,tsx}"

# Backend phases (4-6)
cd apps/api && npx eslint --no-error-on-unmatched-pattern "src/**/*.ts"

# Phase 7
npm run lint
```
- Record: clean or error count

#### Check 5: Component Size (Phases 1–3 Only)

For frontend phases, check that all component files are under 80 lines:
```bash
wc -l apps/web/src/components/*.tsx
```
- Record: all under limit, or list offenders with line count

#### Check 6: Test Coverage (Phases 4–6 Only)

For backend phases, verify every `.ts` implementation file has a corresponding test:

| Implementation | Expected Test |
|----------------|---------------|
| `{module}.repository.ts` | `{module}.repository.integration.spec.ts` |
| `{module}.service.ts` | `{module}.service.spec.ts` |
| `{module}.controller.ts` | `{module}.e2e.spec.ts` |

- Record: `{matched}/{total}` implementation files have tests

#### Check 7: Shared Types Export (Phase 2 Only)

Verify that shared types are properly exported from `libs/shared/src/index.ts`:
```bash
grep -c "export" libs/shared/src/index.ts
```
- Record: exports found or missing

#### Check 8: Phase Context Updated

Check `.phase-context.json`:
- File exists
- Contains an entry for this phase number in `phaseOutputs`
- `completedPhases` array includes this phase number

### Step 4: Generate Report

Print a structured validation report using box-drawing characters:

**Pass example:**
```
+------------------------------------------+
|  VALIDATION REPORT -- Phase 1            |
|  Story: US-001                           |
+------------------------------------------+
|  File Existence    PASS  (6/6 files)     |
|  Build             PASS                  |
|  Tests Pass        PASS  (12 tests)      |
|  Lint Clean        PASS                  |
|  Component Size    PASS  (all < 80 ln)   |
|  Phase Context     PASS                  |
+------------------------------------------+
|  RESULT: PHASE 1 VALIDATED               |
|  Ready for: /implement Phase 2           |
+------------------------------------------+
```

**Fail example:**
```
+------------------------------------------+
|  VALIDATION REPORT -- Phase 1            |
|  Story: US-001                           |
+------------------------------------------+
|  File Existence    FAIL  (4/6 files)     |
|    Missing: TodoForm.tsx, TodoForm.test   |
|  Build             PASS                  |
|  Tests Pass        FAIL  (10/12 passed)  |
|    TodoItem.test > renders title: FAIL   |
|  Lint Clean        PASS                  |
|  Component Size    FAIL                  |
|    TodoList.tsx: 94 lines (limit: 80)    |
|  Phase Context     FAIL                  |
|    .phase-context.json not found         |
+------------------------------------------+
|  RESULT: PHASE 1 BLOCKED                 |
|  Fix 3 issues above before proceeding    |
+------------------------------------------+
```

### Step 5: Gate Decision

- **ALL PASS** — Tell the user they can proceed: `/commit` to save progress, then `/implement Phase {N+1}` for the next phase
- **ANY FAIL** — List the specific fixes needed. Do NOT allow proceeding. Suggest fixing issues and re-running `/validate Phase {N}`.
- **SKIP (Docker unavailable)** — Warn but do not block. Suggest running repository tests later when Docker is available.
