import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, useTheme, alpha, styled,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Tooltip, Avatar, LinearProgress, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText} from '@mui/material';
import { 
  Close as CloseIcon, 
  ArrowUpward as PromoteIcon, 
  Edit as EditIcon, Delete as DeleteIcon,
  Person as PersonIcon, Phone as PhoneIcon, 
  LocationOn as LocationOnIcon, Category as CategoryIcon,
  Share as ShareIcon} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { adminService } from '@/services/AdminService';
import { ganpatiService } from '@/services/GanpatiService';
import { 
  User, GanpatiResponseDto, CustomerRecord, ViewCustomerData, PromoteFormData 
} from '@/types/MurtiType';
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
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
    {icon && <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#666', minWidth: 100, fontWeight: 500 }}>{label}:</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>{value || 'N/A'}</Typography>
  </Box>
);

const MAX_AMOUNT = 10000000;

export default function CustomerManagement() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<User[]>([]);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryFormOpen, setEnquiryFormOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<ViewCustomerData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [customerTabValue, setCustomerTabValue] = useState(0);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareGanpatiIds, setShareGanpatiIds] = useState<string[]>([]);

  const methods = useForm<PromoteFormData>({
    defaultValues: { ganpatiId: '', totalPrice: 0, advancePayment: 0, remainingPayment: 0, bookingDate: new Date().toISOString().split('T')[0], notes: '' }
  });
  const { watch, reset, handleSubmit, setValue } = methods;
  const totalPrice = watch('totalPrice') || 0;
  const advancePayment = watch('advancePayment') || 0;
  useEffect(() => setValue('remainingPayment', Math.max(0, totalPrice - advancePayment)), [totalPrice, advancePayment, setValue]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllCustomers();
      if (res.success && res.data) setCustomers(res.data);
      else showSnackbar('error', res.message || t('msg.error'));
    } catch { showSnackbar('error', t('msg.error')); } finally { setLoading(false); }
  }, [t]);

  const fetchGanpatiList = useCallback(async () => {
    try {
      const res = await ganpatiService.getAll();
      if (res.success && res.data) setGanpatiList(res.data);
    } catch { console.error('Error fetching ganpati'); }
  }, []);

  useEffect(() => { fetchCustomers(); fetchGanpatiList(); }, [fetchCustomers, fetchGanpatiList]);

  const handleAddCustomer = () => { setEditingCustomer(null); setEnquiryFormOpen(true); };
  const handleEditCustomer = (customer: User) => { setEditingCustomer(customer); setEnquiryFormOpen(true); };

  const handleViewCustomer = (customer: User) => {
    setViewCustomer({
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
      contactPersons: customer.contactPersons?.map(cp => ({ name: cp.name, phone: cp.phone, designation: cp.designation })) || []
    });
    setViewDialogOpen(true);
  };

  const handleDeleteCustomer = async (customer: User) => {
    if (await showConfirmation(t('msg.delete_confirm'), t('common.confirm_action'))) {
      const res = await adminService.deleteCustomer(customer.id);
      if (res.success) { showSnackbar('success', t('msg.delete_success')); fetchCustomers(); }
      else showSnackbar('error', res.message || t('msg.error'));
    }
  };

  const handlePromoteClick = (customer: User) => {
    if (customer.isPromoted) { showSnackbar('warning', t('customer.already_promoted')); return; }
    setSelectedCustomer(customer);
    reset({ ganpatiId: customer.ganpatiId || '', totalPrice: 0, advancePayment: 0, remainingPayment: 0, bookingDate: new Date().toISOString().split('T')[0], notes: '' });
    setPromoteDialogOpen(true);
  };

  const onPromoteSubmit = async (data: PromoteFormData) => {
    if (!selectedCustomer) return;
    setSubmitting(true);
    try {
      const promoteRes = await adminService.promoteCustomer(selectedCustomer.id);
      if (!promoteRes.success) { showSnackbar('error', promoteRes.message || t('customer.promotion_failed')); setSubmitting(false); return; }
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
        additionalContacts: selectedCustomer.contactPersons?.map(cp => ({ name: cp.name, phone: cp.phone, designation: cp.designation })) || []
      };
      const bookingRes = await adminService.createBooking(bookingData);
      if (bookingRes.success) { showSnackbar('success', t('customer.promotion_success')); setPromoteDialogOpen(false); fetchCustomers(); }
      else showSnackbar('error', bookingRes.message || t('customer.booking_creation_failed'));
    } catch { showSnackbar('error', t('customer.promotion_failed')); } finally { setSubmitting(false); }
  };

  const handleEnquiryFormSuccess = () => fetchCustomers();

  const getFilteredCustomers = () => {
    if (customerTabValue === 0) return customers;
    const type = customerTabValue === 1 ? 'MANDAL' : 'HOME';
    return customers.filter(c => c.registrationType === type);
  };

  const ganpatiOptions = ganpatiList.map(g => ({ value: g.id, label: `${g.name} (${g.height}) - ₹${g.price.toLocaleString()}` }));

  const filteredCustomers = getFilteredCustomers();
  const columns: Column<CustomerRecord>[] = [
    { key: 'name', label: t('customer.name'), render: row => <Typography variant="body2" fontWeight={600}>{row.name}</Typography> },
    { key: 'phone', label: t('customer.phone') },
    { key: 'registrationType', label: t('customer.type'), render: row => <Chip label={row.registrationType === 'MANDAL' ? t('customer.mandal') : t('customer.home_ganpati')} size="small" color={row.registrationType === 'MANDAL' ? 'secondary' : 'primary'} /> },
    { key: 'isPromoted', label: t('customer.status'), render: row => <Chip label={row.isPromoted ? t('customer.booked') : t('customer.pending')} size="small" color={row.isPromoted ? 'success' : 'warning'} /> },
    { key: 'ganpatiName', label: t('customer.ganpati'), render: row => <Box display="flex" alignItems="center" gap={1}>{row.ganpatiImage && <Avatar src={row.ganpatiImage} sx={{ width: 30, height: 30, borderRadius: 1 }} />}<Typography variant="body2">{row.ganpatiName || t('customer.not_selected')}</Typography></Box> },
    { key: 'createdAt', label: t('customer.registered_on'), render: row => new Date(row.createdAt).toLocaleDateString() },
    { key: ACTION_KEY, label: t('table.actions') },
  ];

  const tableData: CustomerRecord[] = filteredCustomers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    registrationType: c.registrationType,
    mandalName: c.mandalName,
    isPromoted: c.isPromoted || false,
    ganpatiName: c.ganpatiName,
    ganpatiImage: c.ganpatiImage,
    createdAt: c.createdAt,
  }));

  // Share functionality
  const handleShare = async () => {
    try {
      const res = await adminService.createShareCollection({
        customerIds: selectedCustomerIds,
        ganpatiIds: shareGanpatiIds,
        expiryDays: undefined // removed expiry
      });
      if (!res.success) { showSnackbar('error', res.message || 'Failed to create share link'); return; }
      let shareUrl = res.data.shareUrl;
      if (!shareUrl.startsWith('http://') && !shareUrl.startsWith('https://')) shareUrl = `https://${shareUrl}`;
      const selectedCustomers = customers.filter(c => selectedCustomerIds.includes(c.id));
      const phoneNumbers = selectedCustomers.map(c => c.phone).filter(p => p && p.length > 0);
      if (phoneNumbers.length === 0) { showSnackbar('warning', 'No phone numbers found'); return; }
      const message = `Namaste 🙏\n\nYour selected Ganpati collection is ready.\n\nClick below to view.\n${shareUrl}`;
      const encoded = encodeURIComponent(message);
      phoneNumbers.forEach(phone => window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank'));
      showSnackbar('success', `WhatsApp links opened for ${phoneNumbers.length} customers`);
      setShareDialogOpen(false);
      setSelectedCustomerIds([]);
      setShareGanpatiIds([]);
    } catch { showSnackbar('error', 'Failed to create share link'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            {t('admin.customers')}
          </Typography>
          <Button variant="contained" startIcon={<ShareIcon />} disabled={selectedCustomerIds.length === 0} onClick={() => setShareDialogOpen(true)} sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' }, borderRadius: 3 }}>
            Send Ganpati ({selectedCustomerIds.length})
          </Button>
        </Box>

        <GlassPaper>
          <Tabs value={customerTabValue} onChange={(_, newVal) => setCustomerTabValue(newVal)} sx={{ px: 2, pt: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.875rem' } } }}>
            <Tab label={`${t('table.all')} (${customers.length})`} />
            <Tab label={`${t('customer.mandal')} (${customers.filter(c => c.registrationType === 'MANDAL').length})`} />
            <Tab label={`${t('customer.home_ganpati')} (${customers.filter(c => c.registrationType === 'HOME').length})`} />
          </Tabs>

          <UniversalTable<CustomerRecord>
            data={tableData}
            columns={columns}
            loading={loading}
            rowsPerPage={10}
            showSearch
            enableCheckbox
            onSelectionChange={(rows) => setSelectedCustomerIds(rows.map(r => r.id as string))}
            addButton={{ label: t('customer.add'), onClick: handleAddCustomer, color: 'primary', variant: 'contained' }}
            actions={{
              view: row => { const c = customers.find(c => c.id === row.id); if (c) handleViewCustomer(c); },
              edit: row => { const c = customers.find(c => c.id === row.id); if (c) handleEditCustomer(c); },
              delete: row => { const c = customers.find(c => c.id === row.id); if (c) handleDeleteCustomer(c); }
            }}
            renderActions={(row) => {
              const customer = customers.find(c => c.id === row.id);
              if (!customer) return null;
              return (
                <Tooltip title={customer.isPromoted ? t('customer.already_promoted') : t('customer.promote_to_booking')}>
                  <span>
                    <IconButton size="small" onClick={() => handlePromoteClick(customer)} disabled={customer.isPromoted || submitting} sx={{ color: customer.isPromoted ? '#aaa' : '#4caf50' }}>
                      <PromoteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            }}
          />
        </GlassPaper>
      </Box>

      <EnquiryForm open={enquiryFormOpen} onClose={() => setEnquiryFormOpen(false)} mode="customer" ganpatiList={ganpatiList} editingCustomer={editingCustomer} onSuccess={handleEnquiryFormSuccess} />

      {/* Promote Dialog */}
      <Dialog open={promoteDialogOpen} onClose={() => !submitting && setPromoteDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: { xs: 0, sm: 4 }, maxHeight: '90vh', overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 2, sm: 3 } }}>
          <Box><Typography variant="h6" fontWeight={700}><PromoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />{t('customer.promote_to_booking')}</Typography><Typography variant="caption" sx={{ opacity: 0.85 }}>{selectedCustomer?.name} • {selectedCustomer?.phone}</Typography></Box>
          <IconButton onClick={() => setPromoteDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <form id="promote-form" onSubmit={handleSubmit(onPromoteSubmit)}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <DropdownField name="ganpatiId" label={t('customer.select_ganpati')} options={ganpatiOptions} required size="small" onChangeCallback={(val) => { const g = ganpatiList.find(gg => gg.id === val); if (g) setValue('totalPrice', g.price); }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><NumericField name="totalPrice" label={t('booking.total')} required min={0} max={MAX_AMOUNT} size="small" /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><NumericField name="advancePayment" label={t('booking.advance')} required min={0} max={MAX_AMOUNT} size="small" /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><NumericField name="remainingPayment" label={t('booking.remaining')} required disabled size="small" /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><DateTimeField name="bookingDate" label={t('booking.booking_date')} viewMode="date" size="small" useCurrentDate /></Grid>
                </Grid>
              </Paper>
              {submitting && <LinearProgress sx={{ mt: 2 }} />}
            </form>
          </FormProvider>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setPromoteDialogOpen(false)} disabled={submitting} variant="outlined" sx={{ flex: { xs: 1, sm: 'none' } }}>{t('button.cancel')}</Button>
          <Button type="submit" form="promote-form" variant="contained" disabled={submitting} startIcon={<PromoteIcon />} sx={{ background: 'linear-gradient(135deg, #E65100, #FF8F00)', flex: { xs: 1, sm: 'none' } }}>{submitting ? t('table.loading') : t('customer.promote')}</Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #E65100, #F57C00, #FF8F00, #FFA726)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, px: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5}><PersonIcon sx={{ fontSize: 28 }} /><Typography variant="h6" fontWeight={700}>{t('customer.customer_details')}</Typography></Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={viewCustomer?.isPromoted ? `✅ ${t('customer.booked')}` : `⏳ ${t('customer.pending')}`} size="small" sx={{ bgcolor: viewCustomer?.isPromoted ? '#e8f5e9' : '#fff3e0', color: viewCustomer?.isPromoted ? '#2e7d32' : '#ed6c02', fontWeight: 600 }} />
            <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#faf8f6' }}>
          {viewCustomer && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2 }}><PersonIcon fontSize="small" /> {t('customer.personal_info')}</Typography>
                    <ViewDetailRow label={t('customer.name')} value={viewCustomer.name} icon={<PersonIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label={t('customer.phone')} value={viewCustomer.phone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label={t('customer.alternate_phone')} value={viewCustomer.alternatePhone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label={t('customer.type')} value={viewCustomer.registrationType} />
                    {viewCustomer.mandalName && viewCustomer.mandalName !== 'N/A' && <ViewDetailRow label={t('customer.mandal_name')} value={viewCustomer.mandalName} />}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2 }}><LocationOnIcon fontSize="small" /> {t('customer.address_details')}</Typography>
                    <ViewDetailRow label={t('customer.address')} value={viewCustomer.address} icon={<LocationOnIcon sx={{ fontSize: 18 }} />} />
                    <ViewDetailRow label={t('customer.city')} value={viewCustomer.city} />
                    <ViewDetailRow label={t('customer.taluka')} value={viewCustomer.taluka} />
                    <ViewDetailRow label={t('customer.district')} value={viewCustomer.district} />
                    <ViewDetailRow label={t('customer.state')} value={viewCustomer.state} />
                  </Paper>
                </Grid>
              </Grid>

              {viewCustomer.ganpatiName && viewCustomer.ganpatiName !== 'N/A' && (
                <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2 }}><CategoryIcon fontSize="small" /> {t('customer.ganpati_details')}</Typography>
                  {viewCustomer.ganpatiImage && <Box sx={{ mb: 2 }}><Avatar src={viewCustomer.ganpatiImage} sx={{ width: 80, height: 80, borderRadius: 2 }} /></Box>}
                  <ViewDetailRow label={t('customer.ganpati')} value={viewCustomer.ganpatiName} />
                  <ViewDetailRow label={t('customer.status')} value={viewCustomer.isPromoted ? t('customer.booked') : t('customer.pending')} />
                  <ViewDetailRow label={t('customer.registered_on')} value={viewCustomer.createdAt ? new Date(viewCustomer.createdAt).toLocaleDateString() : 'N/A'} />
                </Paper>
              )}

              {viewCustomer.contactPersons && viewCustomer.contactPersons.length > 0 && (
                <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2 }}><PersonIcon fontSize="small" /> {t('customer.contact_persons')}</Typography>
                  {viewCustomer.contactPersons.map((person, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed #f0ebe6', flexWrap: 'wrap', gap: 0.5, '&:last-child': { borderBottom: 'none' } }}>
                      <Typography variant="body2" fontWeight={500}>{person.name}</Typography>
                      <Typography variant="body2">{person.phone}</Typography>
                      <Typography variant="caption" color="textSecondary">{person.designation}</Typography>
                    </Box>
                  ))}
                </Paper>
              )}

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => { setViewDialogOpen(false); const c = customers.find(c => c.id === viewCustomer.id); if (c) handleEditCustomer(c); }} sx={{ bgcolor: '#1976d2', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>{t('customer.edit_customer')}</Button>
                {!viewCustomer.isPromoted && <Button variant="contained" startIcon={<PromoteIcon />} onClick={() => { setViewDialogOpen(false); const c = customers.find(c => c.id === viewCustomer.id); if (c) handlePromoteClick(c); }} sx={{ background: 'linear-gradient(135deg, #E65100, #FF8F00)', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>{t('customer.promote_to_booking')}</Button>}
                <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => { setViewDialogOpen(false); const c = customers.find(c => c.id === viewCustomer.id); if (c) handleDeleteCustomer(c); }} sx={{ borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>{t('customer.delete_customer')}</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, borderTop: '1px solid #f0ebe6' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ borderRadius: 3, px: 3 }}>{t('button.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ bgcolor: '#25D366', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={1}><ShareIcon /><Typography variant="h6">Send Ganpati Collection</Typography></Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Selected Customers: {selectedCustomerIds.length}</Typography>
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Numbers: {selectedCustomerIds.map(id => customers.find(c => c.id === id)?.phone).filter(Boolean).join(', ') || 'None'}
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom>Select Ganpati to Share:</Typography>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Ganpati</InputLabel>
            <Select
              multiple
              value={shareGanpatiIds}
              onChange={(e) => setShareGanpatiIds(e.target.value as string[])}
              label="Ganpati"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const g = ganpatiList.find(item => item.id === value);
                    return <Chip key={value} avatar={g?.images?.[0] ? <Avatar src={g.images[0]} sx={{ width: 20, height: 20 }} /> : undefined} label={g?.name || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {ganpatiList.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  <Checkbox checked={shareGanpatiIds.indexOf(g.id) > -1} />
                  <ListItemText primary={`${g.name} (${g.height}) - ₹${g.price.toLocaleString()}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setShareDialogOpen(false)} variant="outlined" sx={{ flex: { xs: '1 1 100%', sm: 'none' } }}>Cancel</Button>
          <Button variant="contained" onClick={handleShare} disabled={shareGanpatiIds.length === 0} sx={{ bgcolor: '#25D366', flex: { xs: '1 1 100%', sm: 'none' } }}>Send WhatsApp</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}