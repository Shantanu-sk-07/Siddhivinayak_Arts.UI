import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  useTheme,
  Slide,
  Fade,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Settings,
  NotificationsNone,
  TableChart,
  PersonAdd,
  Link as LinkIcon,
} from "@mui/icons-material";
import { showConfirmation } from "@/components/uncontrolled/ToastMessage";
import { useNavigate } from "react-router-dom";
import TataLogo from "@/assets/SolarLogoCropped.jpeg";
import Home from "@/view/Home/Home";
import { SolarForm } from "@/containers/SolarForm";
import URLsView from "@/containers/URLsView";
import { SolarRecord } from "@/types/SolarRecordMapper";
import UserManagementTab from "@/containers/UserManagementTab";
import PeopleIcon from "@mui/icons-material/People";
import { usePermissions } from "@/utils/usePermissions";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TAB_STORAGE_KEY = "dashboard_selected_tab";

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState<number>(() => {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  const [editRecord, setEditRecord] = useState<SolarRecord | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const { hasPermission, role } = usePermissions();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserEmail(payload.sub || payload.email || "");
        setUserName(payload.name || payload.sub?.split("@")[0] || "User");
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }
  }, []);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setTabValue(newValue);
    localStorage.setItem(TAB_STORAGE_KEY, newValue.toString());
    setEditRecord(null);
  };

  const getAvatarInitials = (): string => {
    if (userName && userName !== "User")
      return userName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return "U";
  };

  const handleLogout = async (): Promise<void> => {
  await showConfirmation({
    message: "Are you sure you want to logout?",
    title: "Logout Confirmation",
    confirmText: "Logout",
    cancelText: "Stay",
    confirmColor: "warning",
    icon: "🚪",
    description: "You will need to login again",
    onConfirm: async () => {
      localStorage.clear();
      navigate("/");
    }
  });
};

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleEditRecord = (record: SolarRecord): void => {
    setEditRecord(record);
    setTabValue(1);
    localStorage.setItem(TAB_STORAGE_KEY, "1");
  };

  const handleCancelEdit = (): void => {
    setEditRecord(null);
    setTabValue(0);
    localStorage.setItem(TAB_STORAGE_KEY, "0");
  };

  const notifications = [
    {
      id: 1,
      message: "New solar installation added",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      message: "Document pending for approval",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "KYC verification completed",
      time: "2 hours ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f0f4f8",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiToolbar-root": {
            minHeight: "auto !important",
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, sm: 3, md: 4 },
            py: 0,
            minHeight: "auto",
          }}
        >
          <Slide in={true} direction="right" timeout={500}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <Box
                component="img"
                src={TataLogo}
                alt="TATA Logo"
                sx={{
                  width: { xs: 60, sm: 80, md: 100 },
                  height: { xs: 60, sm: 80, md: 100 },
                  objectFit: "contain",
                }}
              />
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    background:
                      "linear-gradient(135deg, #1a237e 0%, #FF5722 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                    fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                  }}
                >
                  Arihant Solar
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontSize: "0.9rem",
                  }}
                >
                  Authorized electrical government contractor
                </Typography>
              </Box>
            </Box>
          </Slide>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            <Tooltip title="Notifications">
              <IconButton
                size={isMobile ? "small" : "medium"}
                onClick={() =>
                  setNotificationsAnchor(
                    notificationsAnchor ? null : notificationsAnchor,
                  )
                }
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsNone />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                onClick={handleMenuOpen}
                size={isMobile ? "small" : "medium"}
              >
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    bgcolor: "#FF5722",
                    cursor: "pointer",
                  }}
                >
                  {getAvatarInitials()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Marquee Section */}
        {/* <Box sx={{ bgcolor: alpha("#FF5722", 0.08), borderTop: "1px solid", borderColor: "divider" }}>
          <Marquee speed={50} gradient={false} pauseOnHover style={{ padding: "6px 0" }}>
            {marqueeMessages.map((msg, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mx: 3 }}>
                <Bolt sx={{ fontSize: 16, color: "#FF5722" }} />
                <Typography
                  sx={{
                    color: "#1a237e",
                    fontSize: { xs: "11px", sm: "12px", md: "13px" },
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {msg}
                </Typography>
                <Typography sx={{ color: "#FF5722", mx: 1 }}>✦</Typography>
              </Box>
            ))}
          </Marquee>
        </Box> */}

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            bgcolor: "white",
          }}
        >
          <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minHeight: { xs: 42, sm: 48 },
                  py: 1,
                  transition: "all 0.3s",
                  "&:hover": {
                    color: "#FF5722",
                    transform: "translateY(-2px)",
                  },
                },
                "& .Mui-selected": {
                  color: "#FF5722",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#FF5722",
                  height: 3,
                },
              }}
            >
              <Tab
                icon={<TableChart fontSize={isMobile ? "small" : "medium"} />}
                iconPosition="start"
                label={isMobile ? "Records" : "Solar Records"}
                sx={{ gap: 1 }}
              />
              {(hasPermission("CREATE_RECORD") ||
                hasPermission("EDIT_RECORD")) && (
                <Tab
                  icon={<PersonAdd fontSize={isMobile ? "small" : "medium"} />}
                  iconPosition="start"
                  label={
                    isMobile
                      ? editRecord
                        ? "Edit"
                        : hasPermission("CREATE_RECORD")
                          ? "New"
                          : "Edit"
                      : editRecord
                        ? "Edit Customer"
                        : hasPermission("CREATE_RECORD")
                          ? "New Customer"
                          : "Edit Customer"
                  }
                  sx={{ gap: 1 }}
                />
              )}
              <Tab
                icon={<LinkIcon fontSize={isMobile ? "small" : "medium"} />}
                iconPosition="start"
                label={isMobile ? "URLs" : "Quick URLs"}
                sx={{ gap: 1 }}
              />
              {role === "SUPER_ADMIN" && (
                <Tab
                  icon={<PeopleIcon fontSize={isMobile ? "small" : "medium"} />}
                  iconPosition="start"
                  label={isMobile ? "Users" : "User Management"}
                  sx={{ gap: 1 }}
                />
              )}
            </Tabs>
          </Box>
        </Paper>
      </AppBar>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        sx={{ mt: 1 }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 280,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Notifications
          </Typography>
        </Box>
        {notifications.map((n) => (
          <MenuItem key={n.id} sx={{ borderRadius: 1, mb: 0.5, mx: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight={n.read ? 400 : 600}>
                {n.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {n.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        {notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ mt: 1 }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 220,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userEmail}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            navigate("/profile");
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" sx={{ color: "#FF5722" }} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/settings");
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: "#FF5722" }} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Logout</ListItemText>
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          maxWidth: 1600,
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        <Fade in={true} timeout={500}>
          <Box>
            <TabPanel value={tabValue} index={0}>
              <Home onEditRecord={handleEditRecord} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <SolarForm
                editRecord={editRecord}
                onCancelEdit={handleCancelEdit}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <URLsView />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <UserManagementTab />
            </TabPanel>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
