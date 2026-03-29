import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class extends Error {
    status: number;
    constructor(s: number, m: string) {
      super(m);
      this.status = s;
    }
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/hotels/new',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Portal New Hotel Form', () => {
  it('renders Create Hotel heading', async () => {
    const { default: NewHotelPage } = await import('../app/(dashboard)/hotels/new/page');
    render(<NewHotelPage />);
    expect(screen.getByText('Create Hotel')).toBeInTheDocument();
  });

  it('renders Back to Hotels button', async () => {
    const { default: NewHotelPage } = await import('../app/(dashboard)/hotels/new/page');
    render(<NewHotelPage />);
    expect(screen.getByText('Back to Hotels')).toBeInTheDocument();
  });

  it('renders all form fields', async () => {
    const { default: NewHotelPage } = await import('../app/(dashboard)/hotels/new/page');
    render(<NewHotelPage />);

    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Slug/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Latitude/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longitude/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Color/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Secondary Color/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Background URL/)).toBeInTheDocument();
  });

  it('renders submit button', async () => {
    const { default: NewHotelPage } = await import('../app/(dashboard)/hotels/new/page');
    render(<NewHotelPage />);
    expect(screen.getByText('Create Hotel', { selector: 'button' })).toBeInTheDocument();
  });
});
