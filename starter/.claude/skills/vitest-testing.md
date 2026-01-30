# Skill: Vitest Testing Patterns

## Overview

Vitest is the test runner for both frontend and backend. It's Vite-native, fast, and has a Jest-compatible API. We use it with Testing Library for component tests, with MSW for API mocking, and with Testcontainers for database integration tests.

## File Structure

```
apps/web/src/
├── components/__tests__/           # Component unit tests
│   └── {Component}.test.tsx
├── app/{route}/__tests__/          # Page integration tests
│   └── page.test.tsx
├── stores/__tests__/               # Store unit tests
│   └── {store}.test.ts
└── vitest.setup.ts                 # Test setup (MSW, Testing Library)

apps/api/src/
├── modules/{feature}/
│   ├── {feature}.service.spec.ts      # Service unit tests
│   ├── {feature}.repository.spec.ts   # Repository integration tests
│   └── {feature}.e2e.spec.ts          # Controller E2E tests
└── vitest.config.ts
```

## Configuration

### Frontend (apps/web/vitest.config.ts)

```tsx
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../libs/shared/src'),
    },
  },
});
```

### Frontend Setup (apps/web/src/vitest.setup.ts)

```tsx
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Backend (apps/api/vitest.config.ts)

```tsx
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.{spec,test}.ts'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../libs/shared/src'),
    },
  },
});
```

## Component Testing (Frontend)

### Basic Component Test

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../TaskCard';

describe('TaskCard', () => {
  const defaultProps = {
    id: '1',
    title: 'Test Task',
    status: 'active' as const,
    onSelect: vi.fn(),
  };

  it('renders task title', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard {...defaultProps} />);

    await user.click(screen.getByRole('article'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('1');
  });

  it('applies completed styling when status is completed', () => {
    render(<TaskCard {...defaultProps} status="completed" />);
    expect(screen.getByRole('article')).toHaveClass('opacity-60');
  });
});
```

### Testing with Providers (Integration)

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { taskHandlers } from '@/mocks/handlers/task';

const server = setupServer(...taskHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('TasksPage', () => {
  it('loads and displays tasks', async () => {
    renderWithProviders(<TasksPage />);

    // Initially shows loading
    expect(screen.getByRole('status')).toBeInTheDocument();

    // After fetch, shows tasks
    await waitFor(() => {
      expect(screen.getByText('Set up project')).toBeInTheDocument();
    });
  });
});
```

## Mocking Patterns

### Function Mocks

```tsx
// Create mock
const mockFn = vi.fn();

// Mock return value
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');

// Mock implementation
mockFn.mockImplementation((x) => x * 2);

// Assert calls
expect(mockFn).toHaveBeenCalledWith('arg1');
expect(mockFn).toHaveBeenCalledTimes(2);
```

### Module Mocks

```tsx
// Mock an entire module
vi.mock('@/lib/api/task', () => ({
  useGetTasks: vi.fn(),
}));

// Control the mock per test
import { useGetTasks } from '@/lib/api/task';

it('shows tasks', () => {
  vi.mocked(useGetTasks).mockReturnValue({
    data: { data: [{ id: '1', title: 'Task' }], total: 1 },
    isLoading: false,
    error: null,
  } as any);

  render(<TaskList />);
  expect(screen.getByText('Task')).toBeInTheDocument();
});
```

### Spy on Existing Functions

```tsx
const spy = vi.spyOn(repository, 'create');
spy.mockResolvedValue({ id: '1', title: 'Mocked' });

await service.create({ title: 'New Task' });
expect(spy).toHaveBeenCalledWith({ title: 'New Task' });

spy.mockRestore(); // Clean up
```

## Service Unit Tests (Backend)

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from './task.service';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  const mockRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TaskService(mockRepository as any);
  });

  it('creates a task and returns response type', async () => {
    const entity = {
      id: '1',
      title: 'New',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    mockRepository.create.mockResolvedValue(entity);

    const result = await service.create({ title: 'New' });

    expect(result).toEqual({
      id: '1',
      title: 'New',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('throws NotFoundException when task not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.findById('999')).rejects.toThrow(NotFoundException);
  });
});
```

## Test Organization Rules

1. **One `describe` per unit** — Component, service, or repository
2. **Nested `describe` for methods** — `describe('create', () => { ... })`
3. **Descriptive `it` names** — Start with a verb: "renders", "creates", "throws", "returns"
4. **AAA pattern** — Arrange, Act, Assert in every test
5. **Reset between tests** — `vi.clearAllMocks()` in `beforeEach`

## Common Pitfalls

1. **Not using `userEvent.setup()`** — Always call `const user = userEvent.setup()` before using `user.click()`. The setup creates a proper event simulation instance.

2. **Testing implementation details** — Test what the user sees, not internal state. Query by role, text, or label — not by class name or test ID.

3. **Missing `waitFor` for async** — Any component that fetches data needs `await waitFor(() => expect(...))` to wait for state updates.

4. **Shared mocks leaking** — Always `vi.clearAllMocks()` in `beforeEach` and `server.resetHandlers()` for MSW.

5. **No `retry: false` in test QueryClient** — Without this, tests wait for retries on failure, making them slow and flaky.

6. **Forgetting cleanup** — `@testing-library/react`'s `cleanup` should run after each test. Set it up in `vitest.setup.ts`.
