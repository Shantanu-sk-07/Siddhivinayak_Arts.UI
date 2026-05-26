import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
  Fade,
  Zoom,
  Slide,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  SolarPower as SolarIcon,
  Bolt as BoltIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  SupportAgent as SupportIcon,
  ChevronRight as ChevronRightIcon,
  FlashOn as FlashIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Forest as LeafIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UrlPath } from '@/constants/UrlPath';

const WebsiteLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    installations: 0,
    capacity: 0,
    co2: 0,
    customers: 0,
  });

  const targetStats = {
    installations: 1284,
    capacity: 8.4,
    co2: 12500,
    customers: 856,
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        installations: Math.floor(targetStats.installations * progress),
        capacity: Number((targetStats.capacity * progress).toFixed(1)),
        co2: Math.floor(targetStats.co2 * progress),
        customers: Math.floor(targetStats.customers * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, [targetStats.capacity, targetStats.co2, targetStats.customers, targetStats.installations]);

  const menuItems = [
    { label: 'Home', link: '/' },
    { label: 'Services', link: '/services' },
    { label: 'About Us', link: '/about' },
    { label: 'Contact', link: '/contact' },
  ];

  const stats = [
    {
      icon: <SolarIcon sx={{ fontSize: 40 }} />,
      value: animatedStats.installations,
      label: 'Total Installations',
      suffix: '+',
      color: '#FF5722',
      trend: '+12% this month',
    },
    {
      icon: <BoltIcon sx={{ fontSize: 40 }} />,
      value: animatedStats.capacity,
      label: 'Total Capacity',
      suffix: ' MW',
      color: '#2196F3',
      trend: '+8% this quarter',
    },
    {
      icon: <LeafIcon sx={{ fontSize: 40 }} />,
      value: animatedStats.co2,
      label: 'CO₂ Reduced',
      suffix: ' tons',
      color: '#4CAF50',
      trend: 'Eco-friendly',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      value: animatedStats.customers,
      label: 'Active Customers',
      suffix: '+',
      color: '#9C27B0',
      trend: '+24 this week',
    },
  ];

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 50 }} />,
      title: 'Real-time Monitoring',
      description: 'Track solar generation, consumption, and grid export in real-time with detailed analytics.',
      color: '#FF5722',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50 }} />,
      title: 'Secure Documents',
      description: 'Cloud-based secure storage for Aadhar cards, signatures, and installation photos.',
      color: '#2196F3',
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 50 }} />,
      title: 'Automated Reports',
      description: 'Generate WCR reports and certificates automatically with digital signatures.',
      color: '#4CAF50',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 50 }} />,
      title: '24/7 Support',
      description: 'Dedicated technical support for all your solar installation needs.',
      color: '#9C27B0',
    },
  ];

  const recentActivities = [
    { title: 'New Solar Installation Added', customer: 'Rajesh Patil', time: '2 min ago', capacity: '5KW', location: 'Sangli' },
    { title: 'WCR Report Generated', customer: 'Smita Joshi', time: '1 hour ago', capacity: '3KW', location: 'Pune' },
    { title: 'Pending Document Approval', customer: 'Anand Deshmukh', time: '3 hours ago', type: 'Net Metering', location: 'Kolhapur' },
    { title: 'Inverter Commissioned', customer: 'Neha Kulkarni', time: '5 hours ago', capacity: '8KW', location: 'Satara' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Animated Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, rgba(0,0,0,0) 70%)',
            animation: 'pulse 8s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { transform: 'translate(-25%, -25%) scale(1)', opacity: 0.5 },
            '50%': { transform: 'translate(-25%, -25%) scale(1.3)', opacity: 0.8 },
          },
        }}
      />

      {/* Navbar */}
      <AppBar
        position="sticky"
        elevation={scrolled ? 8 : 0}
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 45,
                height: 45,
                background: 'linear-gradient(135deg, #FF5722, #FF9800)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SolarIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #FF5722, #FF9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Arihant Solar
              </Typography>
              <Typography variant="caption" color="text.secondary">Authorized Government Contractor</Typography>
            </Box>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Typography key={item.label} sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { color: '#FF5722' } }}>
                  {item.label}
                </Typography>
              ))}
              <Button variant="outlined" startIcon={<LoginIcon />} onClick={() => navigate(UrlPath.LOGIN)} sx={{ borderRadius: 3, textTransform: 'none' }}>
                Login
              </Button>
              <Button variant="contained" startIcon={<RegisterIcon />} onClick={() => navigate(UrlPath.REGISTER)} sx={{ borderRadius: 3, textTransform: 'none', background: 'linear-gradient(135deg, #FF5722, #FF9800)' }}>
                Sign Up
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {menuItems.map((item) => (
              <ListItem component="button" key={item.label} onClick={() => { setMobileOpen(false); navigate(item.link); }}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem component="button" onClick={() => { setMobileOpen(false); navigate(UrlPath.LOGIN); }}>
              <LoginIcon sx={{ mr: 1 }} /> <ListItemText primary="Login" />
            </ListItem>
            <ListItem component="button" onClick={() => { setMobileOpen(false); navigate(UrlPath.REGISTER); }}>
              <RegisterIcon sx={{ mr: 1 }} /> <ListItemText primary="Sign Up" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
        {/* Hero Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              icon={<FlashIcon />}
              label="Solar Rooftop System"
              color="warning"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography
              variant="h1"
              fontWeight={800}
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                background: 'linear-gradient(135deg, #1a237e, #FF5722, #FF9800)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Power Your Future with Solar Energy
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              Real-time monitoring and management of solar installations across Maharashtra. Track performance, generate reports, and manage customers efficiently.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<ChevronRightIcon />}
                sx={{ borderRadius: 3, textTransform: 'none', px: 4, py: 1.5, background: 'linear-gradient(135deg, #FF5722, #FF9800)' }}
                onClick={() => navigate(UrlPath.REGISTER)}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ borderRadius: 3, textTransform: 'none', px: 4, py: 1.5 }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Zoom in timeout={500 + index * 100} key={stat.label}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: stat.color,
                      border: '1px solid',
                    },
                  }}
                >
                  <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h3" fontWeight={800} color="primary.main">
                    {stat.value}{stat.suffix}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                  <Chip label={stat.trend} size="small" sx={{ mt: 1, bgcolor: alpha(stat.color, 0.1), color: stat.color }} />
                </Card>
              </Grid>
            </Zoom>
          ))}
        </Grid>

        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" fontWeight={700} textAlign="center" sx={{ mb: 2 }}>
            Why Choose Arihant Solar?
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            We provide end-to-end solar solutions with cutting-edge technology and unmatched service quality.
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Slide direction="up" in timeout={500 + index * 100} key={feature.title}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 3, textAlign: 'center', height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                    <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              </Slide>
            ))}
          </Grid>
        </Box>

        {/* Recent Activity Section */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#FF5722' }} />
              Recent Installations
            </Typography>
            <Button endIcon={<ArrowIcon />} sx={{ textTransform: 'none' }}>View All</Button>
          </Box>
          <Grid container spacing={2}>
            {recentActivities.map((activity, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha('#FF5722', 0.05),
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: alpha('#FF5722', 0.1), transform: 'translateX(5px)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{activity.title}</Typography>
                    <Chip label={activity.time} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Customer:</strong> {activity.customer} • {activity.capacity && <><strong>Capacity:</strong> {activity.capacity}</>}
                    {activity.type && <><strong>Type:</strong> {activity.type}</>} • <strong>Location:</strong> {activity.location}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box
          sx={{
            mt: 6,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1a237e, #FF5722)',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to Switch to Solar?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Join thousands of satisfied customers who have already made the switch to clean energy.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#FF5722',
              '&:hover': { bgcolor: '#fff5f0' },
              borderRadius: 3,
              px: 4,
            }}
            onClick={() => navigate(UrlPath.REGISTER)}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', py: 4, mt: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SolarIcon sx={{ color: '#FF5722' }} />
                <Typography variant="h6" fontWeight={700}>Arihant Solar</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Authorized electrical government contractor for Solar Rooftop Systems across Maharashtra.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Links</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>Home</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>Services</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>About Us</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>Contact</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Contact Info</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>📍 Maharashtra, India</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>📞 7774855501 / 9767334454</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>✉ arihantele159@gmail.com</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Business Hours</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Monday - Friday: 9:00 AM - 6:00 PM</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Saturday: 10:00 AM - 4:00 PM</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Sunday: Closed</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography textAlign="center" variant="body2" sx={{ opacity: 0.6 }}>
            © 2024 Arihant Electricals - All Rights Reserved
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WebsiteLayout;