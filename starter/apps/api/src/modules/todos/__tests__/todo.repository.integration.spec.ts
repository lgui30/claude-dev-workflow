import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { todos } from '../todo.schema';
import { TodoRepository } from '../todo.repository';

describe('TodoRepository', () => {
  let container: StartedPostgreSqlContainer;
  let db: NodePgDatabase;
  let pool: Pool;
  let repository: TodoRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    db = drizzle(pool);

    // Create table directly for tests (no migration files needed for example)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    repository = new TodoRepository(db);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.delete(todos);
  });

  describe('create', () => {
    it('creates a todo with generated id and defaults', async () => {
      const todo = await repository.create({ title: 'Buy groceries' });

      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Buy groceries');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('returns the todo when it exists', async () => {
      const created = await repository.create({ title: 'Find me' });
      const found = await repository.findById(created.id);
      expect(found).toEqual(created);
    });

    it('returns null when not found', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns todos ordered by creation date descending', async () => {
      await repository.create({ title: 'First' });
      await repository.create({ title: 'Second' });
      await repository.create({ title: 'Third' });

      const all = await repository.findAll();
      expect(all).toHaveLength(3);
      expect(all[0].title).toBe('Third');
      expect(all[2].title).toBe('First');
    });

    it('returns empty array when no todos exist', async () => {
      const all = await repository.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates title', async () => {
      const created = await repository.create({ title: 'Original' });
      const updated = await repository.update(created.id, { title: 'Updated' });

      expect(updated?.title).toBe('Updated');
      expect(updated?.completed).toBe(false);
    });

    it('toggles completed status', async () => {
      const created = await repository.create({ title: 'Toggle me' });
      const updated = await repository.update(created.id, { completed: true });

      expect(updated?.completed).toBe(true);
    });

    it('returns null when updating non-existent todo', async () => {
      const result = await repository.update('00000000-0000-0000-0000-000000000000', {
        title: 'Nope',
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes the todo and returns true', async () => {
      const created = await repository.create({ title: 'Delete me' });
      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('returns false for non-existent todo', async () => {
      const deleted = await repository.delete('00000000-0000-0000-0000-000000000000');
      expect(deleted).toBe(false);
    });
  });
});
