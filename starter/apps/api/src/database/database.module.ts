import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        const connectionString =
          process.env.DATABASE_URL ??
          'postgresql://postgres:postgres@localhost:5432/app_dev';

        const pool = new Pool({ connectionString });
        return drizzle(pool);
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
