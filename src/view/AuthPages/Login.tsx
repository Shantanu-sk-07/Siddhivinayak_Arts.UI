// src/view/AuthPages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Link,
  Alert,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from '@/utils/useAuth';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import EmailField from '@/components/controlled/EmailField';
import PasswordField from '@/components/controlled/PasswordField';
import Logo from '@/assets/Logo.jfif';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login(data.email, data.password);
      
      if (response.success && response.data) {
        showSnackbar('success', 'Login successful!');
        
        const userRole = response.data.role;
        
        switch (userRole) {
          case 'SUPER_ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'STAFF':
            navigate('/staff/dashboard');
            break;
          case 'CUSTOMER':
            navigate('/customer/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(response.message || 'Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <img src={Logo} alt="Siddhivinayak Arts" style={{ height: 80 }} />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sign in to your account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <EmailField
                  name="email"
                  label="Email Address"
                  required
                  placeholder="Enter your email"
                  sx={{ mb: 2 }}
                />

                <PasswordField
                  name="password"
                  label="Password"
                  required
                  placeholder="Enter your password"
                  sx={{ mb: 2 }}
                />

                <Box display="flex" justifyContent="flex-end" mb={3}>
                  <Link component={RouterLink} to="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Typography textAlign="center" variant="body2">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register">
                    Register
                  </Link>
                </Typography>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}