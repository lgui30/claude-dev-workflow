# /retro — Feature Retrospective

## Arguments

- `$ARGUMENTS` — Optional: story ID (e.g., "US-001") or branch name. If omitted, analyzes the current branch.

## Instructions

You are generating a **retrospective report** for a completed feature. Your job is to analyze git history and project artifacts to surface patterns, measure delivery quality, and suggest workflow improvements.

**Input:** $ARGUMENTS

### Step 1: Gather Data

#### Git History

```bash
# All commits on the feature branch
git log main..HEAD --oneline --format="%h %s"

# Commits per phase (by scope in commit message)
git log main..HEAD --oneline --grep="(ui):" --grep="(api-client):" --grep="(smart-components):" --grep="(repository):" --grep="(service):" --grep="(controller):" --grep="(integration):"

# Files changed per commit
git log main..HEAD --stat --format="%h %s"

# Total diff stats
git diff main..HEAD --stat
```

#### Project Artifacts

- Read `.phase-context.json` for the story ID and completed phases
- Read the plan at `docs/plans/PLAN-{story-ID}.md` for planned vs. actual deliverables
- Read the user story at `docs/stories/{story-ID}.md` for BDD scenarios

### Step 2: Analyze Phase Delivery

For each phase (1–7), report:

| Metric | How to Measure |
|--------|----------------|
| Commits | Count commits matching the phase scope |
| Files created | Count new files in that phase's commit(s) |
| Files modified | Count files changed after initial commit (rework) |
| Test count | Count `it()` or `test()` calls in test files |

Flag phases with **high rework** (multiple commits modifying the same files), which indicates the phase wasn't completed cleanly on the first pass.

### Step 3: Identify Patterns

Analyze the git history for these patterns:

#### Iteration Patterns
- **Single-pass phases** — completed in one commit (ideal)
- **Multi-commit phases** — required fixes after initial implementation
- **Fix-after-validate** — commits that follow a validation failure

#### Common Issues
Look for these in commit messages and diffs:
- Type errors fixed after implementation
- Test failures fixed after writing
- Lint fixes as separate commits
- Import/export issues between shared types and consumers

#### Contract Drift
Check if Phase 7 (integration) required changes to earlier phases:
- Shared types modified in Phase 7 commits
- API hooks updated after backend was built
- MSW handlers changed to match real API behavior

### Step 4: Generate Report

```
+--------------------------------------------------+
|  RETROSPECTIVE -- US-001: {Story Title}           |
|  Branch: feat/US-001-{name}                       |
|  Commits: {total} | Files: {total}                |
+--------------------------------------------------+

  Phase Delivery
  -----------------------------------------------
  Phase 1 (UI)              1 commit    6 files
  Phase 2 (API Client)      1 commit    3 files
  Phase 3 (Smart Components) 2 commits  3 files  *
  Phase 4 (Repository)      1 commit    4 files
  Phase 5 (Service)         1 commit    2 files
  Phase 6 (Controller)      1 commit    3 files
  Phase 7 (Integration)     1 commit    2 files

  * = required iteration (multiple commits)

  Delivery Quality
  -----------------------------------------------
  Single-pass phases:     6/7 (86%)
  Total rework commits:   1
  Contract drift:         None detected
  Test count:             37 tests across 8 files

  Patterns Observed
  -----------------------------------------------
  - Phase 3 required a second commit to fix MSW
    handler URL matching in integration tests
  - All backend phases completed in single pass
    (inside-out TDD working well)

  Suggestions
  -----------------------------------------------
  1. MSW handlers should use wildcard origins
     (*/api/...) to avoid URL mismatch in Node.js
     test environments.
  2. Consider adding a pre-phase checklist for
     Phase 3 to verify MSW setup before wiring.

+--------------------------------------------------+
```

### Step 5: Save Report

Write the report to `docs/retros/RETRO-{story-ID}.md` (create the `docs/retros/` directory if needed).

Print the report to the terminal and confirm the file path.
