'use client';
import { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { Hotel, PhoneAndroid, People, StorefrontOutlined } from '@mui/icons-material';
import { getUser } from '@/lib/auth';

const stats = [
  {
    label: 'Hotels',
    icon: <Hotel />,
    value: '—',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  {
    label: 'Devices',
    icon: <PhoneAndroid />,
    value: '—',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  {
    label: 'Users',
    icon: <People />,
    value: '—',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    label: 'Partners',
    icon: <StorefrontOutlined />,
    value: '—',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
  },
];

export default function DashboardPage() {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user?.firstName) setFirstName(user.firstName);
  }, []);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          System overview
        </Typography>
      </Box>
      <Grid container spacing={2.5}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: s.color,
                }}
              />
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: s.bg,
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {s.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
