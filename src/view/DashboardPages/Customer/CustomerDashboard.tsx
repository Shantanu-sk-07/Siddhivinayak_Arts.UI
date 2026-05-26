// src/view/DashboardPages/Customer/CustomerDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  BookOnline,
  Payment,
  QrCode,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '@/utils/useAuth';
import { Booking } from '@/types';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { useNavigate } from 'react-router-dom';

interface BookingSummary {
  activeBookings: number;
  completedBookings: number;
  totalPaid: number;
  pendingAmount: number;
}

interface BookingsResponse {
  success: boolean;
  data: Booking[];
}

interface SummaryResponse {
  success: boolean;
  data: BookingSummary;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
}

export default function CustomerDashboard() {
  const { user } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<BookingSummary>({
    activeBookings: 0,
    completedBookings: 0,
    totalPaid: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async (): Promise<void> => {
    try {
      setLoading(true);
      // API calls
      const bookingsResponse = await fetch('/api/customer/bookings?limit=5');
      const summaryResponse = await fetch('/api/customer/summary');
      
      const bookingsData: BookingsResponse = await bookingsResponse.json();
      const summaryData: SummaryResponse = await summaryResponse.json();
      
      if (bookingsData.success && bookingsData.data) {
        setRecentBookings(bookingsData.data);
      }
      if (summaryData.success && summaryData.data) {
        setSummary(summaryData.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING_REQUEST': return 'warning';
      case 'APPROVED': return 'info';
      case 'PICKUP_COMPLETED': return 'default';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Button
          variant="contained"
          startIcon={<BookOnline />}
          onClick={() => navigate('/customer/ganpati')}
        >
          Book New Ganpati
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Active Bookings</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>{summary.activeBookings}</Typography>
                </Box>
                <BookOnline sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Completed</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>{summary.completedBookings}</Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Total Paid</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>₹{summary.totalPaid.toLocaleString()}</Typography>
                </Box>
                <Payment sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Pending Amount</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>₹{summary.pendingAmount.toLocaleString()}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'error.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
        {recentBookings.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">No bookings yet</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/customer/ganpati')}>
              Browse Ganpati
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {recentBookings.map((booking: Booking) => (
              <Grid size={12} key={booking.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{booking.ganpatiName}</Typography>
                        <Typography variant="body2" color="textSecondary">Booking ID: {booking.bookingId}</Typography>
                        <Typography variant="body2">Amount: ₹{booking.totalAmount.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                        <Chip 
                          label={booking.status.replace('_', ' ')} 
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                        >
                          View Details
                        </Button>
                        {booking.status === 'CONFIRMED' && (
                          <Button 
                            size="small" 
                            variant="contained"
                            startIcon={<QrCode />}
                            onClick={() => navigate(`/customer/qr/${booking.id}`)}
                          >
                            Show QR
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
}