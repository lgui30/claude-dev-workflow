import { render, screen } from '@testing-library/react';
import { Providers } from '../Providers';

describe('Providers', () => {
  it('renders children', () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>,
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});
