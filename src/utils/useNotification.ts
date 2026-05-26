// src/hooks/useNotification.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { showSnackbar, showToast, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { MessageType } from '@/components/uncontrolled/ToastMessage';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}

export interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Custom event type for notifications
interface CustomNotificationEvent {
  id: string;
  type: 'booking' | 'payment' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: unknown;
}

export const useNotification = () => {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  });

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notificationListeners = useRef<Set<(notification: CustomNotificationEvent) => void>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Send browser notification - defined first to avoid hoisting issues
  const sendBrowserNotification = useCallback((options: NotificationOptions) => {
    if (!state.isSupported || state.permission !== 'granted') return;

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo-192.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    notification.onclose = () => {
      if (options.onClose) {
        options.onClose();
      }
    };

    return notification;
  }, [state.isSupported, state.permission]);

  // Handle notification click based on type
  const handleNotificationClick = useCallback((notification: CustomNotificationEvent) => {
    switch (notification.type) {
      case 'booking':
        window.location.href = '/customer/bookings';
        break;
      case 'payment':
        window.location.href = '/customer/payments';
        break;
      case 'reminder':
        if (window.location.pathname !== '/customer/dashboard') {
          window.location.href = '/customer/dashboard';
        }
        break;
      default:
        break;
    }
  }, []);

  // Handle incoming notifications
  const handleIncomingNotification = useCallback((notification: CustomNotificationEvent) => {
    setUnreadCount(prev => prev + 1);
    
    // Show toast for critical notifications
    let toastType: MessageType = 'info';
    if (notification.type === 'payment') {
      toastType = 'success';
    } else if (notification.type === 'reminder') {
      toastType = 'warning';
    } else {
      toastType = 'info';
    }
    
    // Use showToast with MessageType as first parameter
    showToast(toastType, notification.message, { autoClose: 5000 });

    // Trigger browser notification if permission granted
    if (state.permission === 'granted') {
      sendBrowserNotification({
        title: notification.title,
        body: notification.message,
        tag: notification.id,
        onClick: () => {
          handleNotificationClick(notification);
        },
      });
    }

    // Notify all listeners
    notificationListeners.current.forEach(listener => {
      listener(notification);
    });
  }, [state.permission, sendBrowserNotification, handleNotificationClick]);

  // Setup WebSocket for real-time notifications
  const setupWebSocketConnection = useCallback(() => {
    const token = localStorage.getItem('auth-storage');
    if (!token) return;

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
      wsRef.current = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for notifications');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as CustomNotificationEvent;
          handleIncomingNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = setTimeout(() => {
          setupWebSocketConnection();
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }, [handleIncomingNotification]);

  // Check if browser supports notifications
  useEffect(() => {
    const isSupported = 'Notification' in window;
    setState(prev => ({ ...prev, isSupported }));
    
    if (isSupported) {
      setState(prev => ({ ...prev, permission: Notification.permission }));
    }

    // Set up WebSocket connection for real-time notifications
    if (isSupported) {
      setupWebSocketConnection();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [setupWebSocketConnection]);

  // Register for push notifications
  const registerPushNotifications = useCallback(async () => {
    if (!state.isSupported || state.permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      });

      // Send subscription to backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setState(prev => ({ ...prev, isSubscribed: true }));
    } catch (error) {
      console.error('Failed to register push notifications:', error);
    }
  }, [state.isSupported, state.permission]);

  // Request permission for browser notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      showSnackbar('warning', 'Your browser does not support notifications');
      return false;
    }

    if (state.permission === 'granted') {
      return true;
    }

    if (state.permission === 'denied') {
      showSnackbar('warning', 'Notification permission was denied. Please enable from browser settings.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        showSnackbar('success', 'Notifications enabled');
        
        // Register for push notifications
        await registerPushNotifications();
        return true;
      } else {
        showSnackbar('info', 'Notifications disabled');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported, state.permission, registerPushNotifications]);

  // Send toast notification (in-app)
  const sendToast = useCallback((type: MessageType, message: string, duration?: number) => {
    showToast(type, message, { autoClose: duration });
  }, []);

  // Send success notification
  const sendSuccess = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showSnackbar('success', message, options?.duration);
    
    if (state.permission === 'granted') {
      sendBrowserNotification({
        title: options?.title || 'Success',
        body: message,
        requireInteraction: false,
      });
    }
  }, [state.permission, sendBrowserNotification]);

  // Send error notification
  const sendError = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showSnackbar('error', message, options?.duration);
    
    if (state.permission === 'granted') {
      sendBrowserNotification({
        title: options?.title || 'Error',
        body: message,
        requireInteraction: true,
        icon: '/error-icon.png',
      });
    }
  }, [state.permission, sendBrowserNotification]);

  // Send warning notification
  const sendWarning = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showSnackbar('warning', message, options?.duration);
    
    if (state.permission === 'granted') {
      sendBrowserNotification({
        title: options?.title || 'Warning',
        body: message,
        requireInteraction: true,
        icon: '/warning-icon.png',
      });
    }
  }, [state.permission, sendBrowserNotification]);

  // Send info notification
  const sendInfo = useCallback((message: string, options?: { title?: string; duration?: number }) => {
    showSnackbar('info', message, options?.duration);
    
    if (state.permission === 'granted') {
      sendBrowserNotification({
        title: options?.title || 'Information',
        body: message,
        requireInteraction: false,
      });
    }
  }, [state.permission, sendBrowserNotification]);

  // Show confirmation dialog
  const confirm = useCallback(async (
    message: string,
    title?: string,
    onConfirm?: () => Promise<void>
  ): Promise<boolean> => {
    return showConfirmation(message, title, onConfirm);
  }, []);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(0);
        showSnackbar('success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Send notification to specific user (admin only)
  const sendToUser = useCallback(async (userId: string, title: string, message: string, type: string) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, message, type }),
      });
      const data = await response.json();
      if (data.success) {
        showSnackbar('success', 'Notification sent successfully');
      }
      return data.success;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }, []);

  // Broadcast notification to all users (admin only)
  const broadcast = useCallback(async (title: string, message: string, type: string, roles?: string[]) => {
    try {
      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, roles }),
      });
      const data = await response.json();
      if (data.success) {
        showSnackbar('success', 'Broadcast sent successfully');
      }
      return data.success;
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      return false;
    }
  }, []);

  // Send booking reminder
  const sendBookingReminder = useCallback(async (bookingId: string) => {
    try {
      const response = await fetch(`/api/notifications/booking-reminder/${bookingId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        showSnackbar('success', 'Reminder sent successfully');
      }
      return data.success;
    } catch (error) {
      console.error('Failed to send reminder:', error);
      return false;
    }
  }, []);

  // Add notification listener
  const addListener = useCallback((listener: (notification: CustomNotificationEvent) => void) => {
    notificationListeners.current.add(listener);
    return () => {
      notificationListeners.current.delete(listener);
    };
  }, []);

  // Clear unread count
  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    // State
    isSupported: state.isSupported,
    permission: state.permission,
    isSubscribed: state.isSubscribed,
    unreadCount,
    
    // Permission methods
    requestPermission,
    registerPushNotifications,
    
    // Notification sending methods
    sendBrowserNotification,
    sendToast,
    sendSuccess,
    sendError,
    sendWarning,
    sendInfo,
    confirm,
    
    // Management methods
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearUnreadCount,
    
    // Admin methods
    sendToUser,
    broadcast,
    sendBookingReminder,
    
    // Event handling
    addListener,
  };
};

// Custom hook for booking-specific notifications
export const useBookingNotification = () => {
  const notification = useNotification();

  const notifyBookingRequest = useCallback((customerName: string, ganpatiName: string) => {
    const messageType: MessageType = 'info';
    notification.sendToast(messageType, `New booking request from ${customerName} for ${ganpatiName}`);
    
    notification.sendBrowserNotification({
      title: 'New Booking Request',
      body: `${customerName} has requested to book ${ganpatiName}`,
      tag: 'booking-request',
      onClick: () => {
        window.location.href = '/admin/bookings';
      },
    });
  }, [notification]);

  const notifyBookingApproved = useCallback((bookingId: string, ganpatiName: string) => {
    notification.sendSuccess(`Your booking for ${ganpatiName} has been approved!`);
    
    notification.sendBrowserNotification({
      title: 'Booking Approved',
      body: `Your booking (${bookingId}) for ${ganpatiName} has been approved. Pay advance to confirm.`,
      tag: 'booking-approved',
      onClick: () => {
        window.location.href = `/customer/bookings`;
      },
    });
  }, [notification]);

  const notifyPaymentReceived = useCallback((amount: number, bookingId: string) => {
    notification.sendSuccess(`Payment of ₹${amount.toLocaleString()} received for booking ${bookingId}`);
    
    notification.sendBrowserNotification({
      title: 'Payment Received',
      body: `Your payment of ₹${amount.toLocaleString()} has been successfully processed.`,
      tag: 'payment-received',
      onClick: () => {
        window.location.href = `/customer/payments`;
      },
    });
  }, [notification]);

  const notifyPickupReminder = useCallback((bookingId: string, ganpatiName: string, date: string) => {
    notification.sendInfo(`Reminder: Pickup for ${ganpatiName} is scheduled on ${date}`);
    
    notification.sendBrowserNotification({
      title: 'Pickup Reminder',
      body: `Your Ganpati (${ganpatiName}) is ready for pickup on ${date}. Please bring your QR code.`,
      tag: 'pickup-reminder',
      requireInteraction: true,
      onClick: () => {
        window.location.href = `/customer/qr/${bookingId}`;
      },
    });
  }, [notification]);

  const notifyPaymentVerification = useCallback((amount: number, status: 'verified' | 'rejected') => {
    if (status === 'verified') {
      notification.sendSuccess(`Your offline payment of ₹${amount.toLocaleString()} has been verified.`);
    } else {
      notification.sendError(`Your offline payment of ₹${amount.toLocaleString()} was rejected. Please contact support.`);
    }
  }, [notification]);

  return {
    notifyBookingRequest,
    notifyBookingApproved,
    notifyPaymentReceived,
    notifyPickupReminder,
    notifyPaymentVerification,
  };
};

// Custom hook for system notifications
export const useSystemNotification = () => {
  const notification = useNotification();

  const notifySystemUpdate = useCallback((message: string, version?: string) => {
    notification.sendInfo(message, { title: 'System Update' });
    
    notification.sendBrowserNotification({
      title: 'System Update',
      body: version ? `Version ${version}: ${message}` : message,
      tag: 'system-update',
    });
  }, [notification]);

  const notifyMaintenance = useCallback((startTime: string, endTime: string) => {
    notification.sendWarning(`System maintenance scheduled from ${startTime} to ${endTime}`, {
      title: 'Maintenance Alert',
    });
    
    notification.sendBrowserNotification({
      title: 'Scheduled Maintenance',
      body: `The system will be under maintenance from ${startTime} to ${endTime}. Please plan accordingly.`,
      tag: 'maintenance',
      requireInteraction: true,
    });
  }, [notification]);

  const notifySecurityAlert = useCallback((message: string) => {
    notification.sendError(message, { title: 'Security Alert' });
    
    notification.sendBrowserNotification({
      title: 'Security Alert',
      body: message,
      tag: 'security-alert',
      requireInteraction: true,
      icon: '/security-icon.png',
    });
  }, [notification]);

  return {
    notifySystemUpdate,
    notifyMaintenance,
    notifySecurityAlert,
  };
};

export default useNotification;