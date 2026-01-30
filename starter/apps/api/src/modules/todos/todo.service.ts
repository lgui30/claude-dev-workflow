import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from './todo.repository';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@shared/types/todo';
import type { TodoEntity } from './domain/todo.entity';

@Injectable()
export class TodoService {
  constructor(@Inject(TodoRepository) private readonly repository: TodoRepository) {}

  async create(input: CreateTodoRequest): Promise<Todo> {
    const entity = await this.repository.create({ title: input.title });
    return this.toResponse(entity);
  }

  async findAll(): Promise<{ data: Todo[]; total: number }> {
    const entities = await this.repository.findAll();
    return {
      data: entities.map((e) => this.toResponse(e)),
      total: entities.length,
    };
  }

  async findById(id: string): Promise<Todo> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return this.toResponse(entity);
  }

  async update(id: string, input: UpdateTodoRequest): Promise<Todo> {
    const entity = await this.repository.update(id, input);
    if (!entity) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return this.toResponse(entity);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
  }

  private toResponse(entity: TodoEntity): Todo {
    return {
      id: entity.id,
      title: entity.title,
      completed: entity.completed,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
