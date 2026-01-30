# US-001: User can create, view, complete, and delete todos

## User Story

As a user,
I want to create, view, complete, and delete todos,
So that I can track my tasks.

## BDD Scenarios

### Scenario 1: View empty todo list

**Given** no todos exist
**When** the user visits the todos page
**Then** they see an empty state message

### Scenario 2: Create a new todo

**Given** the user is on the todos page
**When** they type "Buy groceries" in the form and submit
**Then** a new todo "Buy groceries" appears in the list with pending status

### Scenario 3: View existing todos

**Given** todos "Buy groceries" and "Walk the dog" exist
**When** the user visits the todos page
**Then** both todos are displayed in the list

### Scenario 4: Complete a todo

**Given** a pending todo "Buy groceries" exists
**When** the user clicks the todo to toggle it
**Then** the todo shows as completed with strikethrough styling

### Scenario 5: Delete a todo

**Given** a todo "Buy groceries" exists
**When** the user clicks the delete button
**Then** the todo is removed from the list

### Scenario 6: Form validation

**Given** the user is on the todos page
**When** they submit the form with an empty title
**Then** the todo is not created

## Acceptance Criteria

- [ ] Empty state shown when no todos exist
- [ ] Can create a todo with a title
- [ ] Todos display in a list with title and status
- [ ] Can toggle todo between pending and completed
- [ ] Can delete a todo
- [ ] Empty title is rejected

## Technical Notes

- API endpoints: `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`
- Database table: `todos` with columns `id`, `title`, `completed`, `created_at`, `updated_at`
- Shared types: `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `TodoListResponse`

## Dependencies

- PRD: docs/examples/example-prd.md
