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
  usePathname: () => '/reservations',
  useParams: () => ({ hotelId: 'hotel-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_RESERVATIONS = [
  {
    id: 'r1',
    guestName: 'John Doe',
    room: { number: '101' },
    checkIn: '2026-03-29T14:00:00Z',
    checkOut: '2026-04-01T11:00:00Z',
    status: 'CHECKED_IN',
  },
  {
    id: 'r2',
    guestName: 'Jane Smith',
    room: null,
    checkIn: '2026-03-30T14:00:00Z',
    checkOut: '2026-04-02T11:00:00Z',
    status: 'PENDING',
  },
];

describe('Connect Reservations List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Reservations heading and New Reservation button', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_RESERVATIONS);
    const { default: ReservationsPage } = await import('../app/(dashboard)/reservations/page');
    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reservations')).toBeInTheDocument();
    });
    expect(screen.getByText('New Reservation')).toBeInTheDocument();
  });

  it('renders status filter chips', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_RESERVATIONS);
    const { default: ReservationsPage } = await import('../app/(dashboard)/reservations/page');
    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByText('ALL')).toBeInTheDocument();
    });
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('CHECKED IN')).toBeInTheDocument();
    expect(screen.getByText('CHECKED OUT')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('renders reservation rows from API', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_RESERVATIONS);
    const { default: ReservationsPage } = await import('../app/(dashboard)/reservations/page');
    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('renders table column headers', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_RESERVATIONS);
    const { default: ReservationsPage } = await import('../app/(dashboard)/reservations/page');
    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
    expect(screen.getByText('Room')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Check-out')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows empty state when no reservations', async () => {
    mockHotelApi.mockResolvedValueOnce([]);
    const { default: ReservationsPage } = await import('../app/(dashboard)/reservations/page');
    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByText('No reservations found')).toBeInTheDocument();
    });
  });
});
