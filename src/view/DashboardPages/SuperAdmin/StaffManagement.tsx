import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Paper, Grid, Switch, FormControlLabel, Avatar, LinearProgress,
  useTheme, IconButton
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import TextInputField from '@/components/controlled/TextInputField';
import EmailField from '@/components/controlled/EmailField';
import MobileField from '@/components/controlled/MobileField';
import DropdownField from '@/components/controlled/DropdownField';
import { StaffResponseDto, StaffFormData } from '@/types';
import { adminService } from '@/services/AdminService';
import PasswordField from '@/components/controlled/PasswordField';

type StaffRecord = StaffResponseDto & Record<string, unknown>;

const counterOptions = [
  { value: 'Counter 1 - QR Scan', label: 'Counter 1 - QR Scan' },
  { value: 'Counter 2 - Payment', label: 'Counter 2 - Payment' },
  { value: 'Counter 3 - Pickup', label: 'Counter 3 - Pickup' },
  { value: 'Counter 4 - Customer Support', label: 'Counter 4 - Customer Support' },
];

const defaultValues: StaffFormData = { name: '', email: '', phone: '', assignedCounter: '', isActive: true, password: '' };

export default function StaffManagement() {
  const theme = useTheme();
  const [staffList, setStaffList] = useState<StaffResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffResponseDto | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffResponseDto | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const methods = useForm<StaffFormData>({ defaultValues });

  useEffect(() => { fetchStaffList(); }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllStaff();
      if (response.success && response.data) setStaffList(response.data);
    } catch {
      showSnackbar('error', 'Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => { setEditingStaff(null); methods.reset(defaultValues); setDialogOpen(true); };
  const handleEdit = (staff: StaffResponseDto) => { setEditingStaff(staff); methods.reset({ name: staff.name, email: staff.email, phone: staff.phone, assignedCounter: staff.assignedCounter || '', isActive: staff.isActive, password: '' }); setDialogOpen(true); };
  const handleDelete = async (staff: StaffResponseDto) => { const confirmed = await showConfirmation(`Remove ${staff.name}?`, 'Remove Staff'); if (confirmed) { try { const response = await adminService.deleteStaff(staff.id); if (response.success) { showSnackbar('success', 'Staff removed successfully'); await fetchStaffList(); } } catch { showSnackbar('error', 'Failed to remove staff'); } } };
  const handleView = (staff: StaffResponseDto) => { setSelectedStaff(staff); setViewDialogOpen(true); };
  const onSubmit = async (data: StaffFormData) => { setSubmitting(true); try { let response; if (editingStaff) response = await adminService.updateStaff(editingStaff.id, data); else response = await adminService.addStaff(data); if (response.success) { showSnackbar('success', editingStaff ? 'Staff updated' : 'Staff added'); setDialogOpen(false); methods.reset(defaultValues); await fetchStaffList(); } else { showSnackbar('error', response.message || 'Failed to save'); } } catch { showSnackbar('error', 'Failed to save staff'); } finally { setSubmitting(false); } };

  const columns: Column<StaffRecord>[] = [
    { key: 'name', label: 'Staff', render: (row) => { const staff = row as StaffResponseDto; return (<Box display="flex" alignItems="center" gap={2}><Avatar sx={{ bgcolor: theme.palette.primary.main }}>{staff.name.charAt(0)}</Avatar><Box><Typography variant="body2" fontWeight={600}>{staff.name}</Typography><Typography variant="caption" color="textSecondary">{staff.email}</Typography></Box></Box>); } },
    { key: 'phone', label: 'Phone' },
    { key: 'assignedCounter', label: 'Assigned Counter', render: (row) => <Chip label={(row as StaffResponseDto).assignedCounter || 'Not Assigned'} size="small" variant="outlined" sx={{ borderRadius: 2 }} /> },
    { key: 'isActive', label: 'Status', render: (row) => <Chip label={(row as StaffResponseDto).isActive ? 'Active' : 'Inactive'} color={(row as StaffResponseDto).isActive ? 'success' : 'error'} size="small" sx={{ borderRadius: 2, fontWeight: 500 }} /> },
    { key: 'createdAt', label: 'Joined', render: (row) => new Date((row as StaffResponseDto).createdAt).toLocaleDateString() },
    { key: ACTION_KEY, label: 'Actions' },
  ];

  if (loading) return <LinearProgress sx={{ borderRadius: 2 }} />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
         <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                  backgroundClip: 'text', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent',
                  mb:2,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Staff Management
              </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3 }}>Add Staff</Button>
      </Box>
      <Paper sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <UniversalTable<StaffRecord> data={staffList as StaffRecord[]} columns={columns} loading={loading} rowsPerPage={10} showSearch showExport actions={{ view: (row) => handleView(row as StaffResponseDto), edit: (row) => handleEdit(row as StaffResponseDto), delete: (row) => handleDelete(row as StaffResponseDto) }} />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h6" fontWeight={700}>{editingStaff ? 'Edit Staff' : 'Add Staff'}</Typography><IconButton onClick={() => setDialogOpen(false)}><Close /></IconButton></DialogTitle>
        <FormProvider {...methods}><form onSubmit={methods.handleSubmit(onSubmit)}><DialogContent><Grid container spacing={2}><Grid size={12}><TextInputField name="name" label="Full Name" required /></Grid><Grid size={12}><EmailField name="email" label="Email" required /></Grid><Grid size={12}><MobileField name="phone" label="Mobile" required /></Grid><Grid size={12}><DropdownField name="assignedCounter" label="Assigned Counter" options={counterOptions} /></Grid>{!editingStaff && <Grid size={12}><PasswordField name="password" label="Password" required minLength={6} /></Grid>}<Grid size={12}><FormControlLabel control={<Switch {...methods.register('isActive')} checked={methods.watch('isActive')} />} label="Active" /></Grid></Grid></DialogContent><DialogActions sx={{ p: 2, gap: 1 }}><Button onClick={() => setDialogOpen(false)} disabled={submitting} variant="outlined" sx={{ borderRadius: 3, textTransform: 'none' }}>Cancel</Button><Button type="submit" variant="contained" disabled={submitting} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>{submitting ? 'Saving...' : editingStaff ? 'Update' : 'Add'}</Button></DialogActions></form></FormProvider>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        {selectedStaff && (<><DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h6" fontWeight={700}>Staff Details</Typography><IconButton onClick={() => setViewDialogOpen(false)}><Close /></IconButton></DialogTitle><DialogContent><Box textAlign="center"><Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: theme.palette.secondary.main }}>{selectedStaff.name.charAt(0)}</Avatar><Typography variant="h6" fontWeight={600}>{selectedStaff.name}</Typography><Chip label={selectedStaff.isActive ? 'Active' : 'Inactive'} color={selectedStaff.isActive ? 'success' : 'error'} size="small" sx={{ mt: 1, borderRadius: 2 }} /></Box><Grid container spacing={2} sx={{ mt: 1 }}><Grid size={12}><Typography variant="subtitle2" color="textSecondary">Email</Typography><Typography>{selectedStaff.email}</Typography></Grid><Grid size={12}><Typography variant="subtitle2" color="textSecondary">Phone</Typography><Typography>{selectedStaff.phone}</Typography></Grid><Grid size={12}><Typography variant="subtitle2" color="textSecondary">Assigned Counter</Typography><Typography>{selectedStaff.assignedCounter || 'Not Assigned'}</Typography></Grid><Grid size={12}><Typography variant="subtitle2" color="textSecondary">Joined</Typography><Typography>{new Date(selectedStaff.createdAt).toLocaleDateString()}</Typography></Grid></Grid></DialogContent><DialogActions><Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ borderRadius: 3, textTransform: 'none' }}>Close</Button><Button variant="contained" onClick={() => { setViewDialogOpen(false); handleEdit(selectedStaff); }} sx={{ borderRadius: 3, textTransform: 'none' }}>Edit Staff</Button></DialogActions></>)}
      </Dialog>
    </Box>
  );
}