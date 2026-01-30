import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TodoController } from '../todo.controller';
import { TodoService } from '../todo.service';
import type { TodoEntity } from '../domain/todo.entity';

// In-memory store that simulates the full service layer.
// We wire the controller directly to avoid NestJS DI metadata issues with esbuild.
function createInMemoryService() {
  const store = new Map<string, TodoEntity>();

  function toResponse(entity: TodoEntity) {
    return {
      id: entity.id,
      title: entity.title,
      completed: entity.completed,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  return {
    create: async (input: { title: string }) => {
      const entity: TodoEntity = {
        id: crypto.randomUUID(),
        title: input.title,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.set(entity.id, entity);
      return toResponse(entity);
    },
    findAll: async () => {
      const entities = Array.from(store.values()).reverse();
      return { data: entities.map(toResponse), total: entities.length };
    },
    findById: async (id: string) => {
      const entity = store.get(id);
      if (!entity) {
        const { NotFoundException } = await import('@nestjs/common');
        throw new NotFoundException(`Todo with id ${id} not found`);
      }
      return toResponse(entity);
    },
    update: async (id: string, input: { title?: string; completed?: boolean }) => {
      const entity = store.get(id);
      if (!entity) {
        const { NotFoundException } = await import('@nestjs/common');
        throw new NotFoundException(`Todo with id ${id} not found`);
      }
      if (input.title !== undefined) entity.title = input.title;
      if (input.completed !== undefined) entity.completed = input.completed;
      entity.updatedAt = new Date();
      return toResponse(entity);
    },
    remove: async (id: string) => {
      if (!store.delete(id)) {
        const { NotFoundException } = await import('@nestjs/common');
        throw new NotFoundException(`Todo with id ${id} not found`);
      }
    },
  };
}

describe('Todo E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        { provide: TodoService, useValue: createInMemoryService() },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/todos — creates a todo', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ title: 'Buy groceries' })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: 'Buy groceries',
      completed: false,
    });
  });

  it('GET /api/todos — returns todo list', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/todos')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('PATCH /api/todos/:id — toggles completion', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ title: 'Toggle me' });

    const response = await request(app.getHttpServer())
      .patch(`/api/todos/${created.body.id}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.completed).toBe(true);
  });

  it('DELETE /api/todos/:id — removes a todo', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/todos')
      .send({ title: 'Delete me' });

    await request(app.getHttpServer())
      .delete(`/api/todos/${created.body.id}`)
      .expect(204);
  });

  it('GET /api/todos/:id — returns 404 for non-existent todo', async () => {
    await request(app.getHttpServer())
      .get('/api/todos/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
