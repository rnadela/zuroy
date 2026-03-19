'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, ContentCopy } from '@mui/icons-material';
import { api } from '@/lib/api';

interface RegisterResponse {
  id: string;
  apiKey: string;
}

export default function NewDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    serialNumber: '',
    deviceModel: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await api<RegisterResponse>('/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setApiKey(data.apiKey);
    } catch (err: any) {
      setError(err.message || 'Failed to register device');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (apiKey) {
    return (
      <div>
        <Typography variant="h4" className="mb-4">
          Device Registered
        </Typography>
        <Alert severity="warning" className="mb-4">
          Save this API key now. It will not be shown again!
        </Alert>
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <TextField label="API Key" value={apiKey} fullWidth InputProps={{ readOnly: true }} />
              <IconButton onClick={handleCopy}>
                <ContentCopy />
              </IconButton>
            </div>
            {copied && (
              <Alert severity="success" className="mt-2">
                Copied to clipboard
              </Alert>
            )}
          </CardContent>
        </Card>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/devices')} className="mt-4">
          Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/devices')} className="mb-4">
        Back to Devices
      </Button>

      <Typography variant="h4" className="mb-4">
        Register Device
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
              label="Serial Number"
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              required
            />
            <TextField
              label="Device Model"
              name="deviceModel"
              value={form.deviceModel}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" disabled={loading} className="mt-4">
              {loading ? <CircularProgress size={24} /> : 'Register Device'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
