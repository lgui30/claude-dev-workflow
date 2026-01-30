import { render, screen } from '@testing-library/react';
import { TodoList } from '../TodoList';

describe('TodoList', () => {
  const handlers = { onToggle: vi.fn(), onDelete: vi.fn() };

  it('renders empty state when no todos', () => {
    render(<TodoList todos={[]} {...handlers} />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders a list of todos', () => {
    const todos = [
      { id: '1', title: 'Buy groceries', completed: false },
      { id: '2', title: 'Walk the dog', completed: true },
    ];
    render(<TodoList todos={todos} {...handlers} />);
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  it('renders completed todo with line-through', () => {
    const todos = [{ id: '1', title: 'Done task', completed: true }];
    render(<TodoList todos={todos} {...handlers} />);
    expect(screen.getByText('Done task')).toHaveClass('line-through');
  });
});
