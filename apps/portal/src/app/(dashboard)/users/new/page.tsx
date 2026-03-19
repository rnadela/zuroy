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
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Hotel {
  id: string;
  name: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'HOTEL_STAFF',
    hotelId: '',
  });

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await api<Hotel[]>('/hotels');
        setHotels(data);
      } catch {
        // Hotels fetch is non-critical for form render
      }
    };
    fetchHotels();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload: Record<string, string> = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      };
      if (form.role === 'HOTEL_STAFF' && form.hotelId) {
        payload.hotelId = form.hotelId;
      }
      await api('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      router.push('/users');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/users')} className="mb-4">
        Back to Users
      </Button>

      <Typography variant="h4" className="mb-4">
        Create User
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
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
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
            <Button type="submit" variant="contained" disabled={loading} className="mt-4">
              {loading ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
