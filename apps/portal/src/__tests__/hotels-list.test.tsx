import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

const mockApi = vi.fn();

vi.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
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
  usePathname: () => '/hotels',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_HOTELS = [
  { id: '1', name: 'Grand Hotel', slug: 'grand-hotel', address: '123 Main St' },
  { id: '2', name: 'Beach Resort', slug: 'beach-resort', address: '456 Ocean Dr' },
];

describe('Portal Hotels List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Hotels heading and Add Hotel button after loading', async () => {
    mockApi.mockResolvedValueOnce(MOCK_HOTELS);
    const { default: HotelsPage } = await import('../app/(dashboard)/hotels/page');
    render(<HotelsPage />);
    await waitFor(() => {
      expect(screen.getByText('Hotels')).toBeInTheDocument();
    });
    expect(screen.getByText('Add Hotel')).toBeInTheDocument();
  });

  it('renders hotel rows from API', async () => {
    mockApi.mockResolvedValueOnce(MOCK_HOTELS);
    const { default: HotelsPage } = await import('../app/(dashboard)/hotels/page');
    render(<HotelsPage />);
    await waitFor(() => {
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
    });
    expect(screen.getByText('Beach Resort')).toBeInTheDocument();
    expect(screen.getByText('grand-hotel')).toBeInTheDocument();
    expect(screen.getByText('456 Ocean Dr')).toBeInTheDocument();
  });

  it('renders table column headers', async () => {
    mockApi.mockResolvedValueOnce(MOCK_HOTELS);
    const { default: HotelsPage } = await import('../app/(dashboard)/hotels/page');
    render(<HotelsPage />);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows empty state when no hotels', async () => {
    mockApi.mockResolvedValueOnce([]);
    const { default: HotelsPage } = await import('../app/(dashboard)/hotels/page');
    render(<HotelsPage />);
    await waitFor(() => {
      expect(screen.getByText('No hotels found')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', async () => {
    mockApi.mockReturnValue(new Promise(() => {})); // never resolves
    const { default: HotelsPage } = await import('../app/(dashboard)/hotels/page');
    const { container } = render(<HotelsPage />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
