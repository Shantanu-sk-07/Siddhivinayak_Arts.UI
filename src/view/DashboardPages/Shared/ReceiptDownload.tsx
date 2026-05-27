// src/view/DashboardPages/Shared/ReceiptDownload.tsx
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import { BookingResponseDto, PaymentResponseDto } from '@/types';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { customerService } from '@/services/CustomerService';

interface ReceiptDownloadProps {
  booking: BookingResponseDto;
  payments: PaymentResponseDto[];
}

export default function ReceiptDownload({ booking, payments }: ReceiptDownloadProps) {
  const handleDownload = async () => {
    try {
      const blob = await customerService.downloadReceipt(booking.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      showSnackbar('success', 'Receipt downloaded successfully');
    } catch {
      showSnackbar('error', 'Failed to download receipt');
    }
  };

  const handlePrint = () => { window.print(); };

  return (
    <Box id="receipt-content" sx={{ p: 3 }}>
      <Box textAlign="center" mb={3}><Typography variant="h5" sx={{ fontWeight: 600 }}>Siddhivinayak Arts</Typography><Typography variant="body2" color="textSecondary">Ganpati Booking Receipt</Typography></Box>
      <Box mb={3}><Typography variant="subtitle2">Booking Information</Typography><Typography variant="body2">Booking ID: {booking.bookingId}</Typography><Typography variant="body2">Booking Date: {new Date(booking.createdAt).toLocaleDateString()}</Typography><Typography variant="body2">Ganpati: {booking.ganpatiName}</Typography></Box>
      <Box mb={3}><Typography variant="subtitle2">Customer Information</Typography><Typography variant="body2">Name: {booking.customerName}</Typography><Typography variant="body2">Phone: {booking.customerPhone}</Typography></Box>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}><Table size="small"><TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell>Date</TableCell><TableCell>Payment Type</TableCell><TableCell>Method</TableCell><TableCell align="right">Amount (₹)</TableCell></TableRow></TableHead><TableBody>{payments.map((payment) => (<TableRow key={payment.id}><TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell><TableCell>{payment.paymentType}</TableCell><TableCell>{payment.paymentMethod}</TableCell><TableCell align="right">{payment.amount.toLocaleString()}</TableCell></TableRow>))}<TableRow sx={{ bgcolor: '#e3f2fd' }}><TableCell colSpan={3} align="right"><Typography variant="subtitle2">Total Paid:</Typography></TableCell><TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>₹{booking.advancePaid.toLocaleString()}</Typography></TableCell></TableRow></TableBody></Table></TableContainer>
      <Box textAlign="center" mt={3}><Typography variant="caption" color="textSecondary">Thank you for choosing Siddhivinayak Arts! Have a blessed festival.</Typography></Box>
      <Box display="flex" gap={2} justifyContent="center" mt={3} sx={{ '@media print': { display: 'none' } }}>
        <Button variant="contained" startIcon={<Download />} onClick={handleDownload}>Download PDF</Button>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
      </Box>
    </Box>
  );
}