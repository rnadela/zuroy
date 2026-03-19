'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" className="mb-6 text-center font-bold" color="primary">
            Zuroy Connect
          </Typography>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
