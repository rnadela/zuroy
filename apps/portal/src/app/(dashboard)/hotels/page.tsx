'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  address: string;
}

export default function HotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await api<Hotel[]>('/hotels');
      setHotels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api(`/hotels/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchHotels();
    } catch (err: any) {
      setError(err.message || 'Failed to delete hotel');
      setDeleteId(null);
    }
  };

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Hotels</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/hotels/new')}>
          Add Hotel
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell>{hotel.name}</TableCell>
                  <TableCell>{hotel.slug}</TableCell>
                  <TableCell>{hotel.address}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => router.push(`/hotels/${hotel.id}`)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => setDeleteId(hotel.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {hotels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hotels found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this hotel?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
