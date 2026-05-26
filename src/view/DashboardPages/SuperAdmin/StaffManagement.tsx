// src/view/DashboardPages/SuperAdmin/StaffManagement.tsx
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
  Avatar,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { UniversalTable, Column } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import TextInputField from '@/components/controlled/TextInputField';
import EmailField from '@/components/controlled/EmailField';
import MobileField from '@/components/controlled/MobileField';
import DropdownField from '@/components/controlled/DropdownField';
import { Staff } from '@/types';

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  assignedCounter: string;
  isActive: boolean;
  password?: string;
}

// Convert Staff to Record<string, unknown> type
type StaffRecord = Staff & Record<string, unknown>;

interface StaffListResponse {
  success: boolean;
  data: Staff[];
}

interface StaffActionResponse {
  success: boolean;
  message?: string;
}

const counterOptions = [
  { value: 'Counter 1 - QR Scan', label: 'Counter 1 - QR Scan' },
  { value: 'Counter 2 - Payment', label: 'Counter 2 - Payment' },
  { value: 'Counter 3 - Pickup', label: 'Counter 3 - Pickup' },
  { value: 'Counter 4 - Customer Support', label: 'Counter 4 - Customer Support' },
];

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const methods = useForm<StaffFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      assignedCounter: '',
      isActive: true,
      password: '',
    },
  });

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/staff');
      const data: StaffListResponse = await response.json();
      if (data.success && data.data) {
        setStaffList(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (): void => {
    setEditingStaff(null);
    methods.reset({
      name: '',
      email: '',
      phone: '',
      assignedCounter: '',
      isActive: true,
      password: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (staff: Staff): void => {
    setEditingStaff(staff);
    methods.reset({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      assignedCounter: staff.assignedCounter || '',
      isActive: staff.isActive,
      password: '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (staff: Staff): Promise<void> => {
    const confirmed = await showConfirmation({
      message: `Are you sure you want to remove ${staff.name} from staff?`,
      title: 'Remove Staff',
      confirmText: 'Remove',
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/staff/${staff.id}`, {
          method: 'DELETE',
        });
        const data: StaffActionResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Staff removed successfully');
          await fetchStaffList();
        }
      } catch {
        showSnackbar('error', 'Failed to remove staff');
      }
    }
  };

  const handleView = (staff: Staff): void => {
    setSelectedStaff(staff);
    setViewDialogOpen(true);
  };

  const onSubmit = async (data: StaffFormData): Promise<void> => {
    try {
      const url = editingStaff
        ? `/api/admin/staff/${editingStaff.id}`
        : '/api/admin/staff';
      
      const method = editingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: StaffActionResponse = await response.json();
      
      if (result.success) {
        showSnackbar('success', editingStaff ? 'Staff updated' : 'Staff added successfully');
        setDialogOpen(false);
        await fetchStaffList();
      }
    } catch {
      showSnackbar('error', 'Failed to save staff');
    }
  };

  // Define columns for UniversalTable using StaffRecord type
  const columns: Column<StaffRecord>[] = [
    { 
      key: 'name' as keyof StaffRecord, 
      label: 'Staff',
      render: (row: StaffRecord): JSX.Element => {
        const staff = row as Staff;
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{staff.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{staff.name}</Typography>
              <Typography variant="caption" color="textSecondary">{staff.email}</Typography>
            </Box>
          </Box>
        );
      }
    },
    { key: 'phone' as keyof StaffRecord, label: 'Phone' },
    { 
      key: 'assignedCounter' as keyof StaffRecord, 
      label: 'Assigned Counter', 
      render: (row: StaffRecord): string => (row as Staff).assignedCounter || 'Not Assigned' 
    },
    {
      key: 'isActive' as keyof StaffRecord,
      label: 'Status',
      render: (row: StaffRecord): JSX.Element => {
        const staff = row as Staff;
        return (
          <Chip 
            label={staff.isActive ? 'Active' : 'Inactive'} 
            color={staff.isActive ? 'success' : 'default'} 
            size="small" 
          />
        );
      },
    },
    { 
      key: 'createdAt' as keyof StaffRecord, 
      label: 'Joined', 
      render: (row: StaffRecord): string => new Date((row as Staff).createdAt).toLocaleDateString() 
    },
    {
      key: 'actionbutton',
      label: 'Actions',
      render: (row: StaffRecord): JSX.Element => {
        const staff = row as Staff;
        return (
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => handleView(staff)}>
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton size="small" color="primary" onClick={() => handleEdit(staff)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(staff)}>
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
          Staff Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add Staff Member
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <UniversalTable<StaffRecord>
          data={staffList as StaffRecord[]}
          columns={columns}
          loading={loading}
          rowsPerPage={10}
          showSearch
          showExport
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextInputField name="name" label="Full Name" required inputType="alphabet" />
                </Grid>
                <Grid size={12}>
                  <EmailField name="email" label="Email Address" required />
                </Grid>
                <Grid size={12}>
                  <MobileField name="phone" label="Mobile Number" required />
                </Grid>
                <Grid size={12}>
                  <DropdownField name="assignedCounter" label="Assigned Counter" options={counterOptions} />
                </Grid>
                {!editingStaff && (
                  <Grid size={12}>
                    <TextInputField 
                      name="password" 
                      label="Temporary Password" 
                      required 
                      inputType="alphanumeric"
                      minLength={6}
                    />
                  </Grid>
                )}
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
                {editingStaff ? 'Update' : 'Add Staff'}
              </Button>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedStaff && (
          <>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogContent>
              <Box textAlign="center" mb={3}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                  {selectedStaff.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{selectedStaff.name}</Typography>
                <Chip 
                  label={selectedStaff.isActive ? 'Active' : 'Inactive'} 
                  color={selectedStaff.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body2">{selectedStaff.email}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2">Phone</Typography>
                  <Typography variant="body2">{selectedStaff.phone}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2">Assigned Counter</Typography>
                  <Typography variant="body2">{selectedStaff.assignedCounter || 'Not Assigned'}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2">Joined Date</Typography>
                  <Typography variant="body2">{new Date(selectedStaff.createdAt).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button variant="outlined" onClick={() => {
                setViewDialogOpen(false);
                handleEdit(selectedStaff);
              }}>
                Edit Staff
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}