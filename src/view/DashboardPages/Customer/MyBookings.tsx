// src/view/DashboardPages/Customer/MyBookings.tsx
import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Payment,
  QrCode,
  Download,
} from '@mui/icons-material';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { useNavigate } from 'react-router-dom';
import { customerService } from '@/services/CustomerService';
import { paymentService } from '@/services/PaymentService';
import { BookingResponseDto, PaymentResponseDto } from '@/types';
import QRCodeDisplay from '@/view/DashboardPages/Shared/QRCodeDisplay';
import ReceiptDownload from '@/view/DashboardPages/Shared/ReceiptDownload';

type BookingRecord = BookingResponseDto & Record<string, unknown>;

interface BookingSteps {
  steps: string[];
  activeStep: number;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentResponseDto[]>([]);
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [receiptOpen, setReceiptOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await customerService.getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (bookingId: string): Promise<void> => {
    try {
      const response = await paymentService.getPaymentHistory(bookingId);
      if (response.success && response.data) {
        setPaymentHistory(response.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch payment history');
    }
  };

  const viewDetails = async (booking: BookingResponseDto): Promise<void> => {
    setSelectedBooking(booking);
    await fetchPaymentHistory(booking.id);
    setDetailsOpen(true);
  };

  const handleMakePayment = (booking: BookingResponseDto): void => {
    navigate(`/customer/payments?bookingId=${booking.id}`);
  };

  const handleShowQR = (booking: BookingResponseDto): void => {
    setSelectedBooking(booking);
    setQrOpen(true);
  };

  const handleDownloadReceipt = (booking: BookingResponseDto): void => {
    setSelectedBooking(booking);
    setReceiptOpen(true);
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

  const columns: Column<BookingRecord>[] = [
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'ganpatiName', label: 'Ganpati' },
    { key: 'totalAmount', label: 'Total Amount', render: (row) => `₹${(row as BookingResponseDto).totalAmount.toLocaleString()}` },
    { key: 'advancePaid', label: 'Paid', render: (row) => `₹${(row as BookingResponseDto).advancePaid.toLocaleString()}` },
    { key: 'remainingAmount', label: 'Remaining', render: (row) => `₹${(row as BookingResponseDto).remainingAmount.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (row) => <Chip label={(row as BookingResponseDto).status.replace('_', ' ')} color={getStatusColor((row as BookingResponseDto).status)} size="small" /> },
    { key: ACTION_KEY, label: 'Actions' },
  ];

  if (loading) return <LinearProgress />;

  const bookingSteps = selectedBooking ? getBookingSteps(selectedBooking.status) : { steps: [], activeStep: 0 };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>My Bookings</Typography>

      <Paper sx={{ p: 3 }}>
        <UniversalTable<BookingRecord>
          data={bookings as BookingRecord[]}
          columns={columns}
          rowsPerPage={10}
          showSearch
          actions={{
  view: (row) => viewDetails(row as BookingResponseDto),
  payment: (row) => {
    const booking = row as BookingResponseDto;
    if ((booking.status === 'APPROVED' || booking.status === 'CONFIRMED') && booking.remainingAmount > 0) {
      handleMakePayment(booking);
    }
  },
  qr: (row) => {
    const booking = row as BookingResponseDto;
    if (booking.status === 'APPROVED' || booking.status === 'CONFIRMED') {
      handleShowQR(booking);
    }
  },
  download: (row) => {
    const booking = row as BookingResponseDto;
    if (booking.status === 'PICKUP_COMPLETED') {
      handleDownloadReceipt(booking);
    }
  },
}}
        />
      </Paper>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details - {selectedBooking.bookingId}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={bookingSteps.activeStep} alternativeLabel>
                  {bookingSteps.steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
                </Stepper>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{xs:12,md:6}}><Typography variant="subtitle2">Ganpati Details</Typography><Typography variant="body2">Name: {selectedBooking.ganpatiName}</Typography><Typography variant="body2">Booking Date: {new Date(selectedBooking.bookingDate).toLocaleDateString()}</Typography></Grid>
                <Grid size={{xs:12,md:6}}><Typography variant="subtitle2">Payment Summary</Typography><Typography variant="body2">Total Amount: ₹{selectedBooking.totalAmount.toLocaleString()}</Typography><Typography variant="body2">Advance Paid: ₹{selectedBooking.advancePaid.toLocaleString()}</Typography><Typography variant="body2" fontWeight={600}>Remaining: ₹{selectedBooking.remainingAmount.toLocaleString()}</Typography></Grid>
              </Grid>
              {paymentHistory.length > 0 && (<Box mt={3}><Typography variant="subtitle2" gutterBottom>Payment History</Typography>{paymentHistory.map((payment) => (<Card key={payment.id} variant="outlined" sx={{ mb: 1 }}><CardContent><Box display="flex" justifyContent="space-between"><Box><Typography variant="body2">Amount: ₹{payment.amount.toLocaleString()}</Typography><Typography variant="caption" color="textSecondary">Type: {payment.paymentType} | Method: {payment.paymentMethod}</Typography></Box><Chip label={payment.status} color={payment.status === 'VERIFIED' ? 'success' : 'warning'} size="small" /></Box></CardContent></Card>))}</Box>)}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              {selectedBooking.status === 'CONFIRMED' && selectedBooking.remainingAmount > 0 && (<Button variant="contained" startIcon={<Payment />} onClick={() => { setDetailsOpen(false); handleMakePayment(selectedBooking); }}>Make Payment</Button>)}
              {selectedBooking.status === 'CONFIRMED' && (<Button variant="outlined" startIcon={<QrCode />} onClick={() => { setDetailsOpen(false); setQrOpen(true); }}>Show QR</Button>)}
              {selectedBooking.status === 'PICKUP_COMPLETED' && (<Button variant="outlined" startIcon={<Download />} onClick={() => { setDetailsOpen(false); handleDownloadReceipt(selectedBooking); }}>Download Receipt</Button>)}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="sm" fullWidth>
        {selectedBooking && (<><DialogTitle>Your Festival Day QR Code</DialogTitle><DialogContent><QRCodeDisplay bookingId={selectedBooking.bookingId} customerName={selectedBooking.customerName} ganpatiName={selectedBooking.ganpatiName} /></DialogContent><DialogActions><Button onClick={() => setQrOpen(false)}>Close</Button></DialogActions></>)}
      </Dialog>

      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (<><DialogTitle>Download Receipt</DialogTitle><DialogContent><ReceiptDownload booking={selectedBooking} payments={paymentHistory} /></DialogContent><DialogActions><Button onClick={() => setReceiptOpen(false)}>Close</Button></DialogActions></>)}
      </Dialog>
    </Box>
  );
}