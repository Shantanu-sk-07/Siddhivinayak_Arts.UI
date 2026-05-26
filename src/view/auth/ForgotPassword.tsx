import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Mobile, 2: OTP, 3: Reset Password
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      alert("Please enter a valid mobile number");
      return;
    }
    // Normally call API to send OTP
    alert(`OTP sent to ${mobile}`);
    setStep(2);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    if (otp === "123456") {
      setStep(3); // move to password reset
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = () => {
    if (!newPassword || !retypePassword) {
      alert("Please fill all fields");
      return;
    }
    if (newPassword !== retypePassword) {
      alert("New Password and Retype Password do not match");
      return;
    }
    // Normally call API to reset password
    alert("Password reset successfully!");
    navigate("/login");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      bgcolor="#f3f4f6"
    >
      <Box
        bgcolor="#fff"
        p={4}
        borderRadius={2}
        boxShadow="0 4px 20px rgba(0,0,0,0.1)"
        width={{ xs: "100%", sm: 400 }}
      >
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
          Forgot Password
        </Typography>

        {/* Step 1: Mobile Number */}
        {step === 1 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputProps={{ maxLength: 10 }}
              fullWidth
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSendOtp}
              sx={{
                background: "linear-gradient(135deg,#facc15,#fcd34d)",
                color: "#000",
                fontWeight: 600,
                "&:hover": { opacity: 0.9 },
              }}
            >
              Send OTP
            </Button>
          </Box>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ maxLength: 6 }}
              fullWidth
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyOtp}
              sx={{
                background: "linear-gradient(135deg,#facc15,#fcd34d)",
                color: "#000",
                fontWeight: 600,
                "&:hover": { opacity: 0.9 },
              }}
            >
              Verify OTP
            </Button>
          </Box>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <Box display="flex" flexDirection="column" gap={2}>
          
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Retype New Password"
              type="password"
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleResetPassword}
              sx={{
                background: "linear-gradient(135deg,#facc15,#fcd34d)",
                color: "#000",
                fontWeight: 600,
                "&:hover": { opacity: 0.9 },
              }}
            >
              Reset Password
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ForgotPassword;
