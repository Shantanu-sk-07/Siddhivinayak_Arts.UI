// src/container/public/AboutPage.tsx
import { Container, Typography, Box, Grid, Paper, Avatar, Divider, useTheme, alpha, styled, Button, IconButton, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Email, LocationOn, CalendarToday, Star, WhatsApp, Facebook, Instagram, Storefront, EmojiEvents, Groups, QrCode2, ContentCopy } from '@mui/icons-material';
import { config } from '@/constants/config';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

const OrangeBackground = styled(Box)({
  background: 'linear-gradient(160deg, #ff7a3d 0%, #f7931e 45%, #ffb347 100%)',
  minHeight: '100vh',
  paddingTop: 'clamp(24px, 5vw, 48px)',
  paddingBottom: 'clamp(24px, 5vw, 48px)',
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.96),
  backdropFilter: 'blur(14px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${alpha('#fff', 0.5)}`,
  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 16,
    padding: theme.spacing(2.25),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${alpha('#fff', 0.7)}`,
  boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
  margin: '0 auto',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  fontSize: '3rem',
  fontWeight: 700,
  [theme.breakpoints.up('sm')]: { width: 140, height: 140 },
}));

const MapButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  padding: '12px 28px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: '0 10px 28px rgba(230,81,0,0.32)',
  transition: 'all 0.25s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 36px rgba(230,81,0,0.42)' },
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2.5, 1.5),
  borderRadius: 16,
  background: alpha('#fff', 0.08),
  backdropFilter: 'blur(6px)',
  border: `1px solid ${alpha('#fff', 0.14)}`,
  transition: 'all 0.25s ease',
  height: '100%',
  '&:hover': { background: alpha('#fff', 0.14), transform: 'translateY(-3px)' },
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.75),
  padding: theme.spacing(1.25, 0),
}));

const IconBadge = styled(Box)(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.14)})`,
  color: theme.palette.primary.main,
}));

const QrFrame = styled(Box)(({ theme }) => ({
  width: 168,
  height: 168,
  margin: '0 auto',
  borderRadius: 16,
  background: '#ffffff',
  border: `1px solid ${alpha('#000', 0.08)}`,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: { width: 180, height: 180 },
}));

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function AboutPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleMapClick = (): void => {
    window.open(config.SHOP_LOCATION, '_blank');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.UPI_ID);
    showSnackbar('success', t('about.upi_copied', 'UPI ID copied'));
  };

  const stats = [
    { value: '500+', label: t('about.happy_customers'), icon: <Groups sx={{ fontSize: 30 }} /> },
    { value: '1000+', label: t('about.ganpati_sold'), icon: <EmojiEvents sx={{ fontSize: 30 }} /> },
    { value: '30+', label: t('about.years_experience_short'), icon: <Star sx={{ fontSize: 30 }} /> },
  ];

  const socials: SocialLink[] = [
    { icon: <WhatsApp />, href: `https://wa.me/${config.ADMIN_WHATSAPP}`, color: '#25D366' },
    { icon: <Facebook />, href: 'https://www.facebook.com/', color: '#1877F2' },
    { icon: <Instagram />, href: 'https://www.instagram.com/', color: '#E4405F' },
  ];

  return (
    <OrangeBackground>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 5 } }}>
            <Typography
              variant="overline"
              sx={{ color: 'rgba(255,255,255,0.85)', letterSpacing: 3, fontWeight: 700, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 1 }}
            >
              {t('about.established')} {config.ESTABLISHED_YEAR}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'white',
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.1rem' },
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
              }}
            >
              {t('about.title')}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <GlassCard sx={{ textAlign: 'center' }}>
                  <StyledAvatar src={config.OWNER_PHOTO} alt={config.OWNER_NAME}>
                    {config.OWNER_NAME.charAt(0)}
                  </StyledAvatar>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 2, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                    {config.OWNER_NAME}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('about.owner_title')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1.25} justifyContent="center" flexWrap="wrap" useFlexGap>
                    {socials.map((s, idx) => (
                      <IconButton
                        key={idx}
                        component="a"
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          width: 46,
                          height: 46,
                          transition: 'transform 0.2s ease',
                          color: s.color,
                          bgcolor: alpha(s.color, 0.1),
                          '&:hover': { bgcolor: alpha(s.color, 0.18), transform: 'translateY(-3px)' },
                        }}
                      >
                        {s.icon}
                      </IconButton>
                    ))}
                  </Stack>
                </GlassCard>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <GlassCard>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <IconBadge sx={{ width: 46, height: 46 }}>
                      <Storefront />
                    </IconBadge>
                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                      {t('about.history_title')}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('about.history_paragraph1')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('about.history_paragraph2')}
                  </Typography>
                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={700}>
                        {t('about.established')}: {config.ESTABLISHED_YEAR}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Star sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={700}>
                        {t('about.years_experience')}
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCard>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <GlassCard>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <IconBadge sx={{ width: 46, height: 46 }}>
                      <QrCode2 />
                    </IconBadge>
                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                      {t('about.payment_title')}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <QrFrame>
                      <Box
                        component="img"
                        src="/qrcode.png"
                        alt="UPI QR Code"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentNode;
                          if (parent) {
                            const icon = document.createElement('div');
                            icon.innerHTML = `<svg viewBox="0 0 24 24" width="90" height="90" fill="#333"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>`;
                            parent.appendChild(icon);
                          }
                        }}
                      />
                    </QrFrame>

                    <Box
                      sx={{
                        mt: 2.5,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                        borderRadius: 3,
                        px: 2,
                        py: 1,
                        maxWidth: '100%',
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{ color: theme.palette.primary.main, wordBreak: 'break-all', fontSize: { xs: '0.85rem', sm: '1rem' } }}
                      >
                        {config.UPI_ID}
                      </Typography>
                      <IconButton size="small" onClick={handleCopyUpi} sx={{ color: theme.palette.primary.main }}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      {t('about.scan_to_pay')}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
                    {t('about.payment_note')}
                  </Typography>
                </GlassCard>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <GlassCard>
                  <Typography variant="h5" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                    {t('about.contact_title')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <InfoRow>
                      <IconBadge>
                        <Phone fontSize="small" />
                      </IconBadge>
                      <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {config.CONTACT_PHONE}
                      </Typography>
                    </InfoRow>
                    <InfoRow>
                      <IconBadge>
                        <Email fontSize="small" />
                      </IconBadge>
                      <Typography variant="body1" fontWeight={700} sx={{ wordBreak: 'break-word', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {config.CONTACT_EMAIL}
                      </Typography>
                    </InfoRow>
                    <InfoRow>
                      <IconBadge>
                        <LocationOn fontSize="small" />
                      </IconBadge>
                      <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {t('about.address')}
                      </Typography>
                    </InfoRow>
                  </Box>
                  <MapButton fullWidth onClick={handleMapClick} startIcon={<LocationOn />}>
                    {t('about.view_on_map')}
                  </MapButton>
                </GlassCard>
              </motion.div>
            </Grid>

            <Grid size={12}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <GlassCard sx={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))', boxShadow: 'none', border: `1px solid ${alpha('#fff', 0.2)}` }}>
                  <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                    {stats.map((stat, index) => (
                      <Grid size={{ xs: 4 }} key={index}>
                        <StatBox>
                          <Box sx={{ color: 'white', mb: 1 }}>{stat.icon}</Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.85), fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.8rem' } }}>
                            {stat.label}
                          </Typography>
                        </StatBox>
                      </Grid>
                    ))}
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