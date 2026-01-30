# Skill: Testcontainers for PostgreSQL

## Overview

Testcontainers spins up real Docker containers for integration tests. We use it to test repositories against a real PostgreSQL database instead of mocking Drizzle queries. This ensures our SQL actually works.

**Requirement:** Docker must be running on the developer's machine.

## Setup

### Dependencies

```json
{
  "devDependencies": {
    "@testcontainers/postgresql": "^10.0.0",
    "testcontainers": "^10.0.0"
  }
}
```

### Basic Container Lifecycle

```tsx
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let container: StartedPostgreSqlContainer;
let db: NodePgDatabase;
let pool: Pool;

beforeAll(async () => {
  // Start PostgreSQL container — pulls image on first run
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('test')
    .withPassword('test')
    .start();

  // Create connection pool
  pool = new Pool({
    connectionString: container.getConnectionUri(),
  });

  // Initialize Drizzle
  db = drizzle(pool);

  // Run migrations or push schema
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
}, 60_000); // 60s timeout for container startup

afterAll(async () => {
  await pool.end();
  await container.stop();
});
```

## Test Isolation

Each test needs a clean database state. Two strategies:

### Strategy 1: Truncate Tables Between Tests (Recommended)

```tsx
import { sql } from 'drizzle-orm';

beforeEach(async () => {
  // Truncate all tables, reset sequences
  await db.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
});
```

### Strategy 2: Transaction Rollback Per Test

```tsx
import { sql } from 'drizzle-orm';

beforeEach(async () => {
  await db.execute(sql`BEGIN`);
});

afterEach(async () => {
  await db.execute(sql`ROLLBACK`);
});
```

## Full Repository Test Example

```tsx
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { TaskRepository } from './task.repository';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

describe('TaskRepository', () => {
  let container: StartedPostgreSqlContainer;
  let db: NodePgDatabase;
  let pool: Pool;
  let repository: TaskRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    pool = new Pool({ connectionString: container.getConnectionUri() });
    db = drizzle(pool);
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    repository = new TaskRepository(db);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE tasks CASCADE`);
  });

  describe('create', () => {
    it('creates a task with generated id and timestamps', async () => {
      const task = await repository.create({
        title: 'Test task',
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test task');
      expect(task.status).toBe('active');
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('returns the task when it exists', async () => {
      const created = await repository.create({ title: 'Find me' });
      const found = await repository.findById(created.id);
      expect(found).toEqual(created);
    });

    it('returns null when task does not exist', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all tasks ordered by creation date descending', async () => {
      await repository.create({ title: 'First' });
      await repository.create({ title: 'Second' });
      await repository.create({ title: 'Third' });

      const all = await repository.findAll();
      expect(all).toHaveLength(3);
      expect(all[0].title).toBe('Third');
    });

    it('returns empty array when no tasks exist', async () => {
      const all = await repository.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates fields and sets updatedAt', async () => {
      const created = await repository.create({ title: 'Original' });
      const updated = await repository.update(created.id, { title: 'Updated' });

      expect(updated?.title).toBe('Updated');
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('returns null when updating non-existent task', async () => {
      const result = await repository.update('non-existent', { title: 'Nope' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes the task and returns true', async () => {
      const created = await repository.create({ title: 'Delete me' });
      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('returns false for non-existent task', async () => {
      const deleted = await repository.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });
});
```

## Configuration Tips

### Vitest Timeout

Repository tests are slow due to container startup. Configure in `vitest.config.ts`:

```tsx
export default defineConfig({
  test: {
    testTimeout: 30_000,      // 30s per test
    hookTimeout: 120_000,     // 120s for beforeAll (container startup)
  },
});
```

### Reuse Containers Across Test Files

For faster test runs, use a shared container setup:

```tsx
// test/setup-db.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

export async function getTestDatabase() {
  if (!container) {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
  }
  const pool = new Pool({ connectionString: container.getConnectionUri() });
  return { db: drizzle(pool), pool, container };
}
```

### Docker Image Caching

Use a specific image tag (not `latest`) to avoid re-pulls:

```tsx
new PostgreSqlContainer('postgres:16-alpine') // Always pulls the same image
```

## Common Pitfalls

1. **Forgetting the timeout** — Container startup takes 5–15 seconds. Without `{ timeout: 60_000 }` on `beforeAll`, tests fail.

2. **Not cleaning between tests** — Without truncation or rollback, tests depend on each other's data. Always clean in `beforeEach`.

3. **Docker not running** — Tests fail with a connection error. Add a clear error message or skip tests if Docker is unavailable.

4. **Port conflicts** — Testcontainers uses random ports. Never hardcode ports — use `container.getConnectionUri()`.

5. **Forgetting to stop containers** — Always call `container.stop()` in `afterAll`. Leaked containers consume Docker resources.

6. **Slow parallel tests** — Each test file starting its own container is slow. Share containers across files when possible.
