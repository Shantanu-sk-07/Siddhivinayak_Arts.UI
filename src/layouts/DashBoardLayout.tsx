// src/layouts/DashboardLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  styled,
  Card,
  CardContent,
  Popover,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Category,
  BookOnline,
  Payments,
  People,
  QrCodeScanner,
  Logout,
  Person,
  Settings,
  Assessment,
  Forest,
  KeyboardArrowRight,
  AccessTime,
  WbSunny as WbSunnyIcon,
  Nightlight,
  CalendarToday,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/utils/useAuth";
import { usePermissions } from "@/utils/usePermissions";
import NotificationBell from "@/view/DashboardPages/Staff/NotificationDetails";

const drawerWidth = 260;

const BackgroundWrapper = styled(Box)({
  position: "relative",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e8f4f8 0%, #d1e8f0 100%)",
});

const ContentWrapper = styled(Box)({
  position: "relative",
  zIndex: 1,
});

const MainContent = styled(Box)({
  background: "rgba(255, 255, 255, 0.7)",
  borderRadius: "20px 0 0 0",
  minHeight: "calc(100vh - 80px)",
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  borderBottom: "none",
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    width: drawerWidth,
    boxShadow: "2px 0 12px rgba(0,0,0,0.05)",
    borderRight: "none",
    top: 0,
    height: "100vh",
    overflowX: "hidden",
  },
}));

const NavItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  margin: "8px 16px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all 0.3s ease",
  padding: "8px 16px",
  background: active ? alpha(theme.palette.common.white, 0.25) : "transparent",
  "&:hover": {
    background: alpha(theme.palette.common.white, 0.15),
    transform: "translateX(2px)",
  },
  "& .MuiListItemIcon-root": {
    color: active
      ? theme.palette.common.white
      : alpha(theme.palette.common.white, 0.85),
    minWidth: 40,
  },
  "& .MuiListItemText-primary": {
    fontWeight: active ? 600 : 400,
    fontSize: "0.9rem",
    color: theme.palette.common.white,
  },
}));

const GreetingCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: "blur(10px)",
  borderRadius: 12,
  margin: "4px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    background: alpha(theme.palette.common.white, 0.25),
  },
}));

interface NavItemType {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [festivalAnchorEl, setFestivalAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin, isStaff, isCustomer } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getNavItems = (): NavItemType[] => {
    const items: NavItemType[] = [];

    if (isAdmin) {
      items.push(
        { text: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
        {
          text: "Ganpati Management",
          icon: <Category />,
          path: "/admin/ganpati",
          permission: "canManageGanpati",
        },
        {
          text: "Booking Management",
          icon: <BookOnline />,
          path: "/admin/bookings",
          permission: "canManageBookings",
        },
        {
          text: "Payment Verification",
          icon: <Payments />,
          path: "/admin/payments",
          permission: "canVerifyPayments",
        },
        {
          text: "Staff Management",
          icon: <People />,
          path: "/admin/staff",
          permission: "canManageStaff",
        },
        {
          text: "Customer Management",
          icon: <People />,
          path: "/admin/customers",
        },
        {
          text: "Reports",
          icon: <Assessment />,
          path: "/admin/reports",
          permission: "canViewReports",
        },
      );
    } else if (isStaff) {
      items.push(
        { text: "Dashboard", icon: <Dashboard />, path: "/staff/dashboard" },
        {
          text: "QR Scan",
          icon: <QrCodeScanner />,
          path: "/staff/scan",
          permission: "canScanQR",
        },
        {
          text: "Pickup Management",
          icon: <BookOnline />,
          path: "/staff/pickup",
          permission: "canCompletePickup",
        },
      );
    } else if (isCustomer) {
      items.push(
        { text: "Dashboard", icon: <Dashboard />, path: "/customer/dashboard" },
        {
          text: "Browse Ganpati",
          icon: <Category />,
          path: "/customer/ganpati",
          permission: "canMakeBooking",
        },
        {
          text: "My Bookings",
          icon: <BookOnline />,
          path: "/customer/bookings",
          permission: "canViewOwnBookings",
        },
        {
          text: "Payment History",
          icon: <Payments />,
          path: "/customer/payments",
          permission: "canMakePayment",
        },
      );
    }

    return items.filter(
      (item) =>
        !item.permission ||
        hasPermission(item.permission as keyof typeof hasPermission),
    );
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFestivalOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFestivalAnchorEl(event.currentTarget);
  };

  const handleFestivalClose = () => {
    setFestivalAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12)
      return { text: "Good Morning", icon: <WbSunnyIcon />, color: "#ff0" };
    if (hour < 17)
      return { text: "Good Afternoon", icon: <WbSunnyIcon/>, color: "#ff9800" };
    return { text: "Good Evening", icon: <Nightlight />, color: "#9c27b0" };
  };

  const greeting = getGreeting();

  const festivalOpen = Boolean(festivalAnchorEl);

  const drawer = (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", pt: 2 }}
    >
      <Box
        sx={{
          px: 2.5,
          pb: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Forest sx={{ fontSize: 36, color: theme.palette.common.white }} />
        </motion.div>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "white", fontSize: "1.1rem" }}
          >
            Siddhivinayak
          </Typography>
          <Typography
            variant="caption"
            sx={{ opacity: 0.85, color: "white", fontSize: "0.7rem" }}
          >
            Admin Portal
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 0, pt: 1 }}>
        {getNavItems().map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <NavItem
              active={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.85rem",
                }}
              />
              {location.pathname === item.path && (
                <KeyboardArrowRight sx={{ fontSize: 18, color: "white" }} />
              )}
            </NavItem>
          </motion.div>
        ))}
      </List>

     <GreetingCard>
  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={0.5}>
      <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, fontSize: '0.9rem' }}>
        {greeting.text}
      </Typography>
      <Box sx={{ color: greeting.color, display: 'flex', alignItems: 'center' }}>
        {greeting.icon}
      </Box>
    </Box>
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
      <AccessTime sx={{ fontSize: 14, color: 'white', opacity: 0.8 }} />
      <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, fontSize: '0.85rem' }}>
        {formatTime()} • {formatDate()}
      </Typography>
    </Box>
  </CardContent>
</GreetingCard>
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography
          variant="caption"
          sx={{ color: "white", opacity: 1, fontSize: "1rem" }}
        >
          🌺 गणपती बाप्पा मोरया 🌺
        </Typography>
      </Box>
    </Box>
  );

  return (
    <BackgroundWrapper>
      <ContentWrapper>
        <Box sx={{ display: "flex" }}>
          <StyledAppBar
            position="fixed"
            sx={{ zIndex: theme.zIndex.drawer + 1 }}
          >
            <Toolbar
              sx={{ px: { xs: 2, sm: 3 }, minHeight: { xs: 56, sm: 64 } }}
            >
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: "none" }, color: "white" }}
              >
                <MenuIcon />
              </IconButton>

              <Typography
                variant="h6"
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  color: "white",
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                }}
              >
                Siddhivinayak Arts
              </Typography>

              <Box display="flex" alignItems="center" gap={1.5}>
                <Tooltip title="Festival Calendar">
                  <IconButton
                    onClick={handleFestivalOpen}
                    size="small"
                    sx={{ color: "white" }}
                  >
                    <CalendarToday />
                  </IconButton>
                </Tooltip>

                <NotificationBell />

                <IconButton onClick={handleMenuOpen} size="small">
                  <Avatar
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: "white",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {user?.name?.charAt(0) || "G"}
                  </Avatar>
                </IconButton>
              </Box>

              <Popover
                open={festivalOpen}
                anchorEl={festivalAnchorEl}
                onClose={handleFestivalClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    p: 2,
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 200,
                    background: "white",
                  },
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  🎉 Ganesh Festival 2026
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  📅 Start: August 22, 2026
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 End: September 2, 2026
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="primary">
                  🙏 Ganpati Bappa Morya!
                </Typography>
              </Popover>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    minWidth: 180,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/settings");
                  }}
                >
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={handleLogout}
                  sx={{ color: theme.palette.error.main }}
                >
                  <ListItemIcon>
                    <Logout
                      fontSize="small"
                      sx={{ color: theme.palette.error.main }}
                    />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Toolbar>
          </StyledAppBar>

          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          >
            <StyledDrawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  width: "85%",
                  maxWidth: 260,
                  top: 0,
                },
              }}
            >
              {drawer}
            </StyledDrawer>
            <StyledDrawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  top: 0,
                  position: "fixed",
                },
              }}
              open
            >
              {drawer}
            </StyledDrawer>
          </Box>

          <MainContent
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
              mt: { xs: 7, sm: 8 },
              position: "relative",
              zIndex: 1,
              minHeight: "100vh",
              overflowX: "auto",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </MainContent>
        </Box>
      </ContentWrapper>
    </BackgroundWrapper>
  );
}
