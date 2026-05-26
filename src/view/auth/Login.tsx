import * as React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff, WbSunny, Bolt, EnergySavingsLeaf } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/AuthAPI";
import { showSnackbar } from "@/components/uncontrolled/ToastMessage";

const Login: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  /* ---------------- State ---------------- */
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  /* ---------------- Login Handler ---------------- */
  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      showSnackbar("error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("name", res.name);
      if (remember) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/dashboard");
      showSnackbar("success", `${res.name} Successfully Login...😎`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message =
        error.response?.data?.message || "Invalid email or password";

      if (message.toLowerCase().includes("deactivated")) {
        showSnackbar("warning", message);
      } else {
        showSnackbar("error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1525 50%, #0a0f1e 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(33, 150, 243, 0.08) 0%, transparent 50%),
            repeating-linear-gradient(45deg, rgba(255, 215, 0, 0.02) 0px, rgba(255, 215, 0, 0.02) 2px, transparent 2px, transparent 8px)
          `,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "pulseGlow 8s ease-in-out infinite",
        },
        "@keyframes pulseGlow": {
          "0%, 100%": { opacity: 0.5 },
          "50%": { opacity: 1 },
        },
      }}
    >
      {/* Animated Solar Particles Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: "2px",
              height: "2px",
              background: "rgba(255, 215, 0, 0.6)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${5 + Math.random() * 10}s linear infinite`,
              opacity: 0.3 + Math.random() * 0.7,
              transform: `scale(${0.5 + Math.random() * 2})`,
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "-10%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "rotateGlow 20s linear infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "rotateGlow 25s linear infinite reverse",
          }}
        />
        <style>{`
          @keyframes floatParticle {
            0% {
              transform: translateY(100vh) translateX(0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-20vh) translateX(${Math.random() * 100 - 50}px) scale(0);
              opacity: 0;
            }
          }
          @keyframes rotateGlow {
            from { transform: rotate(0deg) scale(1); }
            to { transform: rotate(360deg) scale(1.1); }
          }
        `}</style>
      </Box>

      {/* Main Login Card */}
      <Paper
        elevation={0}
        sx={{
          width: isMobile ? "92%" : 480,
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          background: "rgba(18, 25, 45, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.2)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent, #ffd700, #2196f3, #ffd700, transparent)",
            animation: "scanLine 3s linear infinite",
          },
        }}
      >
        <style>{`
          @keyframes scanLine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `}</style>

        {/* Header with Animated Solar Elements */}
        <Box textAlign="center" mb={4} className="fade-in-up">
          <Box
            mx="auto"
            mb={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={1.5}
            sx={{
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)",
                animation: "pulse 2s ease-in-out infinite",
              },
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ffd700, #ff8c00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
                animation: "rotate 10s linear infinite",
              }}
            >
              <EnergySavingsLeaf sx={{ fontSize: 40, color: "#fff", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
            </Box>
            <Bolt sx={{ fontSize: 35, color: "#ffd700", animation: "blink 1.5s ease-in-out infinite" }} />
            <WbSunny sx={{ fontSize: 40, color: "#ffd700", animation: "spin 8s linear infinite" }} />
          </Box>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #ffd700, #ff8c00, #2196f3)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              letterSpacing: "-0.5px",
            }}
          >
            Solar RTS Portal
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", letterSpacing: "0.5px" }}>
            Renewable Energy Management System
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, animation: "fadeInUp 0.4s ease-out" }}>
            {error}
          </Alert>
        )}

        {/* Email Field */}
        <TextField
          label="Email Address"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 2.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.05)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-focused": {
                background: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 0 0 2px rgba(255, 215, 0, 0.2)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-focused": {
                color: "#ffd700",
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
          }}
        />

        {/* Password Field */}
        <TextField
          label="Password"
          fullWidth
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.05)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-focused": {
                background: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 0 0 2px rgba(255, 215, 0, 0.2)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-focused": {
                color: "#ffd700",
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
          }}
        />

        {/* Remember Me Checkbox - RESTORED AND FULLY FUNCTIONAL */}
        <Box display="flex" alignItems="center" mb={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  "&.Mui-checked": {
                    color: "#ffd700",
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Remember me
              </Typography>
            }
          />
        </Box>

        {/* Login Button with Glow Effect */}
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            py: 1.6,
            borderRadius: 2.5,
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "none",
            background: "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
            color: "#1a1a2e",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 10px 25px -5px rgba(255, 215, 0, 0.4)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              transition: "left 0.5s ease",
            },
            "&:hover::before": {
              left: "100%",
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#1a1a2e" }} /> : "Sign In"}
        </Button>

        {/* Footer - Solar Stats */}
        <Box
          mt={4}
          pt={2}
          sx={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              🔆 Solar RTS v3.0
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              ⚡ 24/7 Support
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              🌍 Green Energy
            </Typography>
          </Box>
        </Box>

        {/* Animated Gradient Border */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #ffd700, #2196f3, #ffd700, transparent)",
            animation: "scanLine 3s linear infinite",
          }}
        />
      </Paper>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
};

export default Login;