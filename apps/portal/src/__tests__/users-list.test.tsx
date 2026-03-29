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
  usePathname: () => '/users',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_USERS = [
  { id: '1', email: 'admin@zuroy.com', firstName: 'Admin', lastName: 'User', role: 'SUPER_ADMIN' },
  { id: '2', email: 'staff@hotel.com', firstName: 'Staff', lastName: 'Member', role: 'HOTEL_STAFF' },
];

describe('Portal Users List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Users heading and Add User button after loading', async () => {
    mockApi.mockResolvedValueOnce(MOCK_USERS);
    const { default: UsersPage } = await import('../app/(dashboard)/users/page');
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });
});
