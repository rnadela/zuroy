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
  usePathname: () => '/',
  useParams: () => ({ hotelId: 'hotel-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Connect Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Dashboard heading', async () => {
    mockHotelApi.mockResolvedValueOnce({
      totalRooms: 50,
      occupied: 30,
      available: 20,
      todayCheckIns: 5,
      todayCheckOuts: 3,
    });
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all stat card labels', async () => {
    mockHotelApi.mockResolvedValueOnce({
      totalRooms: 50,
      occupied: 30,
      available: 20,
      todayCheckIns: 5,
      todayCheckOuts: 3,
    });
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Rooms')).toBeInTheDocument();
    });
    expect(screen.getByText('Occupied')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText("Today's Check-ins")).toBeInTheDocument();
    expect(screen.getByText("Today's Check-outs")).toBeInTheDocument();
  });

  it('renders stat values from API', async () => {
    mockHotelApi.mockResolvedValueOnce({
      totalRooms: 50,
      occupied: 30,
      available: 20,
      todayCheckIns: 5,
      todayCheckOuts: 3,
    });
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument();
    });
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders zero values when API fails', async () => {
    mockHotelApi.mockRejectedValueOnce(new Error('fail'));
    const { default: DashboardPage } = await import('../app/(dashboard)/page');
    render(<DashboardPage />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(5);
  });
});
