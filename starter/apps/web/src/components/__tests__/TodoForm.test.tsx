import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../TodoForm';

describe('TodoForm', () => {
  it('calls onSubmit with trimmed title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('New todo title'), 'Buy groceries');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onSubmit).toHaveBeenCalledWith('Buy groceries');
  });

  it('clears input after submit', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);

    const input = screen.getByLabelText('New todo title');
    await user.type(input, 'Buy groceries');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(input).toHaveValue('');
  });

  it('does not submit empty title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('New todo title'), '   ');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
