# /implement — Phase Dispatcher

## Arguments

- `$ARGUMENTS` — Phase identifier (e.g., "Phase 1", "Phase 3", "Phase 7") and optionally the story ID

## Instructions

You are the **phase dispatcher**. Your job is to route implementation work to the correct phase agent with the right context.

**Input:** $ARGUMENTS

### Step 1: Parse Arguments

Extract:
- **Phase number** (1–7) from the arguments
- **Story ID** (optional) — if not provided, look for the most recent plan in `docs/plans/PLAN-*.md`

### Step 2: Load the Plan

Read the plan file at `docs/plans/PLAN-{story-ID}.md`. If it doesn't exist, tell the user to run `/phased-plan` first.

Extract the section for the target phase, including:
- Deliverables (file paths)
- BDD mapping or business rules
- Any phase-specific context (API contract, database schema, etc.)

### Step 3: Load Phase Context Chain

Read `.phase-context.json` from the project root. This file tracks outputs from completed phases.

See `docs/phase-context-chaining.md` for the full format specification.

**If the file exists:**
- Verify the `storyId` matches
- Check that prerequisite phases are in `completedPhases`:
  - Phase 1: no prerequisites
  - Phase 2: Phase 1 complete
  - Phase 3: Phases 1 and 2 complete
  - Phase 4: Phase 2 complete (shared types needed)
  - Phase 5: Phase 4 complete
  - Phase 6: Phase 5 complete
  - Phase 7: Phases 1–6 complete
- Extract relevant `phaseOutputs` for the target phase

**If the file doesn't exist:**
- Phase 1: Create it with story metadata
- Phase 2+: Warn the user. Offer to scan existing files and reconstruct context, or ask them to re-run earlier phases.

### Step 4: Dispatch to Agent

Load the correct agent file based on phase number:

| Phase | Agent File |
|-------|-----------|
| 1 | `.claude/agents/frontend-phase-1.md` |
| 2 | `.claude/agents/frontend-phase-2.md` |
| 3 | `.claude/agents/frontend-phase-3.md` |
| 4 | `.claude/agents/backend-phase-4.md` |
| 5 | `.claude/agents/backend-phase-5.md` |
| 6 | `.claude/agents/backend-phase-6.md` |
| 7 | `.claude/agents/integration-phase-7.md` |

Read the agent file and follow its instructions, passing along:
- The phase deliverables from the plan
- Context from previous phases (from `.phase-context.json`)
- The original BDD scenarios from the user story

### Step 5: Execute Implementation

Implement all deliverables listed for this phase following the agent's rules.

### Step 6: Write Phase Context

After implementation, update `.phase-context.json`:

1. Add this phase number to `completedPhases`
2. Set `currentPhase` to the next phase number
3. Add this phase's outputs to `phaseOutputs.{N}` with:
   - `phase` — phase title
   - `files` — array of file paths created
   - `testFiles` — array of test file paths
   - `testCount` — number of test cases
   - Phase-specific keys (see table below)

**Phase-specific output keys:**

| Phase | Keys |
|-------|------|
| 1 | `components`, `propsInterfaces` |
| 2 | `sharedTypes`, `apiHooks`, `endpoints`, `mswHandlers` |
| 3 | `pages`, `stores` |
| 4 | `entities`, `repositories`, `schema` |
| 5 | `services`, `domainTypes` |
| 6 | `controllers`, `modules`, `dtos` |
| 7 | `integrationNotes` |

### Step 7: Summary

Print a summary of what was created:

```
Phase {N} Complete: {Phase Title}
---------------------------------
Files created:  {count}
Tests written:  {count}
Context saved:  .phase-context.json updated

Next steps:
  /validate Phase {N}  -- verify quality gates
  /commit              -- save progress
  /progress            -- check overall status
```
