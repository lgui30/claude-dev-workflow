# /pr — Create Pull Request with Phase Breakdown

## Arguments

- `$ARGUMENTS` — Optional: target branch (defaults to `main`)

## Instructions

You are creating a **pull request** that summarizes all phase commits for a completed feature.

**Input:** $ARGUMENTS

### Step 1: Gather Context

1. Read `.phase-context.json` for the story ID and completed phases
2. Read the user story at `docs/stories/{story-ID}.md` for the feature description
3. Read the plan at `docs/plans/PLAN-{story-ID}.md` for the phase breakdown
4. Run `git log main..HEAD --oneline` to get all commits on this branch

### Step 2: Generate PR Content

Create the PR with this structure:

**Title:** `feat: {story title}` (under 72 characters)

**Body:**
```markdown
## Summary

{2-3 sentence description of what this feature does, written for a code reviewer}

## Story Reference

- Story: {story-ID} — {title}
- PRD: {PRD file path}

## Phase Breakdown

### Phase 1: Presentational UI ✅
- Built: {component list}
- Tests: {count} unit tests

### Phase 2: API Client & Mocks ✅
- Hooks: {hook list}
- MSW handlers: {handler list}
- Shared types: {type list}

### Phase 3: Smart Components ✅
- Pages: {page list}
- Stores: {store list}
- Tests: {count} integration tests

### Phase 4: Repository Layer ✅
- Schema: {table list}
- Repositories: {repo list}
- Tests: {count} with Testcontainers

### Phase 5: Service Layer ✅
- Services: {service list}
- Tests: {count} with mocked repos

### Phase 6: Controller Layer ✅
- Endpoints: {endpoint list}
- Tests: {count} E2E tests

### Phase 7: Integration ✅
- MSW mocks removed for production paths
- E2E verification passing

## Test Plan

- [ ] All unit tests pass (`npm run test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Lint clean (`npm run lint`)
- [ ] Type check clean (`npm run typecheck`)
- [ ] Manual smoke test of primary user flow
- [ ] Verify no MSW handlers leak into production

## BDD Scenarios Covered

{List each scenario from the user story with ✅}
```

### Step 3: Create the PR

Use `gh pr create` with the generated title and body, targeting the specified branch (default `main`).

Print the PR URL when done.
