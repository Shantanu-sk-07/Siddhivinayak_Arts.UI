import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  TextField, InputAdornment, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText,
  ListItemAvatar, Avatar,  Tab, Tabs, useTheme, alpha,
  styled
} from '@mui/material';
import {
  Search, CheckCircle, Pending, VerifiedUser, Receipt, Print, Phone, Person, Schedule
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { BookingResponseDto, PickupStats } from '@/types';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { adminService } from '@/services/AdminService';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
type BookingRecord = BookingResponseDto & Record<string, unknown>;

const StyledCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    background: alpha(theme.palette.common.white, 0.96),
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

const StyledButton = styled(Button)({
  borderRadius: 30,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 24px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (<div hidden={value !== index} {...other}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>);
}

export default function PickupManagement() {
  const theme = useTheme();
  const [pickups, setPickups] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<BookingResponseDto | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<BookingResponseDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<PickupStats>({
    todayPickups: 0, completedToday: 0, pendingToday: 0, totalPickups: 0,
  });

  useEffect(() => { fetchPickups(); fetchStats(); }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTodaysPickups();
      if (response.success && response.data) setPickups(response.data);
    } catch { showSnackbar('error', 'Failed to fetch pickups'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getPickupStats();
      if (response.success && response.data) setStats(response.data);
    } catch { console.error('Failed to fetch stats'); }
  };

  const handleSearchBooking = async () => {
    if (!searchPhone) { showSnackbar('warning', 'Please enter mobile number'); return; }
    try {
      const response = await adminService.searchByPhone(searchPhone);
      if (response.success && response.data?.booking) setSearchResult(response.data.booking);
      else { showSnackbar('error', 'No pickup found for this number'); setSearchResult(null); }
    } catch { showSnackbar('error', 'Search failed'); }
  };

  const handleCompletePickup = async (booking: BookingResponseDto) => {
    try {
      const response = await adminService.completePickup(booking.id);
      if (response.success) {
        showSnackbar('success', 'Pickup completed successfully');
        await fetchPickups(); await fetchStats();
        setSearchResult(null); setSearchPhone('');
      }
    } catch { showSnackbar('error', 'Failed to complete pickup'); }
  };

  const handlePrintReceipt = async (booking: BookingResponseDto) => {
    try {
      const blob = await adminService.printReceipt(booking.id);
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) printWindow.print();
    } catch { showSnackbar('error', 'Failed to print receipt'); }
  };

  const viewDetails = (booking: BookingResponseDto) => { setSelectedPickup(booking); setDetailsOpen(true); };

  const getPendingPickups = () => pickups.filter(p => p.status === 'CONFIRMED' && p.remainingAmount === 0);
  const getCompletedPickups = () => pickups.filter(p => p.status === 'PICKUP_COMPLETED');
  const getTodayPickups = () => pickups.filter(p => new Date(p.pickupDate || p.createdAt).toDateString() === new Date().toDateString());

  const pickupColumns: Column<BookingRecord>[] = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerPhone', label: 'Phone' },
    { key: 'ganpatiName', label: 'Ganpati' },
    { key: 'totalAmount', label: 'Amount', render: (row) => `₹${(row as BookingResponseDto).totalAmount.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (row) => <Chip label={(row as BookingResponseDto).status.replace('_', ' ')} color={(row as BookingResponseDto).status === 'PICKUP_COMPLETED' ? 'success' : 'warning'} size="small" sx={{ borderRadius: 8 }} /> },
    { key: ACTION_KEY, label: 'Actions' },
  ];

  if (loading) return <LinearProgress />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Pickup Management
          </Typography>
          <Typography variant="body2" color="textSecondary">Manage and complete customer pickups for festival day</Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledCard><CardContent sx={{ p: { xs: 1.5, sm: 2 } }}><Box display="flex" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" color="textSecondary">Today's Pickups</Typography><Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' }, color: theme.palette.primary.main }}>{stats.todayPickups}</Typography></Box><Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}><Schedule /></Avatar></Box></CardContent></StyledCard>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledCard><CardContent sx={{ p: { xs: 1.5, sm: 2 } }}><Box display="flex" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" color="textSecondary">Completed Today</Typography><Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' }, color: theme.palette.success.main }}>{stats.completedToday}</Typography></Box><Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}><CheckCircle /></Avatar></Box></CardContent></StyledCard>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledCard><CardContent sx={{ p: { xs: 1.5, sm: 2 } }}><Box display="flex" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" color="textSecondary">Pending Today</Typography><Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' }, color: theme.palette.warning.main }}>{stats.pendingToday}</Typography></Box><Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}><Pending /></Avatar></Box></CardContent></StyledCard>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledCard><CardContent sx={{ p: { xs: 1.5, sm: 2 } }}><Box display="flex" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" color="textSecondary">Total Pickups</Typography><Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' }, color: theme.palette.info.main }}>{stats.totalPickups}</Typography></Box><Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}><VerifiedUser /></Avatar></Box></CardContent></StyledCard>
          </Grid>
        </Grid>

        <GlassPaper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }} display="flex" alignItems="center" gap={1}><Search /> Quick Search by Mobile Number</Typography>
          <Box display="flex" gap={2} mt={2} flexWrap="wrap">
            <TextField fullWidth label="Mobile Number" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="Enter 10-digit mobile number" InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }} sx={{ flex: 1 }} />
            <StyledButton variant="contained" onClick={handleSearchBooking}>Search</StyledButton>
          </Box>
          {searchResult && (
            <Card sx={{ mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={2}>
                  <Box><Box display="flex" alignItems="center" gap={2} mb={1}><Avatar sx={{ bgcolor: theme.palette.primary.main }}><Person /></Avatar><Box><Typography variant="subtitle1" fontWeight={600}>{searchResult.customerName}</Typography><Typography variant="caption" color="textSecondary">Booking ID: {searchResult.bookingId}</Typography></Box></Box>
                    <Typography variant="body2">Ganpati: {searchResult.ganpatiName}</Typography>
                    <Typography variant="body2">Total: ₹{searchResult.totalAmount.toLocaleString()}</Typography>
                    <Typography variant="body2">Paid: ₹{searchResult.advancePaid.toLocaleString()}</Typography>
                    <Typography variant="body2" fontWeight={600} color={searchResult.remainingAmount > 0 ? 'error.main' : 'success.main'}>Remaining: ₹{searchResult.remainingAmount.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                    <Chip label={searchResult.status.replace('_', ' ')} color={searchResult.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ borderRadius: 8 }} />
                    {searchResult.status === 'CONFIRMED' && searchResult.remainingAmount === 0 && (<StyledButton variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleCompletePickup(searchResult)}>Complete Pickup</StyledButton>)}
                    <StyledButton variant="outlined" startIcon={<Receipt />} onClick={() => handlePrintReceipt(searchResult)}>Print Receipt</StyledButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </GlassPaper>

        <GlassPaper>
          <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
            <Tab label={`Ready for Pickup (${getPendingPickups().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
            <Tab label={`Today's Pickups (${getTodayPickups().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
            <Tab label={`Completed (${getCompletedPickups().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
            <Tab label="All Pickups" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <UniversalTable<BookingRecord> data={getPendingPickups() as BookingRecord[]} columns={pickupColumns} rowsPerPage={10} showSearch actions={{ view: (row) => viewDetails(row as BookingResponseDto), complete: (row) => handleCompletePickup(row as BookingResponseDto) }} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <UniversalTable<BookingRecord> data={getTodayPickups() as BookingRecord[]} columns={pickupColumns} rowsPerPage={10} showSearch actions={{ view: (row) => viewDetails(row as BookingResponseDto), complete: (row) => handleCompletePickup(row as BookingResponseDto) }} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <UniversalTable<BookingRecord> data={getCompletedPickups() as BookingRecord[]} columns={pickupColumns} rowsPerPage={10} showSearch actions={{ view: (row) => viewDetails(row as BookingResponseDto) }} />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <UniversalTable<BookingRecord> data={pickups as BookingRecord[]} columns={pickupColumns} rowsPerPage={10} showSearch showExport actions={{ view: (row) => viewDetails(row as BookingResponseDto), complete: (row) => (row as BookingResponseDto).status === 'CONFIRMED' && (row as BookingResponseDto).remainingAmount === 0 ? handleCompletePickup(row as BookingResponseDto) : undefined }} />
          </TabPanel>
        </GlassPaper>

        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          {selectedPickup && (
            <>
              <DialogTitle sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'white' }}>Pickup Details - {selectedPickup.bookingId}</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Customer Information</Typography>
                    <List dense>
                      <ListItem><ListItemAvatar><Avatar><Person /></Avatar></ListItemAvatar><ListItemText primary="Name" secondary={selectedPickup.customerName} /></ListItem>
                      <ListItem><ListItemAvatar><Avatar><Phone /></Avatar></ListItemAvatar><ListItemText primary="Phone" secondary={selectedPickup.customerPhone} /></ListItem>
                    </List>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Booking Information</Typography>
                    <List dense>
                      <ListItem><ListItemText primary="Ganpati" secondary={selectedPickup.ganpatiName} /></ListItem>
                      <ListItem><ListItemText primary="Total Amount" secondary={`₹${selectedPickup.totalAmount.toLocaleString()}`} /></ListItem>
                      <ListItem><ListItemText primary="Amount Paid" secondary={`₹${selectedPickup.advancePaid.toLocaleString()}`} /></ListItem>
                      <ListItem><ListItemText primary="Status" secondary={<Chip label={selectedPickup.status} size="small" sx={{ borderRadius: 8 }} />} /></ListItem>
                    </List>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={() => setDetailsOpen(false)} variant="outlined" sx={{ borderRadius: 30 }}>Close</Button>
                <Button variant="contained" startIcon={<Print />} onClick={() => handlePrintReceipt(selectedPickup)} sx={{ borderRadius: 30 }}>Print Receipt</Button>
                {selectedPickup.status === 'CONFIRMED' && selectedPickup.remainingAmount === 0 && (
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => { setDetailsOpen(false); handleCompletePickup(selectedPickup); }} sx={{ borderRadius: 30 }}>Complete Pickup</Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </motion.div>
  );
}