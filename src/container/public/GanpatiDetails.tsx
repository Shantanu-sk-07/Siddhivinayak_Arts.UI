// src/container/public/GanpatiDetails.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Paper, Chip, Rating, LinearProgress,
  Container, IconButton, Divider, Dialog, DialogContent,
  alpha, styled, Skeleton
} from '@mui/material';
import {
  WhatsApp, Share, Height, Brush,
  EmojiEvents, Verified, Favorite, FavoriteBorder, Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { ganpatiService } from '@/services/GanpatiService';
import { GanpatiResponseDto } from '@/types/MurtiType';
import { useTranslation } from 'react-i18next';
import EnquiryForm from '@/container/public/EnquiryForm';

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '12px 0',
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  maxHeight: '85vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#d32f2f',
    borderRadius: '4px',
  },
}));

const FullScreenImageDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(0,0,0,0.95)',
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
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

export default function GanpatiDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [ganpati, setGanpati] = useState<GanpatiResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const fetchGanpatiDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await ganpatiService.getById(id);
      if (response.success && response.data) {
        setGanpati(response.data);
        setSelectedImage(response.data.images?.[0] || '');
        setLikeCount(response.data.likes || 0);
        setIsLiked(response.data.likedBy?.includes('user_id') || false);
      } else {
        showSnackbar('error', response.message || t('ganpati.not_found'));
        navigate('/ganpati');
      }
    } catch {
      showSnackbar('error', t('msg.error'));
      navigate('/ganpati');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    fetchGanpatiDetails();
  }, [fetchGanpatiDetails]);

  const handleLike = async (): Promise<void> => {
    if (!ganpati) return;
    try {
      const response = await ganpatiService.toggleLike(ganpati.id);
      if (response.success) {
        setIsLiked(response.data.likedBy.includes('user_id'));
        setLikeCount(response.data.likes);
      }
    } catch {
      showSnackbar('error', t('msg.error'));
    }
  };

  const openEnquiryDialog = (): void => {
    setEnquiryOpen(true);
  };

  const closeEnquiryDialog = (): void => {
    setEnquiryOpen(false);
  };

  const handleShare = async (): Promise<void> => {
    const shareData = {
      title: ganpati?.name,
      text: `${ganpati?.name} - ${t('app.name')}`,
      url: window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { copyToClipboard(); }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(window.location.href);
    showSnackbar('success', t('common.link_copied'));
  };

  if (loading) {
    return (
      <OrangeBackground>
        <Container sx={{ px: { xs: 1, sm: 2 } }}>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
            <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
            <Skeleton variant="text" height={24} />
            <Skeleton variant="text" height={24} width="60%" />
          </Box>
        </Container>
      </OrangeBackground>
    );
  }

  if (!ganpati) {
    return (
      <OrangeBackground>
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="white">{t('ganpati.not_found')}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, bgcolor: '#d32f2f' }} 
            onClick={() => navigate('/ganpati')}
          >
            {t('ganpati.back_to_collection')}
          </Button>
        </Container>
      </OrangeBackground>
    );
  }

  return (
    <OrangeBackground>
      <Container sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/ganpati')} 
          sx={{ 
            mb: 1.5, 
            color: 'white',
            minHeight: 36,
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            '&:hover': { bgcolor: alpha('#fff', 0.1) }
          }}
        >
          {t('common.back')}
        </Button>

        <GlassCard sx={{ mb: 1.5 }}>
          <Paper 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden', 
              mb: 1.5,
              position: 'relative',
              cursor: 'pointer',
              maxHeight: { xs: 250, sm: 300, md: 350 },
            }}
            onClick={() => setImageDialogOpen(true)}
          >
            <Box
              component="img"
              src={selectedImage}
              alt={ganpati.name}
              sx={{ 
                width: '100%', 
                height: '100%',
                maxHeight: { xs: 250, sm: 300, md: 350 },
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 1.5,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                opacity: { xs: 1, sm: 0 },
                transition: 'opacity 0.3s ease',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem' }}>
                {t('common.click_to_enlarge')}
              </Typography>
            </Box>
          </Paper>

          {ganpati.images && ganpati.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', mb: 1.5, pb: 0.5 }}>
              {ganpati.images.map((img, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={img}
                  sx={{
                    width: { xs: 40, sm: 50 },
                    height: { xs: 40, sm: 50 },
                    borderRadius: 1,
                    objectFit: 'cover',
                    border: selectedImage === img ? '2px solid #d32f2f' : '1px solid #ddd',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              {ganpati.name}
            </Typography>
            <IconButton onClick={handleLike} sx={{ color: isLiked ? '#d32f2f' : 'inherit', p: 0.5 }}>
              {isLiked ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                {likeCount}
              </Typography>
            </IconButton>
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5} mb={1} flexWrap="wrap">
            <Rating value={ganpati.rating || 0} precision={0.5} size="small" readOnly />
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
              ({ganpati.rating || 0})
            </Typography>
            <Chip
              label={`${ganpati.availableSlots} ${t('ganpati.available')}`}
              size="small"
              color={ganpati.availableSlots > 0 ? 'success' : 'error'}
              sx={{ height: 20, fontSize: '0.6rem' }}
            />
          </Box>

          <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 700, mb: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            ₹{ganpati.price.toLocaleString()}
          </Typography>

          {ganpati.description && (
            <Typography variant="body2" color="textSecondary" paragraph sx={{ 
              lineHeight: 1.4, 
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              maxHeight: { xs: 60, sm: 80 },
              overflowY: 'auto',
            }}>
              {ganpati.description}
            </Typography>
          )}

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={0.5} sx={{ mb: 1 }}>
            <Grid size={6}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Height sx={{ fontSize: 14, color: '#666' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' } }}>
                    {t('ganpati.height')}
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                    {ganpati.height}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Brush sx={{ fontSize: 14, color: '#666' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' } }}>
                    {t('ganpati.material')}
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                    {ganpati.material}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {ganpati.achievements && ganpati.achievements.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" display="flex" alignItems="center" gap={0.5} sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, color: '#666' }}>
                <EmojiEvents sx={{ fontSize: 12 }} /> {t('ganpati.achievements')}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {ganpati.achievements.map((ach, idx) => (
                  <Chip 
                    key={idx} 
                    icon={<Verified sx={{ fontSize: 12 }} />} 
                    label={ach} 
                    size="small" 
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.55rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={openEnquiryDialog}
              startIcon={<WhatsApp />}
              sx={{ 
                bgcolor: '#25D366', 
                py: { xs: 0.8, sm: 1 }, 
                borderRadius: 50,
                minHeight: 36,
                flex: 1,
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                '&:hover': { bgcolor: '#128C7E' }
              }}
            >
              {t('ganpati.enquiry')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = 'tel:+919876543210'}
              sx={{ 
                py: { xs: 0.8, sm: 1 }, 
                borderRadius: 50, 
                borderColor: '#d32f2f', 
                color: '#d32f2f',
                minHeight: 36,
                flex: { xs: 1, sm: 0.5 },
                fontSize: { xs: '0.65rem', sm: '0.75rem' }
              }}
            >
              {t('common.call')}
            </Button>
            <IconButton 
              onClick={handleShare} 
              sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 2, 
                minHeight: 36, 
                minWidth: 36,
                bgcolor: 'white'
              }}
            >
              <Share sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </GlassCard>
      </Container>

      <FullScreenImageDialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        fullScreen
      >
        <DialogContent>
          <IconButton
            onClick={() => setImageDialogOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={selectedImage}
            alt={ganpati.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white',
              p: 2,
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              {ganpati.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
              {ganpati.height} • {ganpati.material}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<WhatsApp />}
                onClick={() => {
                  setImageDialogOpen(false);
                  openEnquiryDialog();
                }}
                sx={{ 
                  bgcolor: '#25D366', 
                  '&:hover': { bgcolor: '#128C7E' },
                  py: { xs: 0.8, sm: 1 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  minHeight: 36,
                }}
              >
                {t('ganpati.enquiry')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Favorite />}
                onClick={handleLike}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white', 
                  '&:hover': { borderColor: '#d32f2f', color: '#d32f2f' },
                  py: { xs: 0.8, sm: 1 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  minHeight: 36,
                }}
              >
                {likeCount}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </FullScreenImageDialog>

      <EnquiryForm
        open={enquiryOpen}
        onClose={closeEnquiryDialog}
        ganpati={ganpati}
        mode="enquiry"
        onSuccess={closeEnquiryDialog}
      />
    </OrangeBackground>
  );
}