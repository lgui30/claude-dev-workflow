import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface TestDatabase {
  db: NodePgDatabase;
  pool: Pool;
  container: StartedPostgreSqlContainer;
}

/**
 * Start a PostgreSQL Testcontainer and return a Drizzle instance.
 * Call this in `beforeAll` with a 60s timeout.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();
  const pool = new Pool({ connectionString: container.getConnectionUri() });
  const db = drizzle(pool);

  return { db, pool, container };
}

/**
 * Truncate all tables in the public schema.
 * Call this in `beforeEach` to isolate tests.
 */
export async function truncateAllTables(db: NodePgDatabase): Promise<void> {
  await db.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
}

/**
 * Clean up the test database.
 * Call this in `afterAll`.
 */
export async function destroyTestDatabase(testDb: TestDatabase): Promise<void> {
  await testDb.pool.end();
  await testDb.container.stop();
}
