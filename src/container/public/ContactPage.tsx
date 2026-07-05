// src/container/public/ContactPage.tsx
import { Container, Typography, Box, Grid, Paper, TextField, Button, IconButton, useTheme, alpha, styled, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Email, LocationOn, WhatsApp, Facebook, Instagram, YouTube, AccessTime, Send } from '@mui/icons-material';
import { config } from '@/constants/config';
import { useForm, Controller } from 'react-hook-form';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(12px)',
  borderRadius: 24,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '32px 0',
});

const MapContainer = styled(Box)({
  width: '100%',
  height: '280px',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  border: `1px solid ${alpha('#fff', 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: '0 16px 56px rgba(0,0,0,0.2)',
  },
  '& iframe': {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  padding: '14px 32px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 36px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  const { control, handleSubmit, reset } = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    }
  });

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      console.log('Contact form data:', data);
      showSnackbar('success', t('contact.form_success'));
      reset();
    } catch {
      showSnackbar('error', t('contact.form_error'));
    }
  };

  // Kurundwad location embed URL
  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29877.876456456456!2d74.5984!3d16.8024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDQ4JzA4LjYiTiA3NMKwMzUnNTQuMyJF!5e0!3m2!1sen!2sin!4v1234567890';

  return (
    <OrangeBackground>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              mb: 5,
              fontSize: { xs: '2.2rem', sm: '3.2rem' },
              letterSpacing: '-0.5px',
            }}
          >
            {t('contact.title')}
          </Typography>

          <Grid container spacing={4}>
            {/* Contact Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <GlassCard>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('contact.form_title')}
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2.5}>
                      <Grid size={12}>
                        <Controller
                          name="name"
                          control={control}
                          rules={{ required: t('validation.required') }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('contact.name')}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              size="medium"
                              variant="outlined"
                              InputProps={{ sx: { borderRadius: 3 } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="email"
                          control={control}
                          rules={{
                            required: t('validation.required'),
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: t('validation.invalid_email'),
                            }
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('contact.email')}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              size="medium"
                              variant="outlined"
                              InputProps={{ sx: { borderRadius: 3 } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="phone"
                          control={control}
                          rules={{
                            required: t('validation.required'),
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: t('validation.invalid_phone'),
                            }
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('contact.phone')}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              size="medium"
                              variant="outlined"
                              placeholder="10 digit mobile number"
                              InputProps={{ sx: { borderRadius: 3 } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Controller
                          name="message"
                          control={control}
                          rules={{ required: t('validation.required') }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t('contact.message')}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              size="medium"
                              multiline
                              rows={5}
                              variant="outlined"
                              InputProps={{ sx: { borderRadius: 3 } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={12}>
                        <StyledButton
                          type="submit"
                          fullWidth
                          startIcon={<Send />}
                        >
                          {t('contact.submit')}
                        </StyledButton>
                      </Grid>
                    </Grid>
                  </form>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <GlassCard sx={{ height: '100%' }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('contact.info_title')}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Phone sx={{ color: theme.palette.primary.main }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {t('contact.phone_label')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {config.CONTACT_PHONE}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Email sx={{ color: theme.palette.primary.main }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {t('contact.email_label')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {config.CONTACT_EMAIL}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <LocationOn sx={{ color: theme.palette.primary.main }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {t('contact.address_label')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {t('contact.address')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <AccessTime sx={{ color: theme.palette.primary.main }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {t('contact.hours_label')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {t('contact.hours')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {t('contact.follow_us')}
                  </Typography>
                  <Box display="flex" gap={1.5} flexWrap="wrap">
                    <IconButton
                      component="a"
                      href={`https://wa.me/${config.ADMIN_WHATSAPP}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#25D366', bgcolor: alpha('#25D366', 0.08), '&:hover': { bgcolor: alpha('#25D366', 0.16) } }}
                    >
                      <WhatsApp />
                    </IconButton>
                    <IconButton
                      component="a"
                      href="https://www.facebook.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#1877F2', bgcolor: alpha('#1877F2', 0.08), '&:hover': { bgcolor: alpha('#1877F2', 0.16) } }}
                    >
                      <Facebook />
                    </IconButton>
                    <IconButton
                      component="a"
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#E4405F', bgcolor: alpha('#E4405F', 0.08), '&:hover': { bgcolor: alpha('#E4405F', 0.16) } }}
                    >
                      <Instagram />
                    </IconButton>
                    <IconButton
                      component="a"
                      href="https://www.youtube.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#FF0000', bgcolor: alpha('#FF0000', 0.08), '&:hover': { bgcolor: alpha('#FF0000', 0.16) } }}
                    >
                      <YouTube />
                    </IconButton>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {t('contact.find_us')}
                    </Typography>
                    <MapContainer>
                      <iframe
                        src={mapEmbedUrl}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Siddhivinayak Arts Location"
                      />
                    </MapContainer>
                  </Box>
                </GlassCard>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </OrangeBackground>
  );
}