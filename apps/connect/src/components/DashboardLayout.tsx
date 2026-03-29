'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  MeetingRoom,
  BookOnline,
  RoomService,
  Place,
  Logout,
} from '@mui/icons-material';
import { getUser, logout } from '@/lib/auth';

const DRAWER_WIDTH = 260;
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: <Dashboard /> },
  { label: 'Rooms', href: '/rooms', icon: <MeetingRoom /> },
  { label: 'Reservations', href: '/reservations', icon: <BookOnline /> },
  { label: 'Service Requests', href: '/requests', icon: <RoomService /> },
  { label: 'Amenities', href: '/amenities', icon: <Place /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#faf8f5' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          color: '#1c1917',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderBottom: '1px solid #e7e5e4',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: '#0d7377', fontWeight: 700 }}>
            Zuroy Connect
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#0d7377',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {user.firstName?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2" sx={{ color: '#78716c' }}>
                {user.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <Logout fontSize="small" sx={{ mr: 1, color: '#78716c' }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e7e5e4',
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d7377 0%, #0a5c5f 100%)',
            px: 2.5,
            py: 2.5,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            mb: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
            Zuroy Connect
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
            Front Desk
          </Typography>
        </Box>
        <List sx={{ px: 1, pt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.href}
              selected={pathname === item.href}
              onClick={() => router.push(item.href)}
              sx={{
                mx: 0.5,
                mb: 0.5,
                borderRadius: 2,
                backgroundColor:
                  pathname === item.href ? 'rgba(13, 115, 119, 0.08)' : 'transparent',
                color: pathname === item.href ? '#0d7377' : '#78716c',
                '&:hover': { backgroundColor: 'rgba(13, 115, 119, 0.04)' },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(13, 115, 119, 0.08)',
                  '&:hover': { backgroundColor: 'rgba(13, 115, 119, 0.12)' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.href ? '#0d7377' : '#a8a29e',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: pathname === item.href ? 600 : 500,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
