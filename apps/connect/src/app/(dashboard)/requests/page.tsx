'use client';

import { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

interface ServiceRequest {
  id: string;
  itemName: string;
  guestName: string;
  roomNumber: string;
  quantity: number;
  notes?: string;
  status: string;
  createdAt: string;
}

const TABS = ['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const;

const statusColor: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await hotelApi<ServiceRequest[]>('/requests');
      setRequests(data);
      setError('');
    } catch {
      setError('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await hotelApi(`/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      setError('Failed to update request');
    }
  };

  const currentFilter = TABS[tab];
  const filtered =
    currentFilter === 'ALL' ? requests : requests.filter((r) => r.status === currentFilter);

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
        <Typography variant="h4">Service Requests</Typography>
        <Button startIcon={<Refresh />} onClick={fetchRequests}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-4">
        {TABS.map((t) => (
          <Tab key={t} label={t.replace('_', ' ')} />
        ))}
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.itemName}</TableCell>
                <TableCell>{r.guestName}</TableCell>
                <TableCell>{r.roomNumber}</TableCell>
                <TableCell align="right">{r.quantity}</TableCell>
                <TableCell>{r.notes || '—'}</TableCell>
                <TableCell>
                  <Chip label={r.status} color={statusColor[r.status] ?? 'default'} size="small" />
                </TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleTimeString()}</TableCell>
                <TableCell align="right">
                  {r.status === 'PENDING' && (
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => updateStatus(r.id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => updateStatus(r.id, 'CANCELLED')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
