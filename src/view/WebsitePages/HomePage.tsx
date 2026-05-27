import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, Container, 
  Rating, Chip, useTheme, alpha, styled, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Forest, ShoppingBag, ContactPhone, 
  WorkspacePremium, EmojiEvents, TrendingUp, Star,
  ArrowForward, CheckCircle, Security
} from '@mui/icons-material';
import { Ganpati } from '@/types';
import Logo from '@/assets/Logo.jfif';

const BackgroundWrapper = styled(Box)({
  minHeight: '100vh',
  backgroundImage: `url(${Logo})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
});

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
}));

const FixedImage = styled(Box)({
  width: '100%',
  height: 400,
  overflow: 'hidden',
  borderRadius: 16,
  position: 'relative',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
    '& .ganpati-image': {
      transform: 'scale(1.05)',
    },
  },
}));

const FixedCardImage = styled('img')({
  width: '100%',
  height: 250,
  objectFit: 'cover',
  objectPosition: 'center',
  transition: 'transform 0.3s ease',
  borderRadius: '12px 12px 0 0',
});

const FeatureCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const StepCircle = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
  fontWeight: 'bold',
  margin: '0 auto 16px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const AchievementCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [featuredGanpati, setFeaturedGanpati] = useState<Ganpati[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchFeaturedGanpati();
  }, []);

  const fetchFeaturedGanpati = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ganpati/featured');
      const data = await response.json();
      if (data.success && data.data) {
        setFeaturedGanpati(data.data);
      }
    } catch {
      console.error('Failed to fetch featured Ganpati');
      setFeaturedGanpati([]);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    { icon: <EmojiEvents sx={{ fontSize: 40 }} />, title: 'Best Eco Ganpati Award', year: '2025', color: '#ff9800' },
    { icon: <WorkspacePremium sx={{ fontSize: 40 }} />, title: 'Traditional Excellence Award', year: '2024', color: '#4caf50' },
    { icon: <Star sx={{ fontSize: 40 }} />, title: 'Customer Choice Award', year: '2024', color: '#2196f3' },
    { icon: <TrendingUp sx={{ fontSize: 40 }} />, title: 'Best Decoration Award', year: '2023', color: '#9c27b0' },
  ];

  const steps = [
    { icon: <ShoppingBag sx={{ fontSize: 32 }} />, title: 'Browse & Select', desc: 'Choose your favorite Ganpati from our exclusive collection' },
    { icon: <ContactPhone sx={{ fontSize: 32 }} />, title: 'Request Booking', desc: 'Submit booking request with your details and preferences' },
    { icon: <Security sx={{ fontSize: 32 }} />, title: 'Pay Advance', desc: 'Pay 30% advance securely to confirm your booking' },
    { icon: <CheckCircle sx={{ fontSize: 32 }} />, title: 'Pickup on Festival', desc: 'Scan QR code and complete pickup on festival day' },
  ];

  return (
    <BackgroundWrapper>
      <HeroSection>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Forest sx={{ fontSize: 40 }} />
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Since 1995</Typography>
                </Box>
                <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3.5rem' } }}>
                  Welcome to Siddhivinayak Arts
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ opacity: 0.9, mb: 2 }}>
                  Book Your Eco-Friendly Ganpati Online
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, lineHeight: 1.8 }}>
                  Experience hassle-free booking, secure payments, and doorstep delivery.
                  Choose from our wide collection of beautifully crafted Ganpati idols.
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="contained" 
                      size="large" 
                      onClick={() => navigate('/register')} 
                      sx={{ 
                        bgcolor: 'white', 
                        color: theme.palette.primary.main, 
                        px: 4,
                        py: 1.5,
                        borderRadius: 50,
                        '&:hover': { 
                          bgcolor: '#f5f5f5',
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Book Now
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outlined" 
                      size="large" 
                      onClick={() => navigate('/contact')} 
                      sx={{ 
                        borderColor: 'white', 
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 50,
                        '&:hover': { 
                          borderColor: 'white',
                          background: alpha(theme.palette.common.white, 0.1),
                        }
                      }}
                    >
                      Contact Us
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <FixedImage>
                  <img src={Logo} alt="Ganpati" />
                </FixedImage>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: '#fff' }}>
            Featured Ganpati Collection
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 5, maxWidth: 600, mx: 'auto', color: alpha('#fff', 0.9) }}>
            Discover our most popular and beautifully crafted Ganpati idols for this festive season
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(3)).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))
          ) : featuredGanpati.length === 0 ? (
            <Grid size={12}>
              <Typography textAlign="center" sx={{ color: '#fff' }}>No Ganpati available yet. Please check back later.</Typography>
            </Grid>
          ) : (
            featuredGanpati.map((ganpati, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ganpati.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <StyledCard onClick={() => navigate(`/customer/ganpati/${ganpati.id}`)}>
                    <FixedCardImage
                      src={ganpati.images?.[0] || '/placeholder.jpg'}
                      alt={ganpati.name}
                      className="ganpati-image"
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        {ganpati.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Height: {ganpati.height} | Material: {ganpati.material}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} my={1}>
                        <Rating value={ganpati.rating || 0} precision={0.5} size="small" readOnly />
                        <Typography variant="caption" color="textSecondary">
                          ({ganpati.rating || 0})
                        </Typography>
                      </Box>
                      <Typography variant="h5" color="primary" fontWeight={700} sx={{ my: 1 }}>
                        ₹{ganpati.price.toLocaleString()}
                      </Typography>
                      <Chip 
                        label={`${ganpati.availableSlots || 0} slots available`} 
                        size="small" 
                        color={(ganpati.availableSlots || 0) > 0 ? 'success' : 'error'}
                        icon={(ganpati.availableSlots || 0) > 0 ? <CheckCircle /> : undefined}
                      />
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        <Box textAlign="center" mt={5}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/customer/ganpati')}
              endIcon={<ArrowForward />}
              sx={{ 
                borderRadius: 50, 
                px: 4,
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha('#fff', 0.9) }
              }}
            >
              View All Collection
            </Button>
          </motion.div>
        </Box>
      </Container>

      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: '#fff' }}>
              Our Achievements
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ mb: 5, color: alpha('#fff', 0.9) }}>
              Recognized for excellence in traditional craftsmanship
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {achievements.map((achievement, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <AchievementCard>
                    <Box sx={{ color: achievement.color, mb: 2 }}>
                      {achievement.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {achievement.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {achievement.year}
                    </Typography>
                  </AchievementCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: '#fff' }}>
            How It Works
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 5, color: alpha('#fff', 0.9) }}>
            Simple 4-step process to book your Ganpati
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {steps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureCard>
                  <StepCircle>
                    {step.icon}
                  </StepCircle>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {step.desc}
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: alpha('#1a1a1a', 0.9), color: 'white', py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Forest sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
                <Typography variant="h6" fontWeight={700}>
                  Siddhivinayak Arts
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.6 }}>
                Premium eco-friendly Ganpati idols since 1995. 
                Serving devotees with love and devotion for over 25 years.
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <li>
                  <Button 
                    onClick={() => navigate('/')}
                    sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 }, justifyContent: 'flex-start', p: 0, py: 0.5 }}
                  >
                    Home
                  </Button>
                </li>
                <li>
                  <Button 
                    onClick={() => navigate('/about')}
                    sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 }, justifyContent: 'flex-start', p: 0, py: 0.5 }}
                  >
                    About Us
                  </Button>
                </li>
                <li>
                  <Button 
                    onClick={() => navigate('/contact')}
                    sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 }, justifyContent: 'flex-start', p: 0, py: 0.5 }}
                  >
                    Contact
                  </Button>
                </li>
                <li>
                  <Button 
                    onClick={() => navigate('/customer/ganpati')}
                    sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 }, justifyContent: 'flex-start', p: 0, py: 0.5 }}
                  >
                    Browse Ganpati
                  </Button>
                </li>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Info
              </Typography>
              <Box sx={{ opacity: 0.7 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <span>📞</span>
                  <Typography variant="body2">+91 98765 43210</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <span>✉️</span>
                  <Typography variant="body2">info@siddhivinayakarts.com</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <span>📍</span>
                  <Typography variant="body2">Pune, Maharashtra, India</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Typography 
            variant="body2" 
            textAlign="center" 
            sx={{ 
              mt: 4, 
              pt: 3, 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              opacity: 0.6
            }}
          >
            🙏 Ganpati Bappa Morya 🙏
            <br />
            © {currentYear} Siddhivinayak Arts. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </BackgroundWrapper>
  );
}