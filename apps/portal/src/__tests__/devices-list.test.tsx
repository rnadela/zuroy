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
  usePathname: () => '/devices',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const MOCK_DEVICES = [
  {
    id: 'd1',
    serialNumber: 'SN-001',
    deviceModel: 'Pixel 7',
    status: 'ONLINE',
    hotel: { name: 'Grand Hotel' },
    batteryLevel: 85,
    lastHeartbeat: '2026-03-29T10:00:00Z',
  },
  {
    id: 'd2',
    serialNumber: 'SN-002',
    deviceModel: 'Pixel 8',
    status: 'OFFLINE',
    hotel: null,
    batteryLevel: null,
    lastHeartbeat: null,
  },
];

describe('Portal Devices List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Devices heading and Register Device button after loading', async () => {
    mockApi.mockResolvedValueOnce(MOCK_DEVICES);
    const { default: DevicesPage } = await import('../app/(dashboard)/devices/page');
    render(<DevicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });
    expect(screen.getByText('Register Device')).toBeInTheDocument();
  });

  it('renders device rows from API', async () => {
    mockApi.mockResolvedValueOnce(MOCK_DEVICES);
    const { default: DevicesPage } = await import('../app/(dashboard)/devices/page');
    render(<DevicesPage />);
    await waitFor(() => {
      expect(screen.getByText('SN-001')).toBeInTheDocument();
    });
    expect(screen.getByText('SN-002')).toBeInTheDocument();
    expect(screen.getByText('Pixel 7')).toBeInTheDocument();
    expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
  });

  it('renders table column headers', async () => {
    mockApi.mockResolvedValueOnce(MOCK_DEVICES);
    const { default: DevicesPage } = await import('../app/(dashboard)/devices/page');
    render(<DevicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Serial')).toBeInTheDocument();
    });
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Battery')).toBeInTheDocument();
    expect(screen.getByText('Last Heartbeat')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders status filter with ALL options', async () => {
    mockApi.mockResolvedValueOnce(MOCK_DEVICES);
    const { default: DevicesPage } = await import('../app/(dashboard)/devices/page');
    render(<DevicesPage />);
    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });
    expect(screen.getByText('ALL')).toBeInTheDocument();
  });

  it('shows empty state when no devices', async () => {
    mockApi.mockResolvedValueOnce([]);
    const { default: DevicesPage } = await import('../app/(dashboard)/devices/page');
    render(<DevicesPage />);
    await waitFor(() => {
      expect(screen.getByText('No devices found')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', async () => {
    mockApi.mockReturnValue(new Promise(() => {}));
    const { default: DevicesPage } = await import('../app/(dashboard)/devices/page');
    const { container } = render(<DevicesPage />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
