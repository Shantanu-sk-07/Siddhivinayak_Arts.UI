// src/layouts/WebsiteLayout.tsx
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '@/utils/useAuth';
import { UrlPath } from '@/constants/UrlPath';

export default function WebsiteLayout() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { label: 'Home', path: UrlPath.HOME },
    { label: 'About', path: UrlPath.ABOUT },
    { label: 'Contact', path: UrlPath.CONTACT },
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
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to={UrlPath.HOME}
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 700,
              }}
            >
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
                      {item.label}
                    </MenuItem>
                  ))}
                  {!isAuthenticated ? (
                    [
                      <MenuItem 
                        key="login" 
                        onClick={() => { 
                          navigate(UrlPath.LOGIN); 
                          handleMenuClose(); 
                        }}
                      >
                        Login
                      </MenuItem>,
                      <MenuItem 
                        key="register" 
                        onClick={() => { 
                          navigate(UrlPath.REGISTER); 
                          handleMenuClose(); 
                        }}
                      >
                        Register
                      </MenuItem>
                    ]
                  ) : (
                    <MenuItem 
                      key="dashboard" 
                      onClick={() => { 
                        navigate(getDashboardPath()); 
                        handleMenuClose(); 
                      }}
                    >
                      Dashboard
                    </MenuItem>
                  )}
                </Menu>
              </>
            ) : (
              <Box display="flex" gap={2} alignItems="center">
                {menuItems.map((item) => (
                  <Button key={item.path} color="inherit" component={RouterLink} to={item.path}>
                    {item.label}
                  </Button>
                ))}
                {!isAuthenticated ? (
                  <>
                    <Button variant="outlined" component={RouterLink} to={UrlPath.LOGIN}>
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
      </AppBar>

      <Outlet />

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 4, mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 4}}>
              <Typography variant="h6" gutterBottom>Siddhivinayak Arts</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Premium eco-friendly Ganpati idols since 1995
              </Typography>
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
              <Typography variant="h6" gutterBottom>Quick Links</Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
                <li>
                  <Button color="inherit" component={RouterLink} to={UrlPath.HOME}>
                    Home
                  </Button>
                </li>
                <li>
                  <Button color="inherit" component={RouterLink} to={UrlPath.ABOUT}>
                    About
                  </Button>
                </li>
                <li>
                  <Button color="inherit" component={RouterLink} to={UrlPath.CONTACT}>
                    Contact
                  </Button>
                </li>
              </Box>
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
              <Typography variant="h6" gutterBottom>Contact</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>📞 +91 98765 43210</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>✉️ info@siddhivinayakarts.com</Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" textAlign="center" sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', opacity: 0.5 }}>
            © 2025 Siddhivinayak Arts. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}