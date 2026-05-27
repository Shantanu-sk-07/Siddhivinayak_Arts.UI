import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, LinearProgress, TextField, Button, Chip, useTheme, alpha, styled, Avatar, InputAdornment } from '@mui/material';
import { Category, PendingActions, AttachMoney, Payment, People, TrendingUp, QrCodeScanner, CheckCircle, Search, VerifiedUser, Person, Phone } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { useAuth } from '@/utils/useAuth';
import { adminService } from '@/services/AdminService';
import { DashboardStats, BookingResponseDto } from '@/types';

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

const StatCard = ({ title, value, icon, color, trend }: { title: string; value: string | number; icon: React.ReactNode; color: string; trend?: number }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" variant="caption">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>{value}</Typography>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp sx={{ fontSize: 16, color: trend > 0 ? 'success.main' : 'error.main' }} />
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}% from last week
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ bgcolor: `${color}20`, borderRadius: 2, p: 1 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [todaysPickups, setTodaysPickups] = useState<BookingResponseDto[]>([]);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchResult, setSearchResult] = useState<BookingResponseDto | null>(null);

  useEffect(() => { 
    fetchDashboardStats(); 
    fetchTodaysPickups();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      if (response.success && response.data) setStats(response.data);
    } catch {
      showSnackbar('error', 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysPickups = async (): Promise<void> => {
    try {
      const response = await adminService.getTodaysPickups();
      if (response.success && response.data) setTodaysPickups(response.data);
    } catch { 
      showSnackbar('error', 'Failed to fetch pickups'); 
    }
  };

  const handleSearchBooking = async (): Promise<void> => {
    if (!searchPhone) { 
      showSnackbar('warning', 'Please enter mobile number'); 
      return; 
    }
    try {
      const response = await adminService.searchByPhone(searchPhone);
      if (response.success && response.data?.booking) {
        setSearchResult(response.data.booking);
      } else { 
        showSnackbar('error', 'No booking found for this number'); 
        setSearchResult(null); 
      }
    } catch { 
      showSnackbar('error', 'Search failed'); 
    }
  };

  const handleVerifyPayment = async (bookingId: string): Promise<void> => {
  const confirmed = await showConfirmation('Confirm payment verification?', 'Verify Payment');
  if (confirmed) {
    try {
      const response = await adminService.verifyPayment(bookingId, 'VERIFIED');
      if (response.success) {
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
    const confirmed = await showConfirmation('Confirm pickup completion?', 'Complete Pickup');
    if (confirmed) {
      try {
        const response = await adminService.completePickup(bookingId);
        if (response.success) {
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

  const statCards = [
    { title: 'Total Ganpati', value: stats?.totalGanpati || 0, icon: <Category sx={{ fontSize: 32, color: theme.palette.primary.main }} />, color: theme.palette.primary.main, trend: 12 },
    { title: 'Pending Requests', value: stats?.pendingRequests || 0, icon: <PendingActions sx={{ fontSize: 32, color: theme.palette.warning.main }} />, color: theme.palette.warning.main, trend: 8 },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <AttachMoney sx={{ fontSize: 32, color: theme.palette.success.main }} />, color: theme.palette.success.main, trend: 5 },
    { title: 'Pending Payments', value: `₹${(stats?.pendingPayments || 0).toLocaleString()}`, icon: <Payment sx={{ fontSize: 32, color: theme.palette.error.main }} />, color: theme.palette.error.main },
    { title: 'Interested Users', value: stats?.interestedUsers || 0, icon: <People sx={{ fontSize: 32, color: theme.palette.info.main }} />, color: theme.palette.info.main, trend: 25 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', mb: 2, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
            Welcome Back, {user?.name}!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {statCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.title}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <GlassPaper>
              <Typography variant="h6" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                <Search /> Quick Search by Mobile Number
              </Typography>
              <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                <TextField 
                  fullWidth 
                  label="Mobile Number" 
                  value={searchPhone} 
                  onChange={(e) => setSearchPhone(e.target.value)} 
                  placeholder="Enter 10-digit mobile number" 
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }} 
                  sx={{ flex: 1 }} 
                />
                <Button variant="contained" onClick={handleSearchBooking} sx={{ borderRadius: 30, textTransform: 'none' }}>
                  Search
                </Button>
              </Box>
              {searchResult && (
                <StyledCard sx={{ mt: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={2}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}><Person /></Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>{searchResult.customerName}</Typography>
                            <Typography variant="caption" color="textSecondary">Booking ID: {searchResult.bookingId}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2">Ganpati: {searchResult.ganpatiName}</Typography>
                        <Typography variant="body2">Total: ₹{searchResult.totalAmount.toLocaleString()}</Typography>
                        <Typography variant="body2">Paid: ₹{searchResult.advancePaid.toLocaleString()}</Typography>
                        <Typography variant="body2" fontWeight={600} color={searchResult.remainingAmount > 0 ? 'error.main' : 'success.main'}>
                          Remaining: ₹{searchResult.remainingAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Chip label={searchResult.status.replace('_', ' ')} color={searchResult.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ borderRadius: 8 }} />
                      </Box>
                    </Box>
                    <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                      {searchResult.remainingAmount > 0 && searchResult.status === 'CONFIRMED' && (
                        <Button variant="contained" color="success" startIcon={<VerifiedUser />} onClick={() => handleVerifyPayment(searchResult.id)} sx={{ borderRadius: 30, textTransform: 'none' }}>
                          Verify Payment
                        </Button>
                      )}
                      {searchResult.status === 'CONFIRMED' && searchResult.remainingAmount === 0 && (
                        <Button variant="contained" startIcon={<CheckCircle />} onClick={() => handleCompletePickup(searchResult.id)} sx={{ borderRadius: 30, textTransform: 'none' }}>
                          Complete Pickup
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              )}
            </GlassPaper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <GlassPaper>
              <Typography variant="h6" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                <QrCodeScanner /> QR Scanner
              </Typography>
              <Box sx={{ height: 300, bgcolor: '#000', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="white">QR Scanner Component Here</Typography>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                Position QR code in front of camera to scan
              </Typography>
            </GlassPaper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Today's Pickups Schedule</Typography>
              <UniversalTable<BookingRecord>
                data={todaysPickups as BookingRecord[]}
                columns={columns}
                rowsPerPage={5}
                showSearch
                actions={{
                  view: (row) => console.log('View', row),
                  complete: (row) => (row as BookingResponseDto).status === 'CONFIRMED' && (row as BookingResponseDto).remainingAmount === 0 
                    ? handleCompletePickup((row as BookingResponseDto).id) 
                    : undefined,
                }}
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Festival Analytics</Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Occupancy Rate</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.festivalAnalytics?.occupancyRate || 0}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={stats?.festivalAnalytics?.occupancyRate || 0} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total Bookings</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.festivalAnalytics?.totalBookings || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Completed Pickups</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats?.festivalAnalytics?.completedPickups || 0}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}