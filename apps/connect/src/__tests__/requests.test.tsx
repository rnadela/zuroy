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
  usePathname: () => '/requests',
  useParams: () => ({ hotelId: 'hotel-1' }),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_REQUESTS = [
  { id: 'req-1', type: 'TOWELS', status: 'PENDING', roomId: 'rm1' },
  { id: 'req-2', type: 'MAINTENANCE', status: 'COMPLETED', roomId: 'rm2' },
];

describe('Connect Service Requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Service Requests heading with filter tabs', async () => {
    mockHotelApi.mockResolvedValueOnce(MOCK_REQUESTS);
    const { default: RequestsPage } = await import('../app/(dashboard)/requests/page');
    render(<RequestsPage />);
    await waitFor(() => {
      expect(screen.getByText('Service Requests')).toBeInTheDocument();
    });
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
