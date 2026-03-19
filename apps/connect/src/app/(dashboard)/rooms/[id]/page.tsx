'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
}

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({ number: '', floor: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const room = await hotelApi<Room>(`/rooms/${id}`);
        setForm({
          number: room.number,
          floor: String(room.floor),
          type: room.type,
        });
      } catch {
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await hotelApi(`/rooms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: form.number,
          floor: Number(form.floor),
          type: form.type,
        }),
      });
      router.push('/rooms');
    } catch {
      setError('Failed to update room');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/rooms')} className="mb-4">
        Back to Rooms
      </Button>

      <Typography variant="h4" className="mb-4">
        Edit Room
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
              label="Room Number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Floor"
              type="number"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <MenuItem value="STANDARD">Standard</MenuItem>
                <MenuItem value="DELUXE">Deluxe</MenuItem>
                <MenuItem value="SUITE">Suite</MenuItem>
                <MenuItem value="PENTHOUSE">Penthouse</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
