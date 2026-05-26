// src/view/DashboardPages/Staff/PickupManagement.tsx
import { useState, useEffect, JSX } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Pending,
  VerifiedUser,
  Receipt,
  Print,
  Phone,
  Person,
  Schedule,
} from '@mui/icons-material';
import { Booking } from '@/types';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StatsData {
  todayPickups: number;
  completedToday: number;
  pendingToday: number;
  totalPickups: number;
}

interface SearchResponse {
  success: boolean;
  data: Booking | null;
}

interface PickupStatsResponse {
  success: boolean;
  data: StatsData;
}

interface PickupListResponse {
  success: boolean;
  data: Booking[];
}

interface CompletePickupResponse {
  success: boolean;
  message?: string;
}

// Convert Booking to Record<string, unknown> type
type BookingRecord = Booking & Record<string, unknown>;

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PickupManagement() {
  const [pickups, setPickups] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchResult, setSearchResult] = useState<Booking | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [stats, setStats] = useState<StatsData>({
    todayPickups: 0,
    completedToday: 0,
    pendingToday: 0,
    totalPickups: 0,
  });

  useEffect(() => {
    fetchPickups();
    fetchStats();
  }, []);

  const fetchPickups = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/pickups');
      const data: PickupListResponse = await response.json();
      if (data.success && data.data) {
        setPickups(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch pickups');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/staff/pickup-stats');
      const data: PickupStatsResponse = await response.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch {
      console.error('Failed to fetch stats');
    }
  };

  const handleSearchBooking = async (): Promise<void> => {
    if (!searchPhone) {
      showSnackbar('warning', 'Please enter mobile number');
      return;
    }
    try {
      const response = await fetch(`/api/staff/search-pickup?phone=${searchPhone}`);
      const data: SearchResponse = await response.json();
      if (data.success && data.data) {
        setSearchResult(data.data);
      } else {
        showSnackbar('error', 'No pickup found for this number');
        setSearchResult(null);
      }
    } catch {
      showSnackbar('error', 'Search failed');
    }
  };

  const handleCompletePickup = async (booking: Booking): Promise<void> => {
    try {
      const response = await fetch(`/api/staff/complete-pickup/${booking.id}`, {
        method: 'POST',
      });
      const data: CompletePickupResponse = await response.json();
      if (data.success) {
        showSnackbar('success', 'Pickup completed successfully');
        await fetchPickups();
        await fetchStats();
        setSearchResult(null);
        setSearchPhone('');
      }
    } catch {
      showSnackbar('error', 'Failed to complete pickup');
    }
  };

  const handlePrintReceipt = async (booking: Booking): Promise<void> => {
    try {
      const response = await fetch(`/api/staff/receipt/${booking.id}`);
      const blob: Blob = await response.blob();
      const url: string = window.URL.createObjectURL(blob);
      const printWindow: Window | null = window.open(url, '_blank');
      if (printWindow) {
        printWindow.print();
      }
    } catch {
      showSnackbar('error', 'Failed to print receipt');
    }
  };

  const viewDetails = (booking: Booking): void => {
    setSelectedPickup(booking);
    setDetailsOpen(true);
  };

  const getPendingPickups = (): Booking[] => pickups.filter(p => p.status === 'CONFIRMED' && p.remainingAmount === 0);
  const getCompletedPickups = (): Booking[] => pickups.filter(p => p.status === 'PICKUP_COMPLETED');
  const getTodayPickups = (): Booking[] => pickups.filter(p => {
    const today = new Date().toDateString();
    return new Date(p.pickupDate || p.createdAt).toDateString() === today;
  });

  // Define columns for UniversalTable using BookingRecord type
  const pickupColumns: Column<BookingRecord>[] = [
    { key: 'bookingId' as keyof BookingRecord, label: 'Booking ID' },
    { key: 'customerName' as keyof BookingRecord, label: 'Customer Name' },
    { key: 'customerPhone' as keyof BookingRecord, label: 'Phone' },
    { key: 'ganpatiName' as keyof BookingRecord, label: 'Ganpati' },
    { 
      key: 'totalAmount' as keyof BookingRecord, 
      label: 'Amount', 
      render: (row: BookingRecord): string => `₹${(row as Booking).totalAmount.toLocaleString()}`,
      exportable: true
    },
    { 
      key: 'status' as keyof BookingRecord, 
      label: 'Status', 
      render: (row: BookingRecord): JSX.Element => {
        const booking = row as Booking;
        return (
          <Chip 
            label={booking.status.replace('_', ' ')} 
            color={booking.status === 'PICKUP_COMPLETED' ? 'success' : 'warning'}
            size="small"
          />
        );
      },
      exportable: true
    },
    { 
      key: ACTION_KEY, 
      label: 'Actions', 
      render: (row: BookingRecord): JSX.Element => {
        const booking = row as Booking;
        return (
          <Box display="flex" gap={1}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => viewDetails(booking)}
            >
              View
            </Button>
            {booking.status === 'CONFIRMED' && booking.remainingAmount === 0 && (
              <Button 
                size="small" 
                variant="contained" 
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleCompletePickup(booking)}
              >
                Complete
              </Button>
            )}
          </Box>
        );
      },
      exportable: false
    },
  ];

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Pickup Management
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage and complete customer pickups for festival day
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="textSecondary">Today's Pickups</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>{stats.todayPickups}</Typography>
                </Box>
                <Schedule sx={{ fontSize: 48, color: '#1976d2', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="textSecondary">Completed Today</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>{stats.completedToday}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: '#4caf50', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="textSecondary">Pending Today</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>{stats.pendingToday}</Typography>
                </Box>
                <Pending sx={{ fontSize: 48, color: '#ff9800', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="textSecondary">Total Pickups</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>{stats.totalPickups}</Typography>
                </Box>
                <VerifiedUser sx={{ fontSize: 48, color: '#9c27b0', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearchBooking}>
            Search
          </Button>
        </Box>

        {searchResult && (
          <Card sx={{ mt: 3, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" flexWrap="wrap">
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{searchResult.customerName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Booking ID: {searchResult.bookingId}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">Ganpati: {searchResult.ganpatiName}</Typography>
                  <Typography variant="body2">Total: ₹{searchResult.totalAmount.toLocaleString()}</Typography>
                  <Typography variant="body2">Paid: ₹{searchResult.advancePaid.toLocaleString()}</Typography>
                  <Typography variant="body2" fontWeight={600} color={searchResult.remainingAmount > 0 ? 'error.main' : 'success.main'}>
                    Remaining: ₹{searchResult.remainingAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip 
                    label={searchResult.status.replace('_', ' ')} 
                    color={searchResult.status === 'CONFIRMED' ? 'success' : 'warning'}
                  />
                  {searchResult.status === 'CONFIRMED' && searchResult.remainingAmount === 0 && (
                    <Button 
                      variant="contained" 
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleCompletePickup(searchResult)}
                    >
                      Complete Pickup
                    </Button>
                  )}
                  <Button 
                    variant="outlined" 
                    startIcon={<Receipt />}
                    onClick={() => handlePrintReceipt(searchResult)}
                  >
                    Print Receipt
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* Pickups List */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_event: React.SyntheticEvent, v: number) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label={`Ready for Pickup (${getPendingPickups().length})`} />
          <Tab label={`Today's Pickups (${getTodayPickups().length})`} />
          <Tab label={`Completed (${getCompletedPickups().length})`} />
          <Tab label="All Pickups" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <UniversalTable<BookingRecord>
            data={getPendingPickups() as BookingRecord[]}
            columns={pickupColumns}
            rowsPerPage={10}
            showSearch
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <UniversalTable<BookingRecord>
            data={getTodayPickups() as BookingRecord[]}
            columns={pickupColumns}
            rowsPerPage={10}
            showSearch
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <UniversalTable<BookingRecord>
            data={getCompletedPickups() as BookingRecord[]}
            columns={pickupColumns}
            rowsPerPage={10}
            showSearch
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <UniversalTable<BookingRecord>
            data={pickups as BookingRecord[]}
            columns={pickupColumns}
            rowsPerPage={10}
            showSearch
            showExport
          />
        </TabPanel>
      </Paper>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedPickup && (
          <>
            <DialogTitle>
              Pickup Details - {selectedPickup.bookingId}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemAvatar><Avatar><Person /></Avatar></ListItemAvatar>
                      <ListItemText primary="Name" secondary={selectedPickup.customerName} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar><Avatar><Phone /></Avatar></ListItemAvatar>
                      <ListItemText primary="Phone" secondary={selectedPickup.customerPhone} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2" gutterBottom>Booking Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Ganpati" secondary={selectedPickup.ganpatiName} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Total Amount" secondary={`₹${selectedPickup.totalAmount.toLocaleString()}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Amount Paid" secondary={`₹${selectedPickup.advancePaid.toLocaleString()}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={<Chip label={selectedPickup.status} size="small" />} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid size={12}>
                  <Divider />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<Print />}
                      onClick={() => handlePrintReceipt(selectedPickup)}
                    >
                      Print Receipt
                    </Button>
                    {selectedPickup.status === 'CONFIRMED' && selectedPickup.remainingAmount === 0 && (
                      <Button 
                        variant="contained" 
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setDetailsOpen(false);
                          handleCompletePickup(selectedPickup);
                        }}
                      >
                        Complete Pickup
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}