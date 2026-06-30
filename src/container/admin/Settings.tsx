import { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Button, TextField, Switch, FormControlLabel, Alert, Snackbar, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { Person as PersonIcon, Notifications as NotificationsIcon, Security as SecurityIcon, Save as SaveIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

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
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const [profile, setProfile] = useState<ProfileData>({ 
    name: 'Super Admin', 
    email: 'admin@gmail.com', 
    phone: '+91 98765 43210', 
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
  };

  const handleLanguageChange = (event: SelectChangeEvent): void => {
    setProfile({ ...profile, language: event.target.value });
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>{t('nav.settings')}</Typography>
        {!editMode ? (
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMode(true)} sx={{ borderRadius: 2, bgcolor: '#d32f2f' }}>
            {t('settings.edit_settings')}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleCancel} startIcon={<CloseIcon />} sx={{ borderRadius: 2 }}>{t('button.cancel')}</Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: 2, bgcolor: '#d32f2f' }}>{t('button.save')}</Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#d32f2f', mr: 2 }}><PersonIcon /></Avatar>
                <Typography variant="h6" fontWeight={600}>{t('settings.profile_info')}</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField fullWidth label={t('customer.name')} value={profile.name} disabled={!editMode} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label={t('customer.email')} type="email" value={profile.email} disabled={!editMode} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label={t('customer.phone')} value={profile.phone} disabled={!editMode} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>{t('settings.language')}</InputLabel>
                    <Select value={profile.language} onChange={handleLanguageChange} label={t('settings.language')}>
                      <MenuItem value="mr">{t('language.mr')}</MenuItem>
                      <MenuItem value="en">{t('language.en')}</MenuItem>
                      <MenuItem value="hi">{t('language.hi')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>{t('settings.theme')}</InputLabel>
                    <Select value={profile.theme} onChange={(e: SelectChangeEvent) => setProfile({ ...profile, theme: e.target.value as 'light' | 'dark' })} label={t('settings.theme')}>
                      <MenuItem value="light">{t('settings.light')}</MenuItem>
                      <MenuItem value="dark">{t('settings.dark')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#2196f3', mr: 2 }}><NotificationsIcon /></Avatar>
                <Typography variant="h6" fontWeight={600}>{t('settings.notification_prefs')}</Typography>
              </Box>
              <FormControlLabel control={<Switch checked={notifications.emailNotifications} onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })} disabled={!editMode} />} label={t('settings.email_notifications')} />
              <FormControlLabel control={<Switch checked={notifications.smsNotifications} onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })} disabled={!editMode} />} label={t('settings.sms_notifications')} />
              <FormControlLabel control={<Switch checked={notifications.promotionalEmails} onChange={(e) => setNotifications({ ...notifications, promotionalEmails: e.target.checked })} disabled={!editMode} />} label={t('settings.promotional_emails')} />
              <FormControlLabel control={<Switch checked={notifications.bookingUpdates} onChange={(e) => setNotifications({ ...notifications, bookingUpdates: e.target.checked })} disabled={!editMode} />} label={t('settings.booking_updates')} />
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}><SecurityIcon /></Avatar>
                <Typography variant="h6" fontWeight={600}>{t('settings.security')}</Typography>
              </Box>
              <Button fullWidth variant="outlined" color="warning" startIcon={<SecurityIcon />} sx={{ borderRadius: 2 }}>
                {t('settings.change_password')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}