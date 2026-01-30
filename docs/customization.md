# Customization Guide

How to adapt the workflow to your tech stack and project needs.

## Swapping Technologies

The 7-phase structure is framework-agnostic. The framework-specific knowledge lives in **skill files** and **agent files**, which you can replace without changing the commands or workflow.

### Replacing the Frontend Framework

**Next.js → Remix**

1. Replace `.claude/skills/nextjs-patterns.md` with a `remix-patterns.md` skill covering:
   - Route conventions (`app/routes/` vs `app/`)
   - Loader/action patterns instead of client-side fetching
   - Outlet nesting
2. Update agents `frontend-phase-1.md` and `frontend-phase-3.md` to reference the new skill
3. Update the `apps/web/` scaffold to use Remix instead of Next.js

**Next.js → Vite + React Router**

1. Create `vite-react-patterns.md` skill
2. Replace TanStack Query references if using React Router's built-in data loading
3. Update `apps/web/` to a standard Vite app

### Replacing the Backend Framework

**NestJS → Express**

1. Replace `.claude/skills/nestjs-architecture.md` with `express-patterns.md` covering:
   - Router/middleware structure
   - Error handling middleware
   - Manual dependency injection or a DI library
2. Update agents `backend-phase-4.md` through `backend-phase-6.md`
3. Update `apps/api/` scaffold

**NestJS → Fastify**

1. Create `fastify-patterns.md` skill
2. Update backend agents for Fastify plugin/decorator patterns
3. Update `apps/api/` scaffold

### Replacing the ORM

**Drizzle → Prisma**

1. Replace `.claude/skills/drizzle-repository.md` with `prisma-patterns.md` covering:
   - Schema definition in `schema.prisma`
   - Prisma Client usage
   - Migration workflow
   - Repository pattern wrapping Prisma
2. Update `backend-phase-4.md` agent
3. Update `apps/api/` to use Prisma

**Drizzle → TypeORM**

1. Create `typeorm-patterns.md` skill
2. Update backend agents for entity/repository decorators
3. Update `apps/api/` scaffold

### Replacing State Management

**Zustand → Jotai**

1. Replace `.claude/skills/zustand-state.md` with `jotai-patterns.md`
2. Update `frontend-phase-3.md` agent

**Zustand → Redux Toolkit**

1. Create `redux-toolkit-patterns.md` skill
2. Update `frontend-phase-3.md` agent

## Writing Custom Skills

Skills are markdown files in `.claude/skills/` that agents reference. A good skill file includes:

### Required Sections

```markdown
# Skill: {Technology Name}

## Overview
What this technology does and how we use it in this project.

## File Structure
Where files go. Use a tree diagram.

## Code Patterns
The main patterns with complete, copy-pasteable examples.
Include the most common operations developers will need.

## Common Pitfalls
Numbered list of mistakes and how to avoid them.
These are the most valuable part — they prevent repeated errors.

## Testing Notes
How to test code that uses this technology.
```

### Tips for Effective Skills

- **Be specific, not generic.** Don't write a tutorial — write the patterns *this project* uses.
- **Include complete examples.** Agents copy patterns from skills. Snippets that can't be copy-pasted are less useful.
- **Focus on pitfalls.** The AI already knows the basics. The value is in what *not* to do.
- **Keep it under 300 lines.** Long skills dilute the important patterns.

## Writing Custom Agents

Agents are markdown files in `.claude/agents/` that define phase behavior. Create custom agents for project-specific phases.

### Agent Template

```markdown
# Phase N Agent: {Title}

## Role
One paragraph defining what this agent does.

## Skills
List the skill files this agent should read before starting.

## Input
What context this agent receives from the dispatcher.

## Responsibilities
Numbered list of what this agent must do.

## Quality Rules
Hard constraints (file size, no-import rules, testing requirements).

## Output Format
Templates for the files this agent creates.

## Process
Step-by-step instructions for the agent to follow.

## Phase Context Output
What to record in .phase-context.json after completion.
```

### Custom Phase Example: Design System Phase

If your project needs a design system setup phase before component building:

```markdown
# Phase 0 Agent: Design System

## Role
Set up the design system foundations: color tokens, typography scale,
spacing scale, and base component primitives.

## Skills
- `.claude/skills/tailwind-design-system.md`

## Responsibilities
1. Define color palette as Tailwind theme extensions
2. Set up typography scale
3. Create base primitives: Button, Input, Card, Badge
4. Document tokens in a Storybook-style page
```

## Customizing Commands

Commands in `.claude/commands/` control the workflow pipeline. Common customizations:

### Adding a `/design` Command

Create `.claude/commands/design.md` for generating UI mockup descriptions before Phase 1:

```markdown
# /design — Generate UI Mockup Description

## Arguments
- `$ARGUMENTS` — Story ID

## Instructions
Read the user story and generate a detailed text-based UI mockup
for each screen. Describe layout, component placement, and
responsive behavior. Output to docs/designs/{story-ID}.md.
```

### Modifying `/validate` Checks

Edit `.claude/commands/validate.md` to add project-specific checks:

- Bundle size limits
- Accessibility audit (axe-core)
- API response time thresholds
- Custom linting rules

### Changing the Phase Count

The workflow uses 7 phases by default. To simplify:

- **5-phase workflow:** Merge Phases 1–3 into "Frontend" and Phases 4–6 into "Backend"
- **3-phase workflow:** Frontend → Backend → Integration
- **Single-phase:** For simple features, skip the plan and implement directly

Update `/phased-plan` and `/implement` to match your phase count, and create corresponding agent files.

## Monorepo Alternatives

### Nx Instead of Turborepo

Replace `turbo.json` with `nx.json` and update root `package.json` scripts:

```json
{
  "scripts": {
    "dev": "nx run-many --target=dev",
    "build": "nx run-many --target=build",
    "test": "nx run-many --target=test"
  }
}
```

### No Monorepo (Separate Repos)

If frontend and backend are separate repositories:

1. Move `libs/shared/` to an npm package published to a private registry
2. Both repos depend on the shared package
3. Adjust agent output paths accordingly
4. Use Phase 7 to verify cross-repo integration
