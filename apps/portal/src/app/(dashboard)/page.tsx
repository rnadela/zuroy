'use client';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import { Hotel, PhoneAndroid, People } from '@mui/icons-material';

const stats = [
  { label: 'Hotels', icon: <Hotel fontSize="large" />, value: '—' },
  { label: 'Devices', icon: <PhoneAndroid fontSize="large" />, value: '—' },
  { label: 'Users', icon: <People fontSize="large" />, value: '—' },
];

export default function DashboardPage() {
  return (
    <>
      <Typography variant="h4" className="mb-6">
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent className="flex items-center gap-4">
                {s.icon}
                <div>
                  <Typography variant="h4">{s.value}</Typography>
                  <Typography color="text.secondary">{s.label}</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
