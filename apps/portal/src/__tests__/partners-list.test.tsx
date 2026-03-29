import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  usePathname: () => '/partners',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_PARTNERS = [
  { id: 'p1', name: 'Island Tours', category: 'Tours & Activities', address: '10 Beach Rd', boosted: true },
  { id: 'p2', name: 'Sunset Grill', category: 'Restaurants', address: '5 Harbor Ln', boosted: false },
];

describe('Portal Partners List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Partners heading and Add Partner button after loading', async () => {
    mockApi.mockResolvedValueOnce(MOCK_PARTNERS);
    const { default: PartnersPage } = await import('../app/(dashboard)/partners/page');
    render(<PartnersPage />);
    await waitFor(() => {
      expect(screen.getByText('Partners')).toBeInTheDocument();
    });
    expect(screen.getByText('Add Partner')).toBeInTheDocument();
  });

  it('renders partner rows from API', async () => {
    mockApi.mockResolvedValueOnce(MOCK_PARTNERS);
    const { default: PartnersPage } = await import('../app/(dashboard)/partners/page');
    render(<PartnersPage />);
    await waitFor(() => {
      expect(screen.getByText('Island Tours')).toBeInTheDocument();
    });
    expect(screen.getByText('Sunset Grill')).toBeInTheDocument();
    expect(screen.getByText('Tours & Activities')).toBeInTheDocument();
    expect(screen.getByText('5 Harbor Ln')).toBeInTheDocument();
  });

  it('renders table column headers', async () => {
    mockApi.mockResolvedValueOnce(MOCK_PARTNERS);
    const { default: PartnersPage } = await import('../app/(dashboard)/partners/page');
    render(<PartnersPage />);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Boosted')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders boosted chip for boosted partner', async () => {
    mockApi.mockResolvedValueOnce(MOCK_PARTNERS);
    const { default: PartnersPage } = await import('../app/(dashboard)/partners/page');
    render(<PartnersPage />);
    await waitFor(() => {
      expect(screen.getByText('Island Tours')).toBeInTheDocument();
    });
    expect(screen.getByText('Boosted')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('shows empty state when no partners', async () => {
    mockApi.mockResolvedValueOnce([]);
    const { default: PartnersPage } = await import('../app/(dashboard)/partners/page');
    render(<PartnersPage />);
    await waitFor(() => {
      expect(screen.getByText('No partners found')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', async () => {
    mockApi.mockReturnValue(new Promise(() => {}));
    const { default: PartnersPage } = await import('../app/(dashboard)/partners/page');
    const { container } = render(<PartnersPage />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
