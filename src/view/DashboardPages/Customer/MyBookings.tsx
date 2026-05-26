// src/view/DashboardPages/Customer/MyBookings.tsx
import { useState, useEffect, JSX } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment,
  QrCode,
  Visibility,
  Download,
} from '@mui/icons-material';
import { Booking, Payment as PaymentType } from '@/types';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from '@/view/DashboardPages/Shared/QRCodeDisplay';
import ReceiptDownload from '@/view/DashboardPages/Shared/ReceiptDownload';

// Convert Booking to Record<string, unknown> type
type BookingRecord = Booking & Record<string, unknown>;

interface BookingsResponse {
  success: boolean;
  data: Booking[];
}

interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentType[];
}

interface BookingSteps {
  steps: string[];
  activeStep: number;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentType[]>([]);
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [receiptOpen, setReceiptOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/customer/bookings');
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

  const fetchPaymentHistory = async (bookingId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/customer/payments/${bookingId}`);
      const data: PaymentHistoryResponse = await response.json();
      if (data.success && data.data) {
        setPaymentHistory(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch payment history');
    }
  };

  const viewDetails = async (booking: Booking): Promise<void> => {
    setSelectedBooking(booking);
    await fetchPaymentHistory(booking.id);
    setDetailsOpen(true);
  };

  const handleMakePayment = (booking: Booking): void => {
    navigate(`/customer/payments?bookingId=${booking.id}`);
  };

  const getBookingSteps = (status: string): BookingSteps => {
    const steps = ['Booking Request', 'Admin Approval', 'Advance Payment', 'Confirmed', 'Pickup Complete'];
    let activeStep = 0;
    
    switch (status) {
      case 'PENDING_REQUEST': activeStep = 0; break;
      case 'APPROVED': activeStep = 1; break;
      case 'CONFIRMED': activeStep = 3; break;
      case 'PICKUP_COMPLETED': activeStep = 4; break;
      default: activeStep = 0;
    }
    
    return { steps, activeStep };
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' | 'error' => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING_REQUEST': return 'warning';
      case 'APPROVED': return 'info';
      case 'PICKUP_COMPLETED': return 'default';
      case 'REJECTED': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  // Define columns for UniversalTable using BookingRecord type
  const columns: Column<BookingRecord>[] = [
    { key: 'bookingId' as keyof BookingRecord, label: 'Booking ID' },
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
      key: 'remainingAmount' as keyof BookingRecord, 
      label: 'Remaining', 
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
            color={getStatusColor(booking.status)}
            size="small"
          />
        );
      }
    },
    {
      key: 'actionbutton',
      label: 'Actions',
      render: (row: BookingRecord): JSX.Element => {
        const booking = row as Booking;
        return (
          <Box display="flex" gap={1}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => viewDetails(booking)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {booking.status === 'CONFIRMED' && booking.remainingAmount > 0 && (
              <Tooltip title="Make Payment">
                <IconButton size="small" color="primary" onClick={() => handleMakePayment(booking)}>
                  <Payment fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {booking.status === 'CONFIRMED' && (
              <Tooltip title="Show QR">
                <IconButton size="small" color="secondary" onClick={() => {
                  setSelectedBooking(booking);
                  setQrOpen(true);
                }}>
                  <QrCode fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {booking.status === 'PICKUP_COMPLETED' && (
              <Tooltip title="Download Receipt">
                <IconButton size="small" color="success" onClick={() => {
                  setSelectedBooking(booking);
                  setReceiptOpen(true);
                }}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      }
    }
  ];

  if (loading) return <LinearProgress />;

  const bookingSteps = selectedBooking 
    ? getBookingSteps(selectedBooking.status) 
    : { steps: [], activeStep: 0 };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        My Bookings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <UniversalTable<BookingRecord>
          data={bookings as BookingRecord[]}
          columns={columns}
          rowsPerPage={10}
          showSearch
        />
      </Paper>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details - {selectedBooking.bookingId}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={bookingSteps.activeStep} alternativeLabel>
                  {bookingSteps.steps.map((label: string) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2">Ganpati Details</Typography>
                  <Typography variant="body2">Name: {selectedBooking.ganpatiName}</Typography>
                  <Typography variant="body2">Booking Date: {new Date(selectedBooking.bookingDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2">Payment Summary</Typography>
                  <Typography variant="body2">Total Amount: ₹{selectedBooking.totalAmount.toLocaleString()}</Typography>
                  <Typography variant="body2">Advance Paid: ₹{selectedBooking.advancePaid.toLocaleString()}</Typography>
                  <Typography variant="body2" fontWeight={600}>Remaining: ₹{selectedBooking.remainingAmount.toLocaleString()}</Typography>
                </Grid>
              </Grid>

              {paymentHistory.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>Payment History</Typography>
                  {paymentHistory.map((payment: PaymentType) => (
                    <Card key={payment.id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between">
                          <Box>
                            <Typography variant="body2">Amount: ₹{payment.amount.toLocaleString()}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Type: {payment.paymentType} | Method: {payment.paymentMethod}
                            </Typography>
                          </Box>
                          <Chip 
                            label={payment.status} 
                            color={payment.status === 'VERIFIED' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              {selectedBooking.status === 'CONFIRMED' && selectedBooking.remainingAmount > 0 && (
                <Button variant="contained" startIcon={<Payment />} onClick={() => {
                  setDetailsOpen(false);
                  handleMakePayment(selectedBooking);
                }}>
                  Make Payment
                </Button>
              )}
              {selectedBooking.status === 'CONFIRMED' && (
                <Button variant="outlined" startIcon={<QrCode />} onClick={() => {
                  setDetailsOpen(false);
                  setQrOpen(true);
                }}>
                  Show QR
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="sm" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Your Festival Day QR Code</DialogTitle>
            <DialogContent>
              <QRCodeDisplay 
                bookingId={selectedBooking.bookingId}
                customerName={selectedBooking.customerName}
                ganpatiName={selectedBooking.ganpatiName}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setQrOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Download Receipt</DialogTitle>
            <DialogContent>
              <ReceiptDownload booking={selectedBooking} payments={paymentHistory} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReceiptOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}