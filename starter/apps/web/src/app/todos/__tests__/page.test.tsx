import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { todoHandlers } from '@/mocks/handlers/todos';
import TodosPage from '../page';

const server = setupServer(...todoHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TodosPage />
    </QueryClientProvider>,
  );
}

describe('TodosPage', () => {
  it('shows loading state then displays todos', async () => {
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Build UI components')).toBeInTheDocument();
    });
  });

  it('creates a new todo', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => screen.getByText('Build UI components'));

    await user.type(screen.getByLabelText('New todo title'), 'Write tests');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  it('shows empty state when no todos exist', async () => {
    server.use(
      http.get('*/api/todos', () => {
        return HttpResponse.json({ data: [], total: 0 });
      }),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    server.use(
      http.get('*/api/todos', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      }),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
    });
  });
});
