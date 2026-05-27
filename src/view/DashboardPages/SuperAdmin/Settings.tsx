import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Notifications,
  Security,
  Language,
  Palette,
  Save,
  Edit,
} from '@mui/icons-material';

export default function Settings() {
  const [editMode, setEditMode] = useState(false);
  // ✅ Fixed: Added 'info' to the severity type
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  // User Profile State
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: '123, Main Street, Pune, Maharashtra - 411001',
    language: 'English',
    theme: 'light',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    promotionalEmails: false,
    bookingUpdates: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    shareActivity: true,
  });

  const handleProfileChange = (field: keyof typeof profile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [field]: event.target.value });
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setProfile({ ...profile, language: event.target.value });
  };

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    setProfile({ ...profile, theme: event.target.value });
  };

  const handlePrivacyChange = (event: SelectChangeEvent<string>) => {
    setPrivacy({ ...privacy, profileVisibility: event.target.value });
  };

  const handleNotificationChange = (field: keyof typeof notifications) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNotifications({ ...notifications, [field]: event.target.checked });
  };

  const handlePrivacyToggle = (field: keyof typeof privacy) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPrivacy({ ...privacy, [field]: event.target.checked });
  };

  const handleSave = () => {
    setEditMode(false);
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    setSnackbar({
      open: true,
      message: 'Changes discarded',
      severity: 'info', // ✅ This now works because 'info' is in the type
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        {!editMode ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditMode(true)}
            sx={{ borderRadius: 2 }}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleCancel} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ borderRadius: 2 }}>
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Profile Information
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={handleProfileChange('name')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange('email')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phone}
                    onChange={handleProfileChange('phone')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={profile.address}
                    onChange={handleProfileChange('address')}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid size={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={profile.language}
                      onChange={handleLanguageChange}
                      label="Language"
                      startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Hindi">हिंदी (Hindi)</MenuItem>
                      <MenuItem value="Marathi">मराठी (Marathi)</MenuItem>
                      <MenuItem value="Gujarati">ગુજરાતી (Gujarati)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={profile.theme}
                      onChange={handleThemeChange}
                      label="Theme"
                      startAdornment={<Palette sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System Default</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Notifications />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Notification Preferences
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange('emailNotifications')}
                    disabled={!editMode}
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, mb: 2, color: 'text.secondary' }}>
                Receive booking confirmations and updates via email
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.smsNotifications}
                    onChange={handleNotificationChange('smsNotifications')}
                    disabled={!editMode}
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, mb: 2, color: 'text.secondary' }}>
                Get instant alerts on your phone
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.promotionalEmails}
                    onChange={handleNotificationChange('promotionalEmails')}
                    disabled={!editMode}
                    color="primary"
                  />
                }
                label="Promotional Emails"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, mb: 2, color: 'text.secondary' }}>
                Receive offers, updates, and festival information
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.bookingUpdates}
                    onChange={handleNotificationChange('bookingUpdates')}
                    disabled={!editMode}
                    color="primary"
                  />
                }
                label="Booking Updates"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, color: 'text.secondary' }}>
                Get real-time status of your bookings
              </Typography>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Security />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Privacy & Security
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 3 }} disabled={!editMode}>
                <InputLabel>Profile Visibility</InputLabel>
                <Select
                  value={privacy.profileVisibility}
                  onChange={handlePrivacyChange}
                  label="Profile Visibility"
                >
                  <MenuItem value="public">Public - Anyone can view</MenuItem>
                  <MenuItem value="private">Private - Only me</MenuItem>
                  <MenuItem value="contacts">Contacts - Only my saved contacts</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={privacy.shareActivity}
                    onChange={handlePrivacyToggle('shareActivity')}
                    disabled={!editMode}
                    color="primary"
                  />
                }
                label="Share Activity Status"
              />
              <Typography variant="caption" display="block" sx={{ ml: 4, color: 'text.secondary' }}>
                Let others see when you're active on the platform
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Button
                fullWidth
                variant="outlined"
                color="warning"
                startIcon={<Security />}
                sx={{ borderRadius: 2 }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}