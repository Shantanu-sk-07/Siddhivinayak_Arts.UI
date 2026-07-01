// src/container/admin/GanpatiManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Switch, FormControlLabel, Chip, IconButton, useTheme, alpha, styled,
  LinearProgress, Avatar, useMediaQuery
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
import {
  GanpatiResponseDto,
  GanpatiFormData,
  GanpatiRecord,
  heightOptions,
  materialOptions,
  colorOptions
} from '@/types/MurtiType';

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

export default function GanpatiManagement() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    const confirmed = await showConfirmation(t('msg.delete_confirm'), t('common.confirm_action'));
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
      label: t('ganpati.image'),
      render: (row) => (
        <Avatar
          src={row.images?.[0] || '/placeholder.jpg'}
          sx={{
            width: { xs: 35, sm: 50 },
            height: { xs: 35, sm: 50 },
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
      render: (row) => <Typography fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{row.name}</Typography>,
    },
    { key: 'height', label: t('ganpati.height') },
    {
      key: 'price',
      label: t('ganpati.price'),
      render: (row) => (
        <Typography color="primary" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
          sx={{ height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
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
          sx={{ height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
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
      <Box sx={{ p: { xs: 1, sm: 1.5, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.125rem' }
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

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => !submitting && setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 4 },
              overflow: 'hidden',
              margin: { xs: 0, sm: 'auto' },
              maxHeight: { xs: '100vh', sm: '90vh' },
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: { xs: 1.5, sm: 2.5 },
              px: { xs: 1.5, sm: 3 },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <CategoryIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                {editingGanpati ? t('ganpati.edit') : t('ganpati.add_new')}
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#faf8f6' }}>
            <FormProvider {...methods}>
              <form id="ganpati-form" onSubmit={handleSubmit(onSubmit)}>
                <Paper sx={{
                  p: { xs: 1.5, sm: 2, md: 3 },
                  borderRadius: 3,
                  bgcolor: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="name"
                        label={t('ganpati.name')}
                        required
                        placeholder={t('ganpati.enter_name')}
                        size={isMobile ? "small" : "small"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="height"
                        label={t('ganpati.height')}
                        options={heightOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <NumericField
                        name="price"
                        label={t('ganpati.price')}
                        required
                        min={0}
                        max={1000000000}
                        placeholder={t('ganpati.enter_price')}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <NumericField
                        name="totalSlots"
                        label={t('ganpati.total_slots')}
                        required
                        min={1}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="material"
                        label={t('ganpati.material')}
                        options={materialOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="colorTheme"
                        label={t('ganpati.color_theme')}
                        options={colorOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={12}>
                      <PhotoUpload
                        name="images"
                        label={t('ganpati.images')}
                        maxFiles={5}
                        compress={false}
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
                        label={watch('isActive') ? t('ganpati.active') : t('ganpati.inactive')}
                        sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                {submitting && <LinearProgress sx={{ mt: 2, bgcolor: '#E65100' }} />}
              </form>
            </FormProvider>
          </DialogContent>

          <DialogActions sx={{
            p: { xs: 1.5, sm: 3 },
            pt: { xs: 1, sm: 0 },
            borderTop: '1px solid #f0ebe6',
            gap: 1,
            flexWrap: 'wrap',
            flexDirection: { xs: 'column-reverse', sm: 'row' }
          }}>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 2, sm: 1 }
              }}
            >
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
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha('#E65100', 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {submitting ? t('table.loading') : (editingGanpati ? t('button.update') : t('button.add'))}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 4 },
              overflow: 'hidden',
              margin: { xs: 0, sm: 'auto' },
              maxHeight: { xs: '100vh', sm: '90vh' },
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: { xs: 1.5, sm: 2.5 },
              px: { xs: 1.5, sm: 3 },
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <CategoryIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                {t('ganpati.details')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {viewGanpati && (
                <Chip
                  label={viewGanpati.isActive ? t('ganpati.active') : t('ganpati.inactive')}
                  size="small"
                  sx={{
                    bgcolor: viewGanpati.isActive ? '#e8f5e9' : '#ffebee',
                    color: viewGanpati.isActive ? '#2e7d32' : '#d32f2f',
                    fontWeight: 600,
                    height: { xs: 20, sm: 24 },
                    fontSize: { xs: '0.6rem', sm: '0.7rem' }
                  }}
                />
              )}
              <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#faf8f6' }}>
            {viewGanpati && (
              <Box>
                {viewGanpati.images && viewGanpati.images.length > 0 && (
                  <Paper sx={{
                    p: { xs: 1.5, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #f0ebe6',
                    mb: 3
                  }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      <ImageIcon fontSize="small" /> {t('ganpati.images')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                      {viewGanpati.images.map((img, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={img}
                          sx={{
                            width: { xs: 70, sm: 100 },
                            height: { xs: 70, sm: 100 },
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

                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      borderRadius: 3,
                      bgcolor: 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: '1px solid #f0ebe6',
                      height: '100%'
                    }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        <CategoryIcon fontSize="small" /> {t('ganpati.basic_info')}
                      </Typography>
                      <ViewDetailRow label={t('ganpati.name')} value={viewGanpati.name} icon={<CategoryIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label={t('ganpati.height')} value={viewGanpati.height} icon={<HeightIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label={t('ganpati.material')} value={viewGanpati.material} />
                      <ViewDetailRow label={t('ganpati.color_theme')} value={viewGanpati.colorTheme} icon={<PaletteIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label={t('ganpati.price')} value={`₹${viewGanpati.price?.toLocaleString() || 0}`} icon={<MoneyIcon sx={{ fontSize: 18 }} />} />
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      borderRadius: 3,
                      bgcolor: 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: '1px solid #f0ebe6',
                      height: '100%'
                    }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        <InventoryIcon fontSize="small" /> {t('ganpati.availability')}
                      </Typography>
                      <ViewDetailRow label={t('ganpati.total_slots')} value={viewGanpati.totalSlots} icon={<InventoryIcon sx={{ fontSize: 18 }} />} />
                      <ViewDetailRow label={t('ganpati.available_slots')} value={viewGanpati.availableSlots} />
                      <ViewDetailRow label={t('ganpati.rating')} value={viewGanpati.rating || 0} />
                      <ViewDetailRow label={t('ganpati.likes')} value={viewGanpati.likes || 0} />
                      <ViewDetailRow label={t('ganpati.created_at')} value={viewGanpati.createdAt ? new Date(viewGanpati.createdAt).toLocaleDateString() : 'N/A'} />
                    </Paper>
                  </Grid>
                </Grid>

                <Box display="flex" gap={2} flexWrap="wrap" sx={{ mt: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
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
                      px: 3,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {t('ganpati.edit')}
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
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {t('button.delete')}
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{
            p: { xs: 1.5, sm: 3 },
            pt: 0,
            borderTop: '1px solid #f0ebe6'
          }}>
            <Button
              onClick={() => setViewDialogOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {t('button.close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: 'rgba(0,0,0,0.92)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              margin: { xs: 1, sm: 'auto' }
            }
          }}
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
                p: { xs: 0.5, sm: 1 }
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
            <Box
              component="img"
              src={selectedImage}
              alt={t('ganpati.preview')}
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