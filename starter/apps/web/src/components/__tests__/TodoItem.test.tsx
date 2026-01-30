import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '../TodoItem';

describe('TodoItem', () => {
  const defaultProps = {
    id: '1',
    title: 'Buy groceries',
    completed: false,
    onToggle: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders the todo title', () => {
    render(<TodoItem {...defaultProps} />);
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('applies line-through when completed', () => {
    render(<TodoItem {...defaultProps} completed={true} />);
    expect(screen.getByText('Buy groceries')).toHaveClass('line-through');
  });

  it('does not apply line-through when pending', () => {
    render(<TodoItem {...defaultProps} completed={false} />);
    expect(screen.getByText('Buy groceries')).not.toHaveClass('line-through');
  });

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TodoItem {...defaultProps} onToggle={onToggle} />);
    await user.click(screen.getByLabelText('Mark "Buy groceries" as completed'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoItem {...defaultProps} onDelete={onDelete} />);
    await user.click(screen.getByLabelText('Delete "Buy groceries"'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
