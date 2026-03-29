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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';

interface StayExtension {
  id: string;
  guestName: string;
  roomNumber: string;
  currentCheckout: string;
  requestedCheckout: string;
  reason?: string;
  status: string;
  rejectionNote?: string;
  createdAt: string;
}

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

const statusColor: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

export default function ExtensionsPage() {
  const [extensions, setExtensions] = useState<StayExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  const fetchExtensions = async () => {
    try {
      setLoading(true);
      const data = await hotelApi<StayExtension[]>('/extensions');
      setExtensions(data);
      setError('');
    } catch {
      setError('Failed to load extension requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtensions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await hotelApi(`/extensions/${id}/approve`, { method: 'POST' });
      setExtensions((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'APPROVED' } : e)));
    } catch {
      setError('Failed to approve extension');
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      await hotelApi(`/extensions/${rejectId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionNote }),
      });
      setExtensions((prev) =>
        prev.map((e) => (e.id === rejectId ? { ...e, status: 'REJECTED', rejectionNote } : e)),
      );
      setRejectId(null);
      setRejectionNote('');
    } catch {
      setError('Failed to reject extension');
    }
  };

  const currentFilter = TABS[tab];
  const filtered =
    currentFilter === 'ALL' ? extensions : extensions.filter((e) => e.status === currentFilter);

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
        <Typography variant="h4">Stay Extensions</Typography>
        <Button startIcon={<Refresh />} onClick={fetchExtensions}>
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
          <Tab key={t} label={t} />
        ))}
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Current Checkout</TableCell>
              <TableCell>Requested Checkout</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.guestName}</TableCell>
                <TableCell>{e.roomNumber}</TableCell>
                <TableCell>{new Date(e.currentCheckout).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(e.requestedCheckout).toLocaleDateString()}</TableCell>
                <TableCell>{e.reason || '—'}</TableCell>
                <TableCell>
                  <Chip label={e.status} color={statusColor[e.status] ?? 'default'} size="small" />
                </TableCell>
                <TableCell align="right">
                  {e.status === 'PENDING' && (
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(e.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => setRejectId(e.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No extension requests
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!rejectId} onClose={() => setRejectId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Extension Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Note"
            fullWidth
            multiline
            rows={3}
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
