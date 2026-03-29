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
  Hotel,
  PhoneAndroid,
  People,
  StorefrontOutlined,
  Logout,
} from '@mui/icons-material';
import { getUser, logout } from '@/lib/auth';

const DRAWER_WIDTH = 240;
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: <Dashboard /> },
  { label: 'Hotels', href: '/hotels', icon: <Hotel /> },
  { label: 'Devices', href: '/devices', icon: <PhoneAndroid /> },
  { label: 'Partners', href: '/partners', icon: <StorefrontOutlined /> },
  { label: 'Users', href: '/users', icon: <People /> },
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
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #334155',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#1e293b',
                border: '2px solid #3b82f6',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {user.firstName?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user.email}</MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
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
            background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
            borderRight: '1px solid #1e293b',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 3, borderBottom: '1px solid #1e293b' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.15em',
              color: '#3b82f6',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
            }}
          >
            ZUROY
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#475569',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Admin Portal
          </Typography>
        </Box>
        <List sx={{ px: 1, pt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.href}
              selected={pathname === item.href}
              onClick={() => router.push(item.href)}
              sx={{
                borderLeft: pathname === item.href ? '3px solid #3b82f6' : '3px solid transparent',
                backgroundColor:
                  pathname === item.href ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.05)' },
                borderRadius: 0,
                mb: 0.5,
              }}
            >
              <ListItemIcon
                sx={{ color: pathname === item.href ? '#3b82f6' : '#64748b', minWidth: 40 }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: pathname === item.href ? 600 : 400,
                  color: pathname === item.href ? '#f1f5f9' : '#94a3b8',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: '#1e293b', minHeight: '100vh' }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
