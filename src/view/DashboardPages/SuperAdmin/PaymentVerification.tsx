import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  IconButton,
  Avatar,
  styled,
} from '@mui/material';
import { Close, CheckCircle, Cancel,  AccountBalanceWallet, Info, Warning } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { PaymentResponseDto } from '@/types';
import { adminService } from '@/services/AdminService';

type PaymentRecord = PaymentResponseDto & Record<string, unknown>;

const StyledCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    background: alpha(theme.palette.common.white, 0.96),
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

export default function PaymentVerification() {
  const theme = useTheme();
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponseDto | null>(null);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingPayments();
      if (response.success && response.data) setPayments(response.data);
    } catch {
      showSnackbar('error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payment: PaymentResponseDto, status: 'VERIFIED' | 'REJECTED') => {
    const confirmed = await showConfirmation(
      `${status === 'VERIFIED' ? 'Verify' : 'Reject'} payment of ₹${payment.amount}?`,
      status === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment'
    );
    if (confirmed) {
      try {
        const response = await adminService.verifyPayment(payment.id, status);
        if (response.success) {
          showSnackbar('success', `Payment ${status.toLowerCase()} successfully`);
          await fetchPayments();
        }
      } catch {
        showSnackbar('error', 'Failed to verify payment');
      }
    }
  };

  const viewScreenshot = (payment: PaymentResponseDto) => {
    setSelectedPayment(payment);
    setScreenshotOpen(true);
  };

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'OFFLINE_UPI': return '📱';
      case 'OFFLINE_CASH': return '💵';
      default: return '💳';
    }
  };

  const columns: Column<PaymentRecord>[] = [
    { key: 'id', label: 'Payment ID', render: (row) => (
      <Typography variant="body2" fontWeight={500}>{(row as PaymentResponseDto).id?.slice(0, 8)}</Typography>
    )},
    { key: 'bookingId', label: 'Booking ID', render: (row) => (
      <Typography variant="body2" fontWeight={500}>{(row as PaymentResponseDto).bookingId?.slice(0, 8)}</Typography>
    )},
    { key: 'amount', label: 'Amount', render: (row) => (
      <Typography fontWeight={600} color="primary.main">₹{(row as PaymentResponseDto).amount.toLocaleString()}</Typography>
    )},
    { key: 'paymentType', label: 'Type', render: (row) => (
      <Chip label={(row as PaymentResponseDto).paymentType} size="small" variant="outlined" sx={{ borderRadius: 8 }} />
    )},
    { key: 'paymentMethod', label: 'Method', render: (row) => (
      <Chip label={`${getPaymentMethodIcon((row as PaymentResponseDto).paymentMethod)} ${(row as PaymentResponseDto).paymentMethod}`} size="small" sx={{ borderRadius: 8, bgcolor: alpha(theme.palette.info.main, 0.1) }} />
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Chip label={(row as PaymentResponseDto).status} color={getStatusColor((row as PaymentResponseDto).status)} size="small" sx={{ borderRadius: 8, fontWeight: 500 }} />
    )},
    { key: 'createdAt', label: 'Date', render: (row) => new Date((row as PaymentResponseDto).createdAt).toLocaleDateString() },
    { key: ACTION_KEY, label: 'Actions' },
  ];

  const totalPending = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                  backgroundClip: 'text', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Payment Verification
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Verify offline payments submitted by customers
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Pending Payments
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.warning.main }}>
                        {totalPending}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                      <Warning sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Total Amount
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.primary.main }}>
                        ₹{totalAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <AccountBalanceWallet sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Avg. Payment
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.secondary.main }}>
                        ₹{(totalAmount / (totalPending || 1)).toLocaleString()}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                      <Info sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        </Grid>

        <GlassPaper>
          <UniversalTable<PaymentRecord>
            data={payments as PaymentRecord[]}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            showSearch
            actions={{
              view: (row) => viewScreenshot(row as PaymentResponseDto),
              approve: (row) => handleVerify(row as PaymentResponseDto, 'VERIFIED'),
              reject: (row) => handleVerify(row as PaymentResponseDto, 'REJECTED'),
            }}
          />
        </GlassPaper>

        <Dialog 
          open={screenshotOpen} 
          onClose={() => setScreenshotOpen(false)} 
          maxWidth="sm" 
          fullWidth 
          PaperProps={{
            sx: { borderRadius: 4, background: alpha(theme.palette.common.white, 0.96), backdropFilter: 'blur(10px)' }
          }}
        >
          {selectedPayment && (
            <>
              <DialogTitle sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 }
              }}>
                <Typography variant="h6" fontWeight={600}>Payment Screenshot</Typography>
                <IconButton onClick={() => setScreenshotOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box textAlign="center" sx={{ py: 2 }}>
                  <img 
                    src={selectedPayment.screenshot || '/placeholder-image.jpg'} 
                    alt="Payment Screenshot" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 400, 
                      borderRadius: 16, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Grid container spacing={2} sx={{ mt: 2, textAlign: 'left' }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="textSecondary">Amount</Typography>
                      <Typography variant="body1" fontWeight={600} color="primary.main">₹{selectedPayment.amount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="textSecondary">Transaction ID</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedPayment.transactionId || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="textSecondary">Payment Method</Typography>
                      <Chip label={selectedPayment.paymentMethod} size="small" sx={{ mt: 0.5, borderRadius: 8 }} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="textSecondary">Submitted On</Typography>
                      <Typography variant="body1" fontWeight={500}>{new Date(selectedPayment.createdAt).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, gap: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button onClick={() => setScreenshotOpen(false)} variant="outlined" sx={{ borderRadius: 30, textTransform: 'none' }}>Close</Button>
                <Button 
                  onClick={() => { handleVerify(selectedPayment, 'VERIFIED'); setScreenshotOpen(false); }} 
                  variant="contained" 
                  color="success" 
                  sx={{ borderRadius: 30, textTransform: 'none', px: 3 }}
                  startIcon={<CheckCircle />}
                >
                  Verify
                </Button>
                <Button 
                  onClick={() => { handleVerify(selectedPayment, 'REJECTED'); setScreenshotOpen(false); }} 
                  variant="contained" 
                  color="error" 
                  sx={{ borderRadius: 30, textTransform: 'none', px: 3 }}
                  startIcon={<Cancel />}
                >
                  Reject
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </motion.div>
  );
}