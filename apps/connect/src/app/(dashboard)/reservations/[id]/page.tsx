'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { ArrowBack, ContentCopy, CheckCircle, Wifi, WifiOff } from '@mui/icons-material';
import { hotelApi, api } from '@/lib/api';

interface Reservation {
  id: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  room?: { number: string; type: string };
  checkIn: string;
  checkOut: string;
  status: string;
  hotspotSsid?: string;
  hotspotPassword?: string;
  hotspotEnabled?: boolean;
  hotspotDataUsedMb?: number;
  hotel?: { hotspotDataCapMb?: number };
}

interface Device {
  id: string;
  name: string;
}

interface Charge {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
}

const statusColor: Record<string, 'warning' | 'success' | 'info' | 'error' | 'default'> = {
  PENDING: 'warning',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'info',
  CANCELLED: 'error',
};

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [provisioningToken, setProvisioningToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [hotspotCopied, setHotspotCopied] = useState<'ssid' | 'password' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, chargesData] = await Promise.all([
          hotelApi<Reservation>(`/reservations/${id}`),
          hotelApi<Charge[]>(`/reservations/${id}/charges`),
        ]);
        setReservation(res);
        setCharges(chargesData);

        if (res.status === 'PENDING') {
          const devicesData = await api<Device[]>(`/devices?hotelId=${res.id}`);
          setDevices(devicesData);
        }
      } catch {
        setError('Failed to load reservation');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCheckIn = async () => {
    if (!selectedDevice) return;
    try {
      setActionLoading(true);
      const result = await hotelApi<{ token: string }>(`/reservations/${id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice }),
      });
      setProvisioningToken(result.token);
      setReservation((prev) => (prev ? { ...prev, status: 'CHECKED_IN' } : prev));
    } catch {
      setError('Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setCheckoutDialogOpen(false);
      await hotelApi(`/reservations/${id}/check-out`, { method: 'POST' });
      setReservation((prev) => (prev ? { ...prev, status: 'CHECKED_OUT' } : prev));
    } catch {
      setError('Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(provisioningToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleHotspot = async () => {
    if (!reservation) return;
    try {
      setActionLoading(true);
      const newEnabled = !reservation.hotspotEnabled;
      await hotelApi(`/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotspotEnabled: newEnabled }),
      });
      setReservation((prev) => (prev ? { ...prev, hotspotEnabled: newEnabled } : prev));
    } catch {
      setError('Failed to toggle hotspot');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHotspotCopy = async (text: string, field: 'ssid' | 'password') => {
    await navigator.clipboard.writeText(text);
    setHotspotCopied(field);
    setTimeout(() => setHotspotCopied(null), 2000);
  };

  const chargesTotal = charges.reduce((sum, c) => sum + c.amount * c.quantity, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (!reservation) {
    return <Alert severity="error">Reservation not found</Alert>;
  }

  return (
    <div>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/reservations')}
        className="mb-4"
      >
        Back to Reservations
      </Button>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Guest Info */}
      <Card className="mb-4">
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <Typography variant="h5">Guest Information</Typography>
            <Chip
              label={reservation.status.replace('_', ' ')}
              color={statusColor[reservation.status] ?? 'default'}
            />
          </div>
          <Typography variant="body1">
            <strong>Name:</strong> {reservation.guestName}
          </Typography>
          {reservation.guestEmail && (
            <Typography variant="body1">
              <strong>Email:</strong> {reservation.guestEmail}
            </Typography>
          )}
          {reservation.guestPhone && (
            <Typography variant="body1">
              <strong>Phone:</strong> {reservation.guestPhone}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Room & Dates */}
      <Card className="mb-4">
        <CardContent>
          <Typography variant="h5" className="mb-2">
            Room & Dates
          </Typography>
          <Typography variant="body1">
            <strong>Room:</strong>{' '}
            {reservation.room ? `${reservation.room.number} (${reservation.room.type})` : '—'}
          </Typography>
          <Typography variant="body1">
            <strong>Check-in:</strong> {new Date(reservation.checkIn).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            <strong>Check-out:</strong> {new Date(reservation.checkOut).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Check-in Section */}
      {reservation.status === 'PENDING' && !provisioningToken && (
        <Card className="mb-4">
          <CardContent>
            <Typography variant="h5" className="mb-2">
              Check In
            </Typography>
            <FormControl fullWidth className="mb-4">
              <InputLabel>Select Device</InputLabel>
              <Select
                label="Select Device"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {devices.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="success"
              onClick={handleCheckIn}
              disabled={!selectedDevice || actionLoading}
              size="large"
              fullWidth
            >
              {actionLoading ? 'Checking In...' : 'Check In'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Provisioning Token */}
      {provisioningToken && (
        <Card className="mb-4" sx={{ border: '2px solid #4caf50' }}>
          <CardContent>
            <Typography variant="h5" className="mb-2">
              <CheckCircle color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Check-in Successful
            </Typography>
            <Typography variant="body2" className="mb-2">
              Write this token to the guest&apos;s NFC tag:
            </Typography>
            <div className="flex items-center gap-2">
              <Typography variant="h3" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                {provisioningToken}
              </Typography>
              <IconButton onClick={handleCopy} color="primary" size="large">
                {copied ? <CheckCircle /> : <ContentCopy />}
              </IconButton>
            </div>
            {copied && (
              <Typography variant="body2" color="success.main">
                Copied to clipboard
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hotspot Section */}
      {reservation.status === 'CHECKED_IN' && reservation.hotspotSsid && (
        <Card className="mb-4">
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <Typography variant="h5">
                <Wifi sx={{ mr: 1, verticalAlign: 'middle' }} />
                Hotspot
              </Typography>
              {!reservation.hotspotEnabled && (
                <Chip label="Hotspot disabled" color="error" size="small" icon={<WifiOff />} />
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Typography variant="body1">
                <strong>SSID:</strong> {reservation.hotspotSsid}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleHotspotCopy(reservation.hotspotSsid!, 'ssid')}
              >
                {hotspotCopied === 'ssid' ? (
                  <CheckCircle fontSize="small" color="success" />
                ) : (
                  <ContentCopy fontSize="small" />
                )}
              </IconButton>
            </div>
            {reservation.hotspotPassword && (
              <div className="flex items-center gap-2 mb-2">
                <Typography variant="body1">
                  <strong>Password:</strong> {reservation.hotspotPassword}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleHotspotCopy(reservation.hotspotPassword!, 'password')}
                >
                  {hotspotCopied === 'password' ? (
                    <CheckCircle fontSize="small" color="success" />
                  ) : (
                    <ContentCopy fontSize="small" />
                  )}
                </IconButton>
              </div>
            )}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <Typography variant="body2" color="text.secondary">
                  Data Usage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {reservation.hotspotDataUsedMb ?? 0} MB /{' '}
                  {reservation.hotel?.hotspotDataCapMb ?? '\u221E'} MB
                </Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={
                  reservation.hotel?.hotspotDataCapMb
                    ? Math.min(
                        ((reservation.hotspotDataUsedMb ?? 0) /
                          reservation.hotel.hotspotDataCapMb) *
                          100,
                        100,
                      )
                    : 0
                }
                sx={{ height: 8, borderRadius: 4 }}
              />
            </div>
            <Button
              variant="outlined"
              color={reservation.hotspotEnabled ? 'error' : 'success'}
              onClick={handleToggleHotspot}
              disabled={actionLoading}
              startIcon={reservation.hotspotEnabled ? <WifiOff /> : <Wifi />}
              fullWidth
            >
              {reservation.hotspotEnabled ? 'Disable Hotspot' : 'Enable Hotspot'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Check-out Section */}
      {reservation.status === 'CHECKED_IN' && (
        <Card className="mb-4">
          <CardContent>
            <Typography variant="h5" className="mb-2">
              Check Out
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => setCheckoutDialogOpen(true)}
              disabled={actionLoading}
              size="large"
              fullWidth
            >
              {actionLoading ? 'Checking Out...' : 'Check Out'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Room Charges */}
      <Card className="mb-4">
        <CardContent>
          <Typography variant="h5" className="mb-2">
            Room Charges
          </Typography>
          {charges.length === 0 ? (
            <Typography color="text.secondary">No charges</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {charges.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.itemName}</TableCell>
                      <TableCell align="right">{c.quantity}</TableCell>
                      <TableCell align="right">${c.amount.toFixed(2)}</TableCell>
                      <TableCell align="right">${(c.amount * c.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${chargesTotal.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Check-out Confirmation Dialog */}
      <Dialog open={checkoutDialogOpen} onClose={() => setCheckoutDialogOpen(false)}>
        <DialogTitle>Confirm Check-out</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to check out {reservation.guestName}? This will wipe guest data
            from the device.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCheckOut} color="error" variant="contained">
            Check Out
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
