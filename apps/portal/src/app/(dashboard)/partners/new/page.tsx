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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '@/lib/api';

const CATEGORIES = [
  'Car Rentals',
  'Tours & Activities',
  'Restaurants',
  'Spas & Wellness',
  'Shopping & Souvenirs',
  'Delicacy Stores',
  'Nightlife',
  'Cultural Sites',
  'Transportation',
  'Other',
];

export default function NewPartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    address: '',
    phone: '',
    website: '',
    hours: '',
    photoUrls: '',
    boosted: false,
    boostRegion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api('/partners', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          photoUrls: form.photoUrls ? form.photoUrls.split(',').map((u) => u.trim()) : [],
        }),
      });
      router.push('/partners');
    } catch (err: any) {
      setError(err.message || 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/partners')} className="mb-4">
        Back to Partners
      </Button>

      <Typography variant="h4" className="mb-4">
        Create Partner
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
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <FormControl required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={form.category}
                label="Category"
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <TextField
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
            />
            <TextField
              label="Hours"
              name="hours"
              value={form.hours}
              onChange={handleChange}
              placeholder="e.g. Mon-Fri 9am-5pm"
            />
            <TextField
              label="Photo URLs (comma-separated)"
              name="photoUrls"
              value={form.photoUrls}
              onChange={handleChange}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.boosted}
                  onChange={(e) => setForm({ ...form, boosted: e.target.checked })}
                />
              }
              label="Boosted"
            />
            {form.boosted && (
              <TextField
                label="Boost Region"
                name="boostRegion"
                value={form.boostRegion}
                onChange={handleChange}
              />
            )}
            <Button type="submit" variant="contained" disabled={loading} className="mt-4">
              {loading ? <CircularProgress size={24} /> : 'Create Partner'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
