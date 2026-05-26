// src/view/DashboardPages/Staff/StaffDashboard.tsx
import { useState, useEffect, JSX } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import {
  QrCodeScanner,
  CheckCircle,
  Search,
  VerifiedUser,
} from '@mui/icons-material';
import { Booking } from '@/types';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { useAuth } from '@/utils/useAuth';

// Convert Booking to Record<string, unknown> type
type BookingRecord = Booking & Record<string, unknown>;

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: StaffUser | null;
}

interface TodaysPickupsResponse {
  success: boolean;
  data: Booking[];
}

interface SearchBookingResponse {
  success: boolean;
  data: Booking | null;
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
}

interface CompletePickupResponse {
  success: boolean;
  message?: string;
}

export default function StaffDashboard() {
  const { user } = useAuth() as AuthContextType;
  const [loading, setLoading] = useState<boolean>(true);
  const [todaysPickups, setTodaysPickups] = useState<Booking[]>([]);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchResult, setSearchResult] = useState<Booking | null>(null);

  useEffect(() => {
    fetchTodaysPickups();
  }, []);

  const fetchTodaysPickups = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/todays-pickups');
      const data: TodaysPickupsResponse = await response.json();
      if (data.success && data.data) {
        setTodaysPickups(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch pickups');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBooking = async (): Promise<void> => {
    if (!searchPhone) {
      showSnackbar('warning', 'Please enter mobile number');
      return;
    }
    try {
      const response = await fetch(`/api/staff/search-booking?phone=${searchPhone}`);
      const data: SearchBookingResponse = await response.json();
      if (data.success && data.data) {
        setSearchResult(data.data);
      } else {
        showSnackbar('error', 'No booking found for this number');
        setSearchResult(null);
      }
    } catch {
      showSnackbar('error', 'Search failed');
    }
  };

  const handleVerifyPayment = async (bookingId: string): Promise<void> => {
    const confirmed = await showConfirmation({
      message: 'Confirm payment verification?',
      title: 'Verify Payment',
      confirmText: 'Verify',
      confirmColor: 'success',
    });
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/staff/verify-payment/${bookingId}`, {
          method: 'POST',
        });
        const data: VerifyPaymentResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Payment verified successfully');
          await fetchTodaysPickups();
          setSearchResult(null);
          setSearchPhone('');
        }
      } catch {
        showSnackbar('error', 'Verification failed');
      }
    }
  };

  const handleCompletePickup = async (bookingId: string): Promise<void> => {
    const confirmed = await showConfirmation({
      message: 'Confirm pickup completion?',
      title: 'Complete Pickup',
      confirmText: 'Complete',
      confirmColor: 'success',
    });
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/staff/complete-pickup/${bookingId}`, {
          method: 'POST',
        });
        const data: CompletePickupResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Pickup completed successfully');
          await fetchTodaysPickups();
          setSearchResult(null);
          setSearchPhone('');
        }
      } catch {
        showSnackbar('error', 'Failed to complete pickup');
      }
    }
  };

  // Define columns for UniversalTable using BookingRecord type
  const columns: Column<BookingRecord>[] = [
    { key: 'bookingId' as keyof BookingRecord, label: 'Booking ID' },
    { key: 'customerName' as keyof BookingRecord, label: 'Customer Name' },
    { key: 'customerPhone' as keyof BookingRecord, label: 'Phone' },
    { key: 'ganpatiName' as keyof BookingRecord, label: 'Ganpati' },
    { 
      key: 'remainingAmount' as keyof BookingRecord, 
      label: 'Pending Amount', 
      render: (row: BookingRecord): string => `₹${(row as Booking).remainingAmount.toLocaleString()}` 
    },
    { 
      key: 'status' as keyof BookingRecord, 
      label: 'Status', 
      render: (row: BookingRecord): JSX.Element => {
        const booking = row as Booking;
        return (
          <Chip 
            label={booking.status.replace('_', ' ')} 
            color={booking.status === 'CONFIRMED' ? 'success' : 'warning'}
            size="small"
          />
        );
      }
    },
  ];

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Staff Dashboard - {user?.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, sm: 6}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <Search /> Quick Search by Mobile Number
            </Typography>
            <Box display="flex" gap={2} mt={2}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={searchPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
              />
              <Button variant="contained" onClick={handleSearchBooking}>
                Search
              </Button>
            </Box>

            {searchResult && (
              <Card sx={{ mt: 3, bgcolor: 'action.hover' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{searchResult.customerName}</Typography>
                      <Typography variant="body2">Booking ID: {searchResult.bookingId}</Typography>
                      <Typography variant="body2">Ganpati: {searchResult.ganpatiName}</Typography>
                      <Typography variant="body2">Total: ₹{searchResult.totalAmount.toLocaleString()}</Typography>
                      <Typography variant="body2">Paid: ₹{searchResult.advancePaid.toLocaleString()}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        Remaining: ₹{searchResult.remainingAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip 
                        label={searchResult.status.replace('_', ' ')} 
                        color={searchResult.status === 'CONFIRMED' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={2} mt={2}>
                    {searchResult.remainingAmount > 0 && searchResult.status === 'CONFIRMED' && (
                      <Button 
                        variant="contained" 
                        color="success"
                        startIcon={<VerifiedUser />}
                        onClick={() => handleVerifyPayment(searchResult.id)}
                      >
                        Verify Payment
                      </Button>
                    )}
                    {searchResult.status === 'CONFIRMED' && searchResult.remainingAmount === 0 && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<CheckCircle />}
                        onClick={() => handleCompletePickup(searchResult.id)}
                      >
                        Complete Pickup
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        <Grid size={{xs: 12, sm: 6}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <QrCodeScanner /> QR Scanner
            </Typography>
            <Box 
              sx={{ 
                height: 300, 
                bgcolor: 'black', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="white">QR Scanner Component Here</Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              Position QR code in front of camera to scan
            </Typography>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Today's Pickups Schedule</Typography>
            <UniversalTable<BookingRecord>
              data={todaysPickups as BookingRecord[]}
              columns={columns}
              rowsPerPage={10}
              showSearch
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}