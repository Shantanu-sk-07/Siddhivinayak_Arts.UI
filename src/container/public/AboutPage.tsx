// src/container/public/AboutPage.tsx
import { Container, Typography, Box, Grid, Paper, Avatar, Divider, useTheme, alpha, styled, Button, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Email, LocationOn, CalendarToday, Star, QrCode, WhatsApp, Facebook, Instagram} from '@mui/icons-material';
import { config } from '@/constants/config';

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${alpha(theme.palette.common.white, 0.5)}`,
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  margin: '0 auto',
}));

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff6b35)',
  minHeight: '100vh',
  padding: '20px 0',
});

const MapButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  padding: '12px 24px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 20px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

export default function AboutPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleMapClick = (): void => {
    window.open(config.SHOP_LOCATION, '_blank');
  };

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
            {t('about.title')}
          </Typography>

          <Grid container spacing={3}>
            {/* Owner Section */}
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <GlassCard sx={{ textAlign: 'center' }}>
                  <StyledAvatar src={config.OWNER_PHOTO} alt={config.OWNER_NAME}>
                    {config.OWNER_NAME.charAt(0)}
                  </StyledAvatar>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                    {config.OWNER_NAME}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('about.owner_title')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton sx={{ color: '#25D366' }}>
                      <WhatsApp />
                    </IconButton>
                    <IconButton sx={{ color: '#1877F2' }}>
                      <Facebook />
                    </IconButton>
                    <IconButton sx={{ color: '#E4405F' }}>
                      <Instagram />
                    </IconButton>
                  </Box>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* History Section */}
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <GlassCard>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('about.history_title')}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" paragraph sx={{ lineHeight: 1.8 }}>
                    {t('about.history_paragraph1')}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" paragraph sx={{ lineHeight: 1.8 }}>
                    {t('about.history_paragraph2')}
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap" sx={{ mt: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2">
                        {t('about.established')}: {config.ESTABLISHED_YEAR}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Star sx={{ color: theme.palette.secondary.main }} />
                      <Typography variant="body2">
                        {t('about.years_experience')}
                      </Typography>
                    </Box>
                  </Box>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Payment & UPI Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <GlassCard>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('about.payment_title')}
                  </Typography>
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 3, p: 3, display: 'inline-block' }}>
                      <Typography variant="h6" fontWeight={600}>
                        {t('about.upi_id')}
                      </Typography>
                      <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                        {config.UPI_ID}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <QrCode sx={{ fontSize: 80, color: theme.palette.primary.main }} />
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        {t('about.scan_to_pay')}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                    {t('about.payment_note')}
                  </Typography>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Contact & Location Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <GlassCard>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('about.contact_title')}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Phone sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body1">{config.CONTACT_PHONE}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Email sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body1">{config.CONTACT_EMAIL}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <LocationOn sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body1">{t('about.address')}</Typography>
                    </Box>
                  </Box>
                  <MapButton fullWidth onClick={handleMapClick} startIcon={<LocationOn />}>
                    {t('about.view_on_map')}
                  </MapButton>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* Additional Info Section */}
            <Grid size={12}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <GlassCard>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box textAlign="center">
                        <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 800 }}>
                          500+
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t('about.happy_customers')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box textAlign="center">
                        <Typography variant="h3" sx={{ color: theme.palette.secondary.main, fontWeight: 800 }}>
                          1000+
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t('about.ganpati_sold')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box textAlign="center">
                        <Typography variant="h3" sx={{ color: theme.palette.success.main, fontWeight: 800 }}>
                          30+
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t('about.years_experience_short')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </GlassCard>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </OrangeBackground>
  );
}