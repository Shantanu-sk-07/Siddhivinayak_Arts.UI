import { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, useTheme, alpha } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationBell() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const auth = localStorage.getItem('auth-storage');
      let token = '';
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          token = parsed.state?.token || parsed.token;
        } catch {
          token = '';
        }
      }
      
      const response = await fetch('/api/notifications', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
        const unread = (data.data || []).filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch {
      console.debug('Notifications not available');
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        // Silently handle error
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return theme.palette.primary.main;
      case 'payment': return theme.palette.success.main;
      default: return theme.palette.warning.main;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} sx={{ color: 'white' }}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 350, maxHeight: 450, borderRadius: 3, mt: 1 } }}
      >
        <Typography sx={{ p: 2, fontWeight: 700, fontSize: '1rem', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          Notifications
        </Typography>
        <Divider />
        {notifications.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            No notifications
          </Typography>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                whiteSpace: 'normal',
                bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}