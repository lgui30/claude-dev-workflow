# Skill: NestJS Clean Architecture

## Overview

NestJS is the backend framework. We follow a modular, clean architecture: each feature is a self-contained module with controller → service → repository layers. Dependency injection wires everything together.

## File Structure

```
apps/api/src/
├── main.ts                             # Bootstrap
├── app.module.ts                       # Root module
└── modules/
    └── {feature}/
        ├── {feature}.module.ts         # Module definition
        ├── {feature}.controller.ts     # HTTP layer (thin)
        ├── {feature}.service.ts        # Business logic
        ├── {feature}.repository.ts     # Data access (Drizzle)
        ├── {feature}.schema.ts         # Drizzle table schema
        ├── domain/
        │   └── {entity}.ts             # Domain entity types
        ├── dto/
        │   ├── create-{entity}.dto.ts  # Input validation
        │   └── update-{entity}.dto.ts
        ├── {feature}.service.spec.ts       # Unit tests
        ├── {feature}.repository.spec.ts    # Integration tests
        └── {feature}.e2e.spec.ts           # E2E tests
```

## Module Pattern

Every feature is encapsulated in a NestJS module:

```tsx
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService], // Export service for other modules
})
export class TaskModule {}
```

Register in the root module:

```tsx
import { Module } from '@nestjs/common';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [TaskModule],
})
export class AppModule {}
```

## Controller Layer (Thin)

Controllers handle HTTP concerns only: parse input, call service, return response.

```tsx
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.taskService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
```

## Service Layer (Business Logic)

Services contain all business rules, validation, and data transformation.

```tsx
import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import type { Task } from '@shared/types/task';

@Injectable()
export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async create(input: CreateTaskDto): Promise<Task> {
    const entity = await this.repository.create({
      title: input.title,
      status: 'active',
    });
    return this.toResponse(entity);
  }

  async findById(id: string): Promise<Task> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return this.toResponse(entity);
  }

  async findAll(): Promise<{ data: Task[]; total: number }> {
    const entities = await this.repository.findAll();
    return {
      data: entities.map(this.toResponse),
      total: entities.length,
    };
  }

  private toResponse(entity: TaskEntity): Task {
    return {
      id: entity.id,
      title: entity.title,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
```

## DTO Validation

Use `class-validator` for input validation:

```tsx
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsEnum(['active', 'completed'])
  @IsOptional()
  status?: 'active' | 'completed';
}
```

Enable validation globally in `main.ts`:

```tsx
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,          // Auto-transform types
  }));
  app.enableCors();
  await app.listen(3001);
}
```

## Exception Handling

NestJS exception filters convert thrown exceptions to HTTP responses:

```
NotFoundException      → 404
BadRequestException    → 400
ConflictException      → 409
ForbiddenException     → 403
UnauthorizedException  → 401
```

Throw from services, not controllers:

```tsx
// GOOD — service throws domain exception
throw new NotFoundException(`Task ${id} not found`);

// BAD — controller handles error logic
if (!task) {
  res.status(404).json({ message: 'Not found' });
}
```

## Dependency Injection

NestJS DI is constructor-based. Providers are registered per module:

```tsx
// Automatic injection via constructor
@Injectable()
export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly logger: LoggerService,  // Can inject other services
  ) {}
}
```

For custom providers (e.g., Drizzle DB instance):

```tsx
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return drizzle(connectionString);
      },
    },
    TaskRepository,
  ],
})
export class TaskModule {}

// In repository:
@Injectable()
export class TaskRepository {
  constructor(@Inject('DATABASE') private db: NodePgDatabase) {}
}
```

## Guards, Interceptors, Pipes

- **Guards** — Authentication/authorization checks (run before controller)
- **Interceptors** — Transform response, add logging, handle timeouts
- **Pipes** — Validate/transform input data

Apply them at different scopes:

```tsx
// Method level
@UseGuards(AuthGuard)
@Get('protected')
getProtected() {}

// Controller level
@UseGuards(AuthGuard)
@Controller('api/admin')
export class AdminController {}

// Global level (main.ts)
app.useGlobalGuards(new AuthGuard());
```

## Common Pitfalls

1. **Business logic in controllers** — Controllers should only parse input and return output. Move all logic to services.

2. **Forgetting to export services** — If module A needs module B's service, module B must `exports: [ServiceB]` and module A must `imports: [ModuleB]`.

3. **Not using ValidationPipe globally** — Without it, DTOs are just type annotations with no runtime validation.

4. **Circular dependencies** — If module A imports module B and B imports A, use `forwardRef()`. Better: redesign to avoid the cycle.

5. **Tight coupling to database** — Repositories abstract the database. Services should depend on repository interfaces, not Drizzle directly.

## Testing Notes

- **Controller E2E tests** — Use `@nestjs/testing` with Supertest to test the full HTTP stack
- **Service unit tests** — Mock repositories with `vi.fn()` (see `vitest-testing` skill)
- **Repository integration tests** — Use Testcontainers with real PostgreSQL (see `testcontainers` skill)
