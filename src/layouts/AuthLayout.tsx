// src/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, alpha, useTheme, styled } from '@mui/material';
import { Forest } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BackgroundWrapper = styled(Box)({
  position: 'relative',
  minHeight: '100vh',
  backgroundImage: `url('/Logo.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
});

const GlassCard = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(20px)',
  borderRadius: 24,
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <BackgroundWrapper>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <GlassCard sx={{ p: { xs: 3, sm: 5 } }}>
              <Box textAlign="center" mb={4}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ display: 'inline-block' }}
                >
                  <Forest sx={{ fontSize: 60, color: theme.palette.secondary.main }} />
                </motion.div>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mt: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Siddhivinayak Arts
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mt: 1
                  }}
                >
                  🙏 Welcome to Divine Ganpati Booking Platform 🙏
                </Typography>
              </Box>
              
              <Outlet />
            </GlassCard>
          </motion.div>
        </Container>
      </Box>
    </BackgroundWrapper>
  );
}