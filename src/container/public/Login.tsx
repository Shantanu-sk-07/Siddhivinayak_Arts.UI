import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, Container, Card, CardContent,
  Chip, alpha, styled, useTheme, Fade, InputAdornment,
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Forest as ForestIcon
} from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { authService } from '@/services/AuthService';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import EmailField from '@/components/controlled/EmailField';
import PasswordField from '@/components/controlled/PasswordField';
import { UrlPath } from '@/constants/UrlPath';

interface LoginFormData {
  email: string;
  password: string;
}

const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(20px)',
  borderRadius: 24,
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.12)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 70%)`,
  },
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
}));

const AnimatedIcon = styled(Box)({
  display: 'inline-block',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-8px)' },
    '100%': { transform: 'translateY(0px)' },
  },
});

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 50,
  padding: '4px 8px',
  height: 28,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.15)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  padding: '12px 32px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  '&.Mui-disabled': {
    background: alpha(theme.palette.primary.main, 0.5),
  },
}));

const SloganText = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.6),
  fontSize: '0.85rem',
  fontWeight: 500,
  letterSpacing: '0.5px',
  textAlign: 'center',
  marginTop: 8,
}));

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<LoginFormData>({
    defaultValues: { email: 'Sk@gmail.com', password: 'Shantanu@123' }
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data.email, data.password);
      if (response.success && response.data) {
        showSnackbar('success', t('login.success'));
        navigate(UrlPath.ADMIN_DASHBOARD, { replace: true });
      } else {
        setError(response.message || t('login.error'));
      }
    } catch {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    methods.setValue('email', 'Sk@gmail.com');
    methods.setValue('password', 'Shantanu@123');
  };

  return (
    <Container maxWidth="sm" sx={{ px: 1.5, py: { xs: 2, sm: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <GlassCard>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo & Header */}
            <Box textAlign="center" mb={3}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                <AnimatedIcon>
                  <ForestIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />
                </AnimatedIcon>
              </motion.div>

              <GradientTypography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {t('login.title')}
              </GradientTypography>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                {t('login.welcome')}
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <StyledChip
                  label={t('login.demo_email')}
                  size="small"
                  variant="outlined"
                  onClick={fillDefaultCredentials}
                />
                <StyledChip
                  label={t('login.demo_password')}
                  size="small"
                  variant="outlined"
                  onClick={fillDefaultCredentials}
                />
              </Box>
            </Box>

            {/* Error Alert */}
            <Fade in={!!error}>
              <Box>
                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 3 }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}
              </Box>
            </Fade>

            {/* Form */}
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Box sx={{ mb: 2.5 }}>
                  <EmailField
                    name="email"
                    label={t('login.email')}
                    required
                    placeholder={t('login.email_placeholder')}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <PasswordField
                    name="password"
                    label={t('login.password')}
                    required
                    placeholder={t('login.password_placeholder')}
                    size="small"
                    showStrengthIndicator={false}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                        },
                      },
                    }}
                  />
                </Box>

                <StyledButton
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <LoginIcon />}
                >
                  {loading ? t('table.loading') : t('login.signin')}
                </StyledButton>

                {loading && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderTop: `3px solid ${theme.palette.primary.main}`,
                        animation: 'spin 0.8s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                  </Box>
                )}
              </form>
            </FormProvider>

            {/* Slogan */}
            <Box textAlign="center" mt={3}>
              <SloganText>
                🌺 {t('login.slogan')} 🌺
              </SloganText>
            </Box>
          </CardContent>
        </GlassCard>
      </motion.div>
    </Container>
  );
}