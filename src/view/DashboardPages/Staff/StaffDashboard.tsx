import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, LinearProgress, TextField, Button, Chip, useTheme, alpha, styled, Avatar, InputAdornment } from '@mui/material';
import { QrCodeScanner, CheckCircle, Search, VerifiedUser, Person, Phone } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { useAuth } from '@/utils/useAuth';
import { staffService } from '@/services/StaffService';
import { BookingResponseDto } from '@/types';

type BookingRecord = BookingResponseDto & Record<string, unknown>;

const StyledCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  padding: theme.spacing(3),
}));

export default function StaffDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [todaysPickups, setTodaysPickups] = useState<BookingResponseDto[]>([]);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchResult, setSearchResult] = useState<BookingResponseDto | null>(null);

  useEffect(() => { fetchTodaysPickups(); }, []);

  const fetchTodaysPickups = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await staffService.getTodaysPickups();
      if (response.success && response.data) setTodaysPickups(response.data);
    } catch { showSnackbar('error', 'Failed to fetch pickups'); }
    finally { setLoading(false); }
  };

  const handleSearchBooking = async (): Promise<void> => {
    if (!searchPhone) { showSnackbar('warning', 'Please enter mobile number'); return; }
    try {
      const response = await staffService.searchBookingByPhone(searchPhone);
      if (response.success && response.data?.booking) setSearchResult(response.data.booking);
      else { showSnackbar('error', 'No booking found for this number'); setSearchResult(null); }
    } catch { showSnackbar('error', 'Search failed'); }
  };

  const handleVerifyPayment = async (bookingId: string): Promise<void> => {
    const confirmed = await showConfirmation('Confirm payment verification?', 'Verify Payment', async () => {});
    if (confirmed) {
      try {
        const response = await staffService.verifyPayment(bookingId);
        if (response.success) {
          showSnackbar('success', 'Payment verified successfully');
          await fetchTodaysPickups();
          setSearchResult(null);
          setSearchPhone('');
        }
      } catch { showSnackbar('error', 'Verification failed'); }
    }
  };

  const handleCompletePickup = async (bookingId: string): Promise<void> => {
    const confirmed = await showConfirmation('Confirm pickup completion?', 'Complete Pickup', async () => {});
    if (confirmed) {
      try {
        const response = await staffService.completePickup(bookingId);
        if (response.success) {
          showSnackbar('success', 'Pickup completed successfully');
          await fetchTodaysPickups();
          setSearchResult(null);
          setSearchPhone('');
        }
      } catch { showSnackbar('error', 'Failed to complete pickup'); }
    }
  };

  const columns: Column<BookingRecord>[] = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerPhone', label: 'Phone' },
    { key: 'ganpatiName', label: 'Ganpati' },
    { key: 'remainingAmount', label: 'Pending Amount', render: (row) => `₹${(row as BookingResponseDto).remainingAmount.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (row) => <Chip label={(row as BookingResponseDto).status.replace('_', ' ')} color={(row as BookingResponseDto).status === 'CONFIRMED' ? 'success' : 'warning'} size="small" sx={{ borderRadius: 8 }} /> },
    { key: ACTION_KEY, label: 'Actions' },
  ];

  if (loading) return <LinearProgress />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Staff Dashboard - {user?.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <GlassPaper>
              <Typography variant="h6" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}><Search /> Quick Search by Mobile Number</Typography>
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <TextField fullWidth label="Mobile Number" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="Enter 10-digit mobile number" InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }} sx={{ flex: 1 }} />
                <Button variant="contained" onClick={handleSearchBooking} sx={{ borderRadius: 30, textTransform: 'none' }}>Search</Button>
              </Box>
              {searchResult && (
                <StyledCard sx={{ mt: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={2}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}><Person /></Avatar>
                          <Box><Typography variant="subtitle1" fontWeight={600}>{searchResult.customerName}</Typography><Typography variant="caption" color="textSecondary">Booking ID: {searchResult.bookingId}</Typography></Box>
                        </Box>
                        <Typography variant="body2">Ganpati: {searchResult.ganpatiName}</Typography>
                        <Typography variant="body2">Total: ₹{searchResult.totalAmount.toLocaleString()}</Typography>
                        <Typography variant="body2">Paid: ₹{searchResult.advancePaid.toLocaleString()}</Typography>
                        <Typography variant="body2" fontWeight={600} color={searchResult.remainingAmount > 0 ? 'error.main' : 'success.main'}>Remaining: ₹{searchResult.remainingAmount.toLocaleString()}</Typography>
                      </Box>
                      <Box><Chip label={searchResult.status.replace('_', ' ')} color={searchResult.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ borderRadius: 8 }} /></Box>
                    </Box>
                    <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                      {searchResult.remainingAmount > 0 && searchResult.status === 'CONFIRMED' && (<Button variant="contained" color="success" startIcon={<VerifiedUser />} onClick={() => handleVerifyPayment(searchResult.id)} sx={{ borderRadius: 30, textTransform: 'none' }}>Verify Payment</Button>)}
                      {searchResult.status === 'CONFIRMED' && searchResult.remainingAmount === 0 && (<Button variant="contained" startIcon={<CheckCircle />} onClick={() => handleCompletePickup(searchResult.id)} sx={{ borderRadius: 30, textTransform: 'none' }}>Complete Pickup</Button>)}
                    </Box>
                  </CardContent>
                </StyledCard>
              )}
            </GlassPaper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <GlassPaper>
              <Typography variant="h6" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}><QrCodeScanner /> QR Scanner</Typography>
              <Box sx={{ height: 300, bgcolor: '#000', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="white">QR Scanner Component Here</Typography>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>Position QR code in front of camera to scan</Typography>
            </GlassPaper>
          </Grid>

          <Grid size={12}>
            <GlassPaper>
              <Typography variant="h6" fontWeight={600} gutterBottom>Today's Pickups Schedule</Typography>
              <UniversalTable<BookingRecord>
                data={todaysPickups as BookingRecord[]}
                columns={columns}
                rowsPerPage={10}
                showSearch
                actions={{
                  view: (row) => console.log('View', row),
                  complete: (row) => (row as BookingResponseDto).status === 'CONFIRMED' && (row as BookingResponseDto).remainingAmount === 0 ? handleCompletePickup((row as BookingResponseDto).id) : undefined,
                }}
              />
            </GlassPaper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}