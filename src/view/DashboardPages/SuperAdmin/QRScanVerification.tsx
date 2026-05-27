import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid, Chip, LinearProgress,
 Avatar, List, ListItem, ListItemText, Divider, Alert, useTheme, alpha,
  styled
} from '@mui/material';
import { QrCodeScanner, CheckCircle, VerifiedUser, Receipt, Videocam, VideocamOff, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { adminService } from '@/services/AdminService';
import { BookingResponseDto } from '@/types';

const StyledCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

interface Html5QrcodeScannerConfig {
  fps: number;
  qrbox?: { width: number; height: number } | number;
}

interface Html5QrcodeScanner {
  start: (config: { facingMode: string }, options: Html5QrcodeScannerConfig, onSuccess: (decodedText: string) => void, onError: (error: string | Error) => void) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
}

interface Html5QrcodeStatic {
  new (elementId: string, verbose?: boolean): Html5QrcodeScanner;
}

declare global {
  interface Window {
    Html5Qrcode: Html5QrcodeStatic;
  }
}

export default function QRScanVerification() {
  const theme = useTheme();
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<BookingResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<BookingResponseDto[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
      document.body.removeChild(script);
    };
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    setScanning(true);
    setScanResult(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (typeof window.Html5Qrcode === 'undefined') {
        throw new Error('Scanner library not loaded');
      }
      scannerRef.current = new window.Html5Qrcode('qr-reader');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        (error: string | Error) => { console.warn('Scan error:', error); }
      );
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Failed to access camera');
      setScanning(false);
      showSnackbar('error', 'Could not access camera.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();
    try {
      setLoading(true);
      const qrData = JSON.parse(decodedText);
      const response = await adminService.verifyBooking(qrData.bookingId);
      if (response.success && response.data) {
        setScanResult(response.data);
        setRecentScans(prev => [response.data, ...prev].slice(0, 10));
        showSnackbar('success', 'Booking found!');
      } else {
        setScanResult(null);
        showSnackbar('error', 'Invalid QR code');
        setTimeout(() => startScanner(), 2000);
      }
    } catch {
      showSnackbar('error', 'Invalid QR code format');
      setTimeout(() => startScanner(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async (booking: BookingResponseDto) => {
    if (booking.remainingAmount > 0) {
      showSnackbar('warning', `Pending payment of ₹${booking.remainingAmount.toLocaleString()}. Complete payment first.`);
      return;
    }
    const confirmed = await showConfirmation(`Verify and complete pickup for ${booking.customerName}?`, 'Verify Booking', async () => {});
    if (confirmed) {
      try {
        const response = await adminService.completePickup(booking.id);
        if (response.success) {
          showSnackbar('success', 'Pickup completed!');
          setScanResult(null);
          startScanner();
        }
      } catch {
        showSnackbar('error', 'Failed to complete pickup');
      }
    }
  };

  const handlePrintReceipt = async (booking: BookingResponseDto) => {
    try {
      const blob = await adminService.printReceipt(booking.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      showSnackbar('error', 'Failed to print receipt');
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PICKUP_COMPLETED': return 'info';
      default: return 'default';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            QR Scan Verification
          </Typography>
          <Typography variant="body2" color="textSecondary">Scan customer QR code to verify booking and complete pickup</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant="h6" fontWeight={600} display="flex" alignItems="center" gap={1}><QrCodeScanner /> QR Scanner</Typography>
                <Box>
                  {!scanning ? (<Button variant="contained" startIcon={<Videocam />} onClick={startScanner} sx={{ borderRadius: 30 }}>Start Scanner</Button>) : (<Button variant="outlined" color="error" startIcon={<VideocamOff />} onClick={stopScanner} sx={{ borderRadius: 30 }}>Stop Scanner</Button>)}
                </Box>
              </Box>
              {cameraError && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{cameraError}</Alert>}
              <Box id="qr-reader" sx={{ width: '100%', minHeight: 400, bgcolor: '#000', borderRadius: 3, overflow: 'hidden', display: scanning ? 'block' : 'none' }} />
              {!scanning && !scanResult && (<Box sx={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.common.black, 0.04), borderRadius: 3 }}><QrCodeScanner sx={{ fontSize: 80, color: '#ccc', mb: 2 }} /><Typography color="textSecondary">Click "Start Scanner" to begin scanning QR codes</Typography></Box>)}
              {loading && (<Box sx={{ mt: 2 }}><LinearProgress /><Typography sx={{ mt: 1, textAlign: 'center' }}>Verifying booking...</Typography></Box>)}
            </GlassPaper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Scan Result</Typography>
              {scanResult ? (
                <StyledCard variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main }}><VerifiedUser /></Avatar>
                      <Box><Typography variant="subtitle1" fontWeight={600}>{scanResult.customerName}</Typography><Typography variant="caption" color="textSecondary">Booking ID: {scanResult.bookingId}</Typography></Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <List dense disablePadding>
                      <ListItem disablePadding sx={{ mb: 1 }}><ListItemText primary="Ganpati" secondary={scanResult.ganpatiName} /></ListItem>
                      <ListItem disablePadding sx={{ mb: 1 }}><ListItemText primary="Amount" secondary={`₹${scanResult.totalAmount.toLocaleString()}`} /></ListItem>
                      <ListItem disablePadding sx={{ mb: 1 }}><ListItemText primary="Paid" secondary={`₹${scanResult.advancePaid.toLocaleString()}`} /></ListItem>
                      <ListItem disablePadding sx={{ mb: 1 }}><ListItemText primary="Remaining" secondary={<Typography color={scanResult.remainingAmount > 0 ? 'error' : 'success'}>₹{scanResult.remainingAmount.toLocaleString()}</Typography>} /></ListItem>
                      <ListItem disablePadding><ListItemText primary="Status" secondary={<Chip label={scanResult.status.replace('_', ' ')} color={getStatusColor(scanResult.status)} size="small" sx={{ borderRadius: 8 }} />} /></ListItem>
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {scanResult.status === 'CONFIRMED' && scanResult.remainingAmount === 0 ? (<Button fullWidth variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleVerifyAndComplete(scanResult)} sx={{ borderRadius: 30 }}>Verify & Complete Pickup</Button>) : (<Button fullWidth variant="outlined" color="error" disabled sx={{ borderRadius: 30 }}>Not Ready for Pickup</Button>)}
                    </Box>
                    <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                      <Button fullWidth variant="outlined" startIcon={<Receipt />} onClick={() => handlePrintReceipt(scanResult)} sx={{ borderRadius: 30 }}>Print Receipt</Button>
                      <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={() => { setScanResult(null); startScanner(); }} sx={{ borderRadius: 30 }}>Scan New</Button>
                    </Box>
                  </CardContent>
                </StyledCard>
              ) : (<Box textAlign="center" py={4}><QrCodeScanner sx={{ fontSize: 60, color: '#ccc', mb: 2 }} /><Typography color="textSecondary">Scan a QR code to see booking details</Typography></Box>)}
            </GlassPaper>
          </Grid>
        </Grid>

        {recentScans.length > 0 && (
          <GlassPaper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Recent Scans</Typography>
            <Grid container spacing={2}>
              {recentScans.map((scan, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>{scan.customerName}</Typography>
                          <Typography variant="caption" color="textSecondary">{scan.bookingId}</Typography>
                          <Typography variant="body2">{scan.ganpatiName}</Typography>
                        </Box>
                        <Chip label={scan.status.replace('_', ' ')} color={getStatusColor(scan.status)} size="small" sx={{ borderRadius: 8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </GlassPaper>
        )}
      </Box>
    </motion.div>
  );
}