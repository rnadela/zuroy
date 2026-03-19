'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

export default function NewRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({ number: '', floor: '', type: 'STANDARD' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await hotelApi('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: form.number,
          floor: Number(form.floor),
          type: form.type,
        }),
      });
      router.push('/rooms');
    } catch {
      setError('Failed to create room');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/rooms')} className="mb-4">
        Back to Rooms
      </Button>

      <Typography variant="h4" className="mb-4">
        New Room
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
              {saving ? 'Creating...' : 'Create Room'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
