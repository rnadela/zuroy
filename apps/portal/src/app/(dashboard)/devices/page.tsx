'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  Alert,
  Chip,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Device {
  id: string;
  serialNumber: string;
  deviceModel: string;
  status: string;
  hotel?: { name: string };
  batteryLevel: number | null;
  lastHeartbeat: string | null;
}

const STATUS_COLORS: Record<string, 'success' | 'error' | 'info' | 'default' | 'warning'> = {
  ONLINE: 'success',
  OFFLINE: 'error',
  ASSIGNED: 'info',
  UNASSIGNED: 'default',
  MAINTENANCE: 'warning',
};

const STATUSES = ['ALL', 'ONLINE', 'OFFLINE', 'ASSIGNED', 'UNASSIGNED', 'MAINTENANCE'];

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await api<Device[]>('/devices');
        setDevices(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch devices');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const filtered =
    statusFilter === 'ALL' ? devices : devices.filter((d) => d.status === statusFilter);

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Devices</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/devices/new')}>
          Register Device
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small">
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Serial</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Battery</TableCell>
                <TableCell>Last Heartbeat</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.serialNumber}</TableCell>
                  <TableCell>{device.deviceModel}</TableCell>
                  <TableCell>
                    <Chip
                      label={device.status}
                      color={STATUS_COLORS[device.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{device.hotel?.name || '—'}</TableCell>
                  <TableCell>
                    {device.batteryLevel != null ? `${device.batteryLevel}%` : '—'}
                  </TableCell>
                  <TableCell>
                    {device.lastHeartbeat ? new Date(device.lastHeartbeat).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => router.push(`/devices/${device.id}`)}>
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No devices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
