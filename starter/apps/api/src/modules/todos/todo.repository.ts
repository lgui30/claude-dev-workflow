import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { todos } from './todo.schema';
import type { TodoEntity, CreateTodoInput, UpdateTodoInput } from './domain/todo.entity';

@Injectable()
export class TodoRepository {
  constructor(@Inject('DATABASE') private db: NodePgDatabase) {}

  async create(input: CreateTodoInput): Promise<TodoEntity> {
    const [result] = await this.db
      .insert(todos)
      .values({ title: input.title })
      .returning();
    return result;
  }

  async findById(id: string): Promise<TodoEntity | null> {
    const [result] = await this.db
      .select()
      .from(todos)
      .where(eq(todos.id, id));
    return result ?? null;
  }

  async findAll(): Promise<TodoEntity[]> {
    return this.db.select().from(todos).orderBy(desc(todos.createdAt));
  }

  async update(id: string, input: UpdateTodoInput): Promise<TodoEntity | null> {
    const values: Record<string, unknown> = { updatedAt: new Date() };
    if (input.title !== undefined) values.title = input.title;
    if (input.completed !== undefined) values.completed = input.completed;

    const [result] = await this.db
      .update(todos)
      .set(values)
      .where(eq(todos.id, id))
      .returning();
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning({ id: todos.id });
    return result.length > 0;
  }
}
