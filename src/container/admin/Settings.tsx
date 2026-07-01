// src/container/admin/Settings.tsx
import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Button, TextField,
  Switch, FormControlLabel, Alert, Snackbar, Select, MenuItem, FormControl,
  InputLabel, SelectChangeEvent,  useTheme, alpha, styled,
  Paper, Tooltip, Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  WhatsApp as WhatsAppIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { config } from '@/constants/config';
import { motion } from 'framer-motion';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
  transition: 'all 0.3s ease-in-out',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.08)}`,
  },
}));

const InfoRow = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 1.2,
    borderBottom: '1px solid #f0ebe6',
    '&:last-child': { borderBottom: 'none' }
  }}>
    {icon && <Box sx={{ color: '#E65100', display: 'flex', alignItems: 'center', minWidth: 24 }}>{icon}</Box>}
    <Typography variant="body2" sx={{ color: '#666', minWidth: 120, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-word' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  language: string;
  theme: 'light' | 'dark';
}

interface NotificationPrefs {
  emailNotifications: boolean;
  smsNotifications: boolean;
  promotionalEmails: boolean;
  bookingUpdates: boolean;
}

export default function Settings() {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [profile, setProfile] = useState<ProfileData>({
    name: config.OWNER_NAME || 'श्री. सुरज कुंभार',
    email: config.CONTACT_EMAIL || 'info@siddhivinayakarts.com',
    phone: config.CONTACT_PHONE || '+91 7774855501',
    language: 'mr',
    theme: 'light'
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNotifications: true,
    smsNotifications: true,
    promotionalEmails: false,
    bookingUpdates: true
  });

  const handleSave = (): void => {
    i18n.changeLanguage(profile.language);
    setEditMode(false);
    setSnackbar({ open: true, message: t('settings.save_success'), severity: 'success' });
    showSnackbar('success', t('settings.save_success'));
  };

  const handleCancel = (): void => {
    setEditMode(false);
    setSnackbar({ open: true, message: t('settings.cancel_success'), severity: 'info' });
    showSnackbar('info', t('settings.cancel_success'));
  };

  const handleLanguageChange = (event: SelectChangeEvent): void => {
    setProfile({ ...profile, language: event.target.value });
    i18n.changeLanguage(event.target.value);
  };

  const ownerInfo = [
    { label: t('profile.owner_name'), value: config.OWNER_NAME, icon: <PersonIcon /> },
    { label: t('profile.contact'), value: config.CONTACT_PHONE, icon: <PhoneIcon /> },
    { label: t('profile.email'), value: config.CONTACT_EMAIL, icon: <EmailIcon /> },
    { label: t('profile.location'), value: 'Kurundwad, Maharashtra', icon: <LocationOnIcon /> },
    { label: t('profile.established'), value: config.ESTABLISHED_YEAR, icon: <StoreIcon /> },
    { label: t('profile.whatsapp'), value: config.ADMIN_WHATSAPP, icon: <WhatsAppIcon /> },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 4 } }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {t('nav.settings')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('settings.manage_preferences')}
            </Typography>
          </Box>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              sx={{
                borderRadius: 50,
                px: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {t('settings.edit_settings')}
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CloseIcon />}
                sx={{ borderRadius: 50, px: 3 }}
              >
                {t('button.cancel')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  borderRadius: 50,
                  px: 3,
                  background: `linear-gradient(135deg, #2e7d32, #388e3c)`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha('#2e7d32', 0.3)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('button.save')}
              </Button>
            </Box>
          )}
        </Box>

        {/* Edit Mode Indicator */}
        {editMode && (
          <Box sx={{ mb: 3, p: 2, bgcolor: alpha('#ff9800', 0.08), borderRadius: 2, border: `1px solid ${alpha('#ff9800', 0.2)}` }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 16, color: '#ff9800' }} />
              {t('settings.edit_mode_info')}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Owner Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassPaper>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <StoreIcon sx={{ color: '#E65100', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700} sx={{ color: '#E65100' }}>
                  {t('settings.store_info')}
                </Typography>
              </Box>

              <Box sx={{ mb: 3, p: 2, bgcolor: alpha('#E65100', 0.04), borderRadius: 2, border: `1px solid ${alpha('#E65100', 0.08)}` }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  {config.APP_NAME}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('settings.verified_store')}
                </Typography>
              </Box>

              {ownerInfo.map((info, index) => (
                <InfoRow key={index} label={info.label} value={info.value} icon={info.icon} />
              ))}
            </GlassPaper>
          </Grid>

          {/* Right Column - Settings */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Profile Information */}
            <SettingsCard>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#d32f2f', mr: 2, width: 40, height: 40 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {t('settings.profile_info')}
                  </Typography>
                  {editMode && (
                    <Chip
                      label={t('settings.editing')}
                      size="small"
                      color="warning"
                      sx={{ ml: 2, fontWeight: 600 }}
                    />
                  )}
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('customer.name')}
                      value={profile.name}
                      disabled={!editMode}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      size="small"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('customer.email')}
                      type="email"
                      value={profile.email}
                      disabled={!editMode}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      size="small"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('customer.phone')}
                      value={profile.phone}
                      disabled={!editMode}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      size="small"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small" disabled={!editMode}>
                      <InputLabel>{t('settings.language')}</InputLabel>
                      <Select
                        value={profile.language}
                        onChange={handleLanguageChange}
                        label={t('settings.language')}
                        startAdornment={<LanguageIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />}
                      >
                        <MenuItem value="mr">{t('language.mr')}</MenuItem>
                        <MenuItem value="en">{t('language.en')}</MenuItem>
                        <MenuItem value="hi">{t('language.hi')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small" disabled={!editMode}>
                      <InputLabel>{t('settings.theme')}</InputLabel>
                      <Select
                        value={profile.theme}
                        onChange={(e: SelectChangeEvent) => setProfile({ ...profile, theme: e.target.value as 'light' | 'dark' })}
                        label={t('settings.theme')}
                        startAdornment={
                          profile.theme === 'light' ?
                            <LightModeIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} /> :
                            <DarkModeIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />
                        }
                      >
                        <MenuItem value="light">{t('settings.light')}</MenuItem>
                        <MenuItem value="dark">{t('settings.dark')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </SettingsCard>

            {/* Notification Preferences */}
            <SettingsCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', mr: 2, width: 40, height: 40 }}>
                    <NotificationsIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {t('settings.notification_prefs')}
                  </Typography>
                </Box>

                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.emailNotifications}
                          onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                          disabled={!editMode}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2196f3',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#2196f3',
                            },
                          }}
                        />
                      }
                      label={t('settings.email_notifications')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.smsNotifications}
                          onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                          disabled={!editMode}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label={t('settings.sms_notifications')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.promotionalEmails}
                          onChange={(e) => setNotifications({ ...notifications, promotionalEmails: e.target.checked })}
                          disabled={!editMode}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#ff9800',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#ff9800',
                            },
                          }}
                        />
                      }
                      label={t('settings.promotional_emails')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.bookingUpdates}
                          onChange={(e) => setNotifications({ ...notifications, bookingUpdates: e.target.checked })}
                          disabled={!editMode}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#9c27b0',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#9c27b0',
                            },
                          }}
                        />
                      }
                      label={t('settings.booking_updates')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </SettingsCard>

            {/* Security */}
            <SettingsCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mr: 2, width: 40, height: 40 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {t('settings.security')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Tooltip title={!editMode ? t('settings.enable_edit_to_change') : ''}>
                    <span>
                      <Button
                        fullWidth={false}
                        variant="outlined"
                        color="warning"
                        startIcon={<SecurityIcon />}
                        disabled={!editMode}
                        sx={{
                          borderRadius: 50,
                          px: 4,
                          py: 1,
                          borderColor: '#ff9800',
                          color: '#ff9800',
                          '&:hover': {
                            borderColor: '#f57c00',
                            background: alpha('#ff9800', 0.08),
                          },
                        }}
                      >
                        {t('settings.change_password')}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>

                <Box sx={{ mt: 2.5, p: 2, bgcolor: alpha('#4caf50', 0.04), borderRadius: 2, border: `1px solid ${alpha('#4caf50', 0.1)}` }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ fontSize: 14, color: '#4caf50' }} />
                    {t('settings.security_note')}
                  </Typography>
                </Box>
              </CardContent>
            </SettingsCard>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
}