# claude-dev-workflow

A structured 7-phase AI-assisted development workflow for Claude Code.

## What This Is

An open-source starter kit that gives developers a **repeatable, phased workflow** for building full-stack features with Claude Code. Instead of ad-hoc prompting, you get a structured pipeline with quality gates at every step.

## Getting Started

```bash
cd starter
npm install
docker compose up -d
```

Then open Claude Code and run `/prd` to start your first feature.

## Project Structure

```
claude-dev-workflow/
├── .claude/
│   ├── commands/       # 9 slash commands (your workflow interface)
│   ├── agents/         # 7 phase-specific agents
│   └── skills/         # 9 tech-specific knowledge bases
├── starter/            # Monorepo template (Next.js + NestJS)
│   ├── apps/web/       # Next.js 14 frontend
│   ├── apps/api/       # NestJS backend
│   └── libs/shared/    # Shared TypeScript types
├── docs/               # Workflow documentation
└── README.md
```

## Commands

| Command | Purpose |
|---------|---------|
| `/prd` | Generate a Product Requirements Document |
| `/story` | Create user story with BDD scenarios |
| `/phased-plan` | Map story to 7-phase plan |
| `/implement Phase N` | Execute a specific phase |
| `/validate Phase N` | Quality gate check |
| `/commit` | Conventional commit for the phase |
| `/pr` | Create PR with phase breakdown |
| `/progress` | Check progress |
| `/retro` | Retrospective from git history |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TanStack Query, Zustand, Tailwind CSS |
| Mocking | MSW (Mock Service Worker) |
| Backend | NestJS, Drizzle ORM |
| Database | PostgreSQL 16 (Docker Compose) |
| Testing | Vitest, Testing Library, Testcontainers, Supertest |
| Build | Turborepo, TypeScript |
