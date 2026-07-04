import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Button, LinearProgress,
  Avatar, Divider, alpha, styled
} from '@mui/material';
import { Download, Receipt as ReceiptIcon } from '@mui/icons-material';
import { config } from '@/constants/config';
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
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '16px 0',
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

export default function ReceiptView() {
  const { token } = useParams<{ token: string }>();
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
      // For mobile: fetch blob and open with proper viewer
      const response = await fetch(receipt.pdfPath);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      
      // Check if it's actually a PDF
      if (blob.type !== 'application/pdf') {
        // If Cloudinary returns an HTML error page, try direct URL
        window.open(receipt.pdfPath, '_blank');
        setPdfLoading(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(url, '_blank');
      
      // Revoke URL after 1 minute to free memory
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      
      if (!newWindow) {
        // If popup blocked, fallback to direct link
        window.open(receipt.pdfPath, '_blank');
      }
    } catch (error) {
      console.error('Failed to open PDF:', error);
      // Fallback: open direct URL
      try {
        window.open(receipt.pdfPath, '_blank');
      } catch  {
        showSnackbar('error', 'Failed to open PDF. Please try downloading instead.');
      }
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
      // First try: fetch blob and download
      const response = await fetch(receipt.pdfPath);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      
      // Check if it's actually a PDF
      if (blob.type !== 'application/pdf' || blob.size < 1000) {
        // If Cloudinary returns an error page, fallback to direct download
        window.open(receipt.pdfPath, '_blank');
        setPdfLoading(false);
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${receipt.token.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke URL after download
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      
      showSnackbar('success', 'PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Fallback: open direct URL
      try {
        window.open(receipt.pdfPath, '_blank');
      } catch  {
        showSnackbar('error', 'Failed to download PDF. Please try again.');
      }
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
        <Container>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
            Loading receipt...
          </Typography>
        </Container>
      </OrangeBackground>
    );
  }

  if (error) {
    return (
      <OrangeBackground>
        <Container sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" color="white" gutterBottom>
            🙏
          </Typography>
          <Typography variant="h6" color="white">
            {error}
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mt: 2 }}>
            The receipt link may have expired or is invalid.
          </Typography>
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
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            🐘 Booking Receipt
          </Typography>
        </Box>

        <GlassCard>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ bgcolor: '#d32f2f', width: 60, height: 60 }}>
              <ReceiptIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {config.APP_NAME}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                गणपती मूर्ती बुकिंग पावती
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Receipt Link
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {receipt?.receiptUrl}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Receipt Token
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {receipt?.token}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Generated On
            </Typography>
            <Typography variant="body2">
              {receipt?.createdDate ? new Date(receipt.createdDate).toLocaleString() : 'N/A'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
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
              {pdfLoading ? 'Loading...' : 'Download Receipt (PDF)'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={handleViewPDF}
              disabled={pdfLoading}
              sx={{ 
                bgcolor: '#1976d2',
                borderRadius: 50,
                py: 1.5,
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              {pdfLoading ? 'Loading...' : 'View Receipt'}
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<Download />}
            onClick={handleWhatsAppShare}
            sx={{ 
              mt: 2,
              bgcolor: '#25D366',
              borderRadius: 50,
              py: 1.5,
              '&:hover': { bgcolor: '#128C7E' }
            }}
          >
            Share on WhatsApp
          </Button>
        </GlassCard>
      </Container>
    </OrangeBackground>
  );
}