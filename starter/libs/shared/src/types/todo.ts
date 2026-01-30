import type { Timestamps, ListResponse } from './common';

export interface Todo extends Timestamps {
  id: string;
  title: string;
  completed: boolean;
}

export interface CreateTodoRequest {
  title: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

export type TodoListResponse = ListResponse<Todo>;
