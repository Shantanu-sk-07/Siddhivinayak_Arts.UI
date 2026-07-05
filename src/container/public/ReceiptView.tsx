import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Button, LinearProgress,
  Avatar, Divider, alpha, styled, Grid, Chip, Card, CardContent,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Download, Receipt as ReceiptIcon, WhatsApp, CheckCircle,
  Payment, Person, Phone, LocationOn,
  AttachMoney, History, Category, Height
} from '@mui/icons-material';
import { apiClient } from '@/services/api';
import { Helmet } from 'react-helmet-async';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { downloadReceiptPDF } from '@/utils/ReceiptGenerator';
import { ConfirmedBooking } from '@/types/MurtiType';

interface PaymentRecordDto {
  amount: number;
  paymentDate: string;
  paymentType: string;
  notes: string;
  remainingAfterPayment: number;
}

interface ReceiptResponse {
  token: string;
  receiptUrl: string;
  bookingId: string;
  pdfPath: string;
  createdDate: string;
  isActive: boolean;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerTaluka: string;
  customerDistrict: string;
  mandalName: string;
  ganpatiName: string;
  ganpatiHeight: string;
  ganpatiPrice: number;
  advancePayment: number;
  remainingPayment: number;
  totalPrice: number;
  totalPaidSoFar: number;
  bookingDate: string;
  status: string;
  paymentHistory: PaymentRecordDto[];
}

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
  minHeight: '100vh',
  padding: '8px 0',
  display: 'flex',
  alignItems: 'center',
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(12px)',
  borderRadius: 20,
  padding: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.06)}`,
  position: 'relative',
  overflow: 'hidden',
  maxHeight: '95vh',
  display: 'flex',
  flexDirection: 'column',
}));

const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    py: 0.6,
    borderBottom: '1px solid #f0ebe6',
    '&:last-child': { borderBottom: 'none' }
  }}>
    {icon && <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center', minWidth: 20 }}>{icon}</Box>}
    <Typography variant="caption" sx={{ color: '#6b6b6b', minWidth: 70, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

export default function ReceiptView() {
  const { token } = useParams<{ token: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid receipt link');
      setLoading(false);
      return;
    }

    const fetchReceipt = async () => {
      try {
        const response = await apiClient<{ data: ReceiptResponse }>(`/receipt/${token}`, { skipAuth: true });
        if (!response.data) {
          setError('Invalid or expired receipt link');
          setLoading(false);
          return;
        }
        setReceipt(response.data);
      } catch {
        setError('Invalid or expired receipt link');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [token]);

  const booking = useMemo(() => {
    if (!receipt) return null;
    return {
      id: receipt.bookingId,
      receiptNumber: receipt.receiptNumber,
      customerName: receipt.customerName,
      customerPhone: receipt.customerPhone,
      customerAddress: receipt.customerAddress,
      customerTaluka: receipt.customerTaluka,
      customerDistrict: receipt.customerDistrict,
      mandalName: receipt.mandalName,
      ganpati: {
        name: receipt.ganpatiName,
        height: receipt.ganpatiHeight,
        price: receipt.ganpatiPrice,
      },
      advancePayment: receipt.advancePayment,
      remainingPayment: receipt.remainingPayment,
      totalPrice: receipt.totalPrice,
      totalPaidSoFar: receipt.totalPaidSoFar,
      bookingDate: receipt.bookingDate,
      status: receipt.status,
      paymentHistory: receipt.paymentHistory?.map(p => ({
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentType: p.paymentType,
        notes: p.notes,
        remainingAfterPayment: p.remainingAfterPayment,
      })) || [],
      createdAt: receipt.createdDate,
      customer: null,
    } as unknown as ConfirmedBooking;
  }, [receipt]);

  const handleDownloadPDF = async () => {
    if (!booking) {
      showSnackbar('error', 'Booking data not available');
      return;
    }

    setPdfLoading(true);
    try {
      const customer = booking.customer;
      const receiptData = {
        receiptNumber: booking.receiptNumber || 'REC-0001',
        date: new Date(booking.createdAt).toLocaleDateString(),
        customerName: booking.customerName || customer?.name || '',
        customerPhone: booking.customerPhone || customer?.phone || '',
        customerEmail: '',
        customerAddress: booking.customerAddress || customer?.address || '',
        customerVillage: '',
        customerTaluka: booking.customerTaluka || customer?.taluka || '',
        customerDistrict: booking.customerDistrict || customer?.district || '',
        mandalName: booking.mandalName || customer?.mandalName || '',
        ganpatiName: booking.ganpati?.name || '',
        ganpatiHeight: booking.ganpati?.height || '',
        ganpatiPrice: booking.ganpati?.price || 0,
        advancePayment: booking.advancePayment,
        remainingPayment: booking.remainingPayment,
        totalPrice: booking.totalPrice,
        totalPaidSoFar: booking.totalPaidSoFar || 0,
        bookingDate: booking.bookingDate || new Date().toISOString().split('T')[0],
        status: booking.status,
        contactNumbers: [],
        paymentHistory: booking.paymentHistory?.map(p => ({
          amount: p.amount || 0,
          date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date().toLocaleDateString(),
          type: p.paymentType || 'INSTALLMENT',
          notes: p.notes || '',
          remainingAfter: p.remainingAfterPayment || 0
        })) || []
      };

      await downloadReceiptPDF(receiptData);
      showSnackbar('success', 'PDF downloaded successfully');
    } catch {
      showSnackbar('error', 'Failed to download PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Namaste 🙏\n\nYour booking has been confirmed.\n\nView & download receipt:\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container maxWidth="sm">
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Typography sx={{ mt: 2, textAlign: 'center', color: '#555' }}>Loading receipt...</Typography>
        </Container>
      </OrangeBackground>
    );
  }

  if (error || !booking) {
    return (
      <OrangeBackground>
        <Container maxWidth="sm" sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom>🙏</Typography>
          <Typography variant="h6" color="textPrimary">{error || 'Receipt not found'}</Typography>
          <Button variant="contained" sx={{ mt: 3, borderRadius: 50, px: 4 }} href="/">Go Home</Button>
        </Container>
      </OrangeBackground>
    );
  }

  return (
    <OrangeBackground>
      <Helmet>
        <title>Booking Receipt - Siddhivinayak Arts</title>
        <meta property="og:title" content="Your Booking Receipt" />
        <meta property="og:description" content="View and download your booking receipt." />
        <meta property="og:image" content="/Logo.avif" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
        <GlassCard>
          <Box sx={{ textAlign: 'center', mb: 1.5 }}>
            <Avatar
              src="/Logo.avif"
              sx={{
                width: 48,
                height: 48,
                margin: '0 auto 4px',
                border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              }}
            />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#E65100', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              सिद्धिविनायक आर्ट्स
            </Typography>
            <Typography variant="caption" color="textSecondary">गणपती मूर्ती बुकिंग पावती</Typography>
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ color: '#b84a1a' }}>
                🌺 गणपती बाप्पा मोरया 🌺
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip icon={<ReceiptIcon sx={{ fontSize: 14 }} />} label={`पावती: ${booking.receiptNumber || 'N/A'}`} size="small" variant="outlined" sx={{ borderColor: '#E65100', color: '#E65100', height: 24, '& .MuiChip-label': { fontSize: '0.65rem' } }} />
            <Chip label={`तारीख: ${receipt?.createdDate ? new Date(receipt.createdDate).toLocaleDateString() : 'N/A'}`} size="small" variant="outlined" sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.65rem' } }} />
          </Box>

          <Box sx={{ mb: 1, p: 1, bgcolor: alpha('#4caf50', 0.06), borderRadius: 2, border: `1px solid ${alpha('#4caf50', 0.15)}` }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#2e7d32' }}>
              <CheckCircle sx={{ fontSize: 16 }} /> बुकिंग यशस्वी! धन्यवाद!
            </Typography>
          </Box>

          <Card sx={{ mb: 1, borderRadius: 2, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Person sx={{ fontSize: 14 }} /> ग्राहक
                  </Typography>
                  <InfoRow label="नाव" value={booking.customerName || 'N/A'} icon={<Person sx={{ fontSize: 14 }} />} />
                  <InfoRow label="मोबाईल" value={booking.customerPhone || 'N/A'} icon={<Phone sx={{ fontSize: 14 }} />} />
                  <InfoRow label="पत्ता" value={booking.customerAddress || 'N/A'} icon={<LocationOn sx={{ fontSize: 14 }} />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Category sx={{ fontSize: 14 }} /> गणपती
                  </Typography>
                  <InfoRow label="नाव" value={booking.ganpati?.name || 'N/A'} icon={<Category sx={{ fontSize: 14 }} />} />
                  <InfoRow label="उंची" value={booking.ganpati?.height || 'N/A'} icon={<Height sx={{ fontSize: 14 }} />} />
                  <InfoRow label="किंमत" value={`₹${booking.ganpati?.price?.toLocaleString() || 0}`} icon={<AttachMoney sx={{ fontSize: 14 }} />} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Paper sx={{ p: 1, mb: 1, borderRadius: 2, bgcolor: '#faf8f6' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Payment sx={{ fontSize: 14 }} /> पेमेंट सारांश
            </Typography>
            <Grid container spacing={0.5}>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center"><Typography variant="caption" color="textSecondary">एकूण</Typography><Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100' }}>₹{booking.totalPrice?.toLocaleString() || 0}</Typography></Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center"><Typography variant="caption" color="textSecondary">भरले</Typography><Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2e7d32' }}>₹{booking.totalPaidSoFar?.toLocaleString() || 0}</Typography></Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box textAlign="center"><Typography variant="caption" color="textSecondary">बाकी</Typography><Typography variant="subtitle2" fontWeight={700} sx={{ color: '#d32f2f' }}>₹{booking.remainingPayment?.toLocaleString() || 0}</Typography></Box>
              </Grid>
            </Grid>
          </Paper>

          {booking.paymentHistory && booking.paymentHistory.length > 0 && (
            <Paper sx={{ p: 1, mb: 1, borderRadius: 2, bgcolor: '#faf8f6', maxHeight: 80, overflow: 'auto' }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <History sx={{ fontSize: 14 }} /> हिस्ट्री
              </Typography>
              {booking.paymentHistory.slice(0, 3).map((p, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3, borderBottom: '1px dashed #f0ebe6', fontSize: '0.65rem' }}>
                  <Typography variant="caption">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}</Typography>
                  <Typography variant="caption" fontWeight={600} color="#2e7d32">₹{p.amount?.toLocaleString() || 0}</Typography>
                  <Typography variant="caption">{p.paymentType}</Typography>
                  <Typography variant="caption" fontWeight={600} color="#d32f2f">₹{p.remainingAfterPayment?.toLocaleString() || 0}</Typography>
                </Box>
              ))}
              {booking.paymentHistory.length > 3 && <Typography variant="caption" color="textSecondary">+{booking.paymentHistory.length - 3} more</Typography>}
            </Paper>
          )}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mt: 'auto', pt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                background: 'linear-gradient(135deg, #E65100, #FF8F00)',
                borderRadius: 50,
                py: 1,
                fontSize: { xs: '0.7rem', sm: '0.85rem' },
                '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 15px ${alpha('#E65100', 0.3)}` },
                transition: 'all 0.2s',
              }}
            >
              {pdfLoading ? 'लोड...' : '📄 डाउनलोड'}
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<WhatsApp />}
              onClick={handleWhatsAppShare}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: '#25D366',
                borderRadius: 50,
                py: 1,
                fontSize: { xs: '0.7rem', sm: '0.85rem' },
                '&:hover': { bgcolor: '#128C7E' },
              }}
            >
              WhatsApp
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1, pt: 0.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Typography variant="caption" sx={{ color: '#b84a1a', fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
              🌺 गणपती बाप्पा मोरया 🌺
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: { xs: '0.5rem', sm: '0.6rem' } }}>
              सिद्धिविनायक आर्ट्स • कुरुंदवाड
            </Typography>
          </Box>
        </GlassCard>
      </Container>
    </OrangeBackground>
  );
}