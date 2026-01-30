# /progress — Visual Phase Progress

## Arguments

- `$ARGUMENTS` — Optional: story ID (e.g., "US-001"). If omitted, reads from `.phase-context.json`.

## Instructions

You are generating a **visual progress report** showing which phases are complete, in-progress, or pending for the current feature.

**Input:** $ARGUMENTS

### Step 1: Load State

1. Read `.phase-context.json` for the story ID and `completedPhases` array
2. Read the plan at `docs/plans/PLAN-{story-ID}.md` to get the full phase list
3. Run `git log main..HEAD --oneline` to detect any uncommitted phase work

Determine the status of each phase:
- **Done** — listed in `completedPhases` and has a matching commit
- **Active** — has deliverable files on disk but not yet in `completedPhases` (work in progress)
- **Pending** — no files created yet

### Step 2: Generate Progress Display

Print an ASCII progress bar and phase table:

```
  US-001: Todo List Management
  ================================================

  Progress: [################........] 4/7 phases (57%)

  Phase  Status   Title                    Files  Tests
  -----  -------  -----------------------  -----  -----
    1    [done]   Presentational UI          6     12
    2    [done]   API Client & Mocks         3      -
    3    [done]   Smart Components           3      4
    4    [done]   Repository Layer           4      8
    5    [    ]   Service Layer              -      -
    6    [    ]   Controller Layer           -      -
    7    [    ]   Integration                -      -

  Next step: /implement Phase 5
  ================================================
```

**Active phase (work in progress):**
```
  Progress: [################=>......] 4.5/7 phases

    5    [>>>>]   Service Layer              1/2    0/8
```

### Step 3: Show Phase Dependencies

If the next pending phase has dependencies, show them:

```
  Dependencies for Phase 5:
    Phase 4 (Repository Layer)  [done]  -- provides repository interfaces
```

If dependencies are unmet:
```
  BLOCKED: Phase 5 requires Phase 4 to be completed first.
  Run: /implement Phase 4
```

### Step 4: Summary Stats

Show aggregate stats at the bottom:

```
  Summary
  -------
  Files created:    16 / ~23 estimated
  Tests written:    24 / ~37 estimated
  Commits:          4
  Time on branch:   2 sessions
```

File counts come from `.phase-context.json` outputs. Estimates come from the plan's deliverable counts.

### Step 5: Next Action

Based on the current state, recommend the next action:

| State | Recommendation |
|-------|----------------|
| Phase N just completed, not validated | Run `/validate Phase {N}` |
| Phase N validated, not committed | Run `/commit` |
| Phase N committed, next phase ready | Run `/implement Phase {N+1}` |
| All 7 phases complete | Run `/pr` to create the pull request |
| All 7 phases complete + PR exists | Run `/retro` for retrospective |
