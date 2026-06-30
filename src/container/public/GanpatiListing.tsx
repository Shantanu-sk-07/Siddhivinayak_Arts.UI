// src/container/public/GanpatiListing.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Grid, Card, Typography, Button, Box, LinearProgress,
  Container, IconButton, 
  InputAdornment, MenuItem, Chip, TextField,
  alpha, styled, Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  Visibility as VisibilityIcon,
  Height as HeightIcon,
  Palette as PaletteIcon,
  Favorite, FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

export default function GanpatiListing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [filteredList, setFilteredList] = useState<GanpatiResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [heightFilter, setHeightFilter] = useState<string>('all');
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiResponseDto | null>(null);

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

  if (loading) {
    return (
      <OrangeBackground>
        <Container sx={{ px: { xs: 1, sm: 2 } }}>
          <LinearProgress sx={{ bgcolor: '#d32f2f' }} />
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
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
            {filteredList.map((ganpati) => (
              <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={ganpati.id}>
                <Card sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-4px)' },
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <Box sx={{ position: 'relative', bgcolor: '#f5f5f5' }}>
                    <Box
                      component="img"
                      src={ganpati.images?.[0] || '/placeholder.jpg'}
                      alt={ganpati.name}
                      sx={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.03)' }
                      }}
                    />
                    <Chip
                      label={`${ganpati.availableSlots} ${t('ganpati.available')}`}
                      size="small"
                      color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        fontSize: { xs: '0.5rem', sm: '0.6rem' },
                        fontWeight: 600,
                        height: { xs: 18, sm: 20 }
                      }}
                    />
                    <IconButton
                      onClick={(e) => handleLike(ganpati.id, e)}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(4px)',
                        padding: { xs: '2px', sm: '4px' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                      }}
                    >
                      {ganpati.likedBy?.includes('user_id') ? (
                        <Favorite sx={{ color: '#d32f2f', fontSize: { xs: 14, sm: 18 } }} />
                      ) : (
                        <FavoriteBorder sx={{ fontSize: { xs: 14, sm: 18 } }} />
                      )}
                      <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600, fontSize: { xs: '0.5rem', sm: '0.6rem' } }}>
                        {ganpati.likes || 0}
                      </Typography>
                    </IconButton>
                  </Box>

                  <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.95rem' }, mb: 0.5 }}>
                      {ganpati.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
                        <HeightIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#666' }} />
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.5rem', sm: '0.7rem' } }}>
                          {ganpati.height}
                        </Typography>
                        <PaletteIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#666', ml: 0.5 }} />
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.5rem', sm: '0.7rem' } }}>
                          {ganpati.material}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        ₹{ganpati.price.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/ganpati/${ganpati.id}`)}
                        startIcon={<VisibilityIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
                        sx={{ 
                          borderRadius: 2, 
                          fontSize: { xs: '0.5rem', sm: '0.7rem' }, 
                          flex: 1, 
                          py: { xs: 0.3, sm: 0.5 },
                          borderColor: '#d32f2f',
                          color: '#d32f2f',
                          minHeight: { xs: 28, sm: 36 },
                          px: { xs: 0.5, sm: 1 }
                        }}
                      >
                        {t('ganpati.details')}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => openEnquiryDialog(ganpati)}
                        startIcon={<WhatsAppIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />}
                        sx={{ 
                          borderRadius: 2, 
                          fontSize: { xs: '0.5rem', sm: '0.7rem' }, 
                          flex: 1, 
                          py: { xs: 0.3, sm: 0.5 }, 
                          bgcolor: '#25D366',
                          minHeight: { xs: 28, sm: 36 },
                          px: { xs: 0.5, sm: 1 },
                          '&:hover': { bgcolor: '#128C7E' }
                        }}
                      >
                        {t('ganpati.enquiry')}
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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