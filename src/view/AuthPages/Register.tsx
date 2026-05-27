// src/view/AuthPages/Register.tsx
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
  Grid,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import TextInputField from '@/components/controlled/TextInputField';
import EmailField from '@/components/controlled/EmailField';
import MobileField from '@/components/controlled/MobileField';
import PasswordField from '@/components/controlled/PasswordField';
import { UrlPath } from '@/constants/UrlPath';
import { authService } from '@/services/AuthService';
import Logo from '@/assets/Logo.jfif'

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      
      if (response.success) {
        showSnackbar('success', response.message || 'Registration successful! Please login.');
        navigate(UrlPath.LOGIN);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
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
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Box textAlign="center" mb={3}>
              <img src={Logo} alt="Siddhivinayak Arts" style={{ height: 80 }} />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Register to book your favorite Ganpati
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextInputField
                      name="name"
                      label="Full Name"
                      required
                      inputType="alphabet"
                      placeholder="Enter your full name"
                    />
                  </Grid>
                  
                  <Grid size={{xs: 12, sm: 6}}>
                    <EmailField
                      name="email"
                      label="Email Address"
                      required
                      placeholder="Enter your email"
                    />
                  </Grid>
                  
                  <Grid size={{xs: 12, sm: 6}}>
                    <MobileField
                      name="phone"
                      label="Mobile Number"
                      required
                      placeholder="Enter 10-digit mobile number"
                    />
                  </Grid>
                  
                  <Grid size={{xs: 12, sm: 6}}>
                    <PasswordField
                      name="password"
                      label="Password"
                      required
                      showStrengthIndicator
                      minLength={8}
                      placeholder="Create a password"
                    />
                  </Grid>
                  
                  <Grid size={{xs: 12, sm: 6}}>
                    <PasswordField
                      name="confirmPassword"
                      label="Confirm Password"
                      required
                      confirmFieldName="password"
                      placeholder="Confirm your password"
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>

                <Typography textAlign="center" variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to={UrlPath.LOGIN}>
                    Sign In
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