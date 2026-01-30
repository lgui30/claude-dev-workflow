import { http, HttpResponse, delay } from 'msw';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@shared/types/todo';

let mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Set up project',
    completed: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Build UI components',
    completed: false,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const todoHandlers = [
  http.get('*/api/todos', async () => {
    await delay(150);
    return HttpResponse.json({
      data: [...mockTodos].reverse(),
      total: mockTodos.length,
    });
  }),

  http.post('*/api/todos', async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as CreateTodoRequest;
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: body.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    mockTodos.push(newTodo);
    return HttpResponse.json(newTodo, { status: 201 });
  }),

  http.patch('*/api/todos/:id', async ({ params, request }) => {
    await delay(100);
    const body = (await request.json()) as UpdateTodoRequest;
    const todo = mockTodos.find((t) => t.id === params.id);
    if (!todo) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    if (body.title !== undefined) todo.title = body.title;
    if (body.completed !== undefined) todo.completed = body.completed;
    todo.updatedAt = new Date().toISOString();
    return HttpResponse.json(todo);
  }),

  http.delete('*/api/todos/:id', async ({ params }) => {
    await delay(100);
    const index = mockTodos.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    mockTodos.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
