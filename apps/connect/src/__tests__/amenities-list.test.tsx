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
  usePathname: () => '/amenities',
  useParams: () => ({ hotelId: 'hotel-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_AMENITIES = [
  { id: 'a1', name: 'Pool', description: 'Outdoor swimming pool', category: 'Recreation' },
  { id: 'a2', name: 'Gym', description: 'Fitness center', category: 'Recreation' },
  { id: 'a3', name: 'Room Service', description: null, category: 'Dining' },
];

describe('Connect Amenities List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Amenities heading and Add Amenity button after loading', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_AMENITIES);
    const { default: AmenitiesPage } = await import('../app/(dashboard)/amenities/page');
    render(<AmenitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('Amenities')).toBeInTheDocument();
    });
    expect(screen.getByText('Add Amenity')).toBeInTheDocument();
  });

  it('renders amenity items from API grouped by category', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_AMENITIES);
    const { default: AmenitiesPage } = await import('../app/(dashboard)/amenities/page');
    render(<AmenitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('Pool')).toBeInTheDocument();
    });
    expect(screen.getByText('Gym')).toBeInTheDocument();
    expect(screen.getByText('Room Service')).toBeInTheDocument();
    expect(screen.getByText('Recreation')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
  });

  it('renders amenity descriptions', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_AMENITIES);
    const { default: AmenitiesPage } = await import('../app/(dashboard)/amenities/page');
    render(<AmenitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('Outdoor swimming pool')).toBeInTheDocument();
    });
    expect(screen.getByText('Fitness center')).toBeInTheDocument();
  });

  it('shows empty state when no amenities', async () => {
    mockHotelApi.mockResolvedValueOnce([]);
    const { default: AmenitiesPage } = await import('../app/(dashboard)/amenities/page');
    render(<AmenitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('No amenities found')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', async () => {
    mockHotelApi.mockReturnValue(new Promise(() => {}));
    const { default: AmenitiesPage } = await import('../app/(dashboard)/amenities/page');
    const { container } = render(<AmenitiesPage />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
