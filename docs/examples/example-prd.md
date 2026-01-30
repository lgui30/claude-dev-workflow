# PRD: Todo List

## Overview

A simple CRUD todo list application that lets users create, view, complete, and delete tasks. This feature serves as the canonical example for the claude-dev-workflow, demonstrating all 7 implementation phases with a universally understood domain.

## Problem Statement

Users need a way to track tasks. They want to quickly add todos, see what's pending, mark items as done, and remove items they no longer need.

## Target Users

Any user of the application who needs basic task tracking.

## Core Features

1. **Create Todo** — Add a new todo with a title
   - Title is required, max 200 characters
   - New todos default to "pending" status

2. **View Todos** — See all todos in a list
   - Show title and completion status
   - Most recent todos appear first

3. **Complete Todo** — Toggle a todo between pending and completed
   - Visual distinction between pending and completed items
   - Completed items show with strikethrough styling

4. **Delete Todo** — Remove a todo permanently
   - Confirmation not required for this simple version

## User Experience

1. User sees a list of existing todos with a form at the top
2. User types a title and submits to create a new todo
3. New todo appears at the top of the list
4. User clicks a todo to toggle its completion status
5. User clicks a delete button to remove a todo

## Technical Constraints

- Frontend: Next.js App Router, TanStack Query, Zustand, Tailwind CSS
- Backend: NestJS, Drizzle ORM, PostgreSQL
- Shared types in `libs/shared/`
- Tests with Vitest, Testing Library, MSW, Testcontainers

## Success Metrics

- All CRUD operations work end-to-end
- All tests pass across frontend and backend
- Clean phase separation — each phase's code is isolated to its layer

## Out of Scope

- User authentication
- Todo categories or tags
- Due dates or priorities
- Drag-and-drop reordering
- Real-time updates
