import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHotelApi = vi.fn();

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  hotelApi: (...args: unknown[]) => mockHotelApi(...args),
  getHotelId: () => 'hotel-1',
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
  usePathname: () => '/extensions',
  useParams: () => ({ hotelId: 'hotel-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_EXTENSIONS = [
  {
    id: 'ext1',
    guestName: 'Jane Doe',
    roomNumber: '301',
    currentCheckout: '2026-03-30T12:00:00Z',
    requestedCheckout: '2026-04-01T12:00:00Z',
    reason: 'Flight delayed',
    status: 'PENDING',
    createdAt: '2026-03-29T08:00:00Z',
  },
];

describe('Connect Extensions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Stay Extensions heading after loading', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_EXTENSIONS);
    const { default: ExtensionsPage } = await import('../app/(dashboard)/extensions/page');
    render(<ExtensionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Stay Extensions')).toBeInTheDocument();
    });
  });

  it('renders filter tabs (ALL, PENDING, APPROVED, REJECTED)', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_EXTENSIONS);
    const { default: ExtensionsPage } = await import('../app/(dashboard)/extensions/page');
    render(<ExtensionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Stay Extensions')).toBeInTheDocument();
    });
    expect(screen.getByText('ALL')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
  });

  it('renders extension rows from API', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_EXTENSIONS);
    const { default: ExtensionsPage } = await import('../app/(dashboard)/extensions/page');
    render(<ExtensionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('301')).toBeInTheDocument();
    expect(screen.getByText('Flight delayed')).toBeInTheDocument();
  });

  it('renders table column headers', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_EXTENSIONS);
    const { default: ExtensionsPage } = await import('../app/(dashboard)/extensions/page');
    render(<ExtensionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
    expect(screen.getByText('Room')).toBeInTheDocument();
    expect(screen.getByText('Current Checkout')).toBeInTheDocument();
    expect(screen.getByText('Requested Checkout')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows empty state when no extensions', async () => {
    mockHotelApi.mockResolvedValueOnce([]);
    const { default: ExtensionsPage } = await import('../app/(dashboard)/extensions/page');
    render(<ExtensionsPage />);
    await waitFor(() => {
      expect(screen.getByText('No extension requests')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', async () => {
    mockHotelApi.mockReturnValue(new Promise(() => {}));
    const { default: ExtensionsPage } = await import('../app/(dashboard)/extensions/page');
    const { container } = render(<ExtensionsPage />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
