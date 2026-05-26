import { useState, useEffect, JSX } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import TextInputField from '@/components/controlled/TextInputField';
import NumericField from '@/components/controlled/NumericField';
import DropdownField from '@/components/controlled/DropdownField';
import PhotoUpload from '@/components/controlled/PhotoUpload';
import { Ganpati } from '@/types';

type GanpatiRecord = Ganpati & Record<string, unknown>;

interface GanpatiFormData {
  name: string;
  height: string;
  price: number;
  material: string;
  colorTheme: string;
  description: string;
  totalSlots: number;
  images: (File | string)[];
  achievements: string[];
  isActive: boolean;
}

const API_BASE = 'http://localhost:8080/api';

const getToken = () => {
  const auth = localStorage.getItem('auth-storage');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.state.token;
    } catch {
      return null;
    }
  }
  return null;
};

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
  const [ganpatiList, setGanpatiList] = useState<Ganpati[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingGanpati, setEditingGanpati] = useState<Ganpati | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedGanpati, setSelectedGanpati] = useState<Ganpati | null>(null);

  const methods = useForm<GanpatiFormData>({
    defaultValues: {
      name: '',
      height: '',
      price: 0,
      material: '',
      colorTheme: '',
      description: '',
      totalSlots: 0,
      images: [],
      achievements: [],
      isActive: true,
    },
  });

  useEffect(() => {
    fetchGanpatiList();
  }, []);

  const fetchGanpatiList = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/ganpati`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setGanpatiList(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch Ganpati list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (): void => {
    setEditingGanpati(null);
    methods.reset({
      name: '',
      height: '',
      price: 0,
      material: '',
      colorTheme: '',
      description: '',
      totalSlots: 0,
      images: [],
      achievements: [],
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (ganpati: Ganpati): void => {
    setEditingGanpati(ganpati);
    methods.reset({
      name: ganpati.name,
      height: ganpati.height,
      price: ganpati.price,
      material: ganpati.material,
      colorTheme: ganpati.colorTheme,
      description: ganpati.description,
      totalSlots: ganpati.totalSlots,
      images: ganpati.images,
      achievements: ganpati.achievements,
      isActive: ganpati.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (ganpati: Ganpati): Promise<void> => {
    const confirmed = await showConfirmation({
      message: `Are you sure you want to delete ${ganpati.name}?`,
      title: 'Delete Ganpati',
      confirmText: 'Delete',
    });

    if (confirmed) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/admin/ganpati/${ganpati.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          showSnackbar('success', 'Ganpati deleted successfully');
          await fetchGanpatiList();
        }
      } catch {
        showSnackbar('error', 'Failed to delete Ganpati');
      }
    }
  };

  const handleView = (ganpati: Ganpati): void => {
    setSelectedGanpati(ganpati);
    setViewDialogOpen(true);
  };

  const onSubmit = async (data: GanpatiFormData): Promise<void> => {
    try {
      const formData = new FormData();
      const ganpatiData = {
        name: data.name,
        height: data.height,
        price: data.price,
        material: data.material,
        colorTheme: data.colorTheme,
        description: data.description,
        totalSlots: data.totalSlots,
        achievements: data.achievements,
        isActive: data.isActive,
      };
      
      formData.append('ganpati', new Blob([JSON.stringify(ganpatiData)], { type: 'application/json' }));
      
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });

      const url = editingGanpati
        ? `${API_BASE}/admin/ganpati/${editingGanpati.id}`
        : `${API_BASE}/admin/ganpati`;
      
      const method = editingGanpati ? 'PUT' : 'POST';
      const token = getToken();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSnackbar('success', editingGanpati ? 'Ganpati updated' : 'Ganpati created');
        setDialogOpen(false);
        await fetchGanpatiList();
      } else {
        showSnackbar('error', result.message || 'Failed to save Ganpati');
      }
    } catch {
      showSnackbar('error', 'Failed to save Ganpati');
    }
  };

  const columns: Column<GanpatiRecord>[] = [
    { key: 'name' as keyof GanpatiRecord, label: 'Name' },
    { key: 'height' as keyof GanpatiRecord, label: 'Height' },
    { 
      key: 'price' as keyof GanpatiRecord, 
      label: 'Price', 
      render: (row: GanpatiRecord): string => `₹${(row as Ganpati).price.toLocaleString()}` 
    },
    { key: 'availableSlots' as keyof GanpatiRecord, label: 'Available Slots' },
    { key: 'totalSlots' as keyof GanpatiRecord, label: 'Total Slots' },
    {
      key: 'isActive' as keyof GanpatiRecord,
      label: 'Status',
      render: (row: GanpatiRecord): JSX.Element => {
        const ganpati = row as Ganpati;
        return (
          <Chip 
            label={ganpati.isActive ? 'Active' : 'Inactive'} 
            color={ganpati.isActive ? 'success' : 'default'} 
            size="small" 
          />
        );
      },
    },
    {
      key: 'actionbutton',
      label: 'Actions',
      render: (row: GanpatiRecord): JSX.Element => {
        const ganpati = row as Ganpati;
        return (
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => handleView(ganpati)}>
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton size="small" color="primary" onClick={() => handleEdit(ganpati)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(ganpati)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Ganpati Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add New Ganpati
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <UniversalTable<GanpatiRecord>
          data={ganpatiList as GanpatiRecord[]}
          columns={columns}
          loading={loading}
          rowsPerPage={10}
          showSearch
          showExport
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingGanpati ? 'Edit Ganpati' : 'Add New Ganpati'}</DialogTitle>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                  <TextInputField name="name" label="Ganpati Name" required inputType="alphabet" />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <DropdownField name="height" label="Height" options={heightOptions} required />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <NumericField name="price" label="Price (₹)" required min={1000} max={500000} />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <NumericField name="totalSlots" label="Total Slots" required min={1} max={100} />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <DropdownField name="material" label="Material" options={materialOptions} required />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <DropdownField name="colorTheme" label="Color Theme" options={colorOptions} required />
                </Grid>
                <Grid size={12}>
                  <TextInputField name="description" label="Description" inputType="textarea" rows={3} />
                </Grid>
                <Grid size={12}>
                  <PhotoUpload name="images" label="Ganpati Images" maxFiles={5} required={!editingGanpati} />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    control={<Switch {...methods.register('isActive')} checked={methods.watch('isActive')} />}
                    label="Active"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingGanpati ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedGanpati && (
          <>
            <DialogTitle>{selectedGanpati.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {selectedGanpati.images.map((img: string, idx: number) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${selectedGanpati.name}-${idx}`} 
                        style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} 
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2">Height: {selectedGanpati.height}</Typography>
                  <Typography variant="subtitle2">Material: {selectedGanpati.material}</Typography>
                  <Typography variant="subtitle2">Color Theme: {selectedGanpati.colorTheme}</Typography>
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="subtitle2">Price: ₹{selectedGanpati.price.toLocaleString()}</Typography>
                  <Typography variant="subtitle2">Available Slots: {selectedGanpati.availableSlots}</Typography>
                  <Typography variant="subtitle2">Total Slots: {selectedGanpati.totalSlots}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography variant="body2">{selectedGanpati.description}</Typography>
                </Grid>
                {selectedGanpati.achievements.length > 0 && (
                  <Grid size={12}>
                    <Typography variant="subtitle2">Achievements:</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                      {selectedGanpati.achievements.map((ach: string, idx: number) => (
                        <Chip key={idx} label={ach} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}