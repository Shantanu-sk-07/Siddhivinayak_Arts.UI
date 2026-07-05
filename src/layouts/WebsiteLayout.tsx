import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Container, Box, IconButton,
  Menu, MenuItem, useTheme, useMediaQuery, alpha, Divider, Stack,
} from "@mui/material";
import {
  Menu as MenuIcon, Info as InfoIcon, ContactPhone as ContactIcon,
  Dashboard as DashboardIcon, Login as LoginIcon, Phone as PhoneIcon,
  Email as EmailIcon, LocationOn as LocationOnIcon, ArrowForward,
  Instagram, Facebook, WhatsApp, YouTube, Home as HomeIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { isLoggedIn } from "@/helpers/auth";
import LanguageSwitcher from "@/common/LanguageSwitcher";
import { UrlPath } from "@/constants/UrlPath";
import Grid from "@mui/material/Grid";

const P = {
  saffron: "#F97316",
  rose: "#E11D48",
  grad: "linear-gradient(135deg, #F97316, #E11D48)",
  white: "#FFFFFF",
  bg: "#FFFBF7",
  text: "#111827",
  sub: "#6B7280",
  border: "#EAECF0",
  footerBg: "#111827",
};

const GradientText = ({ children, sx = {} }: { children: React.ReactNode; sx?: object }) => (
  <Box component="span" sx={{
    background: P.grad, backgroundClip: "text",
    WebkitBackgroundClip: "text", color: "transparent", ...sx,
  }}>
    {children}
  </Box>
);

interface MenuItemType { label: string; icon: React.ReactNode; path: string; }

export default function WebsiteLayout() {
  const authenticated = isLoggedIn();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [sloganIdx, setSloganIdx] = useState(0);
  const currentYear = new Date().getFullYear();

  const slogans = ["🌺 गणपती बाप्पा मोरया", "🌺 मंगलमूर्ती मोरया", "🌺 ॐ गं गणपतये नमः", "🌺 विघ्नहर्ता गणेश"];

  useEffect(() => {
    const t = setInterval(() => setSloganIdx(i => (i + 1) % slogans.length), 2800);
    return () => clearInterval(t);
  }, [slogans.length]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuItems: MenuItemType[] = [
    { label: t("nav.home"), icon: <HomeIcon sx={{ fontSize: 16 }} />, path: UrlPath.HOME },
    { label: t("nav.about"), icon: <InfoIcon sx={{ fontSize: 16 }} />, path: UrlPath.ABOUT },
    { label: t("nav.contact"), icon: <ContactIcon sx={{ fontSize: 16 }} />, path: UrlPath.CONTACT },
  ];

  const isActive = (path: string) => location.pathname === path;
  const close = () => setAnchorEl(null);

  return (
    <Box sx={{ minHeight: "100vh", background: P.bg, display: "flex", flexDirection: "column" }}>

      {/* Topbar slogan ticker - fixed height to prevent jumping */}
      <Box sx={{ background: P.grad, height: 28, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={sloganIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "white", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
              {slogans[sloganIdx]}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navbar */}
      <AppBar position="sticky" elevation={0} sx={{
        background: scrolled ? alpha(P.white, 0.95) : P.white,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${P.border}`,
        color: P.text,
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, md: 1 }, minHeight: { xs: 60, sm: 64 }, gap: 1 }}>

            {/* Logo */}
            <Box onClick={() => navigate(UrlPath.HOME)}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", flexGrow: 1 }}>
              <motion.div whileHover={{ rotate: 12, scale: 1.1 }} transition={{ duration: 0.2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2,
                  background: P.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, boxShadow: `0 4px 12px ${alpha(P.saffron, 0.3)}`,
                }}>🐘</Box>
              </motion.div>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", sm: "1.05rem" }, color: P.text, lineHeight: 1.1 }}>
                  Siddhivinayak <GradientText>Arts</GradientText>
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: P.sub, letterSpacing: 0.5 }}>
                  Ganesh Murti Specialist · Kurundwad
                </Typography>
              </Box>
            </Box>

            {!isMobile ? (
              <Box display="flex" alignItems="center" gap={0.5}>
                {menuItems.map((item) => (
                  <Button key={item.path} onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      textTransform: "none", fontWeight: isActive(item.path) ? 600 : 400,
                      fontSize: "0.875rem", borderRadius: 50, px: 2,
                      color: isActive(item.path) ? P.saffron : P.sub,
                      background: isActive(item.path) ? alpha(P.saffron, 0.08) : "transparent",
                      "&:hover": { background: alpha(P.saffron, 0.07), color: P.saffron },
                    }}>
                    {item.label}
                  </Button>
                ))}

                <Box sx={{ mx: 0.5 }}><LanguageSwitcher variant="icon" size="small" /></Box>

                {authenticated ? (
                  <Button onClick={() => navigate(UrlPath.ADMIN_DASHBOARD)}
                    startIcon={<DashboardIcon fontSize="small" />}
                    variant="contained"
                    sx={{
                      textTransform: "none", fontWeight: 600, borderRadius: 50, px: 2.5,
                      background: P.grad, boxShadow: `0 4px 14px ${alpha(P.saffron, 0.35)}`,
                      "&:hover": { boxShadow: `0 6px 20px ${alpha(P.saffron, 0.45)}`, transform: "translateY(-1px)" },
                      transition: "all 0.25s",
                    }}>
                    Dashboard
                  </Button>
                ) : (
                  <Button onClick={() => navigate(UrlPath.LOGIN)}
                    startIcon={<LoginIcon fontSize="small" />}
                    variant="outlined"
                    sx={{
                      textTransform: "none", fontWeight: 600, borderRadius: 50, px: 2.5,
                      borderColor: P.saffron, color: P.saffron,
                      "&:hover": { background: alpha(P.saffron, 0.06), borderColor: P.saffron },
                    }}>
                    {t("nav.login")}
                  </Button>
                )}
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <LanguageSwitcher variant="icon" size="small" />
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ border: `1px solid ${P.border}`, borderRadius: 2, p: 0.8, color: P.text }}>
                  <MenuIcon />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}
                  PaperProps={{
                    sx: {
                      borderRadius: 3, minWidth: 210, mt: 1,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                      border: `1px solid ${P.border}`, p: 0.5,
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                  {menuItems.map((item) => (
                    <MenuItem key={item.path}
                      onClick={() => { navigate(item.path); close(); }}
                      sx={{
                        borderRadius: 2, mb: 0.25, gap: 1.5,
                        color: isActive(item.path) ? P.saffron : P.text,
                        background: isActive(item.path) ? alpha(P.saffron, 0.07) : "transparent",
                        fontWeight: isActive(item.path) ? 600 : 400, fontSize: "0.875rem",
                        "&:hover": { background: alpha(P.saffron, 0.06) },
                      }}>
                      {item.icon}
                      {item.label}
                    </MenuItem>
                  ))}
                  <Divider sx={{ my: 0.75 }} />
                  {authenticated ? (
                    <MenuItem onClick={() => { navigate(UrlPath.ADMIN_DASHBOARD); close(); }}
                      sx={{ borderRadius: 2, gap: 1.5, fontWeight: 600, color: P.saffron, background: alpha(P.saffron, 0.06), "&:hover": { background: alpha(P.saffron, 0.1) } }}>
                      <DashboardIcon fontSize="small" /> Dashboard
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => { navigate(UrlPath.LOGIN); close(); }}
                      sx={{ borderRadius: 2, gap: 1.5, fontWeight: 600, color: P.saffron, background: alpha(P.saffron, 0.06), "&:hover": { background: alpha(P.saffron, 0.1) } }}>
                      <LoginIcon fontSize="small" /> {t("nav.login")}
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </Box>

      {/* Footer */}
      <Box sx={{ background: P.footerBg, color: "white", pt: 6, pb: 3, mt: "auto" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>

            {/* Brand */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, background: P.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🐘</Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "white", fontSize: "1rem" }}>Siddhivinayak Arts</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: alpha("#fff", 0.45), letterSpacing: 0.5 }}>Kurundwad, Maharashtra</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: alpha("#fff", 0.6), fontSize: "0.85rem", lineHeight: 1.8, mb: 2.5 }}>
                {t("footer.about_company")}
              </Typography>
              <Typography sx={{ color: P.saffron, fontSize: "0.8rem", fontStyle: "italic", mb: 2.5 }}>
                "एकदंताय वक्रतुण्डाय गौरीपुत्राय धीमहि" 🌸
              </Typography>
              <Box display="flex" gap={1}>
                {[WhatsApp, Instagram, Facebook, YouTube].map((Icon, i) => (
                  <IconButton key={i} size="small" sx={{
                    color: alpha("#fff", 0.55), border: `1px solid ${alpha("#fff", 0.1)}`, borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": { color: P.saffron, borderColor: alpha(P.saffron, 0.4), background: alpha(P.saffron, 0.08) },
                  }}>
                    <Icon sx={{ fontSize: 18 }} />
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Links */}
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "0.8rem", letterSpacing: 1, textTransform: "uppercase" }}>
                Pages
              </Typography>
              <Stack spacing={1.2}>
                {menuItems.map((item) => (
                  <Button key={item.path} onClick={() => navigate(item.path)}
                    startIcon={<ArrowForward sx={{ fontSize: "11px !important" }} />}
                    sx={{
                      color: alpha("#fff", 0.55), textTransform: "none", fontSize: "0.83rem",
                      justifyContent: "flex-start", p: 0, minWidth: 0, fontWeight: 400,
                      "&:hover": { color: P.saffron, background: "transparent" },
                    }}>
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            {/* Contact */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "0.8rem", letterSpacing: 1, textTransform: "uppercase" }}>
                Contact
              </Typography>
              <Stack spacing={1.8}>
                {[
                  { icon: <PhoneIcon sx={{ fontSize: 15, color: P.saffron }} />, text: t("footer.phone_number") },
                  { icon: <EmailIcon sx={{ fontSize: 15, color: P.saffron }} />, text: t("footer.email_address") },
                  { icon: <LocationOnIcon sx={{ fontSize: 15, color: P.saffron }} />, text: t("footer.location") },
                ].map((c, i) => (
                  <Box key={i} display="flex" alignItems="flex-start" gap={1.5}>
                    <Box sx={{ mt: 0.15, flexShrink: 0 }}>{c.icon}</Box>
                    <Typography sx={{ color: alpha("#fff", 0.6), fontSize: "0.82rem", lineHeight: 1.6 }}>
                      {c.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Map */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "0.8rem", letterSpacing: 1, textTransform: "uppercase" }}>
                📍 {t("footer.find_us")}
              </Typography>
              <Box sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${alpha("#fff", 0.1)}`, height: 170 }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29877.876456456456!2d74.5984!3d16.8024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDQ4JzA4LjYiTiA3NMKwMzUnNTQuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%" height="100%" style={{ border: "none" }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Siddhivinayak Arts Location"
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: alpha("#fff", 0.08), my: 4 }} />

          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" gap={1}>
            <Typography sx={{ color: P.saffron, fontSize: "0.82rem", fontWeight: 500 }}>
              🌺 गणपती बाप्पा मोरया • मंगलमूर्ती मोरया 🌺
            </Typography>
            <Typography sx={{ color: alpha("#fff", 0.35), fontSize: "0.75rem" }}>
              © {currentYear} Siddhivinayak Arts · Made with 🧡 in Maharashtra
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}