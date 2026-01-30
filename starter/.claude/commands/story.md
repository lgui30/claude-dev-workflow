# /story — Generate User Story with BDD Scenarios

## Arguments

- `$ARGUMENTS` — Story ID and title (e.g., "US-001 User can create a new task")

## Instructions

You are generating a **User Story** with BDD (Behavior-Driven Development) scenarios.

**Story input:** $ARGUMENTS

### Step 1: Parse Input

Extract the **story ID** (e.g., `US-001`) and the **story title** from the arguments. If no ID is provided, ask the user for one.

### Step 2: Find the PRD

Look for PRD files in `docs/PRD-*.md`. If multiple exist, ask the user which PRD this story belongs to. Read the PRD to understand the project context, features, and constraints.

### Step 3: Generate the User Story

Create the story file at `docs/stories/{story-ID}.md` with this structure:

```markdown
# {Story ID}: {Story Title}

## User Story
As a [type of user],
I want [action/goal],
So that [benefit/value].

## BDD Scenarios

### Scenario 1: {Happy path name}
**Given** [precondition]
**When** [action taken]
**Then** [expected outcome]
**And** [additional outcome if needed]

### Scenario 2: {Alternative path name}
**Given** [precondition]
**When** [action taken]
**Then** [expected outcome]

### Scenario 3: {Error/edge case name}
**Given** [precondition]
**When** [action taken]
**Then** [expected error handling]

## Acceptance Criteria
- [ ] {Criterion 1 — derived from scenarios}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

## Technical Notes
Any implementation hints, API endpoints needed, data models involved, or dependencies on other stories.

## Dependencies
- PRD: {link to PRD file}
- Blocked by: {other story IDs, if any}
```

### Step 4: Output

1. Write the story to `docs/stories/{story-ID}.md`
2. Print a summary: story ID, title, number of BDD scenarios, and file path
3. Remind the user to run `/phased-plan` next to create an implementation plan for this story
