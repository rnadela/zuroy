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
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Delete } from '@mui/icons-material';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hotelId: string | null;
}

interface Hotel {
  id: string;
  name: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    hotelId: '',
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [userData, hotelData] = await Promise.all([
          api<User>(`/users/${params.id}`),
          api<Hotel[]>('/hotels'),
        ]);
        setEmail(userData.email);
        setForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || '',
          hotelId: userData.hotelId || '',
        });
        setHotels(hotelData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    init();
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
      const payload: Record<string, string> = {
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      };
      if (form.role === 'HOTEL_STAFF' && form.hotelId) {
        payload.hotelId = form.hotelId;
      }
      await api(`/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSuccess('User updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api(`/users/${params.id}`, { method: 'DELETE' });
      router.push('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setShowDelete(false);
    }
  };

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/users')} className="mb-4">
        Back to Users
      </Button>

      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Edit User</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => setShowDelete(true)}
        >
          Delete User
        </Button>
      </div>

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
            <TextField label="Email" value={email} disabled />
            <div className="flex gap-4">
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                fullWidth
              />
            </div>
            <div>
              <Typography variant="body2" className="mb-1">
                Role
              </Typography>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                fullWidth
              >
                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                <MenuItem value="HOTEL_STAFF">Hotel Staff</MenuItem>
              </Select>
            </div>
            {form.role === 'HOTEL_STAFF' && (
              <div>
                <Typography variant="body2" className="mb-1">
                  Hotel
                </Typography>
                <Select
                  value={form.hotelId}
                  onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Select a hotel
                  </MenuItem>
                  {hotels.map((hotel) => (
                    <MenuItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}
            <Button type="submit" variant="contained" disabled={saving} className="mt-4">
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showDelete} onClose={() => setShowDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
