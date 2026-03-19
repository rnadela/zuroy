'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

interface Reservation {
  id: string;
  guestName: string;
  room?: { number: string };
  checkIn: string;
  checkOut: string;
  status: string;
}

const STATUSES = ['ALL', 'PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'] as const;

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  PENDING: 'warning',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'info',
  CANCELLED: 'error',
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await hotelApi<Reservation[]>('/reservations');
        setReservations(data);
        setError('');
      } catch {
        setError('Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const filtered =
    filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Reservations</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/reservations/new')}
        >
          New Reservation
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="flex gap-2 mb-4">
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={s.replace('_', ' ')}
            color={filter === s ? 'primary' : 'default'}
            variant={filter === s ? 'filled' : 'outlined'}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow
                key={r.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/reservations/${r.id}`)}
              >
                <TableCell>{r.guestName}</TableCell>
                <TableCell>{r.room?.number ?? '—'}</TableCell>
                <TableCell>{new Date(r.checkIn).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(r.checkOut).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={r.status.replace('_', ' ')}
                    color={statusColor[r.status] ?? 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No reservations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
