import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Button, LinearProgress,
  Avatar, Divider, alpha, styled, Grid, Chip, Card, CardContent,
  useTheme
} from '@mui/material';
import {
  Download, Receipt as ReceiptIcon, WhatsApp, CheckCircle,
  Payment, Person, Phone, LocationOn, 
  AttachMoney, Category, Height
} from '@mui/icons-material';
import { apiClient } from '@/services/api';
import { Helmet } from 'react-helmet-async';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

interface ReceiptResponse {
  token: string;
  receiptUrl: string;
  bookingId: string;
  pdfPath: string;
  createdDate: string;
  isActive: boolean;
}

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)',
  minHeight: '100vh',
  padding: '24px 0',
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(12px)',
  borderRadius: 24,
  padding: theme.spacing(4),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.06)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
  },
}));

const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 1.2,
    borderBottom: '1px solid #f0ebe6',
    '&:last-child': { borderBottom: 'none' }
  }}>
    {icon && <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center', minWidth: 24 }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#6b6b6b', minWidth: 100, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

export default function ReceiptView() {
  const { token } = useParams<{ token: string }>();
  const theme = useTheme();
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
        const response = await apiClient<{ data: ReceiptResponse }>(`/receipt/${token}`);
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

  const handleViewPDF = async () => {
    if (!receipt?.pdfPath) {
      showSnackbar('error', 'PDF not available');
      return;
    }

    setPdfLoading(true);
    try {
      const response = await fetch(receipt.pdfPath);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        window.open(receipt.pdfPath, '_blank');
        setPdfLoading(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (!newWindow) window.open(receipt.pdfPath, '_blank');
    } catch {
      window.open(receipt.pdfPath, '_blank');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receipt?.pdfPath) {
      showSnackbar('error', 'PDF not available');
      return;
    }

    setPdfLoading(true);
    try {
      const response = await fetch(receipt.pdfPath);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const blob = await response.blob();
      if (blob.type !== 'application/pdf' || blob.size < 1000) {
        window.open(receipt.pdfPath, '_blank');
        setPdfLoading(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${receipt.token.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showSnackbar('success', 'PDF downloaded successfully');
    } catch {
      window.open(receipt.pdfPath, '_blank');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Namaste 🙏\n\nYour booking has been confirmed.\n\nYou can view and download your receipt using the link below.\n${window.location.href}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container maxWidth="md">
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Typography sx={{ mt: 2, textAlign: 'center', color: '#555' }}>
            Loading receipt...
          </Typography>
        </Container>
      </OrangeBackground>
    );
  }

  if (error) {
    return (
      <OrangeBackground>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            🙏
          </Typography>
          <Typography variant="h6" color="textPrimary">
            {error}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            The receipt link may have expired or is invalid.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 4, borderRadius: 50, px: 4 }}
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
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
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Container maxWidth="md">
        <GlassCard>
          {/* Header with Logo & Greeting */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              src="/Logo.avif"
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 12px',
                border: `4px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            />
            <Typography variant="h5" fontWeight={700} sx={{ color: '#E65100' }}>
              सिद्धिविनायक आर्ट्स
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              गणपती मूर्ती बुकिंग पावती
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#b84a1a' }}>
                🌺 गणपती बाप्पा मोरया 🌺
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                "आपल्या विश्वासाबद्दल हार्दिक आभार! 🙏"
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Receipt Info – Minimal Token Display */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
            <Chip
              icon={<ReceiptIcon />}
              label={`पावती क्रमांक: ${receipt?.bookingId?.substring(0, 8) || 'N/A'}`}
              variant="outlined"
              sx={{ borderRadius: 20, borderColor: '#E65100', color: '#E65100' }}
            />
            <Chip
              label={`तारीख: ${receipt?.createdDate ? new Date(receipt.createdDate).toLocaleDateString() : 'N/A'}`}
              variant="outlined"
              sx={{ borderRadius: 20 }}
            />
          </Box>

          {/* Success Message */}
          <Box sx={{ mb: 4, p: 2, bgcolor: alpha('#4caf50', 0.06), borderRadius: 16, border: `1px solid ${alpha('#4caf50', 0.2)}` }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e7d32' }}>
              <CheckCircle fontSize="small" />
              आपली बुकिंग यशस्वीरित्या पूर्ण झाली आहे. धन्यवाद!
            </Typography>
          </Box>

          {/* Booking Details Card */}
          <Card sx={{ mb: 4, borderRadius: 16, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" /> ग्राहक माहिती
                  </Typography>
                  <InfoRow label="नाव" value={receipt?.bookingId ? 'Customer Name' : 'N/A'} icon={<Person sx={{ fontSize: 16 }} />} />
                  <InfoRow label="मोबाईल" value="+91 9876543210" icon={<Phone sx={{ fontSize: 16 }} />} />
                  <InfoRow label="पत्ता" value="Kurundwad, Maharashtra" icon={<LocationOn sx={{ fontSize: 16 }} />} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Category fontSize="small" /> गणपती माहिती
                  </Typography>
                  <InfoRow label="नाव" value="Ganpati Name" icon={<Category sx={{ fontSize: 16 }} />} />
                  <InfoRow label="उंची" value="3 ft" icon={<Height sx={{ fontSize: 16 }} />} />
                  <InfoRow label="किंमत" value="₹ 15,000" icon={<AttachMoney sx={{ fontSize: 16 }} />} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Paper sx={{ p: 2, mb: 4, borderRadius: 16, bgcolor: '#faf8f6' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment fontSize="small" /> पेमेंट सारांश
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">एकूण</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#E65100' }}>₹15,000</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">भरले</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#2e7d32' }}>₹10,000</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">बाकी</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#d32f2f' }}>₹5,000</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              sx={{
                background: 'linear-gradient(135deg, #E65100, #FF8F00)',
                borderRadius: 50,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha('#E65100', 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {pdfLoading ? 'लोड होत आहे...' : '📄 डाउनलोड पावती'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={handleViewPDF}
              disabled={pdfLoading}
              sx={{
                borderRadius: 50,
                py: 1.5,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': { borderColor: '#1565c0', background: alpha('#1976d2', 0.04) },
              }}
            >
              {pdfLoading ? 'लोड होत आहे...' : '👁️ पहा पावती'}
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<WhatsApp />}
            onClick={handleWhatsAppShare}
            sx={{
              bgcolor: '#25D366',
              borderRadius: 50,
              py: 1.5,
              mb: 2,
              '&:hover': { bgcolor: '#128C7E' },
            }}
          >
            WhatsApp वर शेअर करा
          </Button>

          {/* Footer with Slogans */}
          <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="body2" sx={{ color: '#b84a1a', fontWeight: 600 }}>
              🌺 गणपती बाप्पा मोरया • मंगलमूर्ती मोरया 🌺
            </Typography>
            <Typography variant="caption" color="textSecondary">
              सिद्धिविनायक आर्ट्स • कुरुंदवाड, महाराष्ट्र
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
              🙏 आपल्या विश्वासाबद्दल हार्दिक आभार! 🙏
            </Typography>
          </Box>
        </GlassCard>
      </Container>
    </OrangeBackground>
  );
}