// src/container/admin/Profile.tsx
import { useState } from 'react';
import {
  Box, Container, Typography, Paper, Avatar, Grid, TextField, Button,
  Divider, useTheme, alpha, styled, Chip, Card, 
  Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel,
  SelectChangeEvent, Tooltip, Badge
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Store as StoreIcon,
  LocationOn as LocationOnIcon,
  WhatsApp as WhatsAppIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { config } from '@/constants/config';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 130,
  height: 130,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  border: `4px solid ${alpha(theme.palette.common.white, 0.5)}`,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  fontSize: '3rem',
  fontWeight: 700,
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  padding: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
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

export default function Profile() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
    setIsEditing(false);
    showSnackbar('success', t('msg.update_success'));
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    showSnackbar('info', t('settings.cancel_success'));
  };

  const handleLanguageChange = (event: SelectChangeEvent): void => {
    setProfile({ ...profile, language: event.target.value });
    i18n.changeLanguage(event.target.value);
  };

  const handleEditToggle = (): void => {
    setIsEditing(true);
  };

  const stats = [
    { label: t('common.role'), value: 'SUPER_ADMIN', icon: <BadgeIcon /> },
    { label: t('common.member_since'), value: '2024', icon: <CalendarIcon /> },
    { label: t('common.store'), value: config.APP_NAME, icon: <StoreIcon /> },
  ];

  const ownerInfo = [
    { label: t('profile.owner_name'), value: config.OWNER_NAME, icon: <PersonIcon /> },
    { label: t('profile.contact'), value: config.CONTACT_PHONE, icon: <PhoneIcon /> },
    { label: t('profile.email'), value: config.CONTACT_EMAIL, icon: <EmailIcon /> },
    { label: t('profile.location'), value: 'Kurundwad, Maharashtra', icon: <LocationOnIcon /> },
    { label: t('profile.established'), value: config.ESTABLISHED_YEAR, icon: <CalendarIcon /> },
    { label: t('profile.whatsapp'), value: config.ADMIN_WHATSAPP, icon: <WhatsAppIcon /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2 } }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
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
              {t('nav.profile')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('common.manage_info')}
            </Typography>
          </Box>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
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
                {t('button.edit')}
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
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
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Left Column - Profile & Owner Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassPaper>
              {/* Avatar Section */}
              <Box textAlign="center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title={t('profile.verified')}>
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                      </Tooltip>
                    }
                  >
                    <StyledAvatar sx={{ mx: 'auto', mb: 2 }}>
                      {profile.name.charAt(0).toUpperCase()}
                    </StyledAvatar>
                  </Badge>
                </motion.div>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {profile.name}
                </Typography>
                <Chip
                  label="SUPER ADMIN"
                  color="primary"
                  size="small"
                  sx={{ mb: 2, fontWeight: 600 }}
                />

                <Divider sx={{ my: 2.5 }} />

                {/* Stats */}
                <Grid container spacing={1.5}>
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 12 }} key={index}>
                      <StatCard>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                            {stat.icon}
                          </Box>
                          <Box textAlign="left">
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.65rem' }}>
                              {stat.label}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {stat.value}
                            </Typography>
                          </Box>
                        </Box>
                      </StatCard>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* Owner Information */}
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: '#E65100', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StoreIcon fontSize="small" /> {t('profile.owner_details')}
                </Typography>
                {ownerInfo.map((info, index) => (
                  <InfoRow key={index} label={info.label} value={info.value} icon={info.icon} />
                ))}
              </Box>
            </GlassPaper>
          </Grid>

          {/* Right Column - Settings */}
          <Grid size={{ xs: 12, md: 8 }}>
            <GlassPaper>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonIcon sx={{ color: '#E65100' }} />
                {t('common.personal_info')}
                {isEditing && (
                  <Chip
                    label={t('profile.editing_mode')}
                    size="small"
                    color="warning"
                    sx={{ ml: 1, fontWeight: 600 }}
                  />
                )}
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('customer.name')}
                    value={profile.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    size="small"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />,
                    }}
                    sx={{ '& .MuiInputLabel-asterisk': { color: 'error.main' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('customer.email')}
                    type="email"
                    value={profile.email}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    size="small"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" disabled={!isEditing}>
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
                  <FormControl fullWidth size="small" disabled={!isEditing}>
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

              <Divider sx={{ my: 3.5 }} />

              {/* Notification Preferences */}
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <NotificationsIcon sx={{ color: '#2196f3' }} />
                {t('settings.notification_prefs')}
              </Typography>

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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

              <Divider sx={{ my: 3.5 }} />

              {/* Security */}
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SecurityIcon sx={{ color: '#4caf50' }} />
                {t('settings.security')}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<SecurityIcon />}
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
                  disabled={!isEditing}
                >
                  {t('settings.change_password')}
                </Button>
              </Box>

              {isEditing && (
                <Box sx={{ mt: 3, p: 2, bgcolor: alpha('#ff9800', 0.08), borderRadius: 2, border: `1px solid ${alpha('#ff9800', 0.2)}` }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                    {t('settings.edit_mode_info')}
                  </Typography>
                </Box>
              )}
            </GlassPaper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            🌺 {t('footer.ganpati_bappa')} 🌺
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
}