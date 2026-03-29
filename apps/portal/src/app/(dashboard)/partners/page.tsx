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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
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
  category: string;
  address: string;
  boosted: boolean;
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await api<Partner[]>('/partners');
      setPartners(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api(`/partners/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchPartners();
    } catch (err: any) {
      setError(err.message || 'Failed to delete partner');
      setDeleteId(null);
    }
  };

  const filtered = categoryFilter
    ? partners.filter((p) => p.category === categoryFilter)
    : partners;

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Partners</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/partners/new')}
        >
          Add Partner
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <FormControl size="small" className="mb-4" sx={{ minWidth: 200 }}>
        <InputLabel>Filter by Category</InputLabel>
        <Select
          value={categoryFilter}
          label="Filter by Category"
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Boosted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.name}</TableCell>
                  <TableCell>{partner.category}</TableCell>
                  <TableCell>{partner.address}</TableCell>
                  <TableCell>
                    {partner.boosted ? (
                      <Chip label="Boosted" color="success" size="small" />
                    ) : (
                      <Chip label="Standard" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => router.push(`/partners/${partner.id}`)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => setDeleteId(partner.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No partners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this partner?</DialogContent>
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
