// src/pages/WebsitePages/ContactUs.tsx
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Phone, Email, LocationOn, Facebook, Instagram, Twitter, Send, AccessTime } from '@mui/icons-material';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import Logo from '@/assets/Logo.jfif';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${Logo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.08,
    pointerEvents: 'none',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  transition: 'all 0.3s ease',
}));

export default function ContactUs() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSnackbar('success', 'Message sent successfully! Ganpati Bappa Morya! 🙏');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      showSnackbar('error', 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: <Phone sx={{ fontSize: 32 }} />, title: 'Phone', details: ['+91 98765 43210', '+91 98765 43211'], color: '#4caf50' },
    { icon: <Email sx={{ fontSize: 32 }} />, title: 'Email', details: ['info@siddhivinayakarts.com', 'support@siddhivinayakarts.com'], color: '#2196f3' },
    { icon: <LocationOn sx={{ fontSize: 32 }} />, title: 'Address', details: ['123, Ganpati Galli, Dadar West, Mumbai - 400028'], color: '#ff9800' },
    { icon: <AccessTime sx={{ fontSize: 32 }} />, title: 'Business Hours', details: ['Monday - Saturday: 10:00 AM - 8:00 PM', 'Sunday: 11:00 AM - 6:00 PM'], color: '#9c27b0' },
  ];

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 800, 
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '3.5rem' }
              }}
            >
              Contact Us
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.9, 
                textAlign: 'center',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Get in touch with us for any queries or support
            </Typography>
          </motion.div>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <StyledCard sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box sx={{ color: info.color }}>{info.icon}</Box>
                      <Typography variant="h6" fontWeight={600}>{info.title}</Typography>
                    </Box>
                    {info.details.map((detail) => (
                      <Typography key={detail} variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        {detail}
                      </Typography>
                    ))}
                  </CardContent>
                </StyledCard>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Follow Us</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Connect with us on social media
                  </Typography>
                  <Box display="flex" gap={2}>
                    <IconButton 
                      sx={{ 
                        bgcolor: alpha('#1877f2', 0.1), 
                        color: '#1877f2',
                        '&:hover': { bgcolor: alpha('#1877f2', 0.2), transform: 'scale(1.1)' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Facebook />
                    </IconButton>
                    <IconButton 
                      sx={{ 
                        bgcolor: alpha('#e4405f', 0.1), 
                        color: '#e4405f',
                        '&:hover': { bgcolor: alpha('#e4405f', 0.2), transform: 'scale(1.1)' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Instagram />
                    </IconButton>
                    <IconButton 
                      sx={{ 
                        bgcolor: alpha('#1da1f2', 0.1), 
                        color: '#1da1f2',
                        '&:hover': { bgcolor: alpha('#1da1f2', 0.2), transform: 'scale(1.1)' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Twitter />
                    </IconButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <GlassPaper sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Send us a Message
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  We'd love to hear from you. Fill out the form and we'll get back to you within 24 hours.
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={submitting}
                          fullWidth
                          endIcon={<Send />}
                          sx={{ 
                            borderRadius: 50,
                            py: 1.5,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }}
                        >
                          {submitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </motion.div>
                    </Grid>
                  </Grid>
                </form>
              </GlassPaper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}