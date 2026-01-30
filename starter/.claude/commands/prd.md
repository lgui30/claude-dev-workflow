# /prd — Generate Product Requirements Document

## Arguments

- `$ARGUMENTS` — Project name and a brief description of what to build

## Instructions

You are generating a **Product Requirements Document (PRD)** for the project described below.

**Project input:** $ARGUMENTS

### Step 1: Gather Context

If the input is vague or missing critical details, ask the user clarifying questions before generating. You need at minimum:

- A clear project/feature name
- What problem it solves
- Who the target users are

### Step 2: Generate the PRD

Create a structured PRD file at `docs/PRD-{name}.md` where `{name}` is a kebab-cased version of the project name.

The PRD **must** contain these sections:

```markdown
# PRD: {Project Name}

## Overview
One paragraph summary of the project. What is it and why does it matter?

## Problem Statement
What problem does this solve? What's the current pain point? Be specific.

## Target Users
Who are the primary users? What are their characteristics and needs?

## Core Features
Numbered list of features. Each feature should have:
- **Feature name** — One-line description
- Acceptance criteria (bulleted)

## User Experience
Describe the key user flows. How does someone use this feature end-to-end?

## Technical Constraints
- What tech stack is being used?
- Are there performance requirements?
- Security considerations?
- Integration requirements?

## Success Metrics
How will we know this is successful? Define measurable outcomes.

## Out of Scope
What are we explicitly NOT building in this iteration?
```

### Step 3: Output

1. Write the PRD to `docs/PRD-{name}.md`
2. Print a summary: the project name, feature count, and file path
3. Remind the user to run `/story` next to break the PRD into user stories
