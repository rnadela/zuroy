'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Hotel {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundUrl: string;
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await api<Hotel>(`/hotels/${params.id}`);
        setForm({
          name: data.name || '',
          slug: data.slug || '',
          address: data.address || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          logoUrl: data.logoUrl || '',
          primaryColor: data.primaryColor || '',
          secondaryColor: data.secondaryColor || '',
          backgroundUrl: data.backgroundUrl || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hotel');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await api(`/hotels/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        }),
      });
      setSuccess('Hotel updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update hotel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/hotels')} className="mb-4">
        Back to Hotels
      </Button>

      <Typography variant="h4" className="mb-4">
        Edit Hotel
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
            <Button type="submit" variant="contained" disabled={saving} className="mt-4">
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
