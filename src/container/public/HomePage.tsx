// src/container/public/HomePage.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Container,
  Chip, alpha, styled, IconButton, Skeleton,
  Button, LinearProgress, Dialog, DialogContent,
  useMediaQuery, useTheme, Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Favorite, FavoriteBorder, WhatsApp, Forest, Star, Close as CloseIcon
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
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: { xs: 'none', sm: 'translateY(-8px) scale(1.01)' },
    boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.2)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const ImageWrapper = styled(Box)({
  position: 'relative',
  width: '100%',
  paddingTop: '100%',
  overflow: 'hidden',
  backgroundColor: '#f5f0eb',
  borderBottom: `1px solid ${alpha('#d32f2f', 0.08)}`,
  borderRadius: '20px 20px 0 0',
  '& img': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translate(-50%, -50%) scale(1.05)',
    },
  },
});

const SliderDots = styled(Box)({
  position: 'absolute',
  bottom: 10,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 6,
  zIndex: 2,
});

const SliderDot = styled('span')<{ active?: boolean }>(({ theme, active }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.6),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
}));

const FullScreenImageDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(0,0,0,0.92)',
    maxWidth: '100vw',
    maxHeight: '100vh',
    margin: 0,
    borderRadius: 0,
    width: '100vw',
    height: '100vh',
    position: 'relative',
  },
  '& .MuiDialogContent-root': {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
});

const ImageWrapperFull = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 'calc(100vh - 180px)',
  padding: '16px',
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: 8,
  },
});

const DetailsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px 24px',
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.9))',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  gap: 12,
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px',
    gap: 8,
  },
}));

interface GanpatiWithImages extends GanpatiResponseDto {
  currentImageIndex: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [ganpatiList, setGanpatiList] = useState<GanpatiWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiResponseDto | null>(null);
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [fullImageGanpati, setFullImageGanpati] = useState<GanpatiWithImages | null>(null);

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

      const ganpatiData: GanpatiWithImages[] = data.map((g) => ({
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

  const handleCardClick = (ganpati: GanpatiWithImages): void => {
    setFullImageGanpati(ganpati);
    setFullImageOpen(true);
  };

  const handleCloseFullImage = (): void => {
    setFullImageOpen(false);
    setFullImageGanpati(null);
  };

  const getGridSize = () => {
    if (isMobile) return { xs: 12 };
    if (isTablet) return { xs: 6, sm: 6 };
    return { xs: 12, sm: 6, md: 4 };
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 2 }}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
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
            <Grid size={getGridSize()} key={ganpati.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ height: '100%' }}
              >
                <StyledCard onClick={() => handleCardClick(ganpati)}>
                  <ImageWrapper>
                    <img
                      src={ganpati.images?.[ganpati.currentImageIndex || 0] || '/placeholder.jpg'}
                      alt={ganpati.name}
                      loading="lazy"
                    />

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
                    >
                      <IconButton
                        onClick={(e) => handleLike(ganpati.id, e)}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.85)',
                          backdropFilter: 'blur(4px)',
                          padding: { xs: '2px', sm: '4px' },
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {ganpati.likedBy?.includes('user_id') ? (
                            <motion.div
                              key="liked"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <Favorite sx={{ color: '#d32f2f', fontSize: { xs: 16, sm: 18 } }} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unliked"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <FavoriteBorder sx={{ fontSize: { xs: 16, sm: 18 } }} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Typography variant="caption" sx={{ ml: 0.3, fontWeight: 600, fontSize: { xs: '0.55rem', sm: '0.65rem' } }}>
                          {ganpati.likes || 0}
                        </Typography>
                      </IconButton>
                    </motion.div>

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
                  </ImageWrapper>

                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                        minHeight: 40,
                        transition: 'all 0.3s ease',
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

      {/* Full Screen Image Dialog */}
      <FullScreenImageDialog
        open={fullImageOpen}
        onClose={handleCloseFullImage}
        fullScreen
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogContent>
          <IconButton
            onClick={handleCloseFullImage}
            sx={{
              position: 'absolute',
              top: { xs: 12, sm: 20 },
              right: { xs: 12, sm: 20 },
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              p: { xs: 1, sm: 1.5 },
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
          </IconButton>

          {fullImageGanpati && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <ImageWrapperFull>
                <img
                  src={fullImageGanpati.images?.[fullImageGanpati.currentImageIndex || 0] || '/placeholder.jpg'}
                  alt={fullImageGanpati.name}
                />
              </ImageWrapperFull>

              <DetailsOverlay>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.8rem' } }}>
                    {fullImageGanpati.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      {fullImageGanpati.height} • {fullImageGanpati.material}
                    </Typography>
                    <Chip
                      label={`${fullImageGanpati.availableSlots} ${t('ganpati.available')}`}
                      size="small"
                      color={fullImageGanpati.availableSlots > 0 ? 'success' : 'error'}
                      sx={{ height: { xs: 20, sm: 24 } }}
                    />
                    <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.3rem' } }}>
                      ₹{fullImageGanpati.price.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1.5} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<WhatsApp />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseFullImage();
                      openEnquiryDialog(fullImageGanpati);
                    }}
                    sx={{
                      bgcolor: '#25D366',
                      '&:hover': { bgcolor: '#128C7E' },
                      borderRadius: 50,
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.8, sm: 1 },
                      fontSize: { xs: '0.7rem', sm: '0.85rem' },
                      minHeight: { xs: 36, sm: 42 },
                    }}
                  >
                    {t('ganpati.enquiry')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseFullImage();
                      navigate(`/ganpati/${fullImageGanpati.id}`);
                    }}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': { borderColor: '#ff6b35', color: '#ff6b35' },
                      borderRadius: 50,
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.8, sm: 1 },
                      fontSize: { xs: '0.7rem', sm: '0.85rem' },
                      minHeight: { xs: 36, sm: 42 },
                    }}
                  >
                    {t('ganpati.details')}
                  </Button>
                </Box>
              </DetailsOverlay>
            </motion.div>
          )}
        </DialogContent>
      </FullScreenImageDialog>

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