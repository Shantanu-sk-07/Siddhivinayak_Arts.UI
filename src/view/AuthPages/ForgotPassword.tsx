// src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import EmailField from '@/components/controlled/EmailField';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
        showSnackbar('success', 'Password reset link sent to your email');
      } else {
        setError(result.message || 'Failed to send reset link');
      }
    } catch  {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ width: '100%', textAlign: 'center', p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Check Your Email
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              We've sent a password reset link to your email address.
              Please check your inbox and follow the instructions.
            </Typography>
            <Button component={RouterLink} to="/login" variant="contained">
              Return to Login
            </Button>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: '100%', borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" textAlign="center" gutterBottom sx={{ fontWeight: 600 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 3 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <EmailField
                  name="email"
                  label="Email Address"
                  required
                  placeholder="Enter your registered email"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <Typography textAlign="center" variant="body2">
                  <Link component={RouterLink} to="/login">
                    Back to Login
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