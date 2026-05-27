// src/view/DashboardPages/Customer/PaymentHistory.tsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress,
  Card, CardContent, Grid, IconButton, Tooltip, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel
} from '@mui/material';
import { Payment, Receipt, Download, CheckCircle, Pending } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { BookingResponseDto, PaymentResponseDto } from '@/types';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import PhotoUpload from '@/components/controlled/PhotoUpload';
import NumericField from '@/components/controlled/NumericField';
import { useNotification } from '@/utils/useNotification';
import { customerService } from '@/services/CustomerService';
import { paymentService } from '@/services/PaymentService';

interface OfflinePaymentForm {
  amount: number;
  screenshot: File[];
  transactionId: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

export default function PaymentHistory() {
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');
  const { sendSuccess, sendError } = useNotification();
  
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentResponseDto | null>(null);

  const methods = useForm<OfflinePaymentForm>({
    defaultValues: { amount: 0, screenshot: [], transactionId: '' },
  });

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const [bookingsRes, paymentsRes] = await Promise.all([
        customerService.getMyBookings(),
        bookingIdParam ? paymentService.getPaymentHistory(bookingIdParam) : paymentService.getAllPayments(),
      ]);
      if (bookingsRes.success && bookingsRes.data) setBookings(bookingsRes.data);
      if (paymentsRes.success && paymentsRes.data) setPayments(paymentsRes.data);
      if (bookingIdParam && bookingsRes.success && bookingsRes.data) {
        const booking = bookingsRes.data.find((b) => b.id === bookingIdParam);
        if (booking) { setSelectedBooking(booking); methods.setValue('amount', booking.remainingAmount); }
      }
    } catch { showSnackbar('error', 'Failed to load payment data'); }
    finally { setLoading(false); }
  }, [bookingIdParam, methods]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMakePayment = (booking: BookingResponseDto): void => {
    setSelectedBooking(booking);
    methods.setValue('amount', booking.remainingAmount);
    methods.setValue('screenshot', []);
    methods.setValue('transactionId', '');
    setPaymentMethod('online');
    setPaymentDialogOpen(true);
  };

  const handleOnlinePayment = async (): Promise<void> => {
    if (!selectedBooking) return;
    setProcessingPayment(true);
    try {
      const response = await paymentService.createOrder(selectedBooking.id, methods.getValues('amount'));
      if (response.success && response.data.order) {
        const options: RazorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY || '',
          amount: response.data.order.amount,
          currency: 'INR',
          name: 'Siddhivinayak Arts',
          description: `Payment for ${selectedBooking.ganpatiName}`,
          order_id: response.data.order.id,
          handler: async (razorpayResponse: RazorpayPaymentResponse) => {
            await paymentService.verifyPayment(razorpayResponse.razorpay_payment_id, razorpayResponse.razorpay_order_id, razorpayResponse.razorpay_signature, selectedBooking.id);
            showSnackbar('success', 'Payment successful!');
            await fetchData();
            setPaymentDialogOpen(false);
          },
          prefill: { name: selectedBooking.customerName, email: selectedBooking.customerId, contact: selectedBooking.customerPhone },
          theme: { color: '#FF5722' },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch { showSnackbar('error', 'Failed to initiate payment'); sendError('Failed to initiate payment'); }
    finally { setProcessingPayment(false); }
  };

  const handleOfflinePayment = async (data: OfflinePaymentForm): Promise<void> => {
    if (!selectedBooking) return;
    setProcessingPayment(true);
    try {
      const response = await paymentService.uploadOfflinePayment(selectedBooking.id, data.amount, data.screenshot[0], data.transactionId);
      if (response.success) {
        showSnackbar('success', 'Payment details submitted for verification');
        sendSuccess('Your offline payment details have been submitted');
        setPaymentDialogOpen(false);
        await fetchData();
      } else { showSnackbar('error', 'Failed to submit payment details'); }
    } catch { showSnackbar('error', 'Failed to submit payment'); sendError('Failed to submit payment'); }
    finally { setProcessingPayment(false); }
  };

  const downloadReceipt = async (payment: PaymentResponseDto): Promise<void> => {
    try {
      const response = await paymentService.getReceipt(payment.id);
      if (response.success && response.data.url) { window.open(response.data.url, '_blank'); showSnackbar('success', 'Receipt downloaded'); }
    } catch { showSnackbar('error', 'Failed to download receipt'); }
  };

  const viewReceipt = (payment: PaymentResponseDto): void => { setSelectedReceipt(payment); setReceiptDialogOpen(true); };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  const pendingBookings = bookings.filter(b => b.remainingAmount > 0 && b.status === 'CONFIRMED');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Payment History</Typography>

      {pendingBookings.length > 0 && (<Box sx={{ mb: 4 }}><Typography variant="h6" gutterBottom>Pending Payments</Typography><Grid container spacing={2}>{pendingBookings.map((booking) => (<Grid size={{xs:12,md:6}} key={booking.id}><Card><CardContent><Box display="flex" justifyContent="space-between" alignItems="start"><Box><Typography variant="subtitle1" fontWeight={600}>{booking.ganpatiName}</Typography><Typography variant="caption" color="textSecondary">Booking ID: {booking.bookingId}</Typography><Typography variant="body2" sx={{ mt: 1 }}>Total: ₹{booking.totalAmount.toLocaleString()}</Typography><Typography variant="body2">Paid: ₹{booking.advancePaid.toLocaleString()}</Typography><Typography variant="h6" color="error">Remaining: ₹{booking.remainingAmount.toLocaleString()}</Typography></Box><Button variant="contained" startIcon={<Payment />} onClick={() => handleMakePayment(booking)}>Pay Now</Button></Box></CardContent></Card></Grid>))}</Grid></Box>)}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>All Payments</Typography>
        <TableContainer><Table>
          <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell>Date</TableCell><TableCell>Booking ID</TableCell><TableCell>Ganpati</TableCell><TableCell>Amount</TableCell><TableCell>Type</TableCell><TableCell>Method</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>{payments.map((payment) => { const booking = bookings.find(b => b.id === payment.bookingId); return (<TableRow key={payment.id}><TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell><TableCell>{booking?.bookingId || payment.bookingId}</TableCell><TableCell>{booking?.ganpatiName || 'N/A'}</TableCell><TableCell>₹{payment.amount.toLocaleString()}</TableCell><TableCell><Chip label={payment.paymentType} size="small" color={payment.paymentType === 'ADVANCE' ? 'primary' : 'default'} /></TableCell><TableCell>{payment.paymentMethod.replace('_', ' ')}</TableCell><TableCell><Chip label={payment.status} color={getStatusColor(payment.status)} size="small" icon={payment.status === 'VERIFIED' ? <CheckCircle /> : <Pending />} /></TableCell><TableCell>{payment.status === 'VERIFIED' && (<Tooltip title="Download Receipt"><IconButton size="small" onClick={() => downloadReceipt(payment)}><Download fontSize="small" /></IconButton></Tooltip>)}<Tooltip title="View Receipt"><IconButton size="small" onClick={() => viewReceipt(payment)}><Receipt fontSize="small" /></IconButton></Tooltip></TableCell></TableRow>);})}{payments.length === 0 && (<TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography color="textSecondary">No payment records found</Typography></TableCell></TableRow>)}</TableBody>
        </Table></TableContainer>
      </Paper>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Make Payment{selectedBooking && (<Typography variant="caption" color="textSecondary" display="block">Booking: {selectedBooking.ganpatiName} | Remaining: ₹{selectedBooking.remainingAmount.toLocaleString()}</Typography>)}</DialogTitle>
        <FormProvider {...methods}><form onSubmit={methods.handleSubmit(paymentMethod === 'online' ? handleOnlinePayment : handleOfflinePayment)}><DialogContent><FormControl component="fieldset" sx={{ mb: 3 }}><FormLabel component="legend">Payment Method</FormLabel><RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'offline')}><FormControlLabel value="online" control={<Radio />} label="Online Payment (UPI/Card/NetBanking)" /><FormControlLabel value="offline" control={<Radio />} label="Offline Payment (Cash/Manual UPI)" /></RadioGroup></FormControl><NumericField name="amount" label="Amount" required min={1} max={selectedBooking?.remainingAmount || 0} decimal={false} sx={{ mb: 2 }} />
        {paymentMethod === 'offline' && (<><TextField fullWidth label="Transaction ID / Reference Number" {...methods.register('transactionId')} sx={{ mb: 2 }} /><PhotoUpload name="screenshot" label="Payment Screenshot" maxFiles={1} required /><Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>Please upload a clear screenshot of the payment confirmation</Typography></>)}</DialogContent><DialogActions><Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={processingPayment} startIcon={processingPayment ? <LinearProgress sx={{ width: 20 }} /> : <Payment />}>{processingPayment ? 'Processing...' : `Pay ₹${methods.watch('amount').toLocaleString()}`}</Button></DialogActions></form></FormProvider>
      </Dialog>

      <Dialog open={receiptDialogOpen} onClose={() => setReceiptDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedReceipt && (<><DialogTitle>Payment Receipt</DialogTitle><DialogContent><Box textAlign="center" sx={{ py: 2 }}><img src="/logo.png" alt="Logo" style={{ height: 60 }} /><Typography variant="h6" sx={{ mt: 2 }}>Siddhivinayak Arts</Typography><Typography variant="caption" color="textSecondary">Payment Receipt</Typography></Box><Grid container spacing={2} sx={{ mt: 1 }}><Grid size={6}><Typography variant="caption" color="textSecondary">Receipt No:</Typography><Typography variant="body2">{selectedReceipt.id}</Typography></Grid><Grid size={6}><Typography variant="caption" color="textSecondary">Date:</Typography><Typography variant="body2">{new Date(selectedReceipt.createdAt).toLocaleDateString()}</Typography></Grid><Grid size={6}><Typography variant="caption" color="textSecondary">Amount:</Typography><Typography variant="body2" fontWeight={600}>₹{selectedReceipt.amount.toLocaleString()}</Typography></Grid><Grid size={6}><Typography variant="caption" color="textSecondary">Payment Type:</Typography><Typography variant="body2">{selectedReceipt.paymentType}</Typography></Grid><Grid size={6}><Typography variant="caption" color="textSecondary">Payment Method:</Typography><Typography variant="body2">{selectedReceipt.paymentMethod.replace('_', ' ')}</Typography></Grid><Grid size={6}><Typography variant="caption" color="textSecondary">Transaction ID:</Typography><Typography variant="body2">{selectedReceipt.transactionId || 'N/A'}</Typography></Grid></Grid><Box sx={{ mt: 3, textAlign: 'center' }}><Typography variant="caption" color="textSecondary">Thank you for your payment!</Typography></Box></DialogContent><DialogActions><Button onClick={() => setReceiptDialogOpen(false)}>Close</Button><Button variant="outlined" startIcon={<Download />} onClick={() => downloadReceipt(selectedReceipt)}>Download PDF</Button></DialogActions></>)}
      </Dialog>
    </Box>
  );
}