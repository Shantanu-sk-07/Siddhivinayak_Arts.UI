// src/view/DashboardPages/shared/NotificationBell.tsx
import { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
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
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
      }
    } catch  {
      console.error('Failed to fetch notifications');
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
      await fetch(`/api/notifications/${notification.id}/read`, { method: 'POST' });
      setUnreadCount(prev => prev - 1);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return '#1976d2';
      case 'payment': return '#2e7d32';
      default: return '#ff9800';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <Typography sx={{ p: 2, fontWeight: 600 }}>Notifications</Typography>
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
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
              }}
            >
              <Box>
                <Typography variant="subtitle2" gutterBottom>
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