// src/container/public/GanpatiListing.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Grid, Card, Typography, Button, Box, LinearProgress,
  Container, IconButton,
  InputAdornment, MenuItem, Chip, TextField, Dialog, DialogContent,
  alpha, styled, Skeleton, useMediaQuery, useTheme, Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  Visibility as VisibilityIcon,
  Height as HeightIcon,
  Palette as PaletteIcon,
  Favorite, FavoriteBorder, Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { ganpatiService } from '@/services/GanpatiService';
import { GanpatiResponseDto } from '@/types/MurtiType';
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

const ImageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '100%',
  overflow: 'hidden',
  backgroundColor: '#f5f0eb',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  borderRadius: '20px 20px 0 0',
  '& img': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '6px',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translate(-50%, -50%) scale(1.05)',
    },
  },
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

export default function GanpatiListing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState<boolean>(true);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [filteredList, setFilteredList] = useState<GanpatiResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [heightFilter, setHeightFilter] = useState<string>('all');
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiResponseDto | null>(null);
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [fullImageGanpati, setFullImageGanpati] = useState<GanpatiResponseDto | null>(null);

  const heights: string[] = ['all', '2ft', '3ft', '4ft', '5ft', '6ft', '7ft'];

  const fetchGanpatiList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await ganpatiService.getAll();
      if (response.success && response.data) {
        setGanpatiList(response.data);
        setFilteredList(response.data);
      } else {
        showSnackbar('error', response.message || t('msg.error'));
      }
    } catch {
      showSnackbar('error', t('msg.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchGanpatiList();
  }, [fetchGanpatiList]);

  useEffect(() => {
    let filtered = [...ganpatiList];
    if (searchTerm) {
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (heightFilter !== 'all') {
      filtered = filtered.filter((g) => g.height === heightFilter);
    }
    setFilteredList(filtered);
  }, [ganpatiList, searchTerm, heightFilter]);

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

  const handleCardClick = (ganpati: GanpatiResponseDto): void => {
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
    return { xs: 6, sm: 6, md: 4, lg: 3 };
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container sx={{ px: { xs: 1, sm: 2 } }}>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={i}>
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
            {t('ganpati.collection')}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: alpha('#fff', 0.9), mt: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            {t('ganpati.eco_friendly')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder={t('ganpati.search')}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 3
              }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20 }} /></InputAdornment>
            }}
          />
          <TextField
            select
            size="small"
            value={heightFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeightFilter(e.target.value)}
            sx={{
              width: { xs: 100, sm: 120 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 3
              }
            }}
          >
            {heights.map((h) => (
              <MenuItem key={h} value={h}>
                {h === 'all' ? t('ganpati.all_heights') : h}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {filteredList.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="white">{t('table.no_data')}</Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {filteredList.map((ganpati, index) => (
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
                        src={ganpati.images?.[0] || '/placeholder.jpg'}
                        alt={ganpati.name}
                        loading="lazy"
                      />
                      <Chip
                        label={`${ganpati.availableSlots} ${t('ganpati.available')}`}
                        size="small"
                        color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: { xs: '0.45rem', sm: '0.6rem' },
                          fontWeight: 600,
                          height: { xs: 18, sm: 20 },
                          zIndex: 2,
                        }}
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 2 }}
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
                                <Favorite sx={{ color: '#d32f2f', fontSize: { xs: 14, sm: 18 } }} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="unliked"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <FavoriteBorder sx={{ fontSize: { xs: 14, sm: 18 } }} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <Typography variant="caption" sx={{ ml: 0.3, fontWeight: 600, fontSize: { xs: '0.45rem', sm: '0.6rem' } }}>
                            {ganpati.likes || 0}
                          </Typography>
                        </IconButton>
                      </motion.div>
                    </ImageWrapper>

                    <Box sx={{ p: { xs: 1, sm: 1.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.95rem' }, mb: 0.5 }}>
                        {ganpati.name}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
                          <HeightIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#666' }} />
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.45rem', sm: '0.7rem' } }}>
                            {ganpati.height}
                          </Typography>
                          <PaletteIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#666', ml: 0.3 }} />
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.45rem', sm: '0.7rem' } }}>
                            {ganpati.material}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                          ₹{ganpati.price.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ganpati/${ganpati.id}`);
                          }}
                          startIcon={<VisibilityIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
                          sx={{
                            borderRadius: 2,
                            fontSize: { xs: '0.45rem', sm: '0.7rem' },
                            flex: 1,
                            py: { xs: 0.3, sm: 0.5 },
                            borderColor: '#d32f2f',
                            color: '#d32f2f',
                            minHeight: { xs: 28, sm: 36 },
                            px: { xs: 0.5, sm: 1 },
                            '&:hover': {
                              borderColor: '#b71c1c',
                              background: alpha('#d32f2f', 0.05),
                            }
                          }}
                        >
                          {t('ganpati.details')}
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEnquiryDialog(ganpati);
                          }}
                          startIcon={<WhatsAppIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
                          sx={{
                            borderRadius: 2,
                            fontSize: { xs: '0.45rem', sm: '0.7rem' },
                            flex: 1,
                            py: { xs: 0.3, sm: 0.5 },
                            bgcolor: '#25D366',
                            minHeight: { xs: 28, sm: 36 },
                            px: { xs: 0.5, sm: 1 },
                            '&:hover': { bgcolor: '#128C7E' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {t('ganpati.enquiry')}
                        </Button>
                      </Box>
                    </Box>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
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
                  src={fullImageGanpati.images?.[0] || '/placeholder.jpg'}
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
                    startIcon={<WhatsAppIcon />}
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