// src/view/DashboardPages/Staff/QRScanVerification.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  QrCodeScanner,
  CheckCircle,
  Cancel,
  VerifiedUser,
  Receipt,
  Phone,
  Person,
  Videocam,
  VideocamOff,
  Refresh,
} from '@mui/icons-material';
import { Booking } from '@/types';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';

// HTML5 QR Code library types
interface Html5QrcodeScannerConfig {
  fps: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

interface Html5QrcodeScanner {
  start: (
    cameraIdOrConfig: { facingMode: string } | string,
    config: Html5QrcodeScannerConfig,
    onSuccess: (decodedText: string) => void,
    onError: (error: string | Error) => void
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
}

interface Html5QrcodeStatic {
  new (elementId: string, verbose?: boolean): Html5QrcodeScanner;
}

interface QRData {
  bookingId: string;
  [key: string]: unknown;
}

interface VerifyBookingResponse {
  success: boolean;
  booking: Booking;
}

interface CompletePickupResponse {
  success: boolean;
  message?: string;
}

declare global {
  interface Window {
    Html5Qrcode: Html5QrcodeStatic;
  }
}

export default function QRScanVerification() {
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [recentScans, setRecentScans] = useState<Booking[]>([]);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Html5Qrcode library dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch((error: Error) => console.error('Error stopping scanner:', error));
      }
      document.body.removeChild(script);
    };
  }, []);

  const startScanner = async (): Promise<void> => {
    setCameraError(null);
    setScanning(true);
    setScanResult(null);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (typeof window.Html5Qrcode === 'undefined') {
        throw new Error('Scanner library not loaded');
      }
      
      scannerRef.current = new window.Html5Qrcode('qr-reader');
      
      const config: Html5QrcodeScannerConfig = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 } 
      };
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setCameraError(errorMessage);
      setScanning(false);
      showSnackbar('error', 'Could not access camera. Please check permissions.');
    }
  };

  const stopScanner = async (): Promise<void> => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string): Promise<void> => {
    await stopScanner();
    
    try {
      setLoading(true);
      const qrData: QRData = JSON.parse(decodedText);
      
      const response = await fetch(`/api/staff/verify-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: qrData.bookingId }),
      });
      
      const data: VerifyBookingResponse = await response.json();
      if (data.success && data.booking) {
        setScanResult(data.booking);
        setRecentScans(prev => [data.booking, ...prev].slice(0, 10));
        showSnackbar('success', 'Booking found!');
      } else {
        setScanResult(null);
        showSnackbar('error', 'Invalid QR code or booking not found');
        setTimeout(() => startScanner(), 2000);
      }
    } catch {
      showSnackbar('error', 'Invalid QR code format');
      setTimeout(() => startScanner(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const onScanError = (errorMessage: string | Error): void => {
    const message = typeof errorMessage === 'string' ? errorMessage : errorMessage.message;
    console.warn('Scan error:', message);
  };

  const handleVerifyAndComplete = async (booking: Booking): Promise<void> => {
    if (booking.remainingAmount > 0) {
      showConfirmation(
        `Customer still has pending payment of ₹${booking.remainingAmount.toLocaleString()}. Complete payment first?`,
        'Pending Payment',
        async () => {
          // Navigate to payment verification
          window.location.href = `/staff/payments?bookingId=${booking.id}`;
        }
      );
      return;
    }
    
    const confirmed = await showConfirmation({
      message: `Verify and complete pickup for ${booking.customerName}?`,
      title: 'Verify Booking',
      confirmText: 'Verify & Complete',
      confirmColor: 'success',
    });
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/staff/complete-pickup/${booking.id}`, {
          method: 'POST',
        });
        const data: CompletePickupResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Booking verified and pickup completed!');
          setScanResult(null);
          startScanner();
        }
      } catch {
        showSnackbar('error', 'Failed to complete pickup');
      }
    }
  };

  const handlePrintReceipt = async (booking: Booking): Promise<void> => {
    try {
      const response = await fetch(`/api/staff/receipt/${booking.id}`);
      const blob: Blob = await response.blob();
      const url: string = window.URL.createObjectURL(blob);
      const printWindow: Window | null = window.open(url, '_blank');
      if (printWindow) {
        printWindow.print();
      }
    } catch {
      showSnackbar('error', 'Failed to print receipt');
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PICKUP_COMPLETED': return 'info';
      case 'PENDING_REQUEST': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        QR Scan Verification
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Scan customer QR code to verify booking and complete pickup
      </Typography>

      <Grid container spacing={3}>
        {/* Scanner Section */}
        <Grid size={{xs: 12, md: 7}}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <QrCodeScanner /> QR Scanner
              </Typography>
              <Box>
                {!scanning ? (
                  <Button
                    variant="contained"
                    startIcon={<Videocam />}
                    onClick={startScanner}
                  >
                    Start Scanner
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<VideocamOff />}
                    onClick={stopScanner}
                  >
                    Stop Scanner
                  </Button>
                )}
              </Box>
            </Box>

            {cameraError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {cameraError}
              </Alert>
            )}

            <Box
              id="qr-reader"
              ref={videoRef}
              sx={{
                width: '100%',
                minHeight: 400,
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                display: scanning ? 'block' : 'none',
              }}
            />

            {!scanning && !scanResult && (
              <Box
                sx={{
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <QrCodeScanner sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography color="textSecondary">
                  Click "Start Scanner" to begin scanning QR codes
                </Typography>
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography sx={{ mt: 1, textAlign: 'center' }}>Verifying booking...</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Scan Result Section */}
        <Grid size={{xs: 12, md: 5}}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scan Result
            </Typography>
            
            {scanResult ? (
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: scanResult.status === 'CONFIRMED' ? 'success.main' : 'warning.main' }}>
                      <VerifiedUser />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {scanResult.customerName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Booking ID: {scanResult.bookingId}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List dense disablePadding>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary="Ganpati" 
                        secondary={scanResult.ganpatiName}
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary="Amount" 
                        secondary={`₹${scanResult.totalAmount.toLocaleString()}`}
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary="Paid" 
                        secondary={`₹${scanResult.advancePaid.toLocaleString()}`}
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary="Remaining" 
                        secondary={
                          <Typography color={scanResult.remainingAmount > 0 ? 'error' : 'success'}>
                            ₹{scanResult.remainingAmount.toLocaleString()}
                          </Typography>
                        }
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          <Chip 
                            label={scanResult.status.replace('_', ' ')} 
                            color={getStatusColor(scanResult.status)}
                            size="small"
                          />
                        }
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" gap={2}>
                    {scanResult.status === 'CONFIRMED' && scanResult.remainingAmount === 0 ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleVerifyAndComplete(scanResult)}
                      >
                        Verify & Complete Pickup
                      </Button>
                    ) : scanResult.status === 'CONFIRMED' && scanResult.remainingAmount > 0 ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        startIcon={<Cancel />}
                        disabled
                      >
                        Pending Payment: ₹{scanResult.remainingAmount.toLocaleString()}
                      </Button>
                    ) : scanResult.status === 'PICKUP_COMPLETED' ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="info"
                        disabled
                      >
                        Already Completed
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        disabled
                      >
                        Not Ready for Pickup
                      </Button>
                    )}
                  </Box>
                  
                  <Box display="flex" gap={2} mt={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Receipt />}
                      onClick={() => handlePrintReceipt(scanResult)}
                    >
                      Print Receipt
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => {
                        setScanResult(null);
                        startScanner();
                      }}
                    >
                      Scan New
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box textAlign="center" py={4}>
                <QrCodeScanner sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                <Typography color="textSecondary">
                  Scan a QR code to see booking details
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Scans
          </Typography>
          <Grid container spacing={2}>
            {recentScans.map((scan, idx) => (
              <Grid size={{xs: 12, sm: 6, md: 4}} key={idx}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="subtitle2">{scan.customerName}</Typography>
                        <Typography variant="caption" color="textSecondary">{scan.bookingId}</Typography>
                        <Typography variant="body2">{scan.ganpatiName}</Typography>
                      </Box>
                      <Chip 
                        label={scan.status.replace('_', ' ')} 
                        color={getStatusColor(scan.status)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2">Customer Info</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemAvatar><Avatar><Person /></Avatar></ListItemAvatar>
                      <ListItemText primary="Name" secondary={selectedBooking.customerName} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar><Avatar><Phone /></Avatar></ListItemAvatar>
                      <ListItemText primary="Phone" secondary={selectedBooking.customerPhone} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                  <Typography variant="subtitle2">Booking Info</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Ganpati" secondary={selectedBooking.ganpatiName} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Amount" secondary={`₹${selectedBooking.totalAmount.toLocaleString()}`} />
                    </ListItem>
                  </List>
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