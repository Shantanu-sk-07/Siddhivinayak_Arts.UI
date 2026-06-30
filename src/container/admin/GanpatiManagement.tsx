// src/container/admin/GanpatiManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Switch, FormControlLabel, Chip, IconButton, useTheme, alpha, styled,
  LinearProgress, Avatar
  } from '@mui/material';
import {
  Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon,
  Category as CategoryIcon, Height as HeightIcon, AttachMoney as MoneyIcon,
  Palette as PaletteIcon, Inventory as InventoryIcon,
  Image as ImageIcon
  } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import TextInputField from '@/components/controlled/TextInputField';
import NumericField from '@/components/controlled/NumericField';
import DropdownField from '@/components/controlled/DropdownField';
import PhotoUpload from '@/components/controlled/PhotoUpload';
import Paper from '@mui/material/Paper';
import { adminService } from '@/services/AdminService';
import { GanpatiResponseDto, GanpatiFormData } from '@/types/MurtiType';

interface GanpatiRecord extends Record<string, unknown> {
  id: string;
  name: string;
  height: string;
  price: number;
  availableSlots: number;
  isActive: boolean;
  images: string[];
}

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

const ViewDetailRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 1.5, 
    py: 1, 
    borderBottom: '1px solid #f0f0f0',
    '&:last-child': { borderBottom: 'none' }
  }}>
    {icon && <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#666', minWidth: 120, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

const heightOptions = [
  { value: '2ft', label: '2 Feet' },
  { value: '3ft', label: '3 Feet' },
  { value: '4ft', label: '4 Feet' },
  { value: '5ft', label: '5 Feet' },
  { value: '6ft', label: '6 Feet' },
  { value: '7ft', label: '7 Feet' },
];

const materialOptions = [
  { value: 'Eco Friendly', label: 'Eco Friendly' },
  { value: 'Clay', label: 'Clay' },
  { value: 'Plaster of Paris', label: 'Plaster of Paris' },
];

const colorOptions = [
  { value: 'Traditional', label: 'Traditional' },
  { value: 'Modern', label: 'Modern' },
  { value: 'Royal', label: 'Royal' },
  { value: 'Premium', label: 'Premium' },
];

export default function GanpatiManagement() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [editingGanpati, setEditingGanpati] = useState<GanpatiResponseDto | null>(null);
  const [viewGanpati, setViewGanpati] = useState<GanpatiResponseDto | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const methods = useForm<GanpatiFormData>({
    defaultValues: {
      name: '',
      height: '',
      price: 0,
      material: '',
      colorTheme: '',
      totalSlots: 0,
      images: [],
      isActive: true,
    },
  });

  const { watch, reset, handleSubmit, formState: { errors } } = methods;

  const fetchGanpatiList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminService.getAllGanpati();
      if (response.success && response.data) {
        setGanpatiList(response.data);
      } else {
        showSnackbar('error', response.message || t('msg.error'));
      }
    } catch (error) {
      console.error('Error fetching ganpati:', error);
      showSnackbar('error', t('msg.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchGanpatiList();
  }, [fetchGanpatiList]);

  const handleAddNew = (): void => {
    setEditingGanpati(null);
    reset({
      name: '',
      height: '',
      price: 0,
      material: '',
      colorTheme: '',
      totalSlots: 0,
      images: [],
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (ganpati: GanpatiResponseDto): void => {
    setEditingGanpati(ganpati);
    reset({
      name: ganpati.name,
      height: ganpati.height,
      price: ganpati.price,
      material: ganpati.material,
      colorTheme: ganpati.colorTheme,
      totalSlots: ganpati.totalSlots,
      images: ganpati.images || [],
      isActive: ganpati.isActive,
    });
    setDialogOpen(true);
  };

  const handleView = (ganpati: GanpatiResponseDto): void => {
    setViewGanpati(ganpati);
    setViewDialogOpen(true);
  };

  const handleImageClick = (imageUrl: string): void => {
    setSelectedImage(imageUrl);
    setImagePreviewOpen(true);
  };

  const handleDelete = async (ganpati: GanpatiResponseDto): Promise<void> => {
    const confirmed = await showConfirmation(t('msg.delete_confirm'), 'Confirm');
    if (confirmed) {
      try {
        const response = await adminService.deleteGanpati(ganpati.id);
        if (response.success) {
          showSnackbar('success', t('msg.delete_success'));
          await fetchGanpatiList();
        } else {
          showSnackbar('error', response.message || t('msg.error'));
        }
      } catch (error) {
        console.error('Error deleting ganpati:', error);
        showSnackbar('error', t('msg.error'));
      }
    }
  };

  const onSubmit = async (data: GanpatiFormData): Promise<void> => {
    if (Object.keys(errors).length > 0) {
      showSnackbar('warning', t('validation.fix_errors'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('height', data.height);
      formData.append('price', data.price.toString());
      formData.append('material', data.material);
      formData.append('colorTheme', data.colorTheme);
      formData.append('totalSlots', data.totalSlots.toString());
      formData.append('isActive', data.isActive.toString());

      const existingImages: string[] = [];
      const newFiles: File[] = [];

      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          if (typeof image === 'string') {
            existingImages.push(image);
          } else if (image instanceof File) {
            newFiles.push(image);
          }
        }
      }

      existingImages.forEach((url) => formData.append('existingImages', url));
      newFiles.forEach((file) => formData.append('images', file));

      const response = editingGanpati
        ? await adminService.updateGanpati(editingGanpati.id, formData)
        : await adminService.createGanpati(formData);

      if (response && response.success) {
        showSnackbar('success', editingGanpati ? t('msg.update_success') : t('msg.save_success'));
        setDialogOpen(false);
        await fetchGanpatiList();
      } else {
        showSnackbar('error', response?.message || t('msg.error'));
      }
    } catch (error) {
      console.error('Error saving ganpati:', error);
      showSnackbar('error', t('msg.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<GanpatiRecord>[] = [
    {
      key: 'images',
      label: 'Image',
      render: (row) => (
        <Avatar
          src={row.images?.[0] || '/placeholder.jpg'}
          sx={{ 
            width: 50, 
            height: 50, 
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.05)' }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (row.images?.[0]) handleImageClick(row.images[0]);
          }}
        />
      ),
    },
    {
      key: 'name',
      label: t('ganpati.name'),
      render: (row) => <Typography fontWeight={600}>{row.name}</Typography>,
    },
    { key: 'height', label: t('ganpati.height') },
    {
      key: 'price',
      label: t('ganpati.price'),
      render: (row) => (
        <Typography color="primary" fontWeight={600}>
          ₹{row.price.toLocaleString()}
        </Typography>
      ),
    },
    {
      key: 'availableSlots',
      label: t('ganpati.available_slots'),
      render: (row) => (
        <Chip
          label={row.availableSlots}
          size="small"
          color={row.availableSlots > 0 ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'isActive',
      label: t('ganpati.status'),
      render: (row) => (
        <Chip
          label={row.isActive ? t('ganpati.active') : t('ganpati.inactive')}
          color={row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    { key: ACTION_KEY, label: t('table.actions') },
  ];

  const tableData: GanpatiRecord[] = ganpatiList.map((g) => ({
    id: g.id,
    name: g.name,
    height: g.height,
    price: g.price,
    availableSlots: g.availableSlots,
    isActive: g.isActive,
    images: g.images || [],
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {t('admin.ganpati')}
          </Typography>
        </Box>

        <GlassPaper>
          <UniversalTable<GanpatiRecord>
            data={tableData}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            showSearch
            addButton={{
              label: t('ganpati.add_new'),
              onClick: handleAddNew,
              color: 'primary',
              variant: 'contained',
            }}
            actions={{
              view: (row) => {
                const originalGanpati = ganpatiList.find((g) => g.id === row.id);
                if (originalGanpati) handleView(originalGanpati);
              },
              edit: (row) => {
                const originalGanpati = ganpatiList.find((g) => g.id === row.id);
                if (originalGanpati) handleEdit(originalGanpati);
              },
              delete: (row) => {
                const originalGanpati = ganpatiList.find((g) => g.id === row.id);
                if (originalGanpati) handleDelete(originalGanpati);
              },
            }}
            rowClickable
            onRowClick={(row) => {
              const originalGanpati = ganpatiList.find((g) => g.id === row.id);
              if (originalGanpati) handleView(originalGanpati);
            }}
          />
        </GlassPaper>

        <Dialog
          open={dialogOpen}
          onClose={() => !submitting && setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2.5,
              px: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <CategoryIcon />
              <Typography variant="h6" fontWeight={700}>
                {editingGanpati ? 'Edit Ganpati' : 'Add New Ganpati'}
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#faf8f6' }}>
            <FormProvider {...methods}>
              <form id="ganpati-form" onSubmit={handleSubmit(onSubmit)}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="name"
                        label="Ganpati Name"
                        required
                        placeholder="Enter Ganpati name"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="height"
                        label="Height"
                        options={heightOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <NumericField
                        name="price"
                        label="Price (₹)"
                        required
                        min={0}
                        max={1000000000}
                        placeholder="Enter price"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <NumericField
                        name="totalSlots"
                        label="Total Slots"
                        required
                        min={1}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="material"
                        label="Material"
                        options={materialOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="colorTheme"
                        label="Color Theme"
                        options={colorOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={12}>
                      <PhotoUpload
                        name="images"
                        label="Images"
                        maxFiles={5}
                        required={!editingGanpati}
                        defaultPhotos={editingGanpati?.images || []}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            {...methods.register('isActive')}
                            checked={watch('isActive')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#E65100',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#E65100',
                              },
                            }}
                          />
                        }
                        label={watch('isActive') ? 'Active' : 'Inactive'}
                        sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                {submitting && <LinearProgress sx={{ mt: 2, bgcolor: '#E65100' }} />}
              </form>
            </FormProvider>
          </DialogContent>

          <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, borderTop: '1px solid #f0ebe6', gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting} variant="outlined" sx={{ borderRadius: 3, px: 3 }}>
              {t('button.cancel')}
            </Button>
            <Button
              type="submit"
              form="ganpati-form"
              variant="contained"
              disabled={submitting}
              sx={{ 
                background: 'linear-gradient(135deg, #E65100, #FF8F00)',
                borderRadius: 3,
                px: 4,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha('#E65100', 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {submitting ? t('table.loading') : (editingGanpati ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2.5,
              px: 3,
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <CategoryIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Ganpati Details
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {viewGanpati && (
                <Chip
                  label={viewGanpati.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{ 
                    bgcolor: viewGanpati.isActive ? '#e8f5e9' : '#ffebee',
                    color: viewGanpati.isActive ? '#2e7d32' : '#d32f2f',
                    fontWeight: 600
                  }}
                />
              )}
              <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#faf8f6' }}>
            {viewGanpati && (
              <Box>
                {viewGanpati.images && viewGanpati.images.length > 0 && (
                  <Paper sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    bgcolor: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #f0ebe6',
                    mb: 3
                  }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageIcon fontSize="small" /> Images
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                      {viewGanpati.images.map((img, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={img}
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            objectFit: 'contain',
                            backgroundColor: '#f5f0eb',
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': { borderColor: '#E65100', transform: 'scale(1.05)' }
                          }}
                          onClick={() => {
                            setSelectedImage(img);
                            setImagePreviewOpen(true);
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: '1px solid #f0ebe6',
                      height: '100%'
                    }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon fontSize="small" /> Basic Information
                      </Typography>
                      <ViewDetailRow label="Name" value={viewGanpati.name} icon={<CategoryIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label="Height" value={viewGanpati.height} icon={<HeightIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label="Material" value={viewGanpati.material} />
                      <ViewDetailRow label="Color Theme" value={viewGanpati.colorTheme} icon={<PaletteIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label="Price" value={`₹${viewGanpati.price?.toLocaleString() || 0}`} icon={<MoneyIcon sx={{ fontSize: 18 }} />} />
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: '1px solid #f0ebe6',
                      height: '100%'
                    }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon fontSize="small" /> Availability
                      </Typography>
                      <ViewDetailRow label="Total Slots" value={viewGanpati.totalSlots} icon={<InventoryIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label="Available Slots" value={viewGanpati.availableSlots} />
                      <ViewDetailRow label="Rating" value={viewGanpati.rating || 0} />
                      <ViewDetailRow label="Likes" value={viewGanpati.likes || 0} />
                      <ViewDetailRow label="Created At" value={viewGanpati.createdAt ? new Date(viewGanpati.createdAt).toLocaleDateString() : 'N/A'} />
                    </Paper>
                  </Grid>
                </Grid>

                <Box display="flex" gap={2} flexWrap="wrap" sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setViewDialogOpen(false);
                      const ganpati = ganpatiList.find((g) => g.id === viewGanpati.id);
                      if (ganpati) handleEdit(ganpati);
                    }}
                    sx={{ 
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#1565c0' },
                      borderRadius: 3,
                      px: 3
                    }}
                  >
                    Edit Ganpati
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setViewDialogOpen(false);
                      const ganpati = ganpatiList.find((g) => g.id === viewGanpati.id);
                      if (ganpati) handleDelete(ganpati);
                    }}
                    sx={{ borderRadius: 3, px: 3 }}
                  >
                    Delete Ganpati
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, borderTop: '1px solid #f0ebe6' }}>
            <Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ borderRadius: 3, px: 3 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 4, bgcolor: 'rgba(0,0,0,0.92)', maxWidth: '90vw', maxHeight: '90vh' } }}
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setImagePreviewOpen(false)}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={selectedImage}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
                borderRadius: 4,
              }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </motion.div>
  );
}