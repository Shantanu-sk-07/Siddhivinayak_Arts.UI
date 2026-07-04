import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box, AppBar, Toolbar, Typography, IconButton, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem,
  Divider, useTheme, alpha, Tooltip, styled, Chip,
} from "@mui/material";
import {
  Menu as MenuIcon, Dashboard, Category, People, Logout,
  Person, Settings, KeyboardArrowRight, BookOnline,
  Language as WebsiteIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { clearToken } from "@/helpers/auth";
import { UrlPath } from "@/constants/UrlPath";
import LanguageSwitcher from "@/common/LanguageSwitcher";

const DRAWER_WIDTH = 255;
const TOPBAR_HEIGHT = 64;
const GRAD_LINE = 3;

const P = {
  saffron: "#F97316",
  rose: "#E11D48",
  grad: "linear-gradient(135deg, #F97316, #E11D48)",
  gradSoft: "linear-gradient(135deg, #FFF7ED, #FFF1F2)",
  white: "#FFFFFF",
  bg: "#F8F9FB",
  border: "#EAECF0",
  text: "#111827",
  sub: "#6B7280",
  active: "#FFF7ED",
};

const GradientLine = styled(Box)({
  height: GRAD_LINE,
  background: "linear-gradient(90deg, #F97316, #E11D48, #F97316)",
  backgroundSize: "200% 100%",
  animation: "shimmer 3s linear infinite",
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "200% center" },
    "100%": { backgroundPosition: "-200% center" },
  },
});

const StyledAppBar = styled(AppBar)({
  background: P.white,
  boxShadow: "none",
  borderBottom: `1px solid ${P.border}`,
  color: P.text,
});

const SidebarBox = styled(Box)({
  width: DRAWER_WIDTH,
  height: "100vh",
  background: P.white,
  borderRight: `1px solid ${P.border}`,
  display: "flex",
  flexDirection: "column",
});

const NavItem = styled(ListItem, {
  shouldForwardProp: (p) => p !== "active",
})<{ active?: boolean }>(({ active }) => ({
  margin: "2px 12px",
  borderRadius: 10,
  width: `calc(100% - 24px)`,
  cursor: "pointer",
  padding: "9px 14px",
  position: "relative",
  background: active ? P.active : "transparent",
  transition: "all 0.2s ease",
  "&::before": active ? {
    content: '""',
    position: "absolute",
    left: 0, top: "20%", bottom: "20%",
    width: 3,
    borderRadius: "0 4px 4px 0",
    background: "linear-gradient(135deg, #F97316, #E11D48)",
  } : {},
  "&:hover": { background: active ? P.active : "#F9FAFB" },
  "& .MuiListItemIcon-root": { minWidth: 36, color: active ? P.saffron : P.sub },
  "& .MuiListItemText-primary": {
    fontSize: "0.875rem",
    fontWeight: active ? 600 : 400,
    color: active ? P.saffron : P.text,
  },
}));

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const userName = localStorage.getItem("userName") || "Admin";

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const navItems = [
    { text: "Dashboard", icon: <Dashboard fontSize="small" />, path: UrlPath.ADMIN_DASHBOARD },
    { text: "Ganpati", icon: <Category fontSize="small" />, path: UrlPath.ADMIN_GANPATI },
    { text: "Customers", icon: <People fontSize="small" />, path: UrlPath.ADMIN_CUSTOMERS },
    { text: "Bookings", icon: <BookOnline fontSize="small" />, path: UrlPath.ADMIN_BOOKINGS },
  ];

  const handleLogout = () => {
    setAnchorEl(null);
    clearToken();
    localStorage.removeItem("userName");
    navigate(UrlPath.LOGIN, { replace: true });
  };

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const sidebarContent = (
    <SidebarBox>
       <GradientLine />
      <Box sx={{
        px: 2.5,
        borderBottom: `1px solid ${P.border}`,
        height: TOPBAR_HEIGHT + 2,
        display: "flex",
        alignItems: "center",
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2.5,
            background: P.grad,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
            boxShadow: `0 4px 12px ${alpha(P.saffron, 0.35)}`,
          }}>🐘</Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: P.text, lineHeight: 1.2 }}>
              Siddhivinayak
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: P.sub, letterSpacing: 0.5 }}>
              Admin Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${P.border}` }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 34, height: 34, fontSize: "0.85rem", fontWeight: 700, background: P.grad }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: P.text }}>{userName}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: P.sub }}>{getGreeting()} 👋</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 1.5 }}>
        <Typography sx={{ px: 2.5, mb: 1, fontSize: "0.68rem", fontWeight: 600, color: P.sub, letterSpacing: 1, textTransform: "uppercase" }}>
          Main Menu
        </Typography>
        <List disablePadding>
          {navItems.map((item, i) => (
            <motion.div key={item.path}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}>
              <NavItem
                active={location.pathname === item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {location.pathname === item.path && (
                  <KeyboardArrowRight sx={{ fontSize: 16, color: P.saffron }} />
                )}
              </NavItem>
            </motion.div>
          ))}
        </List>

        <Divider sx={{ my: 1.5, mx: 2, borderColor: P.border }} />

        <Typography sx={{ px: 2.5, mb: 1, fontSize: "0.68rem", fontWeight: 600, color: P.sub, letterSpacing: 1, textTransform: "uppercase" }}>
          Other
        </Typography>
        <List disablePadding>
          {[
            { text: "Profile", icon: <Person fontSize="small" />, path: UrlPath.ADMIN_PROFILE },
            { text: "Settings", icon: <Settings fontSize="small" />, path: UrlPath.ADMIN_SETTINGS },
          ].map((item) => (
            <NavItem key={item.path}
              active={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </NavItem>
          ))}
          <NavItem onClick={() => navigate(UrlPath.HOME)}>
            <ListItemIcon><WebsiteIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="View Website" />
          </NavItem>
        </List>
      </Box>

      <Box sx={{
        mx: 2, mb: 2, p: 1.5, borderRadius: 3,
        background: P.gradSoft,
        border: `1px solid ${alpha(P.saffron, 0.15)}`,
        textAlign: "center",
      }}>
        <motion.div animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }}>
          <Typography sx={{ fontSize: "0.78rem", color: P.saffron, fontWeight: 600 }}>
            🌺 गणपती बाप्पा मोरया
          </Typography>
          <Typography sx={{ fontSize: "0.68rem", color: P.sub, mt: 0.3 }}>
            मंगलमूर्ती मोरया 🙏
          </Typography>
        </motion.div>
      </Box>
    </SidebarBox>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: P.bg }}>
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none" } }}>
          {sidebarContent}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none", boxShadow: "2px 0 12px rgba(0,0,0,0.04)" } }}
          open>
          {sidebarContent}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <GradientLine />

        <StyledAppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer, top: 0 }}>
          <Toolbar sx={{ px: { xs: 1.5, sm: 2.5 }, minHeight: `${TOPBAR_HEIGHT}px !important`, gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)}
              sx={{ display: { sm: "none" }, color: P.sub }}>
              <MenuIcon />
            </IconButton>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: P.text }}>
                {navItems.find(n => n.path === location.pathname)?.text ?? "Admin"}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: P.sub }}>
                {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </Typography>
            </Box>

            <LanguageSwitcher variant="icon" size="small" />

            <Tooltip title="View Website">
              <IconButton onClick={() => navigate(UrlPath.HOME)} size="small"
                sx={{
                  border: `1px solid ${P.border}`, borderRadius: 2,
                  color: P.sub, display: { xs: "none", sm: "flex" },
                  "&:hover": { borderColor: P.saffron, color: P.saffron, background: P.active },
                }}>
                <WebsiteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Chip
              avatar={
                <Avatar sx={{ background: P.grad, color: "white !important", fontWeight: 700, fontSize: "0.75rem !important" }}>
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={userName}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                background: P.bg, border: `1px solid ${P.border}`,
                fontWeight: 500, fontSize: "0.82rem", cursor: "pointer",
                "&:hover": { background: P.active, borderColor: alpha(P.saffron, 0.3) },
              }}
            />

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 3, mt: 1, minWidth: 180, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: `1px solid ${P.border}` } }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
              <MenuItem onClick={() => { setAnchorEl(null); navigate(UrlPath.ADMIN_PROFILE); }} sx={{ borderRadius: 2, mx: 0.5 }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>Profile
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate(UrlPath.ADMIN_SETTINGS); }} sx={{ borderRadius: 2, mx: 0.5 }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>Settings
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ borderRadius: 2, mx: 0.5, color: P.rose }}>
                <ListItemIcon><Logout fontSize="small" sx={{ color: P.rose }} /></ListItemIcon>Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </StyledAppBar>

        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 3, md: 1 }, overflow: "auto" }}>
          <AnimatePresence>
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}