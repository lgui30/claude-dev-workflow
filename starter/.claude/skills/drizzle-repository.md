# Skill: Drizzle ORM & Repository Pattern

## Overview

Drizzle ORM is the type-safe SQL toolkit for our backend. We wrap Drizzle operations in repository classes to encapsulate data access. Each feature module has its own schema definition and repository.

## File Structure

```
apps/api/src/
├── drizzle/
│   ├── drizzle.config.ts        # Drizzle Kit config
│   └── migrations/              # Generated migration files
└── modules/{feature}/
    ├── {feature}.schema.ts      # Table definition
    ├── {feature}.repository.ts  # Data access class
    └── domain/{entity}.ts       # Domain type
```

## Schema Definition

Define tables using Drizzle's schema builder:

```tsx
// modules/task/task.schema.ts
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const taskStatusEnum = pgEnum('task_status', ['active', 'completed']);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  description: varchar('description', { length: 2000 }),
  status: taskStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Infer TypeScript types from schema
export type TaskRecord = typeof tasks.$inferSelect;
export type NewTaskRecord = typeof tasks.$inferInsert;
```

## Relations

Define relations between tables:

```tsx
import { relations } from 'drizzle-orm';
import { tasks } from './task.schema';
import { comments } from '../comment/comment.schema';

export const taskRelations = relations(tasks, ({ many }) => ({
  comments: many(comments),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
}));
```

## Repository Pattern

Repositories encapsulate all database queries for a resource:

```tsx
// modules/task/task.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, and, ilike } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { tasks, type TaskRecord, type NewTaskRecord } from './task.schema';

@Injectable()
export class TaskRepository {
  constructor(@Inject('DATABASE') private db: NodePgDatabase) {}

  async create(input: NewTaskRecord): Promise<TaskRecord> {
    const [result] = await this.db
      .insert(tasks)
      .values(input)
      .returning();
    return result;
  }

  async findById(id: string): Promise<TaskRecord | null> {
    const [result] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return result ?? null;
  }

  async findAll(): Promise<TaskRecord[]> {
    return this.db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));
  }

  async findByStatus(status: string): Promise<TaskRecord[]> {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .orderBy(desc(tasks.createdAt));
  }

  async update(id: string, input: Partial<NewTaskRecord>): Promise<TaskRecord | null> {
    const [result] = await this.db
      .update(tasks)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    return result.length > 0;
  }

  async search(query: string): Promise<TaskRecord[]> {
    return this.db
      .select()
      .from(tasks)
      .where(ilike(tasks.title, `%${query}%`))
      .orderBy(desc(tasks.createdAt));
  }
}
```

## Transactions

Use Drizzle transactions for multi-step operations:

```tsx
async createWithComments(taskInput: NewTaskRecord, comments: string[]): Promise<TaskRecord> {
  return this.db.transaction(async (tx) => {
    const [task] = await tx.insert(tasks).values(taskInput).returning();

    if (comments.length > 0) {
      await tx.insert(commentsTable).values(
        comments.map((text) => ({ taskId: task.id, text }))
      );
    }

    return task;
  });
}
```

## Migrations

### Drizzle Kit Configuration

```tsx
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/*//*.schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Generate and Run Migrations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Push schema directly (development only)
npx drizzle-kit push

# Apply migrations
npx drizzle-kit migrate
```

## Database Connection Setup

```tsx
// Provide Drizzle DB instance via NestJS DI
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        return drizzle(pool);
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
```

## Query Builder Patterns

```tsx
// Conditional filters
async findWithFilters(filters: TaskFilters): Promise<TaskRecord[]> {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(tasks.status, filters.status));
  }
  if (filters.search) {
    conditions.push(ilike(tasks.title, `%${filters.search}%`));
  }

  return this.db
    .select()
    .from(tasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tasks.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

// Joins
async findWithComments(id: string) {
  return this.db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: {
      comments: true,
    },
  });
}

// Aggregations
async countByStatus() {
  return this.db
    .select({
      status: tasks.status,
      count: sql<number>`count(*)::int`,
    })
    .from(tasks)
    .groupBy(tasks.status);
}
```

## Common Pitfalls

1. **Raw Drizzle queries outside repositories** — All DB access goes through repositories. Services never import Drizzle operators directly.

2. **Forgetting `.returning()`** — Insert/update/delete don't return data by default. Chain `.returning()` to get the affected rows.

3. **Not handling null from `findById`** — Always return `null` (not `undefined`) for missing records. The service layer converts this to `NotFoundException`.

4. **Mocking Drizzle in tests** — Don't mock the ORM. Use Testcontainers for repository tests against a real PostgreSQL (see `testcontainers` skill).

5. **Schema drift** — Always generate migrations after schema changes. Don't push schema directly in production.

6. **Missing `updatedAt` on updates** — Drizzle doesn't auto-update timestamps. Always set `updatedAt: new Date()` in update operations.
