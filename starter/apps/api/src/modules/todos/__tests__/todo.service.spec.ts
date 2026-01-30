import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TodoService } from '../todo.service';
import type { TodoRepository } from '../todo.repository';
import type { TodoEntity } from '../domain/todo.entity';

function makeTodoEntity(overrides: Partial<TodoEntity> = {}): TodoEntity {
  return {
    id: '1',
    title: 'Test todo',
    completed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function createMockRepository() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as TodoRepository;
}

describe('TodoService', () => {
  let service: TodoService;
  let repository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new TodoService(repository);
  });

  describe('create', () => {
    it('creates a todo and returns API response type', async () => {
      const entity = makeTodoEntity({ title: 'New todo' });
      vi.mocked(repository.create).mockResolvedValue(entity);

      const result = await service.create({ title: 'New todo' });

      expect(repository.create).toHaveBeenCalledWith({ title: 'New todo' });
      expect(result).toEqual({
        id: '1',
        title: 'New todo',
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('findAll', () => {
    it('returns todos with total count', async () => {
      const entities = [
        makeTodoEntity({ id: '1', title: 'First' }),
        makeTodoEntity({ id: '2', title: 'Second' }),
      ];
      vi.mocked(repository.findAll).mockResolvedValue(entities);

      const result = await service.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0].title).toBe('First');
    });
  });

  describe('findById', () => {
    it('returns todo when found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(makeTodoEntity());

      const result = await service.findById('1');
      expect(result.id).toBe('1');
    });

    it('throws NotFoundException when not found', async () => {
      vi.mocked(repository.findById).mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the todo', async () => {
      const updated = makeTodoEntity({ completed: true });
      vi.mocked(repository.update).mockResolvedValue(updated);

      const result = await service.update('1', { completed: true });
      expect(result.completed).toBe(true);
    });

    it('throws NotFoundException when not found', async () => {
      vi.mocked(repository.update).mockResolvedValue(null);

      await expect(service.update('999', { completed: true })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the todo', async () => {
      vi.mocked(repository.delete).mockResolvedValue(true);

      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('throws NotFoundException when not found', async () => {
      vi.mocked(repository.delete).mockResolvedValue(false);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
