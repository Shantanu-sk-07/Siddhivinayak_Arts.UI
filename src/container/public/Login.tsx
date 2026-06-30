import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, Container, Card, CardContent, Chip } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/AuthService';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import EmailField from '@/components/controlled/EmailField';
import PasswordField from '@/components/controlled/PasswordField';
import { UrlPath } from '@/constants/UrlPath';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<LoginFormData>({ defaultValues: { email: 'Sk@gmail.com', password: 'Shantanu@123' } });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data.email, data.password);
      if (response.success && response.data) {
        // Token already saved inside authService.login()
        // localStorage is synchronous so ProtectedRoute
        // will see the token instantly — zero race condition
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
    <Container maxWidth="sm" sx={{ px: 1.5, py: 4 }}>
      <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
              {t('login.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('login.welcome')}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Demo: Sk@gmail.com" size="small" color="primary" variant="outlined" onClick={fillDefaultCredentials} sx={{ cursor: 'pointer' }} />
              <Chip label="Password: Shantanu@123" size="small" color="secondary" variant="outlined" onClick={fillDefaultCredentials} sx={{ cursor: 'pointer' }} />
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <EmailField name="email" label={t('login.email')} required placeholder="Sk@gmail.com" sx={{ mb: 2 }} />
              <PasswordField name="password" label={t('login.password')} required placeholder="••••••" sx={{ mb: 3 }} />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ py: 1.5, borderRadius: 50, bgcolor: '#d32f2f' }}>
                {loading ? t('table.loading') : t('login.signin')}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Container>
  );
}