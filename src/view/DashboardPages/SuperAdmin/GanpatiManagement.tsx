import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Paper, Grid, Switch, FormControlLabel, LinearProgress, 
  Alert, Slide, IconButton, Card, CardContent, Avatar,
  useTheme, alpha, styled, Divider, Stack, useMediaQuery,
  FormHelperText, Tooltip, Badge, TextField as MuiTextField
} from '@mui/material';
import { 
  Add, Close, Info, Warning, CheckCircle, Edit, Delete, Visibility,
  Image as ImageIcon, NavigateBefore, NavigateNext,
  ZoomIn, ZoomOut, Fullscreen, FullscreenExit, Refresh, Star, 
  Height, AttachMoney, Brush, Palette, Description, LocalOffer,
  Inventory
} from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import TextInputField from '@/components/controlled/TextInputField';
import NumericField from '@/components/controlled/NumericField';
import DropdownField from '@/components/controlled/DropdownField';
import PhotoUpload from '@/components/controlled/PhotoUpload';
import { compressMultipleImages } from '@/utils/imageCompressor';
import { adminService } from '@/services/AdminService';
import { GanpatiResponseDto, GanpatiFormData } from '@/types';
import { BookingResponseDto } from '@/types';

type GanpatiRecord = GanpatiResponseDto & Record<string, unknown>;

interface GanpatiWithBookings extends GanpatiResponseDto {
  confirmedBookings?: number;
}

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

const StyledButton = styled(Button)({
  borderRadius: 30,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 28px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
});

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

const FormSection = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.96),
  borderRadius: 16,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}));

const FormSectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  display: 'inline-block',
}));

const ImageViewerDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: 'rgba(0,0,0,0.95)',
    borderRadius: 20,
    maxWidth: '90vw',
    maxHeight: '90vh',
  }
});

const heightOptions = [
  { value: '2ft', label: '2 Feet' }, { value: '3ft', label: '3 Feet' },
  { value: '4ft', label: '4 Feet' }, { value: '5ft', label: '5 Feet' },
  { value: '6ft', label: '6 Feet' }, { value: '7ft', label: '7 Feet' },
];

const materialOptions = [
  { value: 'Eco Friendly', label: 'Eco Friendly' }, { value: 'Clay', label: 'Clay' },
  { value: 'Plaster of Paris', label: 'Plaster of Paris' },
];

const colorOptions = [
  { value: 'Traditional', label: 'Traditional' }, { value: 'Modern', label: 'Modern' },
  { value: 'Royal', label: 'Royal' }, { value: 'Premium', label: 'Premium' },
];

export default function GanpatiManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ganpatiList, setGanpatiList] = useState<GanpatiWithBookings[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingGanpati, setEditingGanpati] = useState<GanpatiWithBookings | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiWithBookings | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const [imageViewerOpen, setImageViewerOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [achievementsList, setAchievementsList] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState<string>('');

  const methods = useForm<GanpatiFormData>({
    defaultValues: {
      name: '', height: '', price: 0, material: '', colorTheme: '',
      description: '', totalSlots: 0, images: [], isActive: true,
    },
  });

  const { watch } = methods;

  useEffect(() => { fetchGanpatiList(); }, []);

  const fetchGanpatiList = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllGanpati();
      if (response.success && response.data) {
        const bookingsResponse = await adminService.getAllBookings();
        const confirmedBookingsMap = new Map<string, number>();
        
        if (bookingsResponse.success && bookingsResponse.data) {
          bookingsResponse.data.forEach((booking: BookingResponseDto) => {
            if (booking.status === 'CONFIRMED' || booking.status === 'APPROVED') {
              const count = confirmedBookingsMap.get(booking.ganpatiId) || 0;
              confirmedBookingsMap.set(booking.ganpatiId, count + 1);
            }
          });
        }
        
        const ganpatiWithBookings: GanpatiWithBookings[] = response.data.map((ganpati: GanpatiResponseDto) => {
          const confirmedBookings = confirmedBookingsMap.get(ganpati.id) || 0;
          return {
            ...ganpati,
            confirmedBookings,
            availableSlots: ganpati.totalSlots - confirmedBookings
          };
        });
        
        setGanpatiList(ganpatiWithBookings);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch Ganpati list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingGanpati(null);
    setAchievementsList([]);
    setNewAchievement('');
    methods.reset({
      name: '', height: '', price: 0, material: '', colorTheme: '',
      description: '', totalSlots: 0, images: [], isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (ganpati: GanpatiWithBookings) => {
    setEditingGanpati(ganpati);
    setAchievementsList(ganpati.achievements || []);
    setNewAchievement('');
    methods.reset({
      name: ganpati.name, height: ganpati.height, price: ganpati.price,
      material: ganpati.material, colorTheme: ganpati.colorTheme,
      description: ganpati.description, totalSlots: ganpati.totalSlots,
      images: ganpati.images, isActive: ganpati.isActive
    });
    setDialogOpen(true);
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setAchievementsList([...achievementsList, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievementsList(achievementsList.filter((_, i) => i !== index));
  };

  const validateTotalSlots = (value: number, confirmedBookings: number): string | null => {
    if (value < confirmedBookings) {
      return `Cannot reduce total slots to ${value}. Currently ${confirmedBookings} confirmed bookings exist. Minimum allowed slots: ${confirmedBookings}`;
    }
    return null;
  };

  const handleDelete = async (ganpati: GanpatiWithBookings) => {
    const confirmedBookingsCount = ganpati.confirmedBookings || 0;
    let warningMessage = `Are you sure you want to delete "${ganpati.name}"?`;
    
    if (confirmedBookingsCount > 0) {
      warningMessage = `⚠️ WARNING: This Ganpati has ${confirmedBookingsCount} confirmed booking(s).\n\nDeleting this Ganpati will also delete all associated bookings.\n\nThis action CANNOT be undone!\n\nAre you sure you want to proceed?`;
    }
    
    await showConfirmation({
      message: warningMessage,
      title: confirmedBookingsCount > 0 ? "⚠️ Delete Ganpati with Bookings" : "Delete Ganpati",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      confirmColor: "error",
      icon: confirmedBookingsCount > 0 ? "⚠️" : "🗑️",
      description: confirmedBookingsCount > 0 ? `This will affect ${confirmedBookingsCount} customer booking(s)` : "This action cannot be undone",
      onConfirm: async () => {
        const response = await adminService.deleteGanpati(ganpati.id);
        if (response.success) {
          showSnackbar('success', `"${ganpati.name}" deleted successfully${confirmedBookingsCount > 0 ? ` along with ${confirmedBookingsCount} booking(s)` : ''}`);
          await fetchGanpatiList();
        } else {
          showSnackbar('error', response.message || 'Failed to delete');
        }
      }
    });
  };

  const handleView = (ganpati: GanpatiWithBookings) => {
    setSelectedGanpati(ganpati);
    setViewDialogOpen(true);
  };

  const handleOpenImageViewer = (images: string[], index: number) => {
    setViewerImages(images);
    setCurrentImageIndex(index);
    setZoomLevel(1);
    setImageViewerOpen(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % viewerImages.length);
    setZoomLevel(1);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleToggleFullscreen = () => {
    const elem = document.getElementById('image-viewer-content');
    if (!isFullscreen) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const onSubmit = async (data: GanpatiFormData) => {
    if (editingGanpati && editingGanpati.confirmedBookings) {
      const slotError = validateTotalSlots(data.totalSlots, editingGanpati.confirmedBookings);
      if (slotError) {
        showSnackbar('error', slotError);
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('height', data.height);
      formData.append('price', data.price.toString());
      formData.append('material', data.material);
      formData.append('colorTheme', data.colorTheme);
      formData.append('description', data.description || '');
      formData.append('totalSlots', data.totalSlots.toString());
      formData.append('isActive', data.isActive.toString());

      if (achievementsList.length) {
        achievementsList.forEach(ach => formData.append('achievements', ach));
      }

      const existingImages: string[] = [];
      const newFiles: File[] = [];
      for (const image of data.images) {
        if (typeof image === 'string') existingImages.push(image);
        else if (image instanceof File) newFiles.push(image);
      }
      existingImages.forEach(url => formData.append('existingImages', url));

      if (newFiles.length) {
        const compressed = await compressMultipleImages(newFiles, {
          maxWidth: 1024, maxHeight: 1024, quality: 0.7, maxSizeKB: 300
        });
        compressed.forEach(file => formData.append('images', file));
      }

      const response = editingGanpati
        ? await adminService.updateGanpati(editingGanpati.id, formData)
        : await adminService.createGanpati(formData);

      if (response.success) {
        showSnackbar('success', editingGanpati ? 'Updated successfully' : 'Created successfully');
        setDialogOpen(false);
        await fetchGanpatiList();
      } else {
        showSnackbar('error', response.message || 'Failed to save');
      }
    } catch {
      showSnackbar('error', 'Failed to save Ganpati');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<GanpatiRecord>[] = [
    { 
      key: 'name', 
      label: 'Ganpati',
      render: (row) => {
        const ganpati = row as GanpatiWithBookings;
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              src={ganpati.images?.[0]} 
              sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: 12, border: '2px solid', borderColor: 'primary.main' }}
            />
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                {ganpati.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {ganpati.id?.slice(0, 8)}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    { 
      key: 'price', 
      label: 'Price', 
      render: (row) => (
        <Typography fontWeight={600} color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          ₹{(row as GanpatiWithBookings).price.toLocaleString()}
        </Typography>
      )
    },
    { 
      key: 'confirmedBookings', 
      label: 'Booked',
      render: (row) => {
        const count = (row as GanpatiWithBookings).confirmedBookings || 0;
        return (
          <Chip 
            label={`${count} Booked`}
            size="small"
            color={count > 0 ? 'warning' : 'default'}
            sx={{ fontWeight: 500, borderRadius: 8 }}
          />
        );
      }
    },
    { 
      key: 'availableSlots', 
      label: 'Available',
      render: (row) => {
        const available = (row as GanpatiWithBookings).availableSlots || 0;
        return (
          <Chip 
            label={`${available} Available`}
            size="small"
            color={available > 0 ? 'success' : 'error'}
            sx={{ fontWeight: 500, borderRadius: 8 }}
          />
        );
      }
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (row) => (
        <Chip 
          label={(row as GanpatiWithBookings).isActive ? 'Active' : 'Inactive'} 
          color={(row as GanpatiWithBookings).isActive ? 'success' : 'default'} 
          size="small"
          sx={{ borderRadius: 8 }}
        />
      ) 
    },
    { 
      key: ACTION_KEY, 
      label: 'Actions',
      render: (row) => {
        const ganpati = row as GanpatiWithBookings;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton 
                size={isMobile ? "small" : "medium"}
                onClick={() => handleView(ganpati)}
                sx={{ color: 'info.main', '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) } }}
              >
                <Visibility fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton 
                size={isMobile ? "small" : "medium"}
                onClick={() => handleEdit(ganpati)}
                sx={{ color: 'warning.main', '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) } }}
              >
                <Edit fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                size={isMobile ? "small" : "medium"}
                onClick={() => handleDelete(ganpati)}
                sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
              >
                <Delete fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      }
    },
  ];

  const getResponsiveColumns = () => {
    if (isMobile) {
      return columns.filter(col => !['height', 'totalSlots'].includes(col.key));
    }
    return columns;
  };

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
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 700, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                  backgroundClip: 'text', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Ganpati Management
              </Typography>
              {!isMobile && (
                <Typography variant="body2" color="textSecondary">
                  Manage your divine collection with ease
                </Typography>
              )}
            </Box>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StyledButton
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
              fullWidth={isMobile}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                color: 'white',
              }}
            >
              Add New Ganpati
            </StyledButton>
          </motion.div>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Total Ganpati
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: 'primary.main' }}>
                        {ganpatiList.length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                      <Info sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Total Bookings
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: 'warning.main' }}>
                        {ganpatiList.reduce((sum, g) => sum + (g.confirmedBookings || 0), 0)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                      <Warning sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Available Slots
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: 'success.main' }}>
                        {ganpatiList.reduce((sum, g) => sum + (g.availableSlots || 0), 0)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                      <CheckCircle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Active Ganpati
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: 'info.main' }}>
                        {ganpatiList.filter(g => g.isActive).length}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                      <Info sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        </Grid>

        <GlassPaper>
          <UniversalTable<GanpatiRecord>
            data={ganpatiList as GanpatiRecord[]}
            columns={getResponsiveColumns()}
            loading={loading}
            rowsPerPage={isMobile ? 5 : 10}
            showSearch={!isMobile}
            showExport={!isMobile}
            actions={{
              view: (row) => handleView(row as GanpatiWithBookings),
              edit: (row) => handleEdit(row as GanpatiWithBookings),
              delete: (row) => handleDelete(row as GanpatiWithBookings),
            }}
          />
        </GlassPaper>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => !submitting && setDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Slide}
          PaperProps={{
            sx: { borderRadius: 4, background: alpha(theme.palette.common.white, 0.98), backdropFilter: 'blur(10px)', maxHeight: '90vh' }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 }
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={600}>
                  {editingGanpati ? 'Edit Ganpati' : 'Add New Ganpati'}
                </Typography>
                {!isMobile && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {editingGanpati ? 'Update the details below' : 'Fill in the details to add a new Ganpati'}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
            <FormProvider {...methods}>
              <form id="ganpati-form" onSubmit={methods.handleSubmit(onSubmit)}>
                {/* Basic Information Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Info fontSize="small" color="primary" />
                      Basic Information
                    </Box>
                  </FormSectionTitle>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextInputField
                        name="name"
                        label="Ganpati Name"
                        required
                        inputType="alphabet"
                        maxLength={100}
                        placeholder="Enter Ganpati name"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DropdownField 
                        name="height" 
                        label="Height" 
                        options={heightOptions} 
                        required 
                      />
                    </Grid>
                  </Grid>
                </FormSection>

                {/* Pricing & Inventory Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachMoney fontSize="small" color="primary" />
                      Pricing & Inventory
                    </Box>
                  </FormSectionTitle>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextInputField
                        name="price"
                        label="Price (₹)"
                        required
                        inputType="numbers"
                        placeholder="Enter price"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <NumericField 
                        name="totalSlots" 
                        label="Total Slots" 
                        required 
                        min={1}
                      />
                      {editingGanpati && editingGanpati.confirmedBookings && editingGanpati.confirmedBookings > 0 && (
                        <Alert severity="info" sx={{ mt: 1, py: 0, borderRadius: 2 }}>
                          <Typography variant="caption">
                            Currently {editingGanpati.confirmedBookings} confirmed booking(s). Minimum slots allowed: {editingGanpati.confirmedBookings}
                          </Typography>
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </FormSection>

                {/* Material & Design Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Brush fontSize="small" color="primary" />
                      Material & Design
                    </Box>
                  </FormSectionTitle>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DropdownField 
                        name="material" 
                        label="Material" 
                        options={materialOptions} 
                        required 
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DropdownField 
                        name="colorTheme" 
                        label="Color Theme" 
                        options={colorOptions} 
                        required 
                      />
                    </Grid>
                  </Grid>
                </FormSection>

                {/* Description Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Description fontSize="small" color="primary" />
                      Description
                    </Box>
                  </FormSectionTitle>
                  <TextInputField
                    name="description"
                    label="Description"
                    inputType="textarea"
                    rows={3}
                    maxLength={1000}
                    placeholder="Enter detailed description of the Ganpati..."
                  />
                </FormSection>

                {/* Achievements Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocalOffer fontSize="small" color="primary" />
                      Achievements & Awards
                    </Box>
                  </FormSectionTitle>
                  <Box sx={{ mb: 2 }}>
                    {achievementsList.map((achievement, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                        <MuiTextField
                          fullWidth
                          size="small"
                          value={achievement}
                          disabled
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                        />
                        <IconButton onClick={() => handleRemoveAchievement(index)} color="error" size="small">
                          <Close />
                        </IconButton>
                      </Box>
                    ))}
                    <Box display="flex" alignItems="center" gap={1}>
                      <MuiTextField
                        fullWidth
                        size="small"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="Enter achievement (e.g., Best Design Award 2024)"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAchievement()}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddAchievement}
                        startIcon={<Add />}
                        sx={{ borderRadius: 30, minWidth: 'auto' }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>
                </FormSection>

                {/* Images Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <ImageIcon fontSize="small" color="primary" />
                      Gallery Images
                    </Box>
                  </FormSectionTitle>
                  <PhotoUpload 
                    name="images" 
                    label="Ganpati Images" 
                    maxFiles={5} 
                    required={!editingGanpati} 
                    accept="image/jpeg,image/png,image/jpg,image/webp" 
                  />
                  <FormHelperText sx={{ mt: 1 }}>
                    Upload up to 5 images. First image will be used as thumbnail.
                  </FormHelperText>
                </FormSection>

                {/* Status Section */}
                <FormSection>
                  <FormSectionTitle variant="subtitle1">
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle fontSize="small" color="primary" />
                      Status
                    </Box>
                  </FormSectionTitle>
                  <FormControlLabel 
                    control={
                      <Switch 
                        {...methods.register('isActive')} 
                        checked={watch('isActive')} 
                      />
                    } 
                    label={watch('isActive') ? 'Active' : 'Inactive'}
                  />
                </FormSection>

                {submitting && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
              </form>
            </FormProvider>
          </DialogContent>
          
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, gap: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting} variant="outlined" size={isMobile ? "small" : "medium"} sx={{ borderRadius: 30, px: 4 }}>
              Cancel
            </Button>
            <Button type="submit" form="ganpati-form" variant="contained" disabled={submitting} size={isMobile ? "small" : "medium"} sx={{ borderRadius: 30, px: 4 }}>
              {submitting ? 'Saving...' : editingGanpati ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, background: alpha(theme.palette.common.white, 0.98), backdropFilter: 'blur(10px)' }
          }}
        >
          {selectedGanpati && (
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
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
                    {selectedGanpati.name}
                  </Typography>
                  <Typography variant="caption">ID: {selectedGanpati.id?.slice(0, 8)}</Typography>
                </Box>
                <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              
              <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <StyledCard sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                        <ImageIcon color="primary" /> Gallery
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          gap: 1.5, 
                          flexWrap: 'wrap', 
                          justifyContent: 'center',
                          maxHeight: 400,
                          overflowY: 'auto',
                          p: 1
                        }}
                      >
                        {selectedGanpati.images?.map((img, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              badgeContent={idx + 1}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                  color: 'white',
                                }
                              }}
                            >
                              <Avatar
                                src={img}
                                variant="rounded"
                                onClick={() => handleOpenImageViewer(selectedGanpati.images || [], idx)}
                                sx={{ 
                                  width: isMobile ? 100 : 140, 
                                  height: isMobile ? 100 : 140, 
                                  borderRadius: 3,
                                  cursor: 'pointer',
                                  border: '2px solid',
                                  borderColor: 'primary.main',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    borderColor: 'primary.dark',
                                    transform: 'scale(1.02)',
                                  }
                                }}
                              />
                            </Badge>
                          </motion.div>
                        ))}
                      </Box>
                    </StyledCard>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <StyledCard sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                        <Info color="primary" /> Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Height fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Height</Typography>
                              <Typography variant="body2" fontWeight={500}>{selectedGanpati.height}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Brush fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Material</Typography>
                              <Typography variant="body2" fontWeight={500}>{selectedGanpati.material}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Palette fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Color Theme</Typography>
                              <Typography variant="body2" fontWeight={500}>{selectedGanpati.colorTheme}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AttachMoney fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Price</Typography>
                              <Typography variant="body1" color="primary" fontWeight={600}>₹{selectedGanpati.price.toLocaleString()}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Inventory fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Total Slots</Typography>
                              <Typography variant="body2" fontWeight={500}>{selectedGanpati.totalSlots}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Warning fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Booked Slots</Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ color: 'warning.main' }}>{selectedGanpati.confirmedBookings || 0}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircle fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="textSecondary">Available Slots</Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ color: 'success.main' }}>{selectedGanpati.availableSlots}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Chip 
                            label={selectedGanpati.isActive ? 'Active' : 'Inactive'} 
                            color={selectedGanpati.isActive ? 'success' : 'default'} 
                            size="small"
                            sx={{ borderRadius: 8 }}
                          />
                        </Grid>
                      </Grid>
                    </StyledCard>

                    {selectedGanpati.achievements?.length > 0 && (
                      <StyledCard sx={{ mt: 2, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                          <Star sx={{ color: 'warning.main' }} /> Achievements
                        </Typography>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {selectedGanpati.achievements.map((ach, idx) => (
                            <Chip key={idx} label={ach} size="small" color="warning" variant="outlined" sx={{ borderRadius: 8 }} />
                          ))}
                        </Box>
                      </StyledCard>
                    )}

                    <StyledCard sx={{ mt: 2, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                        <Description color="info" /> Description
                      </Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                        {selectedGanpati.description || 'No description available'}
                      </Typography>
                    </StyledCard>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button onClick={() => setViewDialogOpen(false)} variant="contained" fullWidth={isMobile} size={isMobile ? "small" : "medium"} sx={{ borderRadius: 30, px: 4 }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Image Viewer Dialog */}
        <ImageViewerDialog
          open={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          maxWidth="xl"
          fullWidth
        >
          <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '70vh' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                display: 'flex',
                gap: 1,
                bgcolor: alpha(theme.palette.common.black, 0.6),
                borderRadius: 4,
                p: 1,
              }}
            >
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn} sx={{ color: 'white' }}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut} sx={{ color: 'white' }}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Zoom">
                <IconButton onClick={handleResetZoom} sx={{ color: 'white' }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Fullscreen">
                <IconButton onClick={handleToggleFullscreen} sx={{ color: 'white' }}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </Box>

            {viewerImages.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    bgcolor: alpha(theme.palette.common.black, 0.6),
                    color: 'white',
                    '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.8) },
                  }}
                >
                  <NavigateBefore sx={{ fontSize: 40 }} />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    bgcolor: alpha(theme.palette.common.black, 0.6),
                    color: 'white',
                    '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.8) },
                  }}
                >
                  <NavigateNext sx={{ fontSize: 40 }} />
                </IconButton>
              </>
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                bgcolor: alpha(theme.palette.common.black, 0.6),
                borderRadius: 4,
                px: 2,
                py: 0.5,
                color: 'white',
              }}
            >
              <Typography variant="caption">
                {currentImageIndex + 1} / {viewerImages.length}
              </Typography>
            </Box>

            <Box
              id="image-viewer-content"
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
              }}
            >
              <motion.img
                key={currentImageIndex}
                src={viewerImages[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: zoomLevel }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(90vh - 100px)',
                  objectFit: 'contain',
                  borderRadius: 16,
                }}
              />
            </Box>
          </Box>
        </ImageViewerDialog>
      </Box>
    </motion.div>
  );
}