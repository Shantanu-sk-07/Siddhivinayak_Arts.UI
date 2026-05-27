// src/view/DashboardPages/Customer/QRScanPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Chip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { LocationOn, Phone, Email } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { customerService } from '@/services/CustomerService';
import { BookingResponseDto } from '@/types';

interface QRValueData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  ganpatiName: string;
  timestamp: string;
}

export default function QRScanPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);
  const [instructionsOpen, setInstructionsOpen] = useState<boolean>(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const fetchBookingDetails = useCallback(async (): Promise<void> => {
    if (!bookingId) {
      showSnackbar('error', 'Booking ID not found');
      navigate('/customer/bookings');
      return;
    }
    try {
      setLoading(true);
      const response = await customerService.getBookingDetails(bookingId);
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        showSnackbar('error', 'Booking not found');
        navigate('/customer/bookings');
      }
    } catch {
      showSnackbar('error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => { fetchBookingDetails(); }, [fetchBookingDetails]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (countdown > 0) {
      interval = setInterval(() => { setCountdown(prev => prev - 1); }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [countdown]);

  const handleRefreshQR = (): void => { setCountdown(30); showSnackbar('success', 'QR code refreshed'); };

  const handleDownloadQR = (): void => {
    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qr-${booking?.bookingId}.png`;
        link.href = pngFile;
        link.click();
        showSnackbar('success', 'QR code downloaded');
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } else {
      showSnackbar('error', 'QR code not found');
    }
  };

  const handlePrintQR = (): void => {
    const qrContent = qrContainerRef.current?.innerHTML;
    if (qrContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${booking?.bookingId}</title>
              <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial; }
                .qr-container { text-align: center; }
              </style>
            </head>
            <body>
              <div class="qr-container">${qrContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading QR code...</Typography>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Booking not found</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/customer/bookings')}>
          View My Bookings
        </Button>
      </Box>
    );
  }

  const qrValue: QRValueData = {
    bookingId: booking.bookingId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    ganpatiName: booking.ganpatiName,
    timestamp: new Date().toISOString(),
  };

  const isQRValid = booking.status === 'CONFIRMED' || booking.status === 'PICKUP_COMPLETED';

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Festival Day QR Code</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Scan this QR code at the festival counter for quick verification and pickup
      </Typography>

      <Grid container spacing={4}>
        {/* QR Code Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <div id="qr-container" ref={qrContainerRef}>
              {isQRValid ? (
                <>
                  <div id="qr-code">
                    <QRCodeSVG
                      value={JSON.stringify(qrValue)}
                      size={250}
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  {countdown > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      QR expires in {countdown}s
                    </Typography>
                  )}
                </>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="error">QR Code Not Available</Typography>
                  <Typography variant="body2" color="textSecondary">
                    QR code is only available for confirmed bookings
                  </Typography>
                </Box>
              )}
            </div>
            {isQRValid && (
              <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={handleRefreshQR}>Refresh QR</Button>
                <Button variant="outlined" onClick={handleDownloadQR}>Download</Button>
                <Button variant="outlined" onClick={handlePrintQR}>Print</Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Booking Details Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Booking Information</Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Booking ID</Typography>
                    <Typography variant="body1" fontWeight={600}>{booking.bookingId}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Status</Typography>
                    <Chip label={booking.status.replace('_', ' ')} color={booking.status === 'CONFIRMED' ? 'success' : 'warning'} size="small" />
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Ganpati Name</Typography>
                    <Typography variant="body2">{booking.ganpatiName}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Booking Date</Typography>
                    <Typography variant="body2">{new Date(booking.bookingDate).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Customer Details</Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600}>Name:</Typography>
                      <Typography variant="body2">{booking.customerName}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{booking.customerPhone}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Payment Summary</Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Total Amount</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{booking.totalAmount.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Amount Paid</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">₹{booking.advancePaid.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Remaining</Typography>
                  <Typography variant="body2" fontWeight={600} color={booking.remainingAmount > 0 ? 'error.main' : 'success.main'}>
                    ₹{booking.remainingAmount.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Button fullWidth variant="outlined" startIcon={<LocationOn />} onClick={() => setInstructionsOpen(true)}>
              Festival Location & Instructions
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Instructions Dialog */}
      <Dialog open={instructionsOpen} onClose={() => setInstructionsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" /> Festival Location & Instructions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Venue Details</Typography>
          <Card variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2">
              <strong>Siddhivinayak Arts Festival Ground</strong><br />
              Near Dadar Railway Station,<br />
              Dadar West, Mumbai - 400028<br /><br />
              📅 Date: Ganesh Chaturthi Day<br />
              ⏰ Time: 8:00 AM - 8:00 PM
            </Typography>
          </Card>

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Important Instructions</Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Please carry a printed copy of this QR code or have it ready on your phone</li>
            <li>Reach the venue at least 30 minutes before your scheduled pickup time</li>
            <li>Carry a valid ID proof for verification</li>
            <li>Complete any pending payments before arrival to avoid delays</li>
            <li>Follow the queue system at the pickup counter</li>
            <li>Keep your booking confirmation email handy</li>
            <li>For any assistance, contact our helpdesk at the venue</li>
          </Box>

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>Contact for Festival Day</Typography>
          <Card variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Phone fontSize="small" color="primary" />
              <Typography variant="body2">Support: +91 98765 43210</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Email fontSize="small" color="primary" />
              <Typography variant="body2">festival@siddhivinayakarts.com</Typography>
            </Box>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstructionsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<LocationOn />} onClick={() => window.open('https://maps.google.com/?q=Dadar+Mumbai', '_blank')}>
            Open in Maps
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}