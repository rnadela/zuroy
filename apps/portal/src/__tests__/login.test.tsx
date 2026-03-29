import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Simple render test — login form exists
describe('Login Page', () => {
  it('renders sign in button', async () => {
    const { default: LoginPage } = await import('../app/login/page');
    render(<LoginPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
