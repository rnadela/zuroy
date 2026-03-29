import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Portal Dashboard', () => {
  it('renders Dashboard heading', async () => {
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Hotels stat card', async () => {
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    expect(screen.getByText('Hotels')).toBeInTheDocument();
  });

  it('renders Devices stat card', async () => {
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    expect(screen.getByText('Devices')).toBeInTheDocument();
  });

  it('renders Users stat card', async () => {
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders placeholder values', async () => {
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    const { container } = render(<DashboardPage />);
    const dashes = container.querySelectorAll('h4');
    const dashValues = Array.from(dashes).filter((el) => el.textContent === '—');
    expect(dashValues).toHaveLength(3);
  });
});
