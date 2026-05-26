// src/view/DashboardPages/SuperAdmin/BookingManagement.tsx
import { useState, useEffect, JSX } from 'react';
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
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { Booking } from '@/types';
import DropdownField from '@/components/controlled/DropdownField';
import { useForm, FormProvider } from 'react-hook-form';

// Convert Booking to Record<string, unknown> type
type BookingRecord = Booking & Record<string, unknown>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface BookingsResponse {
  success: boolean;
  data: Booking[];
}

interface ActionResponse {
  success: boolean;
  message?: string;
}

interface StatusUpdateData {
  status: string;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const methods = useForm<{ status: string }>({
    defaultValues: {
      status: '',
    },
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      const data: BookingsResponse = await response.json();
      if (data.success && data.data) {
        setBookings(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking: Booking): Promise<void> => {
    const confirmed = await showConfirmation({
      message: `Approve booking for ${booking.customerName}?`,
      title: 'Approve Booking',
      confirmText: 'Approve',
      confirmColor: 'success',
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/bookings/${booking.id}/approve`, {
          method: 'POST',
        });
        const data: ActionResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Booking approved successfully');
          await fetchBookings();
        }
      } catch {
        showSnackbar('error', 'Failed to approve booking');
      }
    }
  };

  const handleReject = async (booking: Booking): Promise<void> => {
    const confirmed = await showConfirmation({
      message: `Reject booking for ${booking.customerName}?`,
      title: 'Reject Booking',
      confirmText: 'Reject',
      confirmColor: 'error',
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/bookings/${booking.id}/reject`, {
          method: 'POST',
        });
        const data: ActionResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Booking rejected');
          await fetchBookings();
        }
      } catch {
        showSnackbar('error', 'Failed to reject booking');
      }
    }
  };

  const handleStatusUpdate = async (booking: Booking, status: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status } as StatusUpdateData),
      });
      const data: ActionResponse = await response.json();
      if (data.success) {
        showSnackbar('success', 'Booking status updated');
        await fetchBookings();
      }
    } catch {
      showSnackbar('error', 'Failed to update status');
    }
  };

  const viewDetails = (booking: Booking): void => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const getPendingBookings = (): Booking[] => bookings.filter(b => b.status === 'PENDING_REQUEST');
  const getApprovedBookings = (): Booking[] => bookings.filter(b => b.status === 'APPROVED');
  const getConfirmedBookings = (): Booking[] => bookings.filter(b => b.status === 'CONFIRMED');
  const getCompletedBookings = (): Booking[] => bookings.filter(b => b.status === 'PICKUP_COMPLETED');

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

  // Define columns for UniversalTable using BookingRecord type
  const columns: Column<BookingRecord>[] = [
    { key: 'bookingId' as keyof BookingRecord, label: 'Booking ID' },
    { key: 'customerName' as keyof BookingRecord, label: 'Customer Name' },
    { key: 'customerPhone' as keyof BookingRecord, label: 'Phone' },
    { key: 'ganpatiName' as keyof BookingRecord, label: 'Ganpati' },
    { 
      key: 'totalAmount' as keyof BookingRecord, 
      label: 'Total Amount', 
      render: (row: BookingRecord): string => `₹${(row as Booking).totalAmount.toLocaleString()}` 
    },
    { 
      key: 'advancePaid' as keyof BookingRecord, 
      label: 'Paid', 
      render: (row: BookingRecord): string => `₹${(row as Booking).advancePaid.toLocaleString()}` 
    },
    {
      key: 'status' as keyof BookingRecord,
      label: 'Status',
      render: (row: BookingRecord): JSX.Element => {
        const booking = row as Booking;
        return (
          <Chip 
            label={booking.status.replace('_', ' ')} 
            color={getStatusColor(booking.status)} 
            size="small" 
          />
        );
      },
    },
    {
      key: 'actionbutton',
      label: 'Actions',
      render: (row: BookingRecord): JSX.Element => {
        const booking = row as Booking;
        return (
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => viewDetails(booking)}>
              <Visibility fontSize="small" />
            </IconButton>
            {booking.status === 'PENDING_REQUEST' && (
              <>
                <IconButton size="small" color="success" onClick={() => handleApprove(booking)}>
                  <Check fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleReject(booking)}>
                  <Close fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Booking Management
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_event: React.SyntheticEvent, v: number) => setTabValue(v)} 
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label={`Pending (${getPendingBookings().length})`} />
          <Tab label={`Approved (${getApprovedBookings().length})`} />
          <Tab label={`Confirmed (${getConfirmedBookings().length})`} />
          <Tab label={`Completed (${getCompletedBookings().length})`} />
          <Tab label="All" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <UniversalTable<BookingRecord>
            data={getPendingBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <UniversalTable<BookingRecord>
            data={getApprovedBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <UniversalTable<BookingRecord>
            data={getConfirmedBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <UniversalTable<BookingRecord>
            data={getCompletedBookings() as BookingRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
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
          />
        </TabPanel>
      </Paper>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details - {selectedBooking.bookingId}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">Name: {selectedBooking.customerName}</Typography>
                    <Typography variant="body2">Phone: {selectedBooking.customerPhone}</Typography>
                    <Typography variant="body2">Booking Date: {new Date(selectedBooking.createdAt).toLocaleDateString()}</Typography>
                  </Card>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2" gutterBottom>Ganpati Information</Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">Name: {selectedBooking.ganpatiName}</Typography>
                    <Typography variant="body2">Total Amount: ₹{selectedBooking.totalAmount.toLocaleString()}</Typography>
                    <Typography variant="body2">Advance Paid: ₹{selectedBooking.advancePaid.toLocaleString()}</Typography>
                    <Typography variant="body2">Remaining: ₹{selectedBooking.remainingAmount.toLocaleString()}</Typography>
                  </Card>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>Update Status</Typography>
                  <FormProvider {...methods}>
                    <Box display="flex" gap={2} alignItems="center">
                      <DropdownField
                        name="status"
                        options={statusOptions}
                        defaultValue={selectedBooking.status}
                        sx={{ width: 200 }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => {
                          const newStatus = methods.getValues('status');
                          if (newStatus) {
                            handleStatusUpdate(selectedBooking, newStatus);
                            setDetailsOpen(false);
                          }
                        }}
                      >
                        Update Status
                      </Button>
                    </Box>
                  </FormProvider>
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