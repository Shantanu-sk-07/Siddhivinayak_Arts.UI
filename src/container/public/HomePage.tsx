// src/container/public/HomePage.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Container,
  Chip, alpha, styled, IconButton, Skeleton,
  Button,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Favorite, FavoriteBorder, WhatsApp, Forest, Star
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GanpatiResponseDto } from '@/types/MurtiType';
import { ganpatiService } from '@/services/GanpatiService';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import EnquiryForm from '@/container/public/EnquiryForm';

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '16px 0',
});

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: { xs: 'none', sm: 'translateY(-6px)' },
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`
  }
}));

const ImageSlider = styled(Box)({
  position: 'relative',
  width: '100%',
  height: 250,
  overflow: 'hidden',
  borderRadius: '20px 20px 0 0',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  }
});

const SliderDots = styled(Box)({
  position: 'absolute',
  bottom: 10,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 6,
});

const SliderDot = styled('span')<{ active?: boolean }>(({ theme, active }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.6),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
}));

const LikeButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  background: alpha(theme.palette.common.white, 0.9),
  backdropFilter: 'blur(4px)',
  padding: '4px',
  '&:hover': {
    background: theme.palette.common.white,
  }
}));

interface GanpatiWithImages extends GanpatiResponseDto {
  currentImageIndex: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [ganpatiList, setGanpatiList] = useState<GanpatiWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiResponseDto | null>(null);

  const fetchGanpatiList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await ganpatiService.getAll();
      let data: GanpatiResponseDto[] = [];
      if (response.success && response.data) {
        data = response.data;
      } else {
        showSnackbar('error', response.message || t('msg.error'));
      }
      
      const ganpatiData = data.map((g) => ({
        ...g,
        currentImageIndex: 0,
      }));
      setGanpatiList(ganpatiData);
    } catch {
      showSnackbar('error', t('msg.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchGanpatiList();
  }, [fetchGanpatiList]);

  const handleLike = async (ganpatiId: string, event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    try {
      const response = await ganpatiService.toggleLike(ganpatiId);
      if (response.success) {
        setGanpatiList((prev) => 
          prev.map((g) => 
            g.id === ganpatiId 
              ? { ...g, likes: response.data.likes, likedBy: response.data.likedBy }
              : g
          )
        );
      }
    } catch {
      showSnackbar('error', t('msg.error'));
    }
  };

  const openEnquiryDialog = (ganpati: GanpatiResponseDto): void => {
    setSelectedGanpati(ganpati);
    setEnquiryOpen(true);
  };

  const closeEnquiryDialog = (): void => {
    setEnquiryOpen(false);
    setSelectedGanpati(null);
  };

  const handleImageNavigation = (ganpatiId: string, index: number): void => {
    setGanpatiList((prev) => 
      prev.map((g) => 
        g.id === ganpatiId ? { ...g, currentImageIndex: index } : g
      )
    );
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 2 }}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
                <Skeleton variant="text" height={30} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </OrangeBackground>
    );
  }

  return (
    <OrangeBackground>
      <Container sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              fontSize: { xs: '1.8rem', sm: '2.5rem' }
            }}
          >
            {t('home.welcome_title')}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: alpha('#fff', 0.9), 
              mt: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {t('home.welcome_subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {ganpatiList.map((ganpati, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ganpati.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <StyledCard onClick={() => navigate(`/ganpati/${ganpati.id}`)}>
                  <ImageSlider>
                    <img 
                      src={ganpati.images?.[ganpati.currentImageIndex || 0] || '/placeholder.jpg'} 
                      alt={ganpati.name}
                    />
                    
                    <LikeButton onClick={(e) => handleLike(ganpati.id, e)}>
                      {ganpati.likedBy?.includes('user_id') ? (
                        <Favorite sx={{ color: '#d32f2f', fontSize: 18 }} />
                      ) : (
                        <FavoriteBorder sx={{ fontSize: 18 }} />
                      )}
                      <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.65rem', fontWeight: 600 }}>
                        {ganpati.likes || 0}
                      </Typography>
                    </LikeButton>

                    {ganpati.images && ganpati.images.length > 1 && (
                      <SliderDots>
                        {ganpati.images.map((_, idx) => (
                          <SliderDot
                            key={idx}
                            active={idx === (ganpati.currentImageIndex || 0)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageNavigation(ganpati.id, idx);
                            }}
                          />
                        ))}
                      </SliderDots>
                    )}
                  </ImageSlider>

                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                        {ganpati.name}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#d32f2f', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                        ₹{ganpati.price.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1} mb={1.5} flexWrap="wrap">
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                        <Forest sx={{ fontSize: 14 }} /> {ganpati.height}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                        <Star sx={{ fontSize: 14 }} /> {ganpati.rating || 0}
                      </Typography>
                    </Box>

                    <Chip
                      label={`${ganpati.availableSlots} ${t('ganpati.available')}`}
                      size="small"
                      color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                      sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, mb: 1.5, height: 24 }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEnquiryDialog(ganpati);
                      }}
                      startIcon={<WhatsApp />}
                      sx={{ 
                        bgcolor: '#25D366', 
                        '&:hover': { bgcolor: '#128C7E' },
                        borderRadius: 50,
                        py: { xs: 0.8, sm: 0.8 },
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        minHeight: 40
                      }}
                    >
                      {t('ganpati.enquiry')}
                    </Button>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Enquiry Form */}
      <EnquiryForm
  open={enquiryOpen}
  onClose={closeEnquiryDialog}
  ganpati={selectedGanpati}
  mode="enquiry"
  onSuccess={closeEnquiryDialog}
/>
    </OrangeBackground>
  );
}