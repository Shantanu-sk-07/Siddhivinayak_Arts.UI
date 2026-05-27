// src/layouts/WebsiteLayout.tsx
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Grid,
  alpha,
  styled,
} from '@mui/material';
import { Menu as MenuIcon, Forest, Call, Email, LocationOn, Home, Info, ContactPhone } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/utils/useAuth';
import { UrlPath } from '@/constants/UrlPath';
import Logo from '@/assets/Logo.jpg'

const BackgroundWrapper = styled(Box)({
  position: 'relative',
  minHeight: '100vh',
 backgroundImage: `url(${Logo})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
});

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.95),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const FooterSection = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.common.black, 0.85),
  backdropFilter: 'blur(10px)',
  color: theme.palette.common.white,
  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

export default function WebsiteLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', icon: <Home fontSize="small" />, path: UrlPath.HOME },
    { label: 'About', icon: <Info fontSize="small" />, path: UrlPath.ABOUT },
    { label: 'Contact', icon: <ContactPhone fontSize="small" />, path: UrlPath.CONTACT },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getDashboardPath = () => {
    if (!user) return UrlPath.LOGIN;
    switch (user.role) {
      case 'SUPER_ADMIN': return UrlPath.ADMIN_DASHBOARD;
      case 'STAFF': return UrlPath.STAFF_DASHBOARD;
      case 'CUSTOMER': return UrlPath.CUSTOMER_DASHBOARD;
      default: return UrlPath.LOGIN;
    }
  };

  return (
    <BackgroundWrapper>
      <GlassAppBar position="fixed" elevation={scrolled ? 5 : 0}>
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0 }, py: 0.5 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to={UrlPath.HOME}
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: theme.palette.primary.main,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Forest sx={{ color: theme.palette.secondary.main }} />
              Siddhivinayak Arts
            </Typography>

            {isMobile ? (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>
                <Menu 
                  anchorEl={anchorEl} 
                  open={Boolean(anchorEl)} 
                  onClose={handleMenuClose}
                >
                  {menuItems.map((item) => (
                    <MenuItem 
                      key={item.path} 
                      onClick={() => {
                        navigate(item.path);
                        handleMenuClose();
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {item.icon}
                        {item.label}
                      </Box>
                    </MenuItem>
                  ))}
                  {!isAuthenticated ? (
                    [
                      <MenuItem key="login" onClick={() => { navigate(UrlPath.LOGIN); handleMenuClose(); }}>
                        Login
                      </MenuItem>,
                      <MenuItem key="register" onClick={() => { navigate(UrlPath.REGISTER); handleMenuClose(); }}>
                        Register
                      </MenuItem>
                    ]
                  ) : (
                    <MenuItem key="dashboard" onClick={() => { navigate(getDashboardPath()); handleMenuClose(); }}>
                      Dashboard
                    </MenuItem>
                  )}
                </Menu>
              </>
            ) : (
              <Box display="flex" gap={1} alignItems="center">
                {menuItems.map((item) => (
                  <Button 
                    key={item.path} 
                    component={RouterLink} 
                    to={item.path}
                    startIcon={item.icon}
                    sx={{ 
                      color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                {!isAuthenticated ? (
                  <>
                    <Button variant="text" component={RouterLink} to={UrlPath.LOGIN}>
                      Login
                    </Button>
                    <Button variant="contained" component={RouterLink} to={UrlPath.REGISTER}>
                      Register
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" component={RouterLink} to={getDashboardPath()}>
                    Dashboard
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </GlassAppBar>

      <Box sx={{ pt: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </Box>

      <FooterSection>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Forest sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
                <Typography variant="h6" fontWeight={700}>
                  Siddhivinayak Arts
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                Premium eco-friendly Ganpati idols since 1995. Serving devotees with love and devotion.
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Button 
                      component={RouterLink}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{ 
                        color: 'white',
                        opacity: 0.8,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      {item.label}
                    </Button>
                  </li>
                ))}
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Info
              </Typography>
              <Box sx={{ opacity: 0.8 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <Call fontSize="small" />
                  <Typography variant="body2">+91 98765 43210</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <Email fontSize="small" />
                  <Typography variant="body2">info@siddhivinayakarts.com</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                  <LocationOn fontSize="small" />
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
              borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              opacity: 0.6
            }}
          >
            🙏 Ganpati Bappa Morya 🙏
            <br />
            © 2025 Siddhivinayak Arts. All rights reserved.
          </Typography>
        </Container>
      </FooterSection>
    </BackgroundWrapper>
  );
}