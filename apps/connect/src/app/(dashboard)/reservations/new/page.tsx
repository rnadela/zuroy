'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

interface Room {
  id: string;
  number: string;
  type: string;
}

export default function NewReservationPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await hotelApi<Room[]>('/rooms');
        setRooms(data);
      } catch {
        setError('Failed to load rooms');
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await hotelApi('/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: form.guestName,
          guestEmail: form.guestEmail || undefined,
          guestPhone: form.guestPhone || undefined,
          roomId: form.roomId,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
        }),
      });
      router.push('/reservations');
    } catch {
      setError('Failed to create reservation');
    } finally {
      setSaving(false);
    }
  };

  if (loadingRooms) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
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

      <Typography variant="h4" className="mb-4">
        New Reservation
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Guest Name"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Guest Email"
              type="email"
              value={form.guestEmail}
              onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Guest Phone"
              value={form.guestPhone}
              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Room</InputLabel>
              <Select
                label="Room"
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    Room {room.number} ({room.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Check-in Date"
              type="date"
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Check-out Date"
              type="date"
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button type="submit" variant="contained" disabled={saving} size="large">
              {saving ? 'Creating...' : 'Create Reservation'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
