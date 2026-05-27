import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { CustomerResponseDto, BookingResponseDto } from '@/types';
import { adminService } from '@/services/AdminService';

type CustomerRecord = CustomerResponseDto & Record<string, unknown>;

export default function CustomerManagement() {
  const theme = useTheme();
  const [customers, setCustomers] = useState<CustomerResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponseDto | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [customerBookings, setCustomerBookings] = useState<BookingResponseDto[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminService.getAllCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async (customerId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/bookings`);
      const data = await response.json();
      if (data.success && data.data) {
        setCustomerBookings(data.data);
      }
    } catch {
      setCustomerBookings([]);
    }
  };

  const handleView = async (customer: CustomerResponseDto): Promise<void> => {
    setSelectedCustomer(customer);
    await fetchCustomerBookings(customer.id);
    setViewDialogOpen(true);
  };

  const handleToggleStatus = async (customer: CustomerResponseDto): Promise<void> => {
    const action = customer.isActive ? 'deactivate' : 'activate';
    const confirmed = await showConfirmation({
      message: `Are you sure you want to ${action} ${customer.name}'s account?`,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      confirmText: action,
      confirmColor: customer.isActive ? 'error' : 'success',
    });
    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/customers/${customer.id}/toggle-status`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
          showSnackbar('success', `Customer ${action}d successfully`);
          await fetchCustomers();
        }
      } catch {
        showSnackbar('error', 'Failed to update customer status');
      }
    }
  };

  const columns: Column<CustomerRecord>[] = [
    { key: 'name', label: 'Customer', render: (row) => {
      const customer = row as CustomerResponseDto;
      return (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main }}>{customer.name.charAt(0)}</Avatar>
          <Box><Typography variant="body2" fontWeight={600}>{customer.name}</Typography><Typography variant="caption" color="textSecondary">{customer.email}</Typography></Box>
        </Box>
      );
    }},
    { key: 'phone', label: 'Phone' },
    { key: 'totalBookings', label: 'Total Bookings', render: (row) => (row as CustomerResponseDto).totalBookings || 0 },
    { key: 'totalSpent', label: 'Total Spent', render: (row) => `₹${((row as CustomerResponseDto).totalSpent || 0).toLocaleString()}` },
    { key: 'isActive', label: 'Status', render: (row) => <Chip label={(row as CustomerResponseDto).isActive ? 'Active' : 'Inactive'} color={(row as CustomerResponseDto).isActive ? 'success' : 'error'} size="small" sx={{ borderRadius: 2, fontWeight: 500 }} /> },
    { key: 'createdAt', label: 'Registered', render: (row) => new Date((row as CustomerResponseDto).createdAt).toLocaleDateString() },
    { key: ACTION_KEY, label: 'Actions' },
  ];

  const getBookingStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING_REQUEST': return 'warning';
      case 'PICKUP_COMPLETED': return 'info';
      default: return 'default';
    }
  };

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
                Customer Management
              </Typography>
      <Paper sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <UniversalTable<CustomerRecord>
          data={customers as CustomerRecord[]}
          columns={columns}
          loading={loading}
          rowsPerPage={10}
          showSearch
          showExport
          actions={{ view: (row) => handleView(row as CustomerResponseDto), delete: (row) => handleToggleStatus(row as CustomerResponseDto) }}
        />
      </Paper>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {selectedCustomer && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.secondary.main }}>{selectedCustomer.name.charAt(0)}</Avatar>
                <Box><Typography variant="h6" fontWeight={700}>{selectedCustomer.name}</Typography><Typography variant="body2" color="textSecondary">{selectedCustomer.email}</Typography></Box>
              </Box>
              <IconButton onClick={() => setViewDialogOpen(false)}><Close /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tabValue} onChange={(_event, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label="Profile" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label={`Bookings (${customerBookings.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
              </Tabs>
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <CardContent><Typography variant="subtitle2" color="textSecondary">Phone Number</Typography><Typography variant="body1" fontWeight={500}>{selectedCustomer.phone}</Typography></CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <CardContent><Typography variant="subtitle2" color="textSecondary">Member Since</Typography><Typography variant="body1" fontWeight={500}>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</Typography></CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                      <CardContent><Typography variant="subtitle2" color="textSecondary">Total Bookings</Typography><Typography variant="body1" fontWeight={500}>{selectedCustomer.totalBookings || 0}</Typography></CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.04) }}>
                      <CardContent><Typography variant="subtitle2" color="textSecondary">Total Spent</Typography><Typography variant="body1" fontWeight={500}>₹{(selectedCustomer.totalSpent || 0).toLocaleString()}</Typography></CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              {tabValue === 1 && (
                <Box>
                  {customerBookings.length === 0 ? (
                    <Typography textAlign="center" color="textSecondary" py={4}>No bookings found</Typography>
                  ) : (
                    customerBookings.map((booking) => (
                      <Card key={booking.id} variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                            <Box><Typography variant="subtitle2" fontWeight={600}>{booking.ganpatiName}</Typography><Typography variant="caption" color="textSecondary">Booking ID: {booking.bookingId}</Typography><Typography variant="body2">Amount: ₹{booking.totalAmount.toLocaleString()} | Paid: ₹{booking.advancePaid.toLocaleString()}</Typography></Box>
                            <Chip label={booking.status.replace('_', ' ')} color={getBookingStatusColor(booking.status)} size="small" sx={{ borderRadius: 2, fontWeight: 500 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}