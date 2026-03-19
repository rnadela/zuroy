'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

interface Amenity {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export default function AmenitiesPage() {
  const router = useRouter();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const data = await hotelApi<Amenity[]>('/amenities');
      setAmenities(data);
      setError('');
    } catch {
      setError('Failed to load amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await hotelApi(`/amenities/${deleteId}`, { method: 'DELETE' });
      setAmenities((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError('Failed to delete amenity');
      setDeleteId(null);
    }
  };

  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Amenities</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/amenities/new')}
        >
          Add Amenity
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {Object.keys(grouped).length === 0 && (
        <Typography color="text.secondary">No amenities found</Typography>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, items]) => (
          <div key={category} className="mb-6">
            <Typography variant="h6" className="mb-2">
              {category}
            </Typography>
            <div className="flex flex-col gap-2">
              {items.map((amenity) => (
                <Card key={amenity.id}>
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <Typography variant="subtitle1">{amenity.name}</Typography>
                      {amenity.description && (
                        <Typography variant="body2" color="text.secondary">
                          {amenity.description}
                        </Typography>
                      )}
                    </div>
                    <div>
                      <IconButton onClick={() => router.push(`/amenities/${amenity.id}`)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(amenity.id)}>
                        <Delete />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Amenity</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this amenity?</DialogContentText>
        </DialogContent>
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
