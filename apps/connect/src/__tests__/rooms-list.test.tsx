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
  usePathname: () => '/rooms',
  useParams: () => ({ hotelId: 'hotel-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_ROOMS = [
  { id: 'rm1', number: '101', floor: 1, type: 'SINGLE' },
  { id: 'rm2', number: '202', floor: 2, type: 'SUITE' },
];

describe('Connect Rooms List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Rooms heading and Add Room button', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_ROOMS);
    const { default: RoomsPage } = await import('../app/(dashboard)/rooms/page');
    render(<RoomsPage />);
    await waitFor(() => {
      expect(screen.getByText('Rooms')).toBeInTheDocument();
    });
    expect(screen.getByText('Add Room')).toBeInTheDocument();
  });

  it('renders room rows from API', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_ROOMS);
    const { default: RoomsPage } = await import('../app/(dashboard)/rooms/page');
    render(<RoomsPage />);
    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
    });
    expect(screen.getByText('202')).toBeInTheDocument();
    expect(screen.getByText('SINGLE')).toBeInTheDocument();
    expect(screen.getByText('SUITE')).toBeInTheDocument();
  });

  it('renders table column headers', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_ROOMS);
    const { default: RoomsPage } = await import('../app/(dashboard)/rooms/page');
    render(<RoomsPage />);
    await waitFor(() => {
      expect(screen.getByText('Number')).toBeInTheDocument();
    });
    expect(screen.getByText('Floor')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows empty state when no rooms', async () => {
    mockHotelApi.mockResolvedValueOnce([]);
    const { default: RoomsPage } = await import('../app/(dashboard)/rooms/page');
    render(<RoomsPage />);
    await waitFor(() => {
      expect(screen.getByText('No rooms found')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', async () => {
    mockHotelApi.mockReturnValue(new Promise(() => {})); // never resolves
    const { default: RoomsPage } = await import('../app/(dashboard)/rooms/page');
    const { container } = render(<RoomsPage />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
