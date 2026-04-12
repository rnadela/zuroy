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
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '@/lib/api';

export default function NewHotelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    address: '',
    latitude: '',
    longitude: '',
    logoUrl: '',
    primaryColor: '',
    secondaryColor: '',
    backgroundUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
      };
      if (form.address) payload.address = form.address;
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);
      if (form.logoUrl) payload.logoUrl = form.logoUrl;
      if (form.primaryColor) payload.primaryColor = form.primaryColor;
      if (form.secondaryColor) payload.secondaryColor = form.secondaryColor;
      if (form.backgroundUrl) payload.backgroundUrl = form.backgroundUrl;
      await api('/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.push('/hotels');
    } catch (err: any) {
      setError(err.message || 'Failed to create hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/hotels')} className="mb-4">
        Back to Hotels
      </Button>

      <Typography variant="h4" className="mb-4">
        Create Hotel
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
            />
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <div className="flex gap-4">
              <TextField
                label="Latitude"
                name="latitude"
                type="number"
                value={form.latitude}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Longitude"
                name="longitude"
                type="number"
                value={form.longitude}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <TextField
              label="Logo URL"
              name="logoUrl"
              value={form.logoUrl}
              onChange={handleChange}
            />
            <div className="flex gap-4">
              <TextField
                label="Primary Color"
                name="primaryColor"
                value={form.primaryColor}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Secondary Color"
                name="secondaryColor"
                value={form.secondaryColor}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <TextField
              label="Background URL"
              name="backgroundUrl"
              value={form.backgroundUrl}
              onChange={handleChange}
            />
            <Button type="submit" variant="contained" disabled={loading} className="mt-4">
              {loading ? <CircularProgress size={24} /> : 'Create Hotel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
