import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Chip, IconButton, useTheme, alpha,
  styled, LinearProgress, Tabs, Tab, Divider, Card, TextField,
  MenuItem, Select, FormControl, InputLabel, Avatar
} from '@mui/material';
import {
  Close as CloseIcon, Send as SendIcon, Download as DownloadIcon,
  Save as SaveIcon, Receipt as ReceiptIcon, Payment as PaymentIcon,
  AttachMoney as MoneyIcon, History as HistoryIcon, Edit as EditIcon,
  Person as PersonIcon, Phone as PhoneIcon, LocationOn as LocationOnIcon,
  Category as CategoryIcon, CalendarToday as CalendarTodayIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UniversalTable, Column, ACTION_KEY } from '@/components/uncontrolled/UniversalTable';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { adminService } from '@/services/AdminService';
import { ganpatiService } from '@/services/GanpatiService';
import {
  GanpatiResponseDto, ConfirmedBooking, ConfirmedBookingRequest,
  BookingFormData, BookingRecord, ViewBookingData, InstallmentData
} from '@/types/MurtiType';
import { downloadReceiptPDF } from '@/utils/ReceiptGenerator';
import { sendWhatsAppMessages } from '@/utils/Whatsapp';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const MAX_AMOUNT = 10000000;

type GanpatiRow = { name: string; images?: string[] };
type CustomerRow = { name: string; registrationType?: string };

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  padding: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.1)}` },
}));

const ViewDetailRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
    {icon && <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#666', minWidth: 120, fontWeight: 500 }}>{label}:</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>{value || 'N/A'}</Typography>
  </Box>
);

const StatusChip = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const config: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: t('booking.completed'), color: '#2e7d32', bg: '#e8f5e9' },
    PENDING: { label: t('booking.pending'), color: '#ed6c02', bg: '#fff3e0' },
    CANCELLED: { label: t('booking.cancelled'), color: '#d32f2f', bg: '#ffebee' },
  };
  const c = config[status] || { label: status, color: '#666', bg: '#f5f5f5' };
  return <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, height: 28, '& .MuiChip-label': { fontSize: '0.75rem', px: 1.5 } }} />;
};

export default function BookingManagement() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<ConfirmedBooking | null>(null);
  const [viewBooking, setViewBooking] = useState<ViewBookingData | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);
  const [actionType, setActionType] = useState<'submit' | 'send' | 'download'>('submit');
  const [installments, setInstallments] = useState<InstallmentData[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<ViewBookingData['paymentHistory']>([]);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: {
      customerId: '', customerName: '', customerPhone: '', customerAddress: '', customerTaluka: '', customerDistrict: '',
      mandalName: '', ganpatiId: '', advancePayment: 0, remainingPayment: 0, totalPrice: 0,
      bookingDate: dayjs().format('YYYY-MM-DD'), notes: '', status: 'PENDING', registrationType: 'HOME',
      contactPerson1Name: '', contactPerson1Phone: '', contactPerson1Designation: '',
      contactPerson2Name: '', contactPerson2Phone: '', contactPerson2Designation: '',
    },
  });

  const watchTotalPrice = watch('totalPrice') || 0;
  const watchAdvancePayment = watch('advancePayment') || 0;
  useEffect(() => {
    const remaining = Math.max(0, watchTotalPrice - watchAdvancePayment);
    setValue('remainingPayment', remaining);
  }, [watchTotalPrice, watchAdvancePayment, setValue]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBookings();
      if (response.success && response.data) setBookings(response.data);
      else showSnackbar('error', response.message || t('msg.error'));
    } catch { showSnackbar('error', t('msg.error')); } finally { setLoading(false); }
  }, [t]);

  const fetchGanpatiList = useCallback(async () => {
    try {
      const response = await ganpatiService.getAll();
      if (response.success && response.data) setGanpatiList(response.data);
    } catch { console.error('Failed to fetch ganpati'); }
  }, []);

  useEffect(() => { fetchBookings(); fetchGanpatiList(); }, [fetchBookings, fetchGanpatiList]);

  useEffect(() => {
    if (editingBooking && dialogOpen) {
      const remaining = editingBooking.remainingPayment || 0;
      const history = editingBooking.paymentHistory || [];
      setPaymentHistory(history.map((p) => ({
        amount: p.amount || 0,
        date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date().toLocaleDateString(),
        type: p.paymentType || 'INSTALLMENT',
        notes: p.notes || '',
        remainingAfter: p.remainingAfterPayment || 0
      })));
      setInstallments([{
        id: 1,
        remainingAmount: remaining,
        paidAmount: 0,
        newRemaining: remaining,
        date: dayjs().format('YYYY-MM-DD'),
        isFinal: remaining === 0
      }]);
    }
  }, [editingBooking, dialogOpen]);

  const handleEdit = (booking: ConfirmedBooking) => {
    setEditingBooking(booking);
    const customer = booking.customer;
    const contacts = booking.additionalContacts || [];
    const history = booking.paymentHistory || [];
    setPaymentHistory(history.map((p) => ({
      amount: p.amount || 0,
      date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date().toLocaleDateString(),
      type: p.paymentType || 'INSTALLMENT',
      notes: p.notes || '',
      remainingAfter: p.remainingAfterPayment || 0
    })));
    if (history.length > 0) {
      const installmentsList = history.map((p, index) => ({
        id: index + 1,
        remainingAmount: p.remainingAfterPayment || 0,
        paidAmount: p.amount || 0,
        newRemaining: p.remainingAfterPayment || 0,
        date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date().toLocaleDateString(),
        isFinal: index === history.length - 1
      }));
      setInstallments(installmentsList);
    } else {
      setInstallments([{
        id: 1,
        remainingAmount: booking.remainingPayment || 0,
        paidAmount: 0,
        newRemaining: booking.remainingPayment || 0,
        date: dayjs().format('YYYY-MM-DD'),
        isFinal: booking.remainingPayment === 0
      }]);
    }
    reset({
      customerId: customer?.id || '',
      customerName: booking.customerName || customer?.name || '',
      customerPhone: booking.customerPhone || customer?.phone || '',
      customerAddress: booking.customerAddress || customer?.address || '',
      customerTaluka: booking.customerTaluka || customer?.taluka || '',
      customerDistrict: booking.customerDistrict || customer?.district || '',
      mandalName: booking.mandalName || customer?.mandalName || '',
      ganpatiId: booking.ganpati?.id || '',
      advancePayment: booking.advancePayment || 0,
      remainingPayment: booking.remainingPayment || 0,
      totalPrice: booking.totalPrice || 0,
      bookingDate: booking.bookingDate || dayjs().format('YYYY-MM-DD'),
      notes: booking.notes || '',
      status: booking.status,
      registrationType: (customer?.registrationType as string) || 'HOME',
      contactPerson1Name: contacts[0]?.name || '',
      contactPerson1Phone: contacts[0]?.phone || '',
      contactPerson1Designation: contacts[0]?.designation || '',
      contactPerson2Name: contacts[1]?.name || '',
      contactPerson2Phone: contacts[1]?.phone || '',
      contactPerson2Designation: contacts[1]?.designation || '',
    });
    setDialogOpen(true);
  };

  const handleView = (booking: ConfirmedBooking) => {
    const customer = booking.customer;
    const allContacts = [
      ...(booking.additionalContacts || []),
      ...(customer?.contactPersons?.map((cp) => ({ name: cp.name, phone: cp.phone, designation: cp.designation })) || [])
    ];
    const history = booking.paymentHistory || [];
    const viewData: ViewBookingData = {
      id: booking.id,
      receiptNumber: booking.receiptNumber || 'N/A',
      customerName: booking.customerName || customer?.name || 'N/A',
      customerPhone: booking.customerPhone || customer?.phone || 'N/A',
      customerAddress: booking.customerAddress || customer?.address || 'N/A',
      customerTaluka: booking.customerTaluka || customer?.taluka || 'N/A',
      customerDistrict: booking.customerDistrict || customer?.district || 'N/A',
      mandalName: booking.mandalName || customer?.mandalName || 'N/A',
      ganpatiName: booking.ganpati?.name || 'N/A',
      ganpatiHeight: booking.ganpati?.height || 'N/A',
      ganpatiPrice: booking.ganpati?.price || 0,
      ganpatiImages: booking.ganpati?.images || [],
      advancePayment: booking.advancePayment,
      remainingPayment: booking.remainingPayment,
      totalPrice: booking.totalPrice,
      totalPaidSoFar: booking.totalPaidSoFar || 0,
      bookingDate: booking.bookingDate || 'N/A',
      actualPickupDate: booking.actualPickupDate || 'N/A',
      notes: booking.notes || 'N/A',
      status: booking.status,
      createdAt: new Date(booking.createdAt).toLocaleString(),
      contactPersons: allContacts.filter((c) => c.name && c.phone),
      paymentHistory: history.map((p) => ({
        amount: p.amount || 0,
        date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date().toLocaleDateString(),
        type: p.paymentType || 'INSTALLMENT',
        notes: p.notes || '',
        remainingAfter: p.remainingAfterPayment || 0
      }))
    };
    setViewBooking(viewData);
    setViewDialogOpen(true);
  };

  const handleDelete = async (booking: ConfirmedBooking) => {
    const confirmed = await showConfirmation(t('msg.delete_confirm'), t('common.confirm_action'));
    if (confirmed) {
      const response = await adminService.deleteBooking(booking.id);
      if (response.success) { showSnackbar('success', t('msg.delete_success')); await fetchBookings(); }
      else showSnackbar('error', response.message || t('msg.error'));
    }
  };

  const sendReceiptLink = async (booking: ConfirmedBooking) => {
    const customer = booking.customer;
    const contactNumbers: string[] = [];
    if (customer?.phone) contactNumbers.push(customer.phone);
    else if (booking.customerPhone) contactNumbers.push(booking.customerPhone);
    if (booking.additionalContacts) booking.additionalContacts.forEach((c) => { if (c.phone) contactNumbers.push(c.phone); });
    if (customer?.contactPersons) customer.contactPersons.forEach((c) => { if (c.phone) contactNumbers.push(c.phone); });
    if (contactNumbers.length === 0) { showSnackbar('warning', t('booking.no_phone_number')); return false; }

    try {
      const response = await adminService.generateReceipt(booking.id);
      if (!response.success || !response.data) {
        showSnackbar('error', response.message || 'Failed to generate receipt');
        return false;
      }
      const receiptUrl = response.data.receiptUrl;
      const message = `Namaste 🙏\n\nYour booking receipt is ready.\n\nClick below to view/download.\n${receiptUrl}`;
      sendWhatsAppMessages(contactNumbers, message);
      showSnackbar('success', `Receipt link sent to ${contactNumbers.length} number(s)`);
      return true;
    } catch (error) {
      console.error('Error sending receipt:', error);
      showSnackbar('error', 'Failed to generate or send receipt');
      return false;
    }
  };

  const handleSendReceipt = (booking: ConfirmedBooking) => sendReceiptLink(booking);

  const handleDownloadReceipt = (booking: ConfirmedBooking) => {
    const customer = booking.customer;
    const history = booking.paymentHistory || [];
    const receiptData = {
      receiptNumber: booking.receiptNumber || 'REC-0001',
      date: new Date(booking.createdAt).toLocaleDateString(),
      customerName: booking.customerName || customer?.name || '',
      customerPhone: booking.customerPhone || customer?.phone || '',
      customerAddress: booking.customerAddress || customer?.address || '',
      customerTaluka: booking.customerTaluka || customer?.taluka || '',
      customerDistrict: booking.customerDistrict || customer?.district || '',
      mandalName: booking.mandalName || customer?.mandalName || '',
      ganpatiName: booking.ganpati?.name || '',
      ganpatiHeight: booking.ganpati?.height || '',
      ganpatiPrice: booking.ganpati?.price || 0,
      advancePayment: booking.advancePayment,
      remainingPayment: booking.remainingPayment,
      totalPrice: booking.totalPrice,
      totalPaidSoFar: booking.totalPaidSoFar || 0,
      bookingDate: booking.bookingDate || dayjs().format('YYYY-MM-DD'),
      status: booking.status,
      contactNumbers: [],
      paymentHistory: history.map((p) => ({
        amount: p.amount || 0,
        date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date().toLocaleDateString(),
        type: p.paymentType || 'INSTALLMENT',
        notes: p.notes || '',
        remainingAfter: p.remainingAfterPayment || 0
      }))
    };
    downloadReceiptPDF(receiptData);
    showSnackbar('success', t('booking.receipt_downloaded'));
  };

  const handleAddInstallment = () => {
    const last = installments[installments.length - 1];
    if (last && last.newRemaining > 0) {
      setInstallments([...installments, {
        id: installments.length + 1,
        remainingAmount: last.newRemaining,
        paidAmount: 0,
        newRemaining: last.newRemaining,
        date: dayjs().format('YYYY-MM-DD'),
        isFinal: false
      }]);
    }
  };

  const handleInstallmentChange = (id: number, value: string) => {
    const paidAmount = Math.max(0, parseFloat(value) || 0);
    setInstallments((prev) => prev.map((inst) => {
      if (inst.id === id) {
        const actualPaid = Math.min(paidAmount, inst.remainingAmount);
        const newRemaining = Math.max(0, inst.remainingAmount - actualPaid);
        return { ...inst, paidAmount: actualPaid, newRemaining, isFinal: newRemaining === 0 };
      }
      return inst;
    }));
  };

  const onSubmit = async (data: BookingFormData, action: 'submit' | 'send' | 'download') => {
    if (Object.keys(errors).length > 0) { showSnackbar('warning', t('validation.fix_errors')); return; }
    setSubmitting(true); setActionType(action);
    try {
      const additionalContacts: { name: string; phone: string; designation: string }[] = [];
      if (data.contactPerson1Name && data.contactPerson1Phone) {
        additionalContacts.push({ name: data.contactPerson1Name, phone: data.contactPerson1Phone, designation: data.contactPerson1Designation || t('common.contact_person') });
      }
      if (data.contactPerson2Name && data.contactPerson2Phone) {
        additionalContacts.push({ name: data.contactPerson2Name, phone: data.contactPerson2Phone, designation: data.contactPerson2Designation || t('common.contact_person') });
      }
      let totalPaid = data.advancePayment;
      for (const inst of installments) if (inst.paidAmount > 0) totalPaid += inst.paidAmount;
      const remaining = Math.max(0, data.totalPrice - totalPaid);

      const requestData: ConfirmedBookingRequest = {
        customerId: data.customerId || undefined,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress || undefined,
        customerTaluka: data.customerTaluka || undefined,
        customerDistrict: data.customerDistrict || undefined,
        mandalName: data.mandalName || undefined,
        additionalContacts: additionalContacts.length > 0 ? additionalContacts : undefined,
        ganpatiId: data.ganpatiId,
        advancePayment: totalPaid,
        remainingPayment: remaining,
        totalPrice: data.totalPrice,
        bookingDate: data.bookingDate,
        notes: data.notes,
        status: remaining === 0 ? 'COMPLETED' : 'PENDING',
        createNewCustomer: !data.customerId,
        customerRegistrationType: data.registrationType as 'HOME' | 'MANDAL' | undefined,
        customerContactPersons: additionalContacts,
        installments: installments.map((inst) => ({
          id: inst.id,
          remainingAmount: inst.remainingAmount,
          paidAmount: inst.paidAmount,
          newRemaining: inst.newRemaining,
          date: inst.date,
          isFinal: inst.isFinal
        }))
      };

      const response = editingBooking
        ? await adminService.updateBooking(editingBooking.id, requestData)
        : await adminService.createBooking(requestData);

      if (response.success) {
        showSnackbar('success', editingBooking ? t('msg.update_success') : t('msg.save_success'));
        setDialogOpen(false);
        await fetchBookings();
        if (action === 'send' || action === 'download') {
          const booking = response.data;
          if (booking) {
            if (action === 'send') {
              await sendReceiptLink(booking);
            } else if (action === 'download') {
              handleDownloadReceipt(booking);
            }
          }
        }
      } else {
        showSnackbar('error', response.message || t('msg.error'));
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('error', t('msg.error'));
    } finally {
      setSubmitting(false);
      setActionType('submit');
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      COMPLETED: 'success', PENDING: 'warning', CANCELLED: 'error'
    };
    return map[status] || 'default';
  };

  const getFilteredBookings = () => {
    if (tabValue === 0) return bookings;
    const type = tabValue === 1 ? 'MANDAL' : 'HOME';
    return bookings.filter((b) => {
      const regType = b.customer?.registrationType;
      return regType === type;
    });
  };

  const columns: Column<BookingRecord>[] = [
    {
      key: 'ganpati',
      label: t('booking.ganpati'),
      render: (row) => {
        const ganpati = row.ganpati as GanpatiRow;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            {ganpati?.images?.[0] && <Avatar src={ganpati.images[0]} sx={{ width: 30, height: 30, borderRadius: 1 }} />}
            <Typography variant="body2">{ganpati?.name}</Typography>
          </Box>
        );
      },
    },
    {
      key: 'customerName',
      label: t('booking.customer'),
      render: (row) => {
        const customer = row.customer as CustomerRow;
        return (
          <Box>
            <Typography variant="body2">{row.customerName || customer?.name}</Typography>
            {row.registrationType && (
              <Chip label={row.registrationType === 'MANDAL' ? t('customer.mandal') : t('customer.home_ganpati')}
                size="small" sx={{ fontSize: 10, height: 18 }} />
            )}
          </Box>
        );
      },
    },
    {
      key: 'totalPrice',
      label: 'TA/PA',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="primary">₹{Number(row.totalPrice)?.toLocaleString()}</Typography>
          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem' }}>/ ₹{Number(row.advancePayment)?.toLocaleString()}</Typography>
        </Box>
      ),
    },
    {
      key: 'remainingPayment',
      label: t('booking.remaining'),
      render: (row) => <Typography color="error" fontWeight={600}>₹{Number(row.remainingPayment)?.toLocaleString()}</Typography>,
    },
    {
      key: 'status',
      label: t('booking.status'),
      render: (row) => {
        const map: Record<string, string> = { COMPLETED: t('booking.completed'), PENDING: t('booking.pending'), CANCELLED: t('booking.cancelled') };
        return <Chip label={map[row.status] || row.status} size="small" color={getStatusColor(row.status)} />;
      },
    },
    { key: ACTION_KEY, label: t('table.actions') },
  ];

  const filteredBookings = getFilteredBookings();
  const totalAmount = filteredBookings.reduce((sum, row) => sum + (Number(row.totalPrice) || 0), 0);
  const paidAmount = filteredBookings.reduce((sum, row) => sum + (Number(row.advancePayment) || 0), 0);

  const tableData: BookingRecord[] = filteredBookings.map((booking) => ({
    id: booking.id,
    customerName: booking.customerName || booking.customer?.name,
    customer: booking.customer,
    ganpati: booking.ganpati,
    totalPrice: booking.totalPrice,
    advancePayment: booking.advancePayment,
    remainingPayment: booking.remainingPayment,
    status: booking.status,
    registrationType: booking.customer?.registrationType as string,
  }));

  const ganpatiOptions = ganpatiList.map((g) => ({ value: g.id, label: `${g.name} (${g.height}) - ₹${g.price.toLocaleString()}` }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Typography variant="h4" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {t('admin.bookings')}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`${bookings.filter((b) => b.status === 'COMPLETED').length} ${t('booking.completed')}`} color="success" size="small" />
              <Chip label={`${bookings.filter((b) => b.status === 'PENDING').length} ${t('booking.pending')}`} color="warning" size="small" />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">{t('booking.total_amount_ta')}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#d32f2f' }}>₹{totalAmount.toLocaleString()}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#d32f2f', 0.1), color: '#d32f2f' }}><MoneyIcon /></Avatar>
                </Box>
              </StatCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">{t('booking.paid_amount_pa')}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#2e7d32' }}>₹{paidAmount.toLocaleString()}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#2e7d32', 0.1), color: '#2e7d32' }}><PaymentIcon /></Avatar>
                </Box>
              </StatCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="textSecondary">{t('booking.remaining_amount')}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#ed6c02' }}>₹{(totalAmount - paidAmount).toLocaleString()}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#ed6c02', 0.1), color: '#ed6c02' }}><HistoryIcon /></Avatar>
                </Box>
              </StatCard>
            </Grid>
          </Grid>

          <GlassPaper>
            <Tabs value={tabValue} onChange={(_, newVal) => setTabValue(newVal)} sx={{ px: 2, pt: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.875rem' } } }}>
              <Tab label={`${t('table.all')} (${bookings.length})`} />
              <Tab label={`${t('customer.mandal')} (${bookings.filter((b) => (b.customer?.registrationType as string) === 'MANDAL').length})`} />
              <Tab label={`${t('customer.home_ganpati')} (${bookings.filter((b) => (b.customer?.registrationType as string) === 'HOME').length})`} />
            </Tabs>

            <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="caption" fontWeight={600} color="textSecondary">{t('booking.ta_pa_legend')}</Typography>
            </Box>

            <UniversalTable<BookingRecord>
              data={tableData}
              columns={columns}
              loading={loading}
              rowsPerPage={10}
              showSearch
              actions={{
                view: (row) => { const orig = bookings.find((b) => b.id === row.id); if (orig) handleView(orig); },
                edit: (row) => { const orig = bookings.find((b) => b.id === row.id); if (orig) handleEdit(orig); },
                delete: (row) => { const orig = bookings.find((b) => b.id === row.id); if (orig) handleDelete(orig); },
                send: (row) => { const orig = bookings.find((b) => b.id === row.id); if (orig) handleSendReceipt(orig); },
                download: (row) => { const orig = bookings.find((b) => b.id === row.id); if (orig) handleDownloadReceipt(orig); },
              }}
              rowClickable
              onRowClick={(row) => { const orig = bookings.find((b) => b.id === row.id); if (orig) handleView(orig); }}
            />
          </GlassPaper>

          <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: { xs: 0, sm: 4 }, maxHeight: '90vh', overflow: 'hidden' } }}>
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}><PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />{editingBooking ? t('booking.edit') : t('booking.add')}</Typography>
                {editingBooking && editingBooking.ganpati?.images?.[0] && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Avatar src={editingBooking.ganpati.images[0]} sx={{ width: 30, height: 30, borderRadius: 1 }} />
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>{editingBooking.ganpati?.name} - {editingBooking.ganpati?.height}</Typography>
                  </Box>
                )}
              </Box>
              <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
              <form id="booking-form">
                <Card sx={{ mb: 3, p: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="textSecondary">{t('booking.customer')}</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{watch('customerName') || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="textSecondary">{t('customer.phone')}</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{watch('customerPhone') || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Card>

                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Controller name="ganpatiId" control={control} rules={{ required: t('validation.required') }} render={({ field, fieldState }) => {
                      const selectedGanpati = ganpatiList.find((g) => g.id === field.value);
                      if (selectedGanpati && !editingBooking) setValue('totalPrice', selectedGanpati.price);
                      return (
                        <FormControl fullWidth size="small" error={!!fieldState.error}>
                          <InputLabel>{t('booking.select_ganpati')}</InputLabel>
                          <Select {...field} label={t('booking.select_ganpati')}>
                            {ganpatiOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </Select>
                          {fieldState.error && <Typography variant="caption" color="error">{fieldState.error.message}</Typography>}
                        </FormControl>
                      );
                    }} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller name="totalPrice" control={control} rules={{ required: t('validation.required'), min: 0 }} render={({ field, fieldState }) => (
                      <TextField {...field} fullWidth size="small" label={t('booking.total')} type="number" InputProps={{ inputProps: { min: 0, max: MAX_AMOUNT } }} error={!!fieldState.error} helperText={fieldState.error?.message} onChange={(e) => { const val = parseFloat(e.target.value) || 0; field.onChange(val); }} />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller name="advancePayment" control={control} rules={{ required: t('validation.required'), min: 0 }} render={({ field, fieldState }) => (
                      <TextField {...field} fullWidth size="small" label={t('booking.advance')} type="number" InputProps={{ inputProps: { min: 0, max: MAX_AMOUNT } }} error={!!fieldState.error} helperText={fieldState.error?.message} onChange={(e) => { const val = parseFloat(e.target.value) || 0; field.onChange(val); }} />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller name="remainingPayment" control={control} render={({ field }) => (
                      <TextField {...field} fullWidth size="small" label={t('booking.remaining')} type="number" InputProps={{ readOnly: true }} />
                    )} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller name="bookingDate" control={control} render={({ field }) => (
                      <DatePicker {...field} label={t('booking.booking_date')} slotProps={{ textField: { size: 'small', fullWidth: true } }} value={field.value ? dayjs(field.value) : null} onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')} />
                    )} />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <MoneyIcon color="primary" /> {t('booking.installment_payments')}
                  <Chip label={`${installments.filter((i) => i.paidAmount > 0).length} ${t('booking.payments_made')}`} size="small" color="success" />
                </Typography>

                {paymentHistory.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><HistoryIcon fontSize="small" /> {t('booking.payment_history')}</Typography>
                    {paymentHistory.map((record, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#faf8f6' }}>
                        <Grid container spacing={1} alignItems="center">
                          <Grid size={{ xs: 6 }}><Typography variant="caption" color="textSecondary">{t('booking.date')}</Typography><Typography variant="body2">{record.date}</Typography></Grid>
                          <Grid size={{ xs: 6 }}><Typography variant="caption" color="textSecondary">{t('booking.amount')}</Typography><Typography variant="body2" fontWeight={600} color="primary">₹{record.amount.toLocaleString()}</Typography></Grid>
                          <Grid size={{ xs: 6 }}><Typography variant="caption" color="textSecondary">{t('booking.type')}</Typography><Chip label={record.type} size="small" sx={{ fontSize: 10, height: 18 }} /></Grid>
                          <Grid size={{ xs: 6 }}><Typography variant="caption" color="textSecondary">{t('booking.remaining')}</Typography><Typography variant="body2" fontWeight={600} color="error">₹{record.remainingAfter.toLocaleString()}</Typography></Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                )}

                {installments.map((inst) => (
                  <Card key={inst.id} sx={{ mb: 2, p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                      <Typography variant="subtitle2" fontWeight={600}>{t('booking.installment')} #{inst.id}{inst.isFinal && <Chip label={t('booking.final')} size="small" color="success" sx={{ ml: 1 }} />}</Typography>
                      <Typography variant="caption" color="textSecondary">{t('booking.remaining')}: ₹{inst.remainingAmount.toLocaleString()}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label={t('booking.remaining')} value={inst.remainingAmount.toLocaleString()} InputProps={{ readOnly: true }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label={t('booking.pay_amount')} type="number" value={inst.paidAmount || ''} InputProps={{ inputProps: { min: 0, max: inst.remainingAmount } }} onChange={(e) => handleInstallmentChange(inst.id, e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth size="small" label={t('booking.new_remaining')} value={inst.newRemaining.toLocaleString()} InputProps={{ readOnly: true }} />
                      </Grid>
                    </Grid>
                  </Card>
                ))}

                {installments.length > 0 && installments[installments.length - 1].newRemaining > 0 && (
                  <Button variant="outlined" onClick={handleAddInstallment} startIcon={<PaymentIcon />} sx={{ mb: 2, borderRadius: 30, width: { xs: '100%', sm: 'auto' } }}>{t('booking.add_installment')}</Button>
                )}
                {installments.length > 0 && installments[installments.length - 1].newRemaining === 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, border: `1px solid ${theme.palette.success.main}` }}>
                    <Typography variant="body2" color="success.main" fontWeight={600}>{t('booking.all_payments_completed')}</Typography>
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Controller name="notes" control={control} render={({ field }) => (
                      <TextField {...field} fullWidth size="small" label={t('booking.notes')} multiline rows={2} placeholder={t('booking.add_payment_notes')} />
                    )} />
                  </Grid>
                </Grid>

                {submitting && <LinearProgress sx={{ mt: 2 }} />}
              </form>
            </DialogContent>

            <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button onClick={() => setDialogOpen(false)} disabled={submitting} variant="outlined" sx={{ flex: { xs: 1, sm: 'none' } }}>{t('button.cancel')}</Button>
              <Button variant="contained" disabled={submitting} onClick={() => handleSubmit((data) => onSubmit(data, 'submit'))()} startIcon={<SaveIcon />} sx={{ bgcolor: '#1976d2', flex: { xs: 1, sm: 'none' } }}>{submitting && actionType === 'submit' ? t('table.loading') : t('booking.save_only')}</Button>
              <Button variant="contained" disabled={submitting} onClick={() => handleSubmit((data) => onSubmit(data, 'send'))()} startIcon={<SendIcon />} sx={{ bgcolor: '#25D366', flex: { xs: 1, sm: 'none' } }}>{submitting && actionType === 'send' ? t('table.loading') : t('booking.save_send')}</Button>
              <Button variant="contained" disabled={submitting} onClick={() => handleSubmit((data) => onSubmit(data, 'download'))()} startIcon={<DownloadIcon />} sx={{ background: 'linear-gradient(135deg, #E65100, #FF8F00)', flex: { xs: 1, sm: 'none' }, transition: 'all 0.3s ease' }}>{submitting && actionType === 'download' ? t('table.loading') : t('booking.save_download')}</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #E65100 0%, #F57C00 30%, #FF8F00 60%, #FFA726 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, px: 3, flexWrap: 'wrap', gap: 1 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <ReceiptIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{t('booking.booking_details')}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                {viewBooking && <StatusChip status={viewBooking.status} />}
                <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#faf8f6' }}>
              {viewBooking && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', height: '100%' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon fontSize="small" /> {t('booking.customer_info')}</Typography>
                        <ViewDetailRow label={t('customer.name')} value={viewBooking.customerName} icon={<PersonIcon sx={{ fontSize: 18 }} />} />
                        <ViewDetailRow label={t('customer.phone')} value={viewBooking.customerPhone} icon={<PhoneIcon sx={{ fontSize: 18 }} />} />
                        {viewBooking.mandalName && viewBooking.mandalName !== 'N/A' && <ViewDetailRow label={t('customer.mandal_name')} value={viewBooking.mandalName} />}
                        <ViewDetailRow label={t('customer.address')} value={viewBooking.customerAddress} icon={<LocationOnIcon sx={{ fontSize: 18 }} />} />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', height: '100%' }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><CategoryIcon fontSize="small" /> {t('booking.ganpati_info')}</Typography>
                        {viewBooking.ganpatiImages && viewBooking.ganpatiImages.length > 0 && (
                          <Box sx={{ mb: 2 }}><Avatar src={viewBooking.ganpatiImages[0]} sx={{ width: 60, height: 60, borderRadius: 2 }} /></Box>
                        )}
                        <ViewDetailRow label={t('ganpati.name')} value={viewBooking.ganpatiName} />
                        <ViewDetailRow label={t('ganpati.height')} value={viewBooking.ganpatiHeight} />
                        <ViewDetailRow label={t('ganpati.price')} value={`₹${viewBooking.ganpatiPrice?.toLocaleString() || 0}`} />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><MoneyIcon fontSize="small" /> {t('booking.payment_summary')}</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#fff5f0', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="textSecondary">{t('booking.total')}</Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#d32f2f' }}>₹{viewBooking.totalPrice?.toLocaleString() || 0}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="textSecondary">{t('booking.paid_so_far')}</Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#2e7d32' }}>₹{viewBooking.totalPaidSoFar?.toLocaleString() || 0}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="caption" color="textSecondary">{t('booking.remaining')}</Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#ed6c02' }}>₹{viewBooking.remainingPayment?.toLocaleString() || 0}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {viewBooking.paymentHistory && viewBooking.paymentHistory.length > 0 && (
                    <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><HistoryIcon fontSize="small" /> {t('booking.payment_history')}</Typography>
                      {viewBooking.paymentHistory.map((record, idx) => (
                        <Box key={idx} sx={{ p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#faf8f6', border: '1px solid #f0ebe6', '&:last-child': { mb: 0 } }}>
                          <Grid container spacing={1} alignItems="center">
                            <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="textSecondary">{t('booking.date')}</Typography><Typography variant="body2" fontWeight={500}>{record.date}</Typography></Grid>
                            <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="textSecondary">{t('booking.amount')}</Typography><Typography variant="body2" fontWeight={600} color="primary">₹{record.amount?.toLocaleString() || 0}</Typography></Grid>
                            <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="textSecondary">{t('booking.type')}</Typography><Chip label={record.type || 'INSTALLMENT'} size="small" sx={{ fontSize: 10, height: 20 }} /></Grid>
                            <Grid size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="textSecondary">{t('booking.remaining')}</Typography><Typography variant="body2" fontWeight={600} color="error">₹{record.remainingAfter?.toLocaleString() || 0}</Typography></Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Paper>
                  )}

                  <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><CalendarTodayIcon fontSize="small" /> {t('booking.dates_status')}</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}><ViewDetailRow label={t('booking.booking_date')} value={viewBooking.bookingDate} icon={<CalendarTodayIcon sx={{ fontSize: 18 }} />} /></Grid>
                      <Grid size={{ xs: 12, sm: 6 }}><ViewDetailRow label={t('booking.created_at')} value={viewBooking.createdAt} /></Grid>
                    </Grid>
                  </Paper>

                  {viewBooking.contactPersons && viewBooking.contactPersons.length > 0 && (
                    <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon fontSize="small" /> {t('booking.contact_persons')}</Typography>
                      {viewBooking.contactPersons.map((person, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed #f0ebe6', flexWrap: 'wrap', gap: 0.5, '&:last-child': { borderBottom: 'none' } }}>
                          <Typography variant="body2" fontWeight={500}>{person.name}</Typography>
                          <Typography variant="body2">{person.phone}</Typography>
                          <Typography variant="caption" color="textSecondary">{person.designation}</Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}

                  {viewBooking.notes && viewBooking.notes !== 'N/A' && (
                    <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe6', mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><InfoIcon fontSize="small" /> {t('booking.notes')}</Typography>
                      <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>{viewBooking.notes}</Typography>
                    </Paper>
                  )}

                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button variant="contained" startIcon={<SendIcon />} onClick={() => { const booking = bookings.find((b) => b.id === viewBooking.id); if (booking) handleSendReceipt(booking); }} sx={{ bgcolor: '#25D366', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>{t('booking.send_receipt')}</Button>
                    <Button variant="contained" startIcon={<ReceiptIcon />} onClick={async () => {
                      const booking = bookings.find((b) => b.id === viewBooking.id);
                      if (booking) {
                        const res = await adminService.generateReceipt(booking.id);
                        if (res.success && res.data) { showSnackbar('success', `Receipt link: ${res.data.receiptUrl}`); navigator.clipboard.writeText(res.data.receiptUrl); } else showSnackbar('error', res.message || 'Failed');
                      }
                    }} sx={{ bgcolor: '#1976d2', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>Generate & Copy Link</Button>
                    <Button variant="contained" startIcon={<ReceiptIcon />} onClick={async () => {
                      const booking = bookings.find((b) => b.id === viewBooking.id);
                      if (booking) {
                        const res = await adminService.generateReceipt(booking.id);
                        if (res.success && res.data) {
                          const msg = `Namaste 🙏\n\nYour booking receipt is ready.\n\n${res.data.receiptUrl}`;
                          const encoded = encodeURIComponent(msg);
                          const customer = booking.customer;
                          const numbers: string[] = [];
                          if (customer?.phone) numbers.push(customer.phone);
                          else if (booking.customerPhone) numbers.push(booking.customerPhone);
                          if (booking.additionalContacts) booking.additionalContacts.forEach(c => { if (c.phone) numbers.push(c.phone); });
                          if (customer?.contactPersons) customer.contactPersons.forEach(c => { if (c.phone) numbers.push(c.phone); });
                          numbers.forEach(phone => window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank'));
                          showSnackbar('success', `Link sent to ${numbers.length} number(s)`);
                        } else showSnackbar('error', res.message || 'Failed');
                      }
                    }} sx={{ bgcolor: '#25D366', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>Generate & Send WhatsApp</Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => { const booking = bookings.find((b) => b.id === viewBooking.id); if (booking) handleDownloadReceipt(booking); }} sx={{ background: 'linear-gradient(135deg, #E65100, #FF8F00)', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>{t('booking.download_pdf')}</Button>
                    <Button variant="contained" startIcon={<EditIcon />} onClick={() => { setViewDialogOpen(false); const booking = bookings.find((b) => b.id === viewBooking.id); if (booking) handleEdit(booking); }} sx={{ bgcolor: '#1976d2', borderRadius: 3, px: 3, flex: { xs: '1 1 100%', sm: 'none' } }}>{t('booking.edit_booking')}</Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0, borderTop: '1px solid #f0ebe6' }}>
              <Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ borderRadius: 3, px: 3 }}>{t('button.close')}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
}