// src/container/admin/CustomerManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, useTheme, alpha, styled,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Tooltip, Avatar, LinearProgress, Tabs, Tab
} from '@mui/material';
import { 
  Close as CloseIcon, 
  ArrowUpward as PromoteIcon, 
  Edit as EditIcon, Delete as DeleteIcon,
  Person as PersonIcon, Phone as PhoneIcon, 
  LocationOn as LocationOnIcon, Category as CategoryIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { adminService } from '@/services/AdminService';
import { ganpatiService } from '@/services/GanpatiService';
import { User, GanpatiResponseDto } from '@/types/MurtiType';
import EnquiryForm from '@/container/public/EnquiryForm';
import DropdownField from '@/components/controlled/DropdownField';
import NumericField from '@/components/controlled/NumericField';
import DateTimeField from '@/components/controlled/DateTimeField';

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
    <Typography variant="body2" sx={{ color: '#666', minWidth: 100, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

interface CustomerRecord extends Record<string, unknown> {
  id: string;
  name: string;
  phone: string;
  registrationType?: string;
  mandalName?: string;
  isPromoted?: boolean;
  createdAt: string;
  ganpatiName?: string;
  ganpatiImage?: string;
}

interface ViewCustomerData {
  id: string;
  name: string;
  phone: string;
  alternatePhone: string;
  registrationType: string;
  mandalName: string;
  address: string;
  city: string;
  taluka: string;
  district: string;
  state: string;
  isPromoted: boolean;
  createdAt: string;
  ganpatiName: string;
  ganpatiImage: string;
  contactPersons: Array<{ name: string; phone: string; designation: string }>;
}

interface PromoteFormData {
  ganpatiId: string;
  totalPrice: number;
  advancePayment: number;
  remainingPayment: number;
  bookingDate: string;
  notes: string;
}

const MAX_AMOUNT = 10000000;

export default function CustomerManagement() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<User[]>([]);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enquiryFormOpen, setEnquiryFormOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState<boolean>(false);
  const [viewCustomer, setViewCustomer] = useState<ViewCustomerData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customerTabValue, setCustomerTabValue] = useState<number>(0);

  const methods = useForm<PromoteFormData>({
    defaultValues: {
      ganpatiId: '',
      totalPrice: 0,
      advancePayment: 0,
      remainingPayment: 0,
      bookingDate: new Date().toISOString().split('T')[0],
      notes: '',
    }
  });

  const { watch, reset, handleSubmit, setValue } = methods;
  const totalPrice = watch('totalPrice') || 0;
  const advancePayment = watch('advancePayment') || 0;

  useEffect(() => {
    const remaining = Math.max(0, totalPrice - advancePayment);
    setValue('remainingPayment', remaining);
  }, [totalPrice, advancePayment, setValue]);

  const fetchCustomers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminService.getAllCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      } else {
        showSnackbar('error', response.message || t('msg.error'));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showSnackbar('error', t('msg.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchGanpatiList = useCallback(async (): Promise<void> => {
    try {
      const response = await ganpatiService.getAll();
      if (response.success && response.data) {
        setGanpatiList(response.data);
      }
    } catch (error) {
      console.error('Error fetching ganpati:', error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchGanpatiList();
  }, [fetchCustomers, fetchGanpatiList]);

  const handleAddCustomer = (): void => {
    setEditingCustomer(null);
    setEnquiryFormOpen(true);
  };

  const handleEditCustomer = (customer: User): void => {
    setEditingCustomer(customer);
    setEnquiryFormOpen(true);
  };

  const handleViewCustomer = (customer: User): void => {
    const viewData: ViewCustomerData = {
      id: customer.id,
      name: customer.name || 'N/A',
      phone: customer.phone || 'N/A',
      alternatePhone: customer.alternatePhone || 'N/A',
      registrationType: customer.registrationType || 'HOME',
      mandalName: customer.mandalName || 'N/A',
      address: customer.address || 'N/A',
      city: customer.city || 'N/A',
      taluka: customer.taluka || 'N/A',
      district: customer.district || 'N/A',
      state: customer.state || 'N/A',
      isPromoted: customer.isPromoted || false,
      createdAt: customer.createdAt || '',
      ganpatiName: customer.ganpatiName || 'N/A',
      ganpatiImage: customer.ganpatiImage || '',
      contactPersons: customer.contactPersons?.map((cp) => ({
        name: cp.name,
        phone: cp.phone,
        designation: cp.designation
      })) || []
    };
    setViewCustomer(viewData);
    setViewDialogOpen(true);
  };

  const handleDeleteCustomer = async (customer: User): Promise<void> => {
    const confirmed = await showConfirmation(t('msg.delete_confirm'), 'Confirm');
    if (confirmed) {
      try {
        const response = await adminService.deleteCustomer(customer.id);
        if (response.success) {
          showSnackbar('success', t('msg.delete_success'));
          await fetchCustomers();
        } else {
          showSnackbar('error', response.message || t('msg.error'));
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        showSnackbar('error', t('msg.error'));
      }
    }
  };

  const handlePromoteClick = (customer: User): void => {
    if (customer.isPromoted) {
      showSnackbar('warning', 'Customer already promoted to booking');
      return;
    }
    setSelectedCustomer(customer);
    reset({
      ganpatiId: customer.ganpatiId || '',
      totalPrice: 0,
      advancePayment: 0,
      remainingPayment: 0,
      bookingDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPromoteDialogOpen(true);
  };

  const onPromoteSubmit = async (data: PromoteFormData): Promise<void> => {
    if (!selectedCustomer) return;
    
    setSubmitting(true);
    try {
      const promoteResponse = await adminService.promoteCustomer(selectedCustomer.id);
      if (!promoteResponse.success) {
        showSnackbar('error', promoteResponse.message || 'Promotion failed');
        setSubmitting(false);
        return;
      }

      const bookingData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address || '',
        customerTaluka: selectedCustomer.taluka || '',
        customerDistrict: selectedCustomer.district || '',
        mandalName: selectedCustomer.mandalName || '',
        ganpatiId: data.ganpatiId,
        advancePayment: Number(data.advancePayment),
        remainingPayment: Number(data.remainingPayment),
        totalPrice: Number(data.totalPrice),
        bookingDate: data.bookingDate,
        notes: data.notes,
        status: 'PENDING',
        createNewCustomer: false,
        customerRegistrationType: selectedCustomer.registrationType || 'HOME',
        customerContactPersons: selectedCustomer.contactPersons || [],
        additionalContacts: selectedCustomer.contactPersons?.map((cp) => ({
          name: cp.name,
          phone: cp.phone,
          designation: cp.designation
        })) || []
      };

      const bookingResponse = await adminService.createBooking(bookingData);
      if (bookingResponse.success) {
        showSnackbar('success', 'Customer successfully promoted to booking');
        setPromoteDialogOpen(false);
        await fetchCustomers();
      } else {
        showSnackbar('error', bookingResponse.message || 'Booking creation failed');
      }
    } catch (error) {
      console.error('Error promoting customer:', error);
      showSnackbar('error', 'Promotion failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnquiryFormSuccess = (): void => {
    fetchCustomers();
  };

  const getFilteredCustomers = () => {
    if (customerTabValue === 0) return customers;
    const type = customerTabValue === 1 ? 'MANDAL' : 'HOME';
    return customers.filter((c) => c.registrationType === type);
  };

  const ganpatiOptions = ganpatiList.map((g) => ({
    value: g.id,
    label: `${g.name} (${g.height}) - ₹${g.price.toLocaleString()}`
  }));

  const filteredCustomers = getFilteredCustomers();

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'name',
      label: t('customer.name'),
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'phone',
      label: t('customer.phone'),
    },
    {
      key: 'registrationType',
      label: t('customer.type'),
      render: (row) => (
        <Chip
          label={row.registrationType === 'MANDAL' ? t('customer.mandal') : t('customer.home_ganpati')}
          size="small"
          color={row.registrationType === 'MANDAL' ? 'secondary' : 'primary'}
        />
      ),
    },
    {
      key: 'isPromoted',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.isPromoted ? 'Booked' : 'Pending'}
          size="small"
          color={row.isPromoted ? 'success' : 'warning'}
        />
      ),
    },
    {
      key: 'ganpatiName',
      label: 'Ganpati',
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          {row.ganpatiImage && (
            <Avatar 
              src={row.ganpatiImage} 
              sx={{ width: 30, height: 30, borderRadius: 1 }}
            />
          )}
          <Typography variant="body2">{row.ganpatiName || 'Not selected'}</Typography>
        </Box>
      ),
    },
    {
      key: 'createdAt',
      label: t('customer.registered_on'),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    { key: ACTION_KEY, label: t('table.actions') },
  ];

  const tableData: CustomerRecord[] = filteredCustomers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    registrationType: customer.registrationType,
    mandalName: customer.mandalName,
    isPromoted: customer.isPromoted || false,
    ganpatiName: customer.ganpatiName,
    ganpatiImage: customer.ganpatiImage,
    createdAt: customer.createdAt,
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
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            {t('admin.customers')}
          </Typography>
        </Box>

        <GlassPaper>
          <Tabs
            value={customerTabValue}
            onChange={(_, newValue) => setCustomerTabValue(newValue)}
            sx={{
              px: 2,
              pt: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.875rem' }
              },
            }}
          >
            <Tab label={`${t('table.all')} (${customers.length})`} />
            <Tab
              label={`${t('customer.mandal')} (${customers.filter((c) => c.registrationType === 'MANDAL').length})`}
            />
            <Tab
              label={`${t('customer.home_ganpati')} (${customers.filter((c) => c.registrationType === 'HOME').length})`}
            />
          </Tabs>

          <UniversalTable<CustomerRecord>
            data={tableData}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            showSearch
            addButton={{
              label: 'New Customer',
              onClick: handleAddCustomer,
              color: 'primary',
              variant: 'contained',
            }}
            actions={{
              view: (row) => {
                const customer = customers.find((c) => c.id === row.id);
                if (customer) handleViewCustomer(customer);
              },
              edit: (row) => {
                const customer = customers.find((c) => c.id === row.id);
                if (customer) handleEditCustomer(customer);
              },
              delete: (row) => {
                const customer = customers.find((c) => c.id === row.id);
                if (customer) handleDeleteCustomer(customer);
              },
            }}
            renderActions={(row: { id: string }) => {
              const customer = customers.find((c) => c.id === row.id);
              if (!customer) return null;
              
              return (
                <Tooltip title={customer.isPromoted ? 'Already Promoted' : 'Promote to Booking'}>
                  <IconButton
                    size="small"
                    onClick={() => handlePromoteClick(customer)}
                    disabled={customer.isPromoted || submitting}
                    sx={{ 
                      color: customer.isPromoted ? '#aaa' : '#4caf50',
                      '&:hover': { color: '#388e3c' }
                    }}
                  >
                    <PromoteIcon />
                  </IconButton>
                </Tooltip>
              );
            }}
          />
        </GlassPaper>
      </Box>

      <EnquiryForm
        open={enquiryFormOpen}
        onClose={() => setEnquiryFormOpen(false)}
        mode="customer"
        ganpatiList={ganpatiList}
        editingCustomer={editingCustomer}
        onSuccess={handleEnquiryFormSuccess}
      />

      <Dialog
        open={promoteDialogOpen}
        onClose={() => !submitting && setPromoteDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh', overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 2, sm: 2.5 },
            px: { xs: 2, sm: 3 },
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              <PromoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Promote to Booking
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
              {selectedCustomer?.name} • {selectedCustomer?.phone}
            </Typography>
          </Box>
          <IconButton onClick={() => setPromoteDialogOpen(false)} sx={{ color: 'white', position: 'relative', zIndex: 1 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
          <FormProvider {...methods}>
            <form id="promote-form" onSubmit={handleSubmit(onPromoteSubmit)}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <DropdownField
                      name="ganpatiId"
                      label="Select Ganpati"
                      options={ganpatiOptions}
                      required
                      size="small"
                      onChangeCallback={(value) => {
                        const selected = ganpatiList.find((g) => g.id === value);
                        if (selected) {
                          setValue('totalPrice', selected.price);
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <NumericField
                      name="totalPrice"
                      label="Total Price"
                      required
                      min={0}
                      max={MAX_AMOUNT}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <NumericField
                      name="advancePayment"
                      label="Advance Payment"
                      required
                      min={0}
                      max={MAX_AMOUNT}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <NumericField
                      name="remainingPayment"
                      label="Remaining Amount"
                      required
                      min={0}
                      max={MAX_AMOUNT}
                      disabled
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DateTimeField
                      name="bookingDate"
                      label="Booking Date"
                      viewMode="date"
                      size="small"
                      useCurrentDate
                    />
                  </Grid>
                </Grid>
              </Paper>
              {submitting && <LinearProgress sx={{ mt: 2 }} />}
            </form>
          </FormProvider>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            onClick={() => setPromoteDialogOpen(false)} 
            disabled={submitting} 
            variant="outlined"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            {t('button.cancel')}
          </Button>
          <Button
            type="submit"
            form="promote-form"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? null : <PromoteIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #E65100, #FF8F00)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha('#E65100', 0.4)}`,
              },
              flex: { xs: 1, sm: 'none' },
              minWidth: { xs: 'auto', sm: 120 },
              transition: 'all 0.3s ease',
            }}
          >
            {submitting ? t('table.loading') : 'Promote'}
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
            <PersonIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Customer Details
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={viewCustomer?.isPromoted ? '✅ Booked' : '⏳ Pending'}
              size="small"
              sx={{ 
                bgcolor: viewCustomer?.isPromoted ? '#e8f5e9' : '#fff3e0',
                color: viewCustomer?.isPromoted ? '#2e7d32' : '#ed6c02',
                fontWeight: 600
              }}
            />
            <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#faf8f6' }}>
          {viewCustomer && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
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
                      <PersonIcon fontSize="small" /> Personal Information
                    </Typography>
                    <ViewDetailRow label="Name" value={viewCustomer.name} icon={<PersonIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label="Phone" value={viewCustomer.phone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label="Alternate Phone" value={viewCustomer.alternatePhone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label="Type" value={viewCustomer.registrationType} />
                    {viewCustomer.mandalName && viewCustomer.mandalName !== 'N/A' && (
                      <ViewDetailRow label="Mandal" value={viewCustomer.mandalName} />
                    )}
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
                      <LocationOnIcon fontSize="small" /> Address Details
                    </Typography>
                    <ViewDetailRow label="Address" value={viewCustomer.address} icon={<LocationOnIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label="City" value={viewCustomer.city} />
                    <ViewDetailRow label="Taluka" value={viewCustomer.taluka} />
                    <ViewDetailRow label="District" value={viewCustomer.district} />
                    <ViewDetailRow label="State" value={viewCustomer.state} />
                  </Paper>
                </Grid>
              </Grid>

              {viewCustomer.ganpatiName && viewCustomer.ganpatiName !== 'N/A' && (
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  bgcolor: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f0ebe6',
                  mb: 3
                }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" /> Ganpati Details
                  </Typography>
                  {viewCustomer.ganpatiImage && (
                    <Box sx={{ mb: 2 }}>
                      <Avatar 
                        src={viewCustomer.ganpatiImage} 
                        sx={{ width: 80, height: 80, borderRadius: 2 }}
                      />
                    </Box>
                  )}
                  <ViewDetailRow label="Ganpati" value={viewCustomer.ganpatiName} />
                  <ViewDetailRow label="Status" value={viewCustomer.isPromoted ? 'Booked' : 'Pending'} />
                  <ViewDetailRow label="Registered" value={viewCustomer.createdAt ? new Date(viewCustomer.createdAt).toLocaleDateString() : 'N/A'} />
                </Paper>
              )}

              {viewCustomer.contactPersons && viewCustomer.contactPersons.length > 0 && (
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  bgcolor: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f0ebe6',
                  mb: 3
                }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" /> Contact Persons
                  </Typography>
                  {viewCustomer.contactPersons.map((person, idx) => (
                    <Box key={idx} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      py: 1, 
                      borderBottom: '1px dashed #f0ebe6',
                      flexWrap: 'wrap',
                      gap: 0.5,
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <Typography variant="body2" fontWeight={500}>{person.name}</Typography>
                      <Typography variant="body2">{person.phone}</Typography>
                      <Typography variant="caption" color="textSecondary">{person.designation}</Typography>
                    </Box>
                  ))}
                </Paper>
              )}

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    const customer = customers.find((c) => c.id === viewCustomer.id);
                    if (customer) handleEditCustomer(customer);
                  }}
                  sx={{ 
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' },
                    borderRadius: 3,
                    px: 3
                  }}
                >
                  Edit Customer
                </Button>
                {!viewCustomer.isPromoted && (
                  <Button
                    variant="contained"
                    startIcon={<PromoteIcon />}
                    onClick={() => {
                      setViewDialogOpen(false);
                      const customer = customers.find((c) => c.id === viewCustomer.id);
                      if (customer) handlePromoteClick(customer);
                    }}
                    sx={{ 
                      background: 'linear-gradient(135deg, #E65100, #FF8F00)',
                      '&:hover': { transform: 'translateY(-2px)' },
                      borderRadius: 3,
                      px: 3,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Promote to Booking
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setViewDialogOpen(false);
                    const customer = customers.find((c) => c.id === viewCustomer.id);
                    if (customer) handleDeleteCustomer(customer);
                  }}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  Delete Customer
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
    </motion.div>
  );
}