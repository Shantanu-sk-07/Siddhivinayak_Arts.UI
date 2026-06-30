// src/container/public/EnquiryForm.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box, Typography, Grid, Button, Dialog, DialogTitle,
  DialogContent, IconButton, CircularProgress, Tabs, Tab,
  alpha, Avatar, Chip, Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Home as HomeIcon,
  EmojiEvents as TempleIcon,
  Save as SaveIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { enquiryService } from '@/services/EnquiryService';
import { generateEnquiryMessage, sendWhatsAppMessage } from '@/utils/Whatsapp';
import { config } from '@/constants/config';
import { GanpatiResponseDto, RegistrationType, User } from '@/types/MurtiType';
import TextInputField from '@/components/controlled/TextInputField';
import MobileField from '@/components/controlled/MobileField';
import DropdownField from '@/components/controlled/DropdownField';
import { useTheme } from '@mui/material';

const indianStates = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala',
  'Andhra Pradesh', 'Telangana', 'Uttar Pradesh', 'Delhi', 'Rajasthan',
  'Madhya Pradesh', 'West Bengal', 'Odisha', 'Punjab', 'Haryana'
];

const maharashtraDistricts = [
  'Pune', 'Mumbai City', 'Mumbai Suburban', 'Thane', 'Nashik',
  'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli',
  'Satara', 'Ratnagiri', 'Raigad', 'Palghar', 'Jalgaon',
  'Dhule', 'Nandurbar', 'Ahmednagar', 'Beed', 'Latur',
  'Osmanabad', 'Nanded', 'Parbhani', 'Hingoli', 'Washim',
  'Akola', 'Amravati', 'Buldhana', 'Yavatmal', 'Wardha',
  'Chandrapur', 'Gadchiroli', 'Bhandara', 'Gondia'
];

const talukas: Record<string, string[]> = {
  'Pune': ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Shirur', 'Daund', 'Baramati', 'Purandar', 'Velhe', 'Bhor'],
  'Mumbai City': ['Colaba', 'Fort', 'Byculla', 'Worli', 'Mahim', 'Matunga'],
  'Mumbai Suburban': ['Andheri', 'Bandra', 'Kurla', 'Ghatkopar', 'Mulund', 'Borivali', 'Dadar'],
  'Thane': ['Thane', 'Kalyan', 'Bhiwandi', 'Ulhasnagar', 'Ambernath', 'Palava'],
  'Nashik': ['Nashik', 'Malegaon', 'Sinnar', 'Igatpuri', 'Niphad', 'Yeola'],
  'Nagpur': ['Nagpur', 'Wardha', 'Katol', 'Ramtek', 'Umred', 'Kamptee'],
  'Aurangabad': ['Aurangabad', 'Paithan', 'Vaijapur', 'Gangapur', 'Sillod'],
  'Solapur': ['Solapur', 'Pandharpur', 'Akkalkot', 'Barsi', 'Malshiras'],
  'Kolhapur': ['Kolhapur', 'Ichalkaranji', 'Shirol', 'Hatkanangle', 'Karvir'],
  'Sangli': ['Sangli', 'Miraj', 'Tasgaon', 'Kavathe Mahankal', 'Jat'],
  'Satara': ['Satara', 'Karad', 'Wai', 'Koregaon', 'Phaltan'],
  'Ratnagiri': ['Ratnagiri', 'Chiplun', 'Guhagar', 'Dapoli', 'Lanja'],
  'Raigad': ['Alibag', 'Panvel', 'Khopoli', 'Patalganga', 'Roha'],
  'Palghar': ['Palghar', 'Vasai', 'Virar', 'Boisar', 'Dahanu'],
  'Jalgaon': ['Jalgaon', 'Bhusawal', 'Chalisgaon', 'Pachora', 'Jamner'],
  'Ahmednagar': ['Ahmednagar', 'Shrirampur', 'Rahuri', 'Kopargaon', 'Sangamner']
};

const stateOptions = indianStates.map((state) => ({ value: state, label: state }));
const districtOptions = maharashtraDistricts.map((district) => ({ value: district, label: district }));

const getTalukaOptions = (district: string): { value: string; label: string }[] => {
  if (!district || !talukas[district]) {
    return [{ value: '', label: 'Select Taluka' }];
  }
  return talukas[district].map((taluka) => ({ value: taluka, label: taluka }));
};

export interface EnquiryFormValues {
  name: string;
  phone: string;
  alternatePhone: string;
  state: string;
  district: string;
  taluka: string;
  city: string;
  address: string;
  registrationType: RegistrationType;
  mandalName: string;
  adhyakshyaName: string;
  adhyakshyaPhone: string;
  contactPerson1Phone: string;
  contactPerson2Phone: string;
  ganpatiId: string;
}

interface EnquiryFormProps {
  open: boolean;
  onClose: () => void;
  ganpati?: GanpatiResponseDto | null;
  mode?: 'enquiry' | 'customer';
  onSuccess?: () => void;
  ganpatiList?: GanpatiResponseDto[];
  editingCustomer?: User | null;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  open,
  onClose,
  ganpati = null,
  mode = 'enquiry',
  onSuccess,
  ganpatiList = [],
  editingCustomer = null
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiResponseDto | null>(ganpati);
  const isInitialized = useRef<boolean>(false);

  const isEnquiryMode = mode === 'enquiry';
  const isCustomerMode = mode === 'customer';

  const methods = useForm<EnquiryFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      alternatePhone: '',
      state: 'Maharashtra',
      district: '',
      taluka: '',
      city: '',
      address: '',
      registrationType: 'HOME',
      mandalName: '',
      adhyakshyaName: '',
      adhyakshyaPhone: '',
      contactPerson1Phone: '',
      contactPerson2Phone: '',
      ganpatiId: '',
    }
  });

  const { watch, reset, handleSubmit, setValue } = methods;
  const selectedDistrict = watch('district');
  const talukaOptions = useMemo(() => getTalukaOptions(selectedDistrict), [selectedDistrict]);

  useEffect(() => {
    if (open && !isInitialized.current) {
      isInitialized.current = true;
      
      if (editingCustomer) {
        reset({
          name: editingCustomer.name || '',
          phone: editingCustomer.phone || '',
          alternatePhone: editingCustomer.alternatePhone || '',
          state: editingCustomer.state || 'Maharashtra',
          district: editingCustomer.district || '',
          taluka: editingCustomer.taluka || '',
          city: editingCustomer.city || '',
          address: editingCustomer.address || '',
          registrationType: editingCustomer.registrationType || 'HOME',
          mandalName: editingCustomer.mandalName || '',
          adhyakshyaName: editingCustomer.adhyakshyaName || '',
          adhyakshyaPhone: editingCustomer.adhyakshyaPhone || '',
          contactPerson1Phone: editingCustomer.contactPersons?.[0]?.phone || '',
          contactPerson2Phone: editingCustomer.contactPersons?.[1]?.phone || '',
          ganpatiId: editingCustomer.ganpatiId || '',
        });
        if (editingCustomer.ganpatiId) {
          const found = ganpatiList.find((g) => g.id === editingCustomer.ganpatiId);
          if (found) {
            setSelectedGanpati(found);
          }
        }
        setTabValue(editingCustomer.registrationType === 'MANDAL' ? 1 : 0);
      } else {
        setSelectedGanpati(ganpati);
        reset({
          name: '',
          phone: '',
          alternatePhone: '',
          state: 'Maharashtra',
          district: '',
          taluka: '',
          city: '',
          address: '',
          registrationType: 'HOME',
          mandalName: '',
          adhyakshyaName: '',
          adhyakshyaPhone: '',
          contactPerson1Phone: '',
          contactPerson2Phone: '',
          ganpatiId: '',
        });
        setTabValue(0);
      }
      setSubmitting(false);
    }

    if (!open) {
      isInitialized.current = false;
    }
  }, [open, editingCustomer, ganpati, reset, ganpatiList]);

  const handleClose = (): void => {
    onClose();
    setSubmitting(false);
    setTabValue(0);
    isInitialized.current = false;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
    const type = newValue === 0 ? 'HOME' : 'MANDAL';
    setValue('registrationType', type);
  };

  const handleGanpatiChange = (ganpatiId: string): void => {
    const found = ganpatiList.find((g) => g.id === ganpatiId);
    if (found) {
      setSelectedGanpati(found);
    }
  };

  const onSubmit: SubmitHandler<EnquiryFormValues> = async (data) => {
    setSubmitting(true);

    try {
      if (isEnquiryMode && selectedGanpati) {
        const response = await enquiryService.submitEnquiry({
          ...data,
          ganpatiId: selectedGanpati.id,
          registrationType: data.registrationType
        });

        if (response.success) {
          showSnackbar('success', 'Enquiry submitted successfully! 🙏');
          
          const message = generateEnquiryMessage(
            selectedGanpati.name,
            selectedGanpati.height,
            selectedGanpati.price,
            data.name,
            data.phone,
            `Type: ${data.registrationType === 'HOME' ? 'Home Ganpati' : 'Mandal Ganpati'}`
          );
          
          sendWhatsAppMessage(config.ADMIN_WHATSAPP, message);
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          showSnackbar('error', response.message || t('msg.error'));
        }
      } else if (isCustomerMode) {
        const payload = {
          ...data,
          ganpatiId: selectedGanpati?.id || '',
          registrationType: data.registrationType
        };

        let response;
        if (editingCustomer) {
          response = await enquiryService.updateCustomer(editingCustomer.id, payload);
        } else {
          response = await enquiryService.createCustomer(payload);
        }

        if (response.success) {
          showSnackbar('success', editingCustomer ? 'Customer updated successfully' : 'Customer registered successfully');
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          showSnackbar('error', response.message || t('msg.error'));
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showSnackbar('error', t('msg.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = (): string => {
    if (isCustomerMode) {
      return editingCustomer ? 'Edit Customer' : 'New Customer';
    }
    if (isEnquiryMode && selectedGanpati) {
      return t('enquiry.title');
    }
    return t('enquiry.select_type');
  };

  const ganpatiOptions = ganpatiList.map((g) => ({
    value: g.id,
    label: `${g.name} (${g.height}) - ₹${g.price.toLocaleString()}`
  }));

  const isMobile = window.innerWidth < 600;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          margin: { xs: 0, sm: 'auto' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)',
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
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 1,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          }
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {getTitle()}
            </Typography>
            {isEnquiryMode && selectedGanpati && (
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {selectedGanpati.name} • {selectedGanpati.height}
              </Typography>
            )}
          </Box>
          {selectedGanpati && (
            <Chip
              avatar={<Avatar src={selectedGanpati.images?.[0]} sx={{ width: 28, height: 28 }} />}
              label={`${selectedGanpati.name} - ${selectedGanpati.height}`}
              size="small"
              sx={{ 
                bgcolor: alpha('#fff', 0.2), 
                color: 'white',
                '& .MuiChip-label': { fontWeight: 600, fontSize: '0.7rem' }
              }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white', position: 'relative', zIndex: 1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          px: 2
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #E65100, #FF8F00)',
              }
            }}
          >
            <Tab 
              icon={<HomeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />} 
              label={t('enquiry.home_ganpati')} 
              iconPosition="start"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 48,
                borderRadius: '12px 12px 0 0',
                '&.Mui-selected': {
                  color: '#E65100',
                  backgroundColor: alpha('#E65100', 0.08),
                }
              }}
            />
            <Tab 
              icon={<TempleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />} 
              label={t('enquiry.mandal_ganpati')} 
              iconPosition="start"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 48,
                borderRadius: '12px 12px 0 0',
                '&.Mui-selected': {
                  color: '#E65100',
                  backgroundColor: alpha('#E65100', 0.08),
                }
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {isCustomerMode && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2,
                  bgcolor: alpha('#E65100', 0.03),
                  border: `1px solid ${alpha('#E65100', 0.1)}`
                }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#E65100', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon fontSize="small" /> Select Ganpati
                  </Typography>
                  <DropdownField
                    name="ganpatiId"
                    label="Select Ganpati"
                    options={ganpatiOptions}
                    required
                    size="small"
                    value={selectedGanpati?.id || ''}
                    onChangeCallback={handleGanpatiChange}
                  />
                </Paper>
              )}

              {tabValue === 0 && (
                <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, bgcolor: alpha('#FFF5F0', 0.5) }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="name"
                        label={isCustomerMode ? 'Customer Name' : t('enquiry.name')}
                        required
                        placeholder={isCustomerMode ? 'Enter customer name' : t('enquiry.name')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="phone"
                        label={isCustomerMode ? 'Customer WhatsApp' : `${t('enquiry.phone')} (WhatsApp)`}
                        required
                        placeholder="10 digit mobile number"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="alternatePhone"
                        label={isCustomerMode ? 'Alternate WhatsApp' : `${t('enquiry.alternate_phone')} (WhatsApp)`}
                        placeholder="10 digit mobile number"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="state"
                        label={isCustomerMode ? 'State' : t('enquiry.state')}
                        options={stateOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="district"
                        label={isCustomerMode ? 'District' : t('enquiry.district')}
                        options={districtOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="taluka"
                        label={isCustomerMode ? 'Taluka' : t('enquiry.taluka')}
                        options={talukaOptions}
                        required
                        disabled={!selectedDistrict}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="city"
                        label="City"
                        required
                        placeholder="Enter city name"
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                      <TextInputField
                        name="address"
                        label={isCustomerMode ? 'Address' : t('enquiry.address')}
                        required
                        inputType="all"
                        rows={2}
                        placeholder={isCustomerMode ? 'Enter full address' : t('enquiry.address')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {tabValue === 1 && (
                <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, bgcolor: alpha('#FFF5F0', 0.5) }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="mandalName"
                        label={isCustomerMode ? 'Mandal Name' : t('enquiry.mandal_name')}
                        required
                        placeholder={isCustomerMode ? 'Enter mandal name' : t('enquiry.mandal_name')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="adhyakshyaName"
                        label={isCustomerMode ? 'Adhyakshya Name' : t('enquiry.adhyakshya')}
                        required
                        placeholder={isCustomerMode ? 'Enter adhyakshya name' : t('enquiry.adhyakshya')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="adhyakshyaPhone"
                        label={isCustomerMode ? 'Adhyakshya WhatsApp' : `${t('enquiry.adhyakshya_phone')} (WhatsApp)`}
                        required
                        placeholder="10 digit mobile number"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="contactPerson1Phone"
                        label={isCustomerMode ? 'Contact Person 1 WhatsApp' : `${t('enquiry.contact1_phone')} (WhatsApp)`}
                        required
                        placeholder="10 digit mobile number"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="contactPerson2Phone"
                        label={isCustomerMode ? 'Contact Person 2 WhatsApp' : `${t('enquiry.contact2_phone_optional')} (WhatsApp)`}
                        placeholder="10 digit mobile number"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="state"
                        label={isCustomerMode ? 'State' : t('enquiry.state')}
                        options={stateOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="district"
                        label={isCustomerMode ? 'District' : t('enquiry.district')}
                        options={districtOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="taluka"
                        label={isCustomerMode ? 'Taluka' : t('enquiry.taluka')}
                        options={talukaOptions}
                        required
                        disabled={!selectedDistrict}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="city"
                        label="City"
                        required
                        placeholder="Enter city name"
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                      <TextInputField
                        name="address"
                        label={isCustomerMode ? 'Address' : t('enquiry.address')}
                        required
                        inputType="all"
                        rows={2}
                        placeholder={isCustomerMode ? 'Enter full address' : t('enquiry.address')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.04), 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Please provide accurate contact details and address. This will help our team to serve you better and contact you for the booking process.
                </Typography>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={isEnquiryMode ? <WhatsAppIcon /> : <SaveIcon />}
                sx={{
                  mt: 3,
                  background: isEnquiryMode 
                    ? 'linear-gradient(135deg, #25D366, #128C7E)' 
                    : 'linear-gradient(135deg, #E65100, #FF8F00)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(isEnquiryMode ? '#25D366' : '#E65100', 0.4)}`,
                  },
                  py: { xs: 1.5, sm: 1.5 },
                  borderRadius: 50,
                  minHeight: 48,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : isEnquiryMode ? (
                  t('enquiry.send_whatsapp')
                ) : (
                  editingCustomer ? 'Update Customer' : 'Register Customer'
                )}
              </Button>
            </form>
          </FormProvider>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EnquiryForm;