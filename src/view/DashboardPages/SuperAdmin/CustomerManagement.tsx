// src/view/DashboardPages/SuperAdmin/CustomerManagement.tsx
import { useState, useEffect, JSX } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
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
} from '@mui/material';
import { Visibility, Block, CheckCircle } from '@mui/icons-material';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { User, Booking } from '@/types';

interface CustomerWithDetails extends User {
  isActive: boolean;
  totalBookings?: number;
  totalSpent?: number;
}

// Convert CustomerWithDetails to Record<string, unknown> type
type CustomerRecord = CustomerWithDetails & Record<string, unknown>;

interface CustomersResponse {
  success: boolean;
  data: CustomerWithDetails[];
}

interface CustomerBookingsResponse {
  success: boolean;
  data: Booking[];
}

interface ToggleStatusResponse {
  success: boolean;
  message?: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<CustomerWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDetails | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers');
      const data: CustomersResponse = await response.json();
      if (data.success && data.data) {
        setCustomers(data.data);
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
      const data: CustomerBookingsResponse = await response.json();
      if (data.success && data.data) {
        setCustomerBookings(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch customer bookings');
    }
  };

  const handleView = async (customer: CustomerWithDetails): Promise<void> => {
    setSelectedCustomer(customer);
    await fetchCustomerBookings(customer.id);
    setViewDialogOpen(true);
  };

  const handleToggleStatus = async (customer: CustomerWithDetails): Promise<void> => {
    const action = customer.isActive ? 'deactivate' : 'activate';
    const confirmed = await showConfirmation({
      message: `Are you sure you want to ${action} ${customer.name}'s account?`,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      confirmText: action,
      confirmColor: customer.isActive ? 'error' : 'success',
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/customers/${customer.id}/toggle-status`, {
          method: 'POST',
        });
        const data: ToggleStatusResponse = await response.json();
        if (data.success) {
          showSnackbar('success', `Customer ${action}d successfully`);
          await fetchCustomers();
        }
      } catch {
        showSnackbar('error', 'Failed to update customer status');
      }
    }
  };

  // Define columns for UniversalTable using CustomerRecord type
  const columns: Column<CustomerRecord>[] = [
    { 
      key: 'name' as keyof CustomerRecord, 
      label: 'Customer',
      render: (row: CustomerRecord): JSX.Element => {
        const customer = row as CustomerWithDetails;
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>{customer.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{customer.name}</Typography>
              <Typography variant="caption" color="textSecondary">{customer.email}</Typography>
            </Box>
          </Box>
        );
      }
    },
    { key: 'phone' as keyof CustomerRecord, label: 'Phone' },
    { 
      key: 'totalBookings' as keyof CustomerRecord, 
      label: 'Total Bookings', 
      render: (row: CustomerRecord): number => (row as CustomerWithDetails).totalBookings || 0 
    },
    { 
      key: 'totalSpent' as keyof CustomerRecord, 
      label: 'Total Spent', 
      render: (row: CustomerRecord): string => `₹${((row as CustomerWithDetails).totalSpent || 0).toLocaleString()}` 
    },
    {
      key: 'isActive' as keyof CustomerRecord,
      label: 'Status',
      render: (row: CustomerRecord): JSX.Element => {
        const customer = row as CustomerWithDetails;
        return (
          <Chip 
            label={customer.isActive !== false ? 'Active' : 'Inactive'} 
            color={customer.isActive !== false ? 'success' : 'error'} 
            size="small"
          />
        );
      },
    },
    { 
      key: 'createdAt' as keyof CustomerRecord, 
      label: 'Registered', 
      render: (row: CustomerRecord): string => new Date((row as CustomerWithDetails).createdAt).toLocaleDateString() 
    },
    {
      key: 'actionbutton',
      label: 'Actions',
      render: (row: CustomerRecord): JSX.Element => {
        const customer = row as CustomerWithDetails;
        return (
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => handleView(customer)}>
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color={customer.isActive !== false ? 'error' : 'success'}
              onClick={() => handleToggleStatus(customer)}
            >
              {customer.isActive !== false ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Box>
        );
      },
    },
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Customer Management
      </Typography>

      <Paper sx={{ p: 3 }}>
        <UniversalTable<CustomerRecord>
          data={customers as CustomerRecord[]}
          columns={columns}
          loading={loading}
          rowsPerPage={10}
          showSearch
          showExport
        />
      </Paper>

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'secondary.main' }}>
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCustomer.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{selectedCustomer.email}</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs 
                value={tabValue} 
                onChange={(_event: React.SyntheticEvent, v: number) => setTabValue(v)} 
                sx={{ mb: 2 }}
              >
                <Tab label="Profile" />
                <Tab label={`Bookings (${customerBookings.length})`} />
              </Tabs>

              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid size={{xs: 12, sm: 6}}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Phone Number</Typography>
                        <Typography variant="body1">{selectedCustomer.phone}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Member Since</Typography>
                        <Typography variant="body1">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Total Bookings</Typography>
                        <Typography variant="body1">{selectedCustomer.totalBookings || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">Total Spent</Typography>
                        <Typography variant="body1">₹{(selectedCustomer.totalSpent || 0).toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  {customerBookings.length === 0 ? (
                    <Typography textAlign="center" color="textSecondary" py={4}>
                      No bookings found
                    </Typography>
                  ) : (
                    customerBookings.map((booking) => (
                      <Card key={booking.id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                            <Box>
                              <Typography variant="subtitle2">{booking.ganpatiName}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                Booking ID: {booking.bookingId}
                              </Typography>
                              <Typography variant="body2">
                                Amount: ₹{booking.totalAmount.toLocaleString()} | Paid: ₹{booking.advancePaid.toLocaleString()}
                              </Typography>
                            </Box>
                            <Chip 
                              label={booking.status.replace('_', ' ')} 
                              color={getBookingStatusColor(booking.status)}
                              size="small"
                            />
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