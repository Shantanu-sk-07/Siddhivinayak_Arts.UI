// src/pages/WebsitePages/HomePage.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Rating,
  Chip,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Ganpati } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [featuredGanpati, setFeaturedGanpati] = useState<Ganpati[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedGanpati();
  }, []);

  const fetchFeaturedGanpati = async () => {
    try {
      const response = await fetch('/api/ganpati/featured');
      const data = await response.json();
      if (data.success) setFeaturedGanpati(data.data);
    } catch  {
      console.error('Failed to fetch featured Ganpati');
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    'Best Eco Ganpati Award 2025',
    'Traditional Excellence Award 2024',
    'Customer Choice Award 2024',
    'Best Decoration Award 2023',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{xs:12, sm:6}}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome to Siddhivinayak Arts
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ opacity: 0.9 }}>
                Book Your Eco-Friendly Ganpati Online
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                Experience hassle-free booking, secure payments, and doorstep delivery.
                Choose from our wide collection of beautifully crafted Ganpati idols.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: '#f5f5f5' },
                  mr: 2,
                }}
              >
                Book Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/contact')}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Contact Us
              </Button>
            </Grid>
            <Grid size={{xs:12, sm:6}}>
              <Box
                component="img"
                src="/hero-image.png"
                alt="Ganpati"
                sx={{ width: '100%', borderRadius: 4 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Ganpati Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 600 }}>
          Featured Ganpati Collection
        </Typography>
        <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
          Discover our most popular and beautifully crafted Ganpati idols
        </Typography>

        <Grid container spacing={3}>
          {featuredGanpati.map((ganpati) => (
            <Grid size={{xs:12, sm:6,md:4}} key={ganpati.id}>
              <Card sx={{ height: '100%', '&:hover': { transform: 'translateY(-4px)', transition: '0.3s' } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={ganpati.images[0]}
                  alt={ganpati.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>{ganpati.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Height: {ganpati.height} | Material: {ganpati.material}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} my={1}>
                    <Rating value={ganpati.rating} precision={0.5} size="small" readOnly />
                    <Typography variant="caption">({ganpati.rating})</Typography>
                  </Box>
                  <Typography variant="h5" color="primary" sx={{ my: 1 }}>
                    ₹{ganpati.price.toLocaleString()}
                  </Typography>
                  <Chip 
                    label={`${ganpati.availableSlots} slots available`} 
                    size="small"
                    color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={4}>
          <Button variant="outlined" size="large" onClick={() => navigate('/customer/ganpati')}>
            View All Collection
          </Button>
        </Box>
      </Container>

      {/* Achievements Section */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 600 }}>
            Our Achievements
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
            Recognized for excellence in traditional craftsmanship
          </Typography>

          <Grid container spacing={3}>
            {achievements.map((achievement, index) => (
              <Grid size={{xs:12, sm:6,md:3}} key={index}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" color="primary">🏆</Typography>
                  <Typography variant="body2">{achievement}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 600 }}>
          How It Works
        </Typography>
        <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
          Simple 4-step process to book your Ganpati
        </Typography>

        <Grid container spacing={3}>
          {[
            { step: '1', title: 'Browse & Select', desc: 'Choose your favorite Ganpati from our collection' },
            { step: '2', title: 'Request Booking', desc: 'Submit booking request with your details' },
            { step: '3', title: 'Pay Advance', desc: 'Pay 30% advance to confirm your booking' },
            { step: '4', title: 'Pickup on Festival', desc: 'Scan QR code and complete pickup' },
          ].map((item) => (
            <Grid size={{xs:12, sm:6,md:3}} key={item.step}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="h6" gutterBottom>{item.title}</Typography>
                <Typography variant="body2" color="textSecondary">{item.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}