import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { BookingResponseDto } from '@/types';
import DropdownField from '@/components/controlled/DropdownField';
import { useForm, FormProvider } from 'react-hook-form';
import { adminService } from '@/services/AdminService';

type BookingRecord = BookingResponseDto & Record<string, unknown>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const statusOptions = [
  { value: 'PENDING_REQUEST', label: 'Pending Request' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PICKUP_COMPLETED', label: 'Pickup Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BookingManagement() {
  const theme = useTheme();
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const methods = useForm<{ status: string }>({
    defaultValues: { status: '' },
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminService.getAllBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking: BookingResponseDto): Promise<void> => {
    const confirmed = await showConfirmation({
      message: `Approve booking for ${booking.customerName}?`,
      title: 'Approve Booking',
      confirmText: 'Approve',
      confirmColor: 'success',
    });
    if (confirmed) {
      try {
        const response = await adminService.approveBooking(booking.id);
        if (response.success) {
          showSnackbar('success', 'Booking approved successfully');
          await fetchBookings();
        }
      } catch {
        showSnackbar('error', 'Failed to approve booking');
      }
    }
  };

  const handleReject = async (booking: BookingResponseDto): Promise<void> => {
    const confirmed = await showConfirmation({
      message: `Reject booking for ${booking.customerName}?`,
      title: 'Reject Booking',
      confirmText: 'Reject',
      confirmColor: 'error',
    });
    if (confirmed) {
      try {
        const response = await adminService.rejectBooking(booking.id);
        if (response.success) {
          showSnackbar('success', 'Booking rejected');
          await fetchBookings();
        }
      } catch {
        showSnackbar('error', 'Failed to reject booking');
      }
    }
  };

  const handleStatusUpdate = async (booking: BookingResponseDto, status: string): Promise<void> => {
    try {
      const response = await adminService.updateBookingStatus(booking.id, status);
      if (response.success) {
        showSnackbar('success', 'Booking status updated');
        await fetchBookings();
        setDetailsOpen(false);
      }
    } catch {
      showSnackbar('error', 'Failed to update status');
    }
  };

  const viewDetails = (booking: BookingResponseDto): void => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const getPendingBookings = (): BookingResponseDto[] => bookings.filter(b => b.status === 'PENDING_REQUEST');
  const getApprovedBookings = (): BookingResponseDto[] => bookings.filter(b => b.status === 'APPROVED');
  const getConfirmedBookings = (): BookingResponseDto[] => bookings.filter(b => b.status === 'CONFIRMED');
  const getCompletedBookings = (): BookingResponseDto[] => bookings.filter(b => b.status === 'PICKUP_COMPLETED');

  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' | 'error' => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING_REQUEST': return 'warning';
      case 'APPROVED': return 'info';
      case 'PICKUP_COMPLETED': return 'default';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const columns: Column<BookingRecord>[] = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerPhone', label: 'Phone' },
    { key: 'ganpatiName', label: 'Ganpati' },
    { key: 'totalAmount', label: 'Total Amount', render: (row) => `₹${(row as BookingResponseDto).totalAmount.toLocaleString()}` },
    { key: 'advancePaid', label: 'Paid', render: (row) => `₹${(row as BookingResponseDto).advancePaid.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (row) => (
      <Chip label={(row as BookingResponseDto).status.replace('_', ' ')} color={getStatusColor((row as BookingResponseDto).status)} size="small" sx={{ borderRadius: 2, fontWeight: 500 }} />
    )},
    { key: ACTION_KEY, label: 'Actions' },
  ];

  return (
    <Box>
       <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                  backgroundClip: 'text', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent',
                  mb:2,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Booking Management
              </Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs value={tabValue} onChange={(_event, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tab label={`Pending (${getPendingBookings().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
          <Tab label={`Approved (${getApprovedBookings().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
          <Tab label={`Confirmed (${getConfirmedBookings().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
          <Tab label={`Completed (${getCompletedBookings().length})`} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
          <Tab label="All" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <UniversalTable<BookingRecord>
            data={getPendingBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            actions={{
              view: (row) => viewDetails(row as BookingResponseDto),
              approve: (row) => handleApprove(row as BookingResponseDto),
              reject: (row) => handleReject(row as BookingResponseDto),
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UniversalTable<BookingRecord>
            data={getApprovedBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            actions={{ view: (row) => viewDetails(row as BookingResponseDto) }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <UniversalTable<BookingRecord>
            data={getConfirmedBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            actions={{ view: (row) => viewDetails(row as BookingResponseDto) }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <UniversalTable<BookingRecord>
            data={getCompletedBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            actions={{ view: (row) => viewDetails(row as BookingResponseDto) }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <UniversalTable<BookingRecord>
            data={bookings as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            showSearch
            showExport
            actions={{
              view: (row) => viewDetails(row as BookingResponseDto),
              approve: (row) => (row as BookingResponseDto).status === 'PENDING_REQUEST' ? handleApprove(row as BookingResponseDto) : undefined,
              reject: (row) => (row as BookingResponseDto).status === 'PENDING_REQUEST' ? handleReject(row as BookingResponseDto) : undefined,
            }}
          />
        </TabPanel>
      </Paper>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {selectedBooking && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Booking Details - {selectedBooking.bookingId}</Typography>
              <IconButton onClick={() => setDetailsOpen(false)}><Close /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Customer Information</Typography>
                  <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ mb: 1 }}>Name: <strong>{selectedBooking.customerName}</strong></Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Phone: {selectedBooking.customerPhone}</Typography>
                      <Typography variant="body2">Booking Date: {new Date(selectedBooking.createdAt).toLocaleDateString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Ganpati Information</Typography>
                  <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ mb: 1 }}>Name: <strong>{selectedBooking.ganpatiName}</strong></Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Total Amount: ₹{selectedBooking.totalAmount.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Advance Paid: ₹{selectedBooking.advancePaid.toLocaleString()}</Typography>
                      <Typography variant="body2">Remaining: ₹{selectedBooking.remainingAmount.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Update Status</Typography>
                  <FormProvider {...methods}>
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <DropdownField name="status" options={statusOptions} defaultValue={selectedBooking.status} sx={{ width: 220 }} />
                      <Button variant="contained" onClick={() => { const newStatus = methods.getValues('status'); if (newStatus) handleStatusUpdate(selectedBooking, newStatus); }} sx={{ borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 600 }}>
                        Update Status
                      </Button>
                    </Box>
                  </FormProvider>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailsOpen(false)} variant="outlined" sx={{ borderRadius: 3, textTransform: 'none' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}