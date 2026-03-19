'use client';
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { hotelApi } from '@/lib/api';

interface DashboardStats {
  totalRooms: number;
  occupied: number;
  available: number;
  todayCheckIns: number;
  todayCheckOuts: number;
}

const STAT_CARDS: { key: keyof DashboardStats; label: string; color: string }[] = [
  { key: 'totalRooms', label: 'Total Rooms', color: '#0d9488' },
  { key: 'occupied', label: 'Occupied', color: '#ef4444' },
  { key: 'available', label: 'Available', color: '#22c55e' },
  { key: 'todayCheckIns', label: "Today's Check-ins", color: '#3b82f6' },
  { key: 'todayCheckOuts', label: "Today's Check-outs", color: '#f59e0b' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupied: 0,
    available: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
  });

  useEffect(() => {
    hotelApi<DashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h4" className="mb-6 font-bold">
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {STAT_CARDS.map(({ key, label, color }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h3" sx={{ color, fontWeight: 700 }}>
                  {stats[key]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
