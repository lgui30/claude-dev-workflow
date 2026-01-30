import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { TodoModule } from './modules/todos/todo.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, HealthModule, TodoModule],
})
export class AppModule {}
