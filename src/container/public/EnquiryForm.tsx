import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box, Typography, Grid, Button, Dialog, DialogTitle,
  DialogContent, IconButton, CircularProgress, Tabs, Tab,
  alpha, Avatar, Chip, Paper,  useTheme
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

const indianStates = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala',
  'Andhra Pradesh', 'Telangana', 'Uttar Pradesh', 'Delhi', 'Rajasthan',
  'Madhya Pradesh', 'West Bengal', 'Odisha', 'Punjab', 'Haryana'
];

const maharashtraDistricts = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed',
  'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
  'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
  'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
  'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani',
  'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim',
  'Yavatmal'
];

const talukas: Record<string, string[]> = {
  'Ahmednagar': ['Ahmednagar', 'Shrirampur', 'Rahuri', 'Kopargaon', 'Sangamner', 'Nevasa', 'Shevgaon', 'Pathardi', 'Jamkhed', 'Parner', 'Akole', 'Shrigonda', 'Karjat'],
  'Akola': ['Akola', 'Telhara', 'Balapur', 'Barshitakli', 'Murtijapur', 'Patur', 'Akot'],
  'Amravati': ['Amravati', 'Daryapur', 'Chandurbazar', 'Anjangaon', 'Achalpur', 'Warud', 'Morshi', 'Nandgaon Khandeshwar', 'Bhatkuli', 'Dharni', 'Chikhaldara'],
  'Aurangabad': ['Aurangabad', 'Paithan', 'Vaijapur', 'Gangapur', 'Sillod', 'Phulambri', 'Khuldabad', 'Soegaon', 'Kannad'],
  'Beed': ['Beed', 'Parli', 'Georai', 'Ambejogai', 'Ashti', 'Patoda', 'Shirur Kasar', 'Wadwani', 'Kaij', 'Majalgaon', 'Dharur'],
  'Bhandara': ['Bhandara', 'Tumsar', 'Pauni', 'Mohadi', 'Sakoli', 'Lakhani', 'Lakhmandur'],
  'Buldhana': ['Buldhana', 'Khamgaon', 'Shegaon', 'Malkapur', 'Nandura', 'Jalgaon Jamod', 'Sangrampur', 'Deulgaon Raja', 'Chikhli', 'Lonar', 'Mehkar', 'Sindkhed Raja'],
  'Chandrapur': ['Chandrapur', 'Warora', 'Mul', 'Brahmapuri', 'Chimur', 'Gondpipri', 'Nagbhid', 'Sawali', 'Pombhurna', 'Bhadravati', 'Rajura', 'Korpana', 'Jiwati', 'Ballarpur'],
  'Dhule': ['Dhule', 'Shirpur', 'Sakri', 'Sindkheda'],
  'Gadchiroli': ['Gadchiroli', 'Aheri', 'Armori', 'Bhamragad', 'Chamorshi', 'Dhanora', 'Etapalli', 'Gadchiroli', 'Korchi', 'Kurkheda', 'Mulchera', 'Sironcha'],
  'Gondia': ['Gondia', 'Tirora', 'Arjuni Morgaon', 'Deori', 'Amgaon', 'Salekasa', 'Goregaon', 'Sadak Arjuni'],
  'Hingoli': ['Hingoli', 'Kalamnuri', 'Sengaon', 'Aundha Nagnath', 'Basmath'],
  'Jalgaon': ['Jalgaon', 'Bhusawal', 'Chalisgaon', 'Pachora', 'Jamner', 'Amalner', 'Parola', 'Erandol', 'Dharangaon', 'Raver', 'Yawal', 'Bhadgaon', 'Muktai Nagar', 'Bodwad'],
  'Jalna': ['Jalna', 'Bhokardan', 'Jafferabad', 'Badnapur', 'Ghansawangi', 'Partur', 'Mantha', 'Ambad'],
  'Kolhapur': ['Kolhapur', 'Ichalkaranji', 'Shirol', 'Hatkanangle', 'Karvir', 'Panhala', 'Gaganbavda', 'Kagal', 'Radhanagari', 'Ajra', 'Chandgad', 'Bavda', 'Shahuwadi'],
  'Latur': ['Latur', 'Udgir', 'Ahmadpur', 'Chakur', 'Deoni', 'Jalkot', 'Nilanga', 'Ausa', 'Shirur Anantpal', 'Renapur'],
  'Mumbai City': ['Colaba', 'Fort', 'Byculla', 'Worli', 'Mahim', 'Matunga', 'Dadar', 'Parel', 'Girgaon', 'Chinchpokli', 'Malabar Hill', 'Cuffe Parade'],
  'Mumbai Suburban': ['Andheri', 'Bandra', 'Kurla', 'Ghatkopar', 'Mulund', 'Borivali', 'Dadar', 'Kandivali', 'Malad', 'Goregaon', 'Jogeshwari', 'Vile Parle', 'Santacruz', 'Khar', 'Bandra East', 'Kanjurmarg', 'Bhandup', 'Nahur', 'Powai', 'Marol', 'Sakinaka', 'Chakala'],
  'Nagpur': ['Nagpur', 'Wardha', 'Katol', 'Ramtek', 'Umred', 'Kamptee', 'Hingna', 'Kalmeshwar', 'Narkhed', 'Saoner', 'Mouda', 'Bhiwapur', 'Kuhi', 'Parseoni'],
  'Nanded': ['Nanded', 'Deglur', 'Mudkhed', 'Bhokar', 'Hadgaon', 'Himayatnagar', 'Kinwat', 'Loha', 'Mahur', 'Mukhed', 'Naigaon', 'Kandhar', 'Biloli', 'Dharmabad', 'Ardhapur'],
  'Nandurbar': ['Nandurbar', 'Shahade', 'Nawapur', 'Akkalkuwa', 'Taloda', 'Dhadgaon'],
  'Nashik': ['Nashik', 'Malegaon', 'Sinnar', 'Igatpuri', 'Niphad', 'Yeola', 'Chandwad', 'Deola', 'Kalwan', 'Peth', 'Satana', 'Surgana', 'Trimbakeshwar', 'Dindori', 'Nandgaon', 'Baglan'],
  'Osmanabad': ['Osmanabad', 'Tuljapur', 'Paranda', 'Bhoom', 'Washi', 'Kallam', 'Lohara'],
  'Palghar': ['Palghar', 'Vasai', 'Virar', 'Boisar', 'Dahanu', 'Talasari', 'Jawhar', 'Mokhada', 'Vikramgad', 'Wada'],
  'Parbhani': ['Parbhani', 'Gangakhed', 'Manwat', 'Pathri', 'Purna', 'Jintur', 'Selu', 'Sonpeth', 'Sailu'],
  'Pune': ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Shirur', 'Daund', 'Baramati', 'Purandar', 'Velhe', 'Bhor', 'Indapur', 'Junnar', 'Ambegaon', 'Khadakwasla'],
  'Raigad': ['Alibag', 'Panvel', 'Khopoli', 'Patalganga', 'Roha', 'Mangaon', 'Mhasala', 'Shrivardhan', 'Murud', 'Tala', 'Sudhagad', 'Karjat', 'Khalapur', 'Poladpur', 'Mahad', 'Uran', 'Pen'],
  'Ratnagiri': ['Ratnagiri', 'Chiplun', 'Guhagar', 'Dapoli', 'Lanja', 'Mandangad', 'Rajapur', 'Sangameshwar', 'Khed', 'Ratnagiri'],
  'Sangli': ['Sangli', 'Miraj', 'Tasgaon', 'Kavathe Mahankal', 'Jat', 'Walwa', 'Palus', 'Khanapur', 'Atpadi', 'Kadegaon', 'Shirala'],
  'Satara': ['Satara', 'Karad', 'Wai', 'Koregaon', 'Phaltan', 'Patan', 'Jawali', 'Mahabaleshwar', 'Khandala', 'Man', 'Khatav', 'Jaoli'],
  'Sindhudurg': ['Sawantwadi', 'Vengurla', 'Kudal', 'Malvan', 'Kankavli', 'Devgad', 'Dodamarg', 'Vaibhavwadi', 'Sindhudurg'],
  'Solapur': ['Solapur', 'Pandharpur', 'Akkalkot', 'Barsi', 'Malshiras', 'Mohol', 'Madha', 'Sangola', 'Karmala', 'Mangalwedha', 'Northeast Solapur', 'South Solapur'],
  'Thane': ['Thane', 'Kalyan', 'Bhiwandi', 'Ulhasnagar', 'Ambernath', 'Palava', 'Badlapur', 'Dombivli', 'Mira Road', 'Bhayandar', 'Navi Mumbai', 'Airoli', 'Rabale', 'Ghansoli', 'Turbhe', 'Vashi', 'Kharghar', 'Kamothe', 'Panvel'],
  'Wardha': ['Wardha', 'Hinganghat', 'Samudrapur', 'Arvi', 'Deoli', 'Karanja', 'Ashti', 'Seloo', 'Talegaon'],
  'Washim': ['Washim', 'Karanja', 'Risod', 'Malegaon', 'Mangrulpir', 'Manora'],
  'Yavatmal': ['Yavatmal', 'Umarkhed', 'Pusad', 'Digras', 'Ner', 'Darwha', 'Arni', 'Ralegaon', 'Ghatanji', 'Zari Jamni', 'Maregaon', 'Kalamb', 'Mahagaon', 'Babhulgaon']
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

  const { watch, reset, handleSubmit, setValue, setError } = methods;
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
          showSnackbar('success', t('enquiry.success'));
          
          const message = generateEnquiryMessage(
            selectedGanpati.name,
            selectedGanpati.height,
            selectedGanpati.price,
            data.name,
            data.phone,
            `${t('enquiry.type')}: ${data.registrationType === 'HOME' ? t('enquiry.home_ganpati') : t('enquiry.mandal_ganpati')}`
          );
          
          sendWhatsAppMessage(config.ADMIN_WHATSAPP, message);
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          if (response.message?.toLowerCase().includes('phone') || response.message?.toLowerCase().includes('already exists')) {
            setError('phone', { 
              type: 'manual', 
              message: t('validation.phone_exists', 'Mobile number already exists') 
            });
            showSnackbar('warning', t('validation.phone_exists', 'Mobile number already exists'));
          } else {
            showSnackbar('error', response.message || t('msg.error'));
          }
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
          showSnackbar('success', editingCustomer ? t('customer.update_success') : t('customer.register_success'));
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          if (response.message?.toLowerCase().includes('phone') || response.message?.toLowerCase().includes('already exists')) {
            setError('phone', { 
              type: 'manual', 
              message: t('validation.phone_exists', 'Mobile number already exists') 
            });
            showSnackbar('warning', t('validation.phone_exists', 'Mobile number already exists'));
          } else {
            showSnackbar('error', response.message || t('msg.error'));
          }
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const msg = error instanceof Error ? error.message : '';
      if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('already exists')) {
        setError('phone', { 
          type: 'manual', 
          message: t('validation.phone_exists', 'Mobile number already exists') 
        });
        showSnackbar('warning', t('validation.phone_exists', 'Mobile number already exists'));
      } else {
        showSnackbar('error', t('msg.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = (): string => {
    if (isCustomerMode) {
      return editingCustomer ? t('customer.edit') : t('customer.add');
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

  const isMobileScreen = window.innerWidth < 600;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobileScreen}
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
          py: { xs: 1.5, sm: 2.5 },
          px: { xs: 1.5, sm: 3 },
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
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
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
              avatar={<Avatar src={selectedGanpati.images?.[0]} sx={{ width: { xs: 20, sm: 28 }, height: { xs: 20, sm: 28 } }} />}
              label={`${selectedGanpati.name} - ${selectedGanpati.height}`}
              size="small"
              sx={{ 
                bgcolor: alpha('#fff', 0.2), 
                color: 'white',
                '& .MuiChip-label': { fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.7rem' } },
                height: { xs: 24, sm: 32 }
              }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white', position: 'relative', zIndex: 1, p: { xs: 0.5, sm: 1 } }}>
          <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          px: { xs: 1, sm: 2 }
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
              icon={<HomeIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} 
              label={t('enquiry.home_ganpati')} 
              iconPosition="start"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 },
                borderRadius: '12px 12px 0 0',
                '&.Mui-selected': {
                  color: '#E65100',
                  backgroundColor: alpha('#E65100', 0.08),
                }
              }}
            />
            <Tab 
              icon={<TempleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} 
              label={t('enquiry.mandal_ganpati')} 
              iconPosition="start"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1, sm: 2 },
                borderRadius: '12px 12px 0 0',
                '&.Mui-selected': {
                  color: '#E65100',
                  backgroundColor: alpha('#E65100', 0.08),
                }
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {isCustomerMode && (
                <Paper sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  mb: 2.5, 
                  borderRadius: 2,
                  bgcolor: alpha('#E65100', 0.03),
                  border: `1px solid ${alpha('#E65100', 0.1)}`
                }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: '#E65100', display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    <SchoolIcon fontSize="small" /> {t('enquiry.select_ganpati')}
                  </Typography>
                  <DropdownField
                    name="ganpatiId"
                    label={t('enquiry.select_ganpati')}
                    options={ganpatiOptions}
                    required
                    size="small"
                    value={selectedGanpati?.id || ''}
                    onChangeCallback={handleGanpatiChange}
                  />
                </Paper>
              )}

              {tabValue === 0 && (
                <Paper sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, bgcolor: alpha('#FFF5F0', 0.5) }}>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="name"
                        label={isCustomerMode ? t('customer.name') : t('enquiry.name')}
                        required
                        placeholder={isCustomerMode ? t('enquiry.enter_customer_name') : t('enquiry.enter_name')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="phone"
                        label={isCustomerMode ? t('customer.phone') : t('enquiry.phone')}
                        required
                        placeholder={t('enquiry.enter_phone')}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="alternatePhone"
                        label={isCustomerMode ? t('enquiry.alternate_phone') : t('enquiry.alternate_phone_optional')}
                        placeholder={t('enquiry.enter_phone')}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="state"
                        label={isCustomerMode ? t('enquiry.state') : t('enquiry.state')}
                        options={stateOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="district"
                        label={isCustomerMode ? t('enquiry.district') : t('enquiry.district')}
                        options={districtOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="taluka"
                        label={isCustomerMode ? t('enquiry.taluka') : t('enquiry.taluka')}
                        options={talukaOptions}
                        required
                        disabled={!selectedDistrict}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="city"
                        label={t('enquiry.city')}
                        required
                        placeholder={t('enquiry.enter_city')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                      <TextInputField
                        name="address"
                        label={isCustomerMode ? t('customer.address') : t('enquiry.address')}
                        required
                        inputType="all"
                        rows={2}
                        placeholder={isCustomerMode ? t('enquiry.enter_full_address') : t('enquiry.enter_address')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {tabValue === 1 && (
                <Paper sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, bgcolor: alpha('#FFF5F0', 0.5) }}>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="mandalName"
                        label={isCustomerMode ? t('customer.mandal_name') : t('enquiry.mandal_name')}
                        required
                        placeholder={isCustomerMode ? t('enquiry.enter_mandal_name') : t('enquiry.enter_mandal_name')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="adhyakshyaName"
                        label={isCustomerMode ? t('enquiry.adhyakshya') : t('enquiry.adhyakshya')}
                        required
                        placeholder={isCustomerMode ? t('enquiry.enter_adhyakshya_name') : t('enquiry.enter_adhyakshya_name')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="adhyakshyaPhone"
                        label={isCustomerMode ? t('enquiry.adhyakshya_phone') : t('enquiry.adhyakshya_phone')}
                        required
                        placeholder={t('enquiry.enter_phone')}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="contactPerson1Phone"
                        label={isCustomerMode ? t('enquiry.contact1_phone') : t('enquiry.contact1_phone')}
                        required
                        placeholder={t('enquiry.enter_phone')}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <MobileField
                        name="contactPerson2Phone"
                        label={isCustomerMode ? t('enquiry.contact2_phone_optional') : t('enquiry.contact2_phone_optional')}
                        placeholder={t('enquiry.enter_phone')}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="state"
                        label={isCustomerMode ? t('enquiry.state') : t('enquiry.state')}
                        options={stateOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="district"
                        label={isCustomerMode ? t('enquiry.district') : t('enquiry.district')}
                        options={districtOptions}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <DropdownField
                        name="taluka"
                        label={isCustomerMode ? t('enquiry.taluka') : t('enquiry.taluka')}
                        options={talukaOptions}
                        required
                        disabled={!selectedDistrict}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextInputField
                        name="city"
                        label={t('enquiry.city')}
                        required
                        placeholder={t('enquiry.enter_city')}
                        inputType="alphabet"
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                      <TextInputField
                        name="address"
                        label={isCustomerMode ? t('customer.address') : t('enquiry.address')}
                        required
                        inputType="all"
                        rows={2}
                        placeholder={isCustomerMode ? t('enquiry.enter_full_address') : t('enquiry.enter_address')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <Box sx={{ 
                mt: 2.5, 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: alpha(theme.palette.info.main, 0.04), 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.8rem' } }}>
                  {t('enquiry.submit_note')}
                </Typography>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={isEnquiryMode ? <WhatsAppIcon /> : <SaveIcon />}
                sx={{
                  mt: 2.5,
                  background: isEnquiryMode 
                    ? 'linear-gradient(135deg, #25D366, #128C7E)' 
                    : 'linear-gradient(135deg, #E65100, #FF8F00)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(isEnquiryMode ? '#25D366' : '#E65100', 0.4)}`,
                  },
                  py: { xs: 1.2, sm: 1.5 },
                  borderRadius: 50,
                  minHeight: { xs: 40, sm: 48 },
                  fontSize: { xs: '0.75rem', sm: '1rem' },
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
                  editingCustomer ? t('button.update') : t('button.add')
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