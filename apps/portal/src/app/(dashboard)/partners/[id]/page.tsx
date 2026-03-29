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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Delete } from '@mui/icons-material';
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

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  phone: string;
  website: string;
  hours: string;
  photoUrls: string[];
  boosted: boolean;
  boostRegion: string;
}

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
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

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await api<Partner>(`/partners/${params.id}`);
        setForm({
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          address: data.address || '',
          phone: data.phone || '',
          website: data.website || '',
          hours: data.hours || '',
          photoUrls: data.photoUrls?.join(', ') || '',
          boosted: data.boosted || false,
          boostRegion: data.boostRegion || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch partner');
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
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
      await api(`/partners/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          photoUrls: form.photoUrls ? form.photoUrls.split(',').map((u) => u.trim()) : [],
        }),
      });
      setSuccess('Partner updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api(`/partners/${params.id}`, { method: 'DELETE' });
      router.push('/partners');
    } catch (err: any) {
      setError(err.message || 'Failed to delete partner');
      setDeleteOpen(false);
    }
  };

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/partners')}>
          Back to Partners
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
      </div>

      <Typography variant="h4" className="mb-4">
        Edit Partner
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
            <Button type="submit" variant="contained" disabled={saving} className="mt-4">
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this partner?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
