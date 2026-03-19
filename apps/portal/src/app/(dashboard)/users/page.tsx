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
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hotel?: { name: string };
}

const ROLE_COLORS: Record<string, 'secondary' | 'info'> = {
  SUPER_ADMIN: 'secondary',
  HOTEL_STAFF: 'info',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api<User[]>('/users');
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <CircularProgress className="mt-6" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Users</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/users/new')}>
          Add User
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
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={ROLE_COLORS[user.role] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.hotel?.name || '—'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => router.push(`/users/${user.id}`)}>
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
