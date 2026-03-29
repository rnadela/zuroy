import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Login Page', () => {
  it('renders sign in button', async () => {
    const { default: LoginPage } = await import('../app/login/page');
    render(<LoginPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
