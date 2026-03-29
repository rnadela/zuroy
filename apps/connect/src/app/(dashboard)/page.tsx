'use client';
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { MeetingRoom, Hotel, CheckCircle, Login, Logout } from '@mui/icons-material';
import { hotelApi } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface DashboardStats {
  totalRooms: number;
  occupied: number;
  available: number;
  todayCheckIns: number;
  todayCheckOuts: number;
}

const STAT_CARDS: {
  key: keyof DashboardStats;
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'totalRooms',
    label: 'Total Rooms',
    color: '#0d7377',
    bg: 'rgba(13, 115, 119, 0.08)',
    icon: <MeetingRoom />,
  },
  {
    key: 'occupied',
    label: 'Occupied',
    color: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.08)',
    icon: <Hotel />,
  },
  {
    key: 'available',
    label: 'Available',
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.08)',
    icon: <CheckCircle />,
  },
  {
    key: 'todayCheckIns',
    label: "Today's Check-ins",
    color: '#0d7377',
    bg: 'rgba(13, 115, 119, 0.08)',
    icon: <Login />,
  },
  {
    key: 'todayCheckOuts',
    label: "Today's Check-outs",
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    icon: <Logout />,
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupied: 0,
    available: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
  });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user?.firstName) setUserName(user.firstName);
    hotelApi<DashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#1c1917', fontWeight: 700 }}>
          {getGreeting()}
          {userName ? `, ${userName}` : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#78716c', mt: 0.5, fontSize: '0.95rem' }}>
          Here&apos;s your property overview for today.
        </Typography>
      </Box>
      <Grid container spacing={2.5}>
        {STAT_CARDS.map(({ key, label, color, bg, icon }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid #e7e5e4',
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color,
                      mr: 1.5,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#78716c', fontWeight: 500 }}>
                    {label}
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color, fontWeight: 700, fontSize: '2rem' }}>
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
