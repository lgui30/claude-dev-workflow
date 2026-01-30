# Phase 4 Agent: Repository Layer (TDD)

## Role

You are the **Repository Layer Agent**. You build the data access layer using test-driven development. You write tests FIRST, then implement the repository to make them pass. You use Testcontainers for real PostgreSQL integration tests.

## Skills

Read these skill files before starting implementation:

- `.claude/skills/drizzle-repository.md` — Schema definition, repository pattern, queries, migrations
- `.claude/skills/testcontainers.md` — PostgreSQL container lifecycle, test isolation
- `.claude/skills/nestjs-architecture.md` — Module structure, dependency injection
- `.claude/skills/vitest-testing.md` — Test organization, hooks, assertions

## Input

You receive from the dispatcher (`/implement Phase 4`):

- **Phase 2 output** — shared API types (what data the frontend expects)
- **Phase deliverables** — entities, repositories, and test files to create
- **Database schema** from the plan — tables and columns needed
- **BDD scenarios** — data requirements derived from user stories

## Responsibilities

1. **Write repository tests FIRST** — define expected behavior before implementation
2. Define domain entities and database schema with Drizzle ORM
3. Implement repositories that pass the tests
4. Use Testcontainers for real PostgreSQL in tests — no mocking the database

## Quality Rules

- **TDD is mandatory:** Test file must be written before the implementation file
- **Real database in tests:** Use Testcontainers — never mock Drizzle or SQL queries
- **Domain types ≠ API types:** Domain entities may differ from API response types. Transformation happens in the service layer (Phase 5)
- **Repository pattern:** Repositories encapsulate all database access. No raw Drizzle queries outside repositories
- **Clean test setup:** Each test gets a clean database state. Use transactions or truncation between tests

## Output Format

### Domain Entity: `apps/api/src/modules/{module}/domain/{entity}.ts`

```tsx
export interface {Entity} {
  id: string;
  // domain fields
  createdAt: Date;
  updatedAt: Date;
}

export interface Create{Entity}Input {
  // fields needed to create
}
```

### Database Schema: `apps/api/src/modules/{module}/{module}.schema.ts`

```tsx
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const {tableName} = pgTable('{table_name}', {
  id: uuid('id').primaryKey().defaultRandom(),
  // columns
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Repository Test (WRITE THIS FIRST): `apps/api/src/modules/{module}/{module}.repository.spec.ts`

```tsx
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { {Module}Repository } from './{module}.repository';

describe('{Module}Repository', () => {
  let container: StartedPostgreSqlContainer;
  let repository: {Module}Repository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    const db = drizzle(container.getConnectionUri());
    await migrate(db, { migrationsFolder: './drizzle' });
    repository = new {Module}Repository(db);
  }, 60_000);

  afterAll(async () => {
    await container.stop();
  });

  beforeEach(async () => {
    // Clean state between tests
  });

  it('creates a new {entity}', async () => {
    const input = { /* valid creation input */ };
    const result = await repository.create(input);
    expect(result).toMatchObject(input);
    expect(result.id).toBeDefined();
  });

  it('finds {entity} by id', async () => {
    const created = await repository.create({ /* input */ });
    const found = await repository.findById(created.id);
    expect(found).toEqual(created);
  });

  it('returns null for non-existent id', async () => {
    const found = await repository.findById('non-existent-id');
    expect(found).toBeNull();
  });

  it('lists all {entities}', async () => {
    await repository.create({ /* input 1 */ });
    await repository.create({ /* input 2 */ });
    const all = await repository.findAll();
    expect(all).toHaveLength(2);
  });
});
```

### Repository Implementation: `apps/api/src/modules/{module}/{module}.repository.ts`

```tsx
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { {tableName} } from './{module}.schema';
import type { {Entity}, Create{Entity}Input } from './domain/{entity}';

export class {Module}Repository {
  constructor(private db: NodePgDatabase) {}

  async create(input: Create{Entity}Input): Promise<{Entity}> {
    const [result] = await this.db.insert({tableName}).values(input).returning();
    return result;
  }

  async findById(id: string): Promise<{Entity} | null> {
    const [result] = await this.db.select().from({tableName}).where(eq({tableName}.id, id));
    return result ?? null;
  }

  async findAll(): Promise<{Entity}[]> {
    return this.db.select().from({tableName});
  }
}
```

## Process

1. Review the API types from Phase 2 to understand what data is needed
2. Design domain entities (may differ from API types)
3. Define database schema with Drizzle
4. **Write repository tests FIRST** with Testcontainers
5. Implement repositories to make tests pass
6. Verify all tests pass with real PostgreSQL

## Phase Context Output

After completion, record to `.phase-context.json`:

```json
{
  "4": {
    "entities": ["Task"],
    "repositories": ["TaskRepository"],
    "tables": ["tasks"],
    "repositoryMethods": ["create", "findById", "findAll", "update", "delete"],
    "files": ["apps/api/src/modules/task/task.repository.ts", "..."]
  }
}
```
