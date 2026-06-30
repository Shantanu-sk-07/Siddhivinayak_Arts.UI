// src/container/public/ContactPage.tsx
import { Container, Typography, Box, Grid, Paper, TextField, Button, IconButton, useTheme, alpha, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Email, LocationOn, WhatsApp, Facebook, Instagram, YouTube, AccessTime } from '@mui/icons-material';
import { config } from '@/constants/config';
import { useForm, Controller } from 'react-hook-form';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '20px 0',
});

const MapContainer = styled(Box)({
  width: '100%',
  height: '300px',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  '& iframe': {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

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

 

  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.6789!2d73.8567!3d18.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMxJzEzLjUiTiA3M8KwNTEnMjQuMCJF!5e0!3m2!1sen!2sin!4v1234567890';

  return (
    <OrangeBackground>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              mb: 4,
              fontSize: { xs: '2rem', sm: '3rem' },
            }}
          >
            {t('contact.title')}
          </Typography>

          <Grid container spacing={3}>
            {/* Contact Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <GlassCard>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('contact.form_title')}
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
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
                              size="small"
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
                              size="small"
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
                              size="small"
                              placeholder="10 digit mobile number"
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
                              size="small"
                              multiline
                              rows={4}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          sx={{
                            borderRadius: 50,
                            py: 1.5,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }}
                        >
                          {t('contact.submit')}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <GlassCard>
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

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {t('contact.follow_us')}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <IconButton sx={{ color: '#25D366' }}><WhatsApp /></IconButton>
                    <IconButton sx={{ color: '#1877F2' }}><Facebook /></IconButton>
                    <IconButton sx={{ color: '#E4405F' }}><Instagram /></IconButton>
                    <IconButton sx={{ color: '#FF0000' }}><YouTube /></IconButton>
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