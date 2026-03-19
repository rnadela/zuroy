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

const CATEGORIES = [
  'Dining',
  'Pools & Beach',
  'Spa & Wellness',
  'Fitness & Gym',
  'Recreation & Activities',
  'Business Center',
  'Kids & Family',
  'Shopping & Retail',
  'Transport',
  'Guest Services',
  'Events & Entertainment',
];

interface Amenity {
  id: string;
  name: string;
  description?: string;
  category: string;
  latitude?: number;
  longitude?: number;
  hours?: string;
  photoUrls?: string[];
}

export default function EditAmenityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    hours: '',
    photoUrls: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAmenity = async () => {
      try {
        const amenity = await hotelApi<Amenity>(`/amenities/${id}`);
        setForm({
          name: amenity.name,
          description: amenity.description ?? '',
          category: amenity.category,
          latitude: amenity.latitude != null ? String(amenity.latitude) : '',
          longitude: amenity.longitude != null ? String(amenity.longitude) : '',
          hours: amenity.hours ?? '',
          photoUrls: amenity.photoUrls?.join(', ') ?? '',
        });
      } catch {
        setError('Failed to load amenity');
      } finally {
        setLoading(false);
      }
    };
    fetchAmenity();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await hotelApi(`/amenities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          category: form.category,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          hours: form.hours || undefined,
          photoUrls: form.photoUrls ? form.photoUrls.split(',').map((u) => u.trim()) : [],
        }),
      });
      router.push('/amenities');
    } catch {
      setError('Failed to update amenity');
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
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/amenities')} className="mb-4">
        Back to Amenities
      </Button>

      <Typography variant="h4" className="mb-4">
        Edit Amenity
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
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex gap-4">
              <TextField
                label="Latitude"
                type="number"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                fullWidth
                slotProps={{ htmlInput: { step: 'any' } }}
              />
              <TextField
                label="Longitude"
                type="number"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                fullWidth
                slotProps={{ htmlInput: { step: 'any' } }}
              />
            </div>
            <TextField
              label="Hours"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              placeholder="e.g. 9:00 AM - 10:00 PM"
              fullWidth
            />
            <TextField
              label="Photo URLs"
              value={form.photoUrls}
              onChange={(e) => setForm({ ...form, photoUrls: e.target.value })}
              placeholder="Comma-separated URLs"
              helperText="Enter photo URLs separated by commas"
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={saving} size="large">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
