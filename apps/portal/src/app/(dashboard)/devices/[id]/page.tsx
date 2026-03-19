'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Device {
  id: string;
  serialNumber: string;
  deviceModel: string;
  status: string;
  batteryLevel: number | null;
  appVersion: string | null;
  lastHeartbeat: string | null;
  hotelId: string | null;
  hotel?: { id: string; name: string };
}

interface Hotel {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, 'success' | 'error' | 'info' | 'default' | 'warning'> = {
  ONLINE: 'success',
  OFFLINE: 'error',
  ASSIGNED: 'info',
  UNASSIGNED: 'default',
  MAINTENANCE: 'warning',
};

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDevice = async () => {
    try {
      const data = await api<Device>(`/devices/${params.id}`);
      setDevice(data);
      setSelectedHotel(data.hotelId || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch device');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [, hotelData] = await Promise.all([fetchDevice(), api<Hotel[]>('/hotels')]);
        setHotels(hotelData);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.id]);

  const handleAssign = async () => {
    try {
      setAssigning(true);
      setError('');
      setSuccess('');
      await api(`/devices/${params.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: selectedHotel }),
      });
      setSuccess('Device assigned successfully');
      await fetchDevice();
    } catch (err: any) {
      setError(err.message || 'Failed to assign device');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setAssigning(true);
      setError('');
      setSuccess('');
      await api(`/devices/${params.id}/unassign`, { method: 'POST' });
      setSuccess('Device unassigned successfully');
      setSelectedHotel('');
      await fetchDevice();
    } catch (err: any) {
      setError(err.message || 'Failed to unassign device');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <CircularProgress className="mt-6" />;
  if (!device) return <Alert severity="error">Device not found</Alert>;

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/devices')} className="mb-4">
        Back to Devices
      </Button>

      <Typography variant="h4" className="mb-4">
        Device: {device.serialNumber}
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" className="mb-2">
            Device Info
          </Typography>
          <div className="flex flex-col gap-2">
            <Typography>
              <strong>Serial:</strong> {device.serialNumber}
            </Typography>
            <Typography>
              <strong>Model:</strong> {device.deviceModel}
            </Typography>
            <Typography>
              <strong>Status:</strong>{' '}
              <Chip
                label={device.status}
                color={STATUS_COLORS[device.status] || 'default'}
                size="small"
              />
            </Typography>
            <Typography>
              <strong>Battery:</strong>{' '}
              {device.batteryLevel != null ? `${device.batteryLevel}%` : '—'}
            </Typography>
            <Typography>
              <strong>App Version:</strong> {device.appVersion || '—'}
            </Typography>
            <Typography>
              <strong>Last Heartbeat:</strong>{' '}
              {device.lastHeartbeat ? new Date(device.lastHeartbeat).toLocaleString() : '—'}
            </Typography>
            <Typography>
              <strong>Hotel:</strong> {device.hotel?.name || 'Unassigned'}
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-2">
            Assign / Unassign Hotel
          </Typography>
          <div className="flex gap-4 items-center">
            <Select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="" disabled>
                Select a hotel
              </MenuItem>
              {hotels.map((hotel) => (
                <MenuItem key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={!selectedHotel || assigning}
            >
              {assigning ? <CircularProgress size={20} /> : 'Assign'}
            </Button>
            {device.hotelId && (
              <Button
                variant="outlined"
                color="warning"
                onClick={handleUnassign}
                disabled={assigning}
              >
                Unassign
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
