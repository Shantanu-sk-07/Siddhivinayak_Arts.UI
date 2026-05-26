import * as React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { showSnackbar } from "@/components/uncontrolled/ToastMessage";
import {
  register,
  sendEmailOtp,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp,
} from "@/services/AuthAPI";

/* ---------------- Utility ---------------- */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[6-9]\d{9}$/;

/* ---------------- Component ---------------- */
const Register: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [emailVerified, setEmailVerified] = React.useState(false);
  const [mobileVerified, setMobileVerified] = React.useState(false);

  const [emailOtp, setEmailOtp] = React.useState("");
  const [mobileOtp, setMobileOtp] = React.useState("");

  const [showEmailOtp, setShowEmailOtp] = React.useState(false);
  const [showMobileOtp, setShowMobileOtp] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  /* ---------------- Handlers ---------------- */
  const handleChange = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  /* ---------------- OTP FLOW ---------------- */
  const handleSendEmailOtp = async () => {
  // Show OTP input immediately (console OTP or email)
  setShowEmailOtp(true);
  showSnackbar("info", "Check console for OTP");

  try {
    await sendEmailOtp(form.email);
    showSnackbar("success", "OTP sent via email (if SMTP works)");
  } catch {
    showSnackbar("warning", "Email OTP not sent via SMTP; use console OTP");
  }
};

  const handleVerifyEmailOtp = async () => {
    try {
      await verifyEmailOtp(form.email, emailOtp);
      setEmailVerified(true);
      setShowEmailOtp(false);
      showSnackbar("success", "Email Verified");
    } catch {
      showSnackbar("error", "Invalid Email OTP");
    }
  };

  const handleSendMobileOtp = async () => {
    try {
      await sendMobileOtp(form.mobile);
      setShowMobileOtp(true);
      showSnackbar("success", "OTP sent to mobile");
    } catch {
      showSnackbar("error", "Failed to send mobile OTP");
    }
  };

  const handleVerifyMobileOtp = async () => {
    try {
      await verifyMobileOtp(form.mobile, mobileOtp);
      setMobileVerified(true);
      setShowMobileOtp(false);
      showSnackbar("success", "Mobile Verified");
    } catch {
      showSnackbar("error", "Invalid Mobile OTP");
    }
  };

  /* ---------------- Register ---------------- */
  const handleRegister = async () => {
    if (!emailVerified || !mobileVerified) {
      showSnackbar("error", "Verify Email & Mobile first");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showSnackbar("error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await register(form);
      showSnackbar("success", "Registration Successful 🎉");
      navigate("/");
    } catch {
      showSnackbar("error", "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
      <Paper sx={{ width: isMobile ? "100%" : 450, p: 4 }}>
        <Typography variant="h5" align="center" mb={2}>
          Create Account
        </Typography>

        {/* NAME */}
        <TextField
          label="Full Name"
          fullWidth
          sx={{ mb: 2 }}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        {/* EMAIL */}
        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 1 }}
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {emailVerified ? (
                  <CheckCircle color="success" />
                ) : (
                  <Button
                    disabled={!emailRegex.test(form.email)}
                    onClick={handleSendEmailOtp}
                  >
                    Verify
                  </Button>
                )}
              </InputAdornment>
            ),
          }}
        />

        {showEmailOtp && (
          <Box display="flex" gap={1} mb={2}>
            <TextField
              placeholder="Enter OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
            />
            <Button onClick={handleVerifyEmailOtp}>Verify</Button>
            <Button onClick={handleSendEmailOtp}>Resend</Button>
          </Box>
        )}

        {/* MOBILE */}
        <TextField
          label="Mobile"
          fullWidth
          sx={{ mb: 1 }}
          value={form.mobile}
          onChange={(e) => handleChange("mobile", e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {mobileVerified ? (
                  <CheckCircle color="success" />
                ) : (
                  <Button
                    disabled={!mobileRegex.test(form.mobile)}
                    onClick={handleSendMobileOtp}
                  >
                    Verify
                  </Button>
                )}
              </InputAdornment>
            ),
          }}
        />

        {showMobileOtp && (
          <Box display="flex" gap={1} mb={2}>
            <TextField
              placeholder="Enter OTP"
              value={mobileOtp}
              onChange={(e) => setMobileOtp(e.target.value)}
            />
            <Button onClick={handleVerifyMobileOtp}>Verify</Button>
            <Button onClick={handleSendMobileOtp}>Resend</Button>
          </Box>
        )}

        {/* PASSWORD */}
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          sx={{ mb: 2 }}
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />

        {/* CONFIRM */}
        <TextField
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          fullWidth
          sx={{ mb: 2 }}
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />

        <Button fullWidth variant="contained" onClick={handleRegister}>
          {loading ? <CircularProgress size={22} /> : "Register"}
        </Button>
      </Paper>
    </Box>
  );
};

export default Register;
