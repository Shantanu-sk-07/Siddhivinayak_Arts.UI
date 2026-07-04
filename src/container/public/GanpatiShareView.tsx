import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Container,
  Chip, alpha, styled, LinearProgress, Button} from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import { config } from '@/constants/config';
import { apiClient } from '@/services/api';
import { GanpatiResponseDto } from '@/types/MurtiType';
import { Helmet } from 'react-helmet-async';

interface ShareCollectionResponse {
  token: string;
  shareUrl: string;
  ganpatiIds: string[];
  customerIds: string[];
  createdBy: string;
  createdDate: string;
  expiryDate: string | null;
  isActive: boolean;
}

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '16px 0',
});

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: { xs: 'none', sm: 'translateY(-6px)' },
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`
  }
}));

export default function GanpatiShareView() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<ShareCollectionResponse | null>(null);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);

  useEffect(() => {
    if (!token) {
      setError('Invalid link');
      setLoading(false);
      return;
    }

    const fetchSharedGanpati = async () => {
      try {
        const collectionRes = await apiClient<{ data: ShareCollectionResponse }>(`/share/collection/${token}`);
        if (!collectionRes.data) {
          setError('Invalid or expired link');
          setLoading(false);
          return;
        }

        setCollection(collectionRes.data);

        const ganpatiRes = await apiClient<{ data: GanpatiResponseDto[] }>('/ganpati/all');
        if (ganpatiRes.data) {
          const filtered = ganpatiRes.data.filter(g => 
            collectionRes.data.ganpatiIds.includes(g.id)
          );
          setGanpatiList(filtered);
        }
      } catch {
        setError('Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedGanpati();
  }, [token]);

  const handleWhatsAppShare = () => {
    const message = `Namaste 🙏\n\nYour selected Ganpati collection is ready.\n\nClick below to view.\n${window.location.href}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
            Loading...
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
            The link may have expired or is invalid.
          </Typography>
        </Container>
      </OrangeBackground>
    );
  }

  return (
    <OrangeBackground>
      <Helmet>
        <title>{ganpatiList.length > 0 ? `${ganpatiList[0].name} - Ganpati Collection` : 'Ganpati Collection'}</title>
        <meta property="og:title" content={`${ganpatiList.length} Ganpati Collection - Siddhivinayak Arts`} />
        <meta property="og:description" content="Premium eco-friendly Ganpati idols shared with you." />
        <meta property="og:image" content={ganpatiList[0]?.images?.[0] || '/Logo.avif'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Container sx={{ px: { xs: 1, sm: 2 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            🐘 Ganpati Collection
          </Typography>
          <Typography variant="subtitle1" sx={{ color: alpha('#fff', 0.9) }}>
            Shared by {collection?.createdBy}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {ganpatiList.map((ganpati) => (
            <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={ganpati.id}>
              <StyledCard>
                <Box sx={{ position: 'relative', bgcolor: '#f5f5f5' }}>
                  <Box
                    component="img"
                    src={ganpati.images?.[0] || '/placeholder.jpg'}
                    alt={ganpati.name}
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'cover',
                    }}
                  />
                  <Chip
                    label={`${ganpati.availableSlots} Available`}
                    size="small"
                    color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                </Box>

                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                    {ganpati.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {ganpati.height} • {ganpati.material}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#d32f2f', mt: 1 }}>
                    ₹{ganpati.price.toLocaleString()}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={() => window.location.href = `https://wa.me/${config.ADMIN_WHATSAPP}`}
                    startIcon={<WhatsApp />}
                    sx={{ mt: 1.5, bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                  >
                    Contact
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {ganpatiList.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'white' }}>
            <Typography>No Ganpati found in this collection.</Typography>
          </Box>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<WhatsApp />}
            onClick={handleWhatsAppShare}
            sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' }, borderRadius: 50, px: 4 }}
          >
            Share on WhatsApp
          </Button>
        </Box>
      </Container>
    </OrangeBackground>
  );
}