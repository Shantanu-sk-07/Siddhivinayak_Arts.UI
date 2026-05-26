// src/layouts/DashboardLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Category,
  BookOnline,
  Payments,
  People,
  QrCodeScanner,
  Logout,
  Person,
  Settings,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '@/utils/useAuth';
import { usePermissions } from '@/utils/usePermissions';
import NotificationBell from '@/view/DashboardPages/Staff/NotificationDetails';

const drawerWidth = 260;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin, isStaff, isCustomer } = usePermissions();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [];

    if (isAdmin) {
      items.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'Ganpati Management', icon: <Category />, path: '/admin/ganpati', permission: 'canManageGanpati' },
        { text: 'Booking Management', icon: <BookOnline />, path: '/admin/bookings', permission: 'canManageBookings' },
        { text: 'Payment Verification', icon: <Payments />, path: '/admin/payments', permission: 'canVerifyPayments' },
        { text: 'Staff Management', icon: <People />, path: '/admin/staff', permission: 'canManageStaff' },
        { text: 'Customer Management', icon: <People />, path: '/admin/customers' },
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports', permission: 'canViewReports' }
      );
    } else if (isStaff) {
      items.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/staff/dashboard' },
        { text: 'QR Scan', icon: <QrCodeScanner />, path: '/staff/scan', permission: 'canScanQR' },
        { text: 'Pickup Management', icon: <BookOnline />, path: '/staff/pickup', permission: 'canCompletePickup' }
      );
    } else if (isCustomer) {
      items.push(
        { text: 'Dashboard', icon: <Dashboard />, path: '/customer/dashboard' },
        { text: 'Browse Ganpati', icon: <Category />, path: '/customer/ganpati', permission: 'canMakeBooking' },
        { text: 'My Bookings', icon: <BookOnline />, path: '/customer/bookings', permission: 'canViewOwnBookings' },
        { text: 'Payment History', icon: <Payments />, path: '/customer/payments', permission: 'canMakePayment' }
      );
    }

    return items.filter(item => !item.permission || hasPermission(item.permission as keyof typeof hasPermission));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src="/logo.png" alt="Siddhivinayak Arts" style={{ height: 40 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Siddhivinayak
        </Typography>
      </Box>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Siddhivinayak Arts - Ganpati Booking Platform
          </Typography>
          <NotificationBell />
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}