import { useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { toast, ToastContainer, type ToastOptions, type ToastContainerProps } from "react-toastify";
import { Dialog, DialogContent, DialogActions, Button, Typography, Snackbar, Alert, CircularProgress, Box } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

export type MessageType = "success" | "error" | "warning" | "info";

export interface ConfirmationOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "secondary" | "error" | "success" | "warning";
  icon?: string;
  description?: string;
  showPrice?: boolean;
  price?: number;
  advancePercent?: number;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

// ---------------- Toast ----------------
const toastProps: ToastContainerProps = {
  position: "top-right",
  autoClose: 3000,
  newestOnTop: true,
  pauseOnHover: true,
  closeOnClick: true,
};

let toastRoot: Root | null = null;
const ensureToast = () => {
  if (!toastRoot) {
    toastRoot = createRoot(document.body.appendChild(document.createElement("div")));
    toastRoot.render(<ToastContainer {...toastProps} />);
  }
};

export const showToast = (type: MessageType, message: string, options?: ToastOptions) => {
  ensureToast();
  toast[type](message, options);
};

// ---------------- Snackbar ----------------
let snackbarRoot: Root | null = null;
const ensureSnackbarRoot = () => {
  if (!snackbarRoot) {
    snackbarRoot = createRoot(document.body.appendChild(document.createElement("div")));
  }
};

export const showSnackbar = (severity: MessageType = "info", message: string, duration: number = 3000) => {
  ensureSnackbarRoot();

  const Container = () => {
    const [open, setOpen] = useState(true);
    return (
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    );
  };

  snackbarRoot!.render(<Container />);
};

// ---------------- Confirmation Dialog (Reusable with customization) ----------------
let confirmRoot: Root | null = null;
const ensureConfirmRoot = () => {
  if (!confirmRoot) {
    confirmRoot = createRoot(document.body.appendChild(document.createElement("div")));
  }
};

export const showConfirmation = (
  messageOrOptions: string | ConfirmationOptions,
  title?: string,
  onConfirm?: () => Promise<void>
): Promise<boolean> => {
  let options: ConfirmationOptions;
  
  if (typeof messageOrOptions === 'string') {
    options = {
      message: messageOrOptions,
      title: title || "Confirm Action",
      confirmText: "Confirm",
      cancelText: "Cancel",
      confirmColor: "primary",
      icon: "⚠️",
      description: "",
      showPrice: false,
      onConfirm: onConfirm,
    };
  } else {
    options = {
      confirmText: "Confirm",
      cancelText: "Cancel",
      confirmColor: "primary",
      icon: "⚠️",
      description: "",
      showPrice: false,
      ...messageOrOptions,
    };
  }

  ensureConfirmRoot();

  const {
    message,
    title: finalTitle,
    confirmText,
    cancelText,
    confirmColor,
    icon,
    description,
    showPrice,
    price,
    advancePercent = 30,
    onConfirm: finalOnConfirm,
    onCancel,
  } = options;

  return new Promise((resolve) => {
    const Container = () => {
      const [open, setOpen] = useState(true);
      const [loading, setLoading] = useState(false);

      const handleClose = (result: boolean) => {
        if (loading) return;
        setOpen(false);
        resolve(result);
        if (!result && onCancel) onCancel();
        setTimeout(() => {
          if (confirmRoot) {
            confirmRoot.unmount();
            confirmRoot = null;
          }
        }, 300);
      };

      const handleConfirm = async () => {
        if (loading) return;
        
        if (finalOnConfirm) {
          setLoading(true);
          try {
            await finalOnConfirm();
            handleClose(true);
          } catch (error) {
            console.error('Confirmation error:', error);
            setLoading(false);
            showSnackbar("error", error instanceof Error ? error.message : "Operation failed! Please try again.");
            // Don't close dialog on error
          }
        } else {
          handleClose(true);
        }
      };

      const getHeaderGradient = () => {
        switch(confirmColor) {
          case "error": return "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)";
          case "success": return "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #0f5a2e 100%)";
          case "warning": return "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)";
          default: return "linear-gradient(135deg, #FF5722 0%, #e64a19 50%, #bf360c 100%)";
        }
      };

      const getButtonColor = () => {
        switch(confirmColor) {
          case "error": return "#dc2626";
          case "success": return "#16a34a";
          case "warning": return "#f59e0b";
          default: return "#FF5722";
        }
      };

      const advanceAmount = price ? (price * advancePercent) / 100 : 0;
      const remainingAmount = price ? price - advanceAmount : 0;

      return (
        <Dialog
          open={open}
          onClose={() => handleClose(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              width: { xs: "90%", sm: showPrice ? 450 : 420 },
              maxWidth: "90%",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              animation: "fadeInScale 0.2s ease-out",
              "@keyframes fadeInScale": {
                "0%": { opacity: 0, transform: "scale(0.95)" },
                "100%": { opacity: 1, transform: "scale(1)" }
              }
            },
          }}
        >
          <Box sx={{
            background: getHeaderGradient(),
            p: 2.5,
            position: "relative",
            overflow: "hidden",
          }}>
            <Box sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
            }} />
            <Box sx={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 70,
              height: 70,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.08)",
            }} />
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, position: "relative", zIndex: 1 }}>
              <Box sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Typography sx={{ fontSize: 24 }}>{icon}</Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "white", fontWeight: 700, letterSpacing: "-0.5px" }}>
                  {finalTitle}
                </Typography>
                {description && (
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                    {description}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body1" sx={{ 
                color: "#1e293b", 
                fontWeight: 500,
                lineHeight: 1.5,
                mb: showPrice ? 2 : 0
              }}>
                {message}
              </Typography>
              
              {showPrice && price && (
                <Box sx={{ 
                  bgcolor: "#f8fafc", 
                  borderRadius: 2, 
                  p: 2, 
                  mt: 2,
                  border: "1px solid #e2e8f0"
                }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">Total Price</Typography>
                    <Typography variant="body1" fontWeight={600}>₹{price.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">Advance Payment ({advancePercent}%)</Typography>
                    <Typography variant="body1" fontWeight={600} color="#FF5722">₹{advanceAmount.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">Remaining Amount ({100 - advancePercent}%)</Typography>
                    <Typography variant="body1">₹{remainingAmount.toLocaleString()}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 2.5, 
            pt: showPrice ? 0 : 2.5,
            gap: 2,
            bgcolor: "#f8fafc",
            borderTop: "1px solid #e2e8f0"
          }}>
            <Button 
              onClick={() => handleClose(false)} 
              disabled={loading}
              variant="outlined"
              sx={{ 
                flex: 1,
                textTransform: "none", 
                borderRadius: 2,
                py: 1,
                borderColor: "#cbd5e1",
                color: "#475569",
                "&:hover": {
                  borderColor: "#94a3b8",
                  bgcolor: "#f1f5f9"
                }
              }}
            >
              {cancelText}
            </Button>
            
            <Button 
              onClick={handleConfirm}
              disabled={loading}
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : null}
              sx={{ 
                flex: 1,
                textTransform: "none", 
                borderRadius: 2,
                py: 1,
                bgcolor: getButtonColor(),
                "&:hover": { bgcolor: getButtonColor() + "dd" },
                "&.Mui-disabled": confirmColor === "error" ? { bgcolor: "#fecaca", color: "#ef4444" } : {}
              }}
            >
              {loading ? "Processing..." : confirmText}
            </Button>
          </DialogActions>
        </Dialog>
      );
    };

    confirmRoot!.render(<Container />);
  });
};