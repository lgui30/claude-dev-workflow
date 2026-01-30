# Command Reference

Detailed documentation for every slash command.

---

## /prd

Generate a Product Requirements Document.

**Syntax:**
```
/prd {project name and description}
```

**Arguments:**
- Project name and a brief description of what to build

**Output:**
- `docs/PRD-{name}.md` — Structured PRD file

**Sections Generated:**
- Overview
- Problem Statement
- Target Users
- Core Features (with acceptance criteria)
- User Experience
- Technical Constraints
- Success Metrics
- Out of Scope

**Example:**
```
/prd Task management app with CRUD operations and team collaboration
```

Creates `docs/PRD-task-management.md`.

---

## /story

Generate a user story with BDD scenarios.

**Syntax:**
```
/story {story-ID} {story title}
```

**Arguments:**
- Story ID (e.g., `US-001`) — Unique identifier
- Story title — What the user can do

**Prerequisites:**
- A PRD must exist in `docs/PRD-*.md`

**Output:**
- `docs/stories/{story-ID}.md` — User story with BDD scenarios

**Sections Generated:**
- User Story (As a / I want / So that)
- BDD Scenarios (Given / When / Then)
- Acceptance Criteria
- Technical Notes
- Dependencies

**Example:**
```
/story US-001 User can create and view tasks
```

Creates `docs/stories/US-001.md`.

---

## /phased-plan

Generate a 7-phase implementation plan.

**Syntax:**
```
/phased-plan {story-ID}
```

**Arguments:**
- Story ID — The story to plan (must exist in `docs/stories/`)

**Prerequisites:**
- Story file at `docs/stories/{story-ID}.md`
- Referenced PRD must exist

**Output:**
- `docs/plans/PLAN-{story-ID}.md` — 7-phase plan with deliverables

**Per Phase, Generates:**
- Agent assignment
- Deliverable file paths with checkboxes
- BDD scenario mapping
- Phase-specific details (API contract, schema, business rules)

**Example:**
```
/phased-plan US-001
```

Creates `docs/plans/PLAN-US-001.md`.

---

## /implement

Execute a phase using the assigned agent.

**Syntax:**
```
/implement Phase {N}
/implement Phase {N} {story-ID}
```

**Arguments:**
- Phase number (1–7) — Which phase to implement
- Story ID (optional) — Defaults to the most recent plan

**Prerequisites:**
- Plan file at `docs/plans/PLAN-{story-ID}.md`
- Previous phases must be complete (checked via `.phase-context.json`)

**Behavior:**
1. Reads the plan and extracts phase deliverables
2. Loads context from completed phases (`.phase-context.json`)
3. Loads the phase agent (`.claude/agents/{agent}.md`)
4. Agent reads referenced skill files
5. Implements all deliverables
6. Updates `.phase-context.json` with outputs

**Agent Dispatch Table:**

| Phase | Agent File |
|-------|-----------|
| 1 | `frontend-phase-1.md` — Presentational UI |
| 2 | `frontend-phase-2.md` — API Client & Mocks |
| 3 | `frontend-phase-3.md` — Smart Components |
| 4 | `backend-phase-4.md` — Repository Layer (TDD) |
| 5 | `backend-phase-5.md` — Service Layer (TDD) |
| 6 | `backend-phase-6.md` — Controller Layer (TDD) |
| 7 | `integration-phase-7.md` — Integration |

**Example:**
```
/implement Phase 1
/implement Phase 4 US-001
```

---

## /validate

Run quality gate checks on a completed phase.

**Syntax:**
```
/validate Phase {N}
/validate Phase {N} {story-ID}
```

**Arguments:**
- Phase number (1–7) — Which phase to validate
- Story ID (optional) — Defaults to current story from `.phase-context.json`

**Checks Performed:**

| Check | Phases | What It Verifies |
|-------|--------|-----------------|
| File Existence | All | All deliverables from the plan exist |
| Tests Pass | All | `vitest run` succeeds for phase files |
| Lint Clean | All | No ESLint errors, no TypeScript errors |
| Component Size | 1–3 | All components under 80 lines |
| Test Coverage | 4–6 | Every `.ts` file has a `.spec.ts` |
| Phase Context | All | `.phase-context.json` updated |

**Output:**
- Formatted pass/fail report for each check
- `PASS` — Proceed to next phase
- `FAIL` — List of fixes needed

**Example:**
```
/validate Phase 1
```

---

## /commit

Create a conventional commit scoped to the current phase.

**Syntax:**
```
/commit
/commit Phase {N}
/commit {custom scope}
```

**Arguments:**
- Phase number (optional) — Determines the commit scope
- Custom scope (optional) — Override the automatic scope

**Commit Format:**
```
{type}({scope}): {short description}

{body}

Story: {story-ID}
Phase: {N}/7 — {phase title}
```

**Scope Mapping:**

| Phase | Scope |
|-------|-------|
| 1 | `ui` |
| 2 | `api-client` |
| 3 | `smart-components` |
| 4 | `repository` |
| 5 | `service` |
| 6 | `controller` |
| 7 | `integration` |

**Example Output:**
```
feat(ui): add TaskCard and TaskList components

Build presentational components for task display with TypeScript
props, Tailwind styling, and unit tests.

Story: US-001
Phase: 1/7 — Presentational UI
```

---

## /pr

Create a pull request with phase breakdown.

**Syntax:**
```
/pr
/pr {target-branch}
```

**Arguments:**
- Target branch (optional) — Defaults to `main`

**Prerequisites:**
- All 7 phases committed
- `.phase-context.json` with complete phase outputs
- Story and plan files exist

**Output:**
- GitHub PR created via `gh pr create`
- Title: `feat: {story title}`
- Body includes: summary, story reference, phase breakdown, test plan, BDD checklist

**Example:**
```
/pr
/pr develop
```

---

## /progress

Show visual phase completion status.

**Syntax:**
```
/progress
/progress {story-ID}
```

**Arguments:**
- Story ID (optional) — Defaults to the current story from `.phase-context.json`

**Data Sources:**
- `.phase-context.json` — completed phases and outputs
- `docs/plans/PLAN-{story-ID}.md` — planned deliverables per phase
- `git log` — commit history for the feature branch

**Output:**
- ASCII progress bar showing overall completion
- Per-phase table with status, file count, and test count
- Dependency check for the next phase
- Recommended next action (`/implement`, `/validate`, `/commit`, `/pr`, or `/retro`)

**Phase Statuses:**

| Status | Meaning |
|--------|---------|
| `[done]` | Phase complete and in `completedPhases` |
| `[>>>>]` | Work in progress (files exist but not committed) |
| `[    ]` | Pending (no files created yet) |

**Example:**
```
/progress
/progress US-001
```

---

## /retro

Generate a retrospective report for a completed feature.

**Syntax:**
```
/retro
/retro {story-ID}
/retro {branch-name}
```

**Arguments:**
- Story ID or branch name (optional) — Defaults to the current branch

**Prerequisites:**
- Feature should be complete (all 7 phases committed)
- Git history available on the feature branch

**Analysis Performed:**

| Metric | What It Measures |
|--------|-----------------|
| Commits per phase | How many iterations each phase needed |
| Files per phase | Size of each phase's output |
| Rework detection | Files modified after initial commit |
| Contract drift | Shared types changed during integration |
| Test count | Total tests across all phases |

**Output:**
- `docs/retros/RETRO-{story-ID}.md` — Saved retrospective report
- Terminal display of the full report

**Patterns Detected:**
- Single-pass phases (completed in one commit)
- Multi-commit phases (required iteration)
- Fix-after-validate commits
- Type errors fixed post-implementation
- Contract drift in Phase 7

**Example:**
```
/retro
/retro US-001
```
