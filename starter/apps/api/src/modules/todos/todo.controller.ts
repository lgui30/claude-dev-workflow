import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoListResponse } from '@shared/types/todo';

@Controller('api/todos')
export class TodoController {
  constructor(@Inject(TodoService) private readonly todoService: TodoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateTodoRequest): Promise<Todo> {
    return this.todoService.create(body);
  }

  @Get()
  findAll(): Promise<TodoListResponse> {
    return this.todoService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Todo> {
    return this.todoService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTodoRequest,
  ): Promise<Todo> {
    return this.todoService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.todoService.remove(id);
  }
}
