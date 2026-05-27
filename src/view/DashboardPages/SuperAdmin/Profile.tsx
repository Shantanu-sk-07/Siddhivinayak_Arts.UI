// src/pages/Profile.tsx
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  useTheme,
  alpha,
  styled,
  Chip,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Person, Email, Phone, Edit, Save, Cancel, 
  Forest, Badge, CalendarToday, LocationOn 
} from '@mui/icons-material';
import { useAuth } from '@/utils/useAuth';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  border: `4px solid ${alpha(theme.palette.common.white, 0.5)}`,
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
}));

export default function Profile() {
  const { user } = useAuth();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+91 98765 43210',
    address: 'Pune, Maharashtra, India',
  });

  const handleSave = () => {
    showSnackbar('success', 'Profile updated successfully! 🙏');
    setIsEditing(false);
  };

  const stats = [
    { label: 'Total Bookings', value: '5', icon: <Badge /> },
    { label: 'Active Bookings', value: '2', icon: <CalendarToday /> },
    { label: 'Member Since', value: '2024', icon: <Forest /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your personal information and account settings
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Image Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassPaper sx={{ textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <StyledAvatar sx={{ mx: 'auto', mb: 2 }}>
                  {formData.name.charAt(0).toUpperCase()}
                </StyledAvatar>
              </motion.div>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {formData.name}
              </Typography>
              <Chip 
                label={user?.role || 'Customer'} 
                color="primary" 
                size="small" 
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <Box textAlign="left">
                {stats.map((stat, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ color: theme.palette.primary.main }}>{stat.icon}</Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </GlassPaper>
          </Grid>

          {/* Profile Details Section */}
          <Grid size={{ xs: 12, md: 8 }}>
            <GlassPaper>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={600}>
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                      sx={{ borderRadius: 50 }}
                    >
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <Box display="flex" gap={1}>
                    <IconButton onClick={() => setIsEditing(false)} sx={{ color: theme.palette.error.main }}>
                      <Cancel />
                    </IconButton>
                    <IconButton onClick={handleSave} sx={{ color: theme.palette.success.main }}>
                      <Save />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Account Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      Account Created
                    </Typography>
                    <Typography variant="body1">January 15, 2024</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="textSecondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">Today at 10:30 AM</Typography>
                  </Grid>
                </Grid>
              </Box>
            </GlassPaper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}