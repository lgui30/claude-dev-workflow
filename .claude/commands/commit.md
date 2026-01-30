# /commit — Phase-Scoped Conventional Commit

## Arguments

- `$ARGUMENTS` — Optional: phase number or custom scope (e.g., "Phase 3", "docs")

## Instructions

You are creating a **conventional commit** scoped to the current phase of work.

**Input:** $ARGUMENTS

### Step 1: Determine Scope

Check `.phase-context.json` for the current story and phase context. Determine:
- **Story ID** (e.g., `US-001`)
- **Phase number** (from arguments or the latest completed phase in context)
- **Phase name** (e.g., "presentational-ui", "api-client", "repository-layer")

Phase scope mappings:
| Phase | Scope |
|-------|-------|
| 1 | `ui` |
| 2 | `api-client` |
| 3 | `smart-components` |
| 4 | `repository` |
| 5 | `service` |
| 6 | `controller` |
| 7 | `integration` |

### Step 2: Analyze Changes

Run `git diff --staged` and `git diff` to understand what changed. Categorize:
- **New files** — these are `feat` type
- **Modified files** — could be `feat`, `fix`, `refactor`
- **Test files** — these support the main type
- **Config changes** — these are `chore`

### Step 3: Generate Commit Message

Follow conventional commits format:

```
{type}({scope}): {short description}

{body — what was built and why}

Story: {story-ID}
Phase: {N}/7 — {phase title}
```

**Examples:**
```
feat(ui): add TaskCard and TaskList components

Build presentational components for task display with TypeScript
props, Tailwind styling, and unit tests.

Story: US-001
Phase: 1/7 — Presentational UI
```

```
feat(repository): add task repository with Testcontainers tests

Implement Drizzle-based TaskRepository with full CRUD operations.
Tests use Testcontainers with real PostgreSQL.

Story: US-001
Phase: 4/7 — Repository Layer
```

### Step 4: Execute

1. Stage all relevant files: `git add {files}`
2. Create the commit with the generated message
3. Print the commit hash and summary
4. If this is Phase 7, remind the user to run `/pr` to create the pull request
