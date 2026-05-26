// src/view/DashboardPages/Customer/GanpatiDetails.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Rating,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ArrowBack,
  CheckCircle,
  EmojiEvents,
  CalendarToday,
  Height,
  Brush,
  AttachMoney,
  LocalOffer,
  Verified,
  WhatsApp,
  Phone,
  Share,
} from '@mui/icons-material';
import { Ganpati, Booking } from '@/types';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { useAuth } from '@/utils/useAuth';
import { useBookingNotification } from '@/utils/useNotification';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
}

interface GanpatiDetailsResponse {
  success: boolean;
  data: Ganpati;
}

interface InterestedCheckResponse {
  success: boolean;
  isInterested: boolean;
}

interface ExistingBookingResponse {
  success: boolean;
  booking: Booking | null;
}

interface InterestedToggleResponse {
  success: boolean;
  message?: string;
}

interface BookingRequestResponse {
  success: boolean;
  message?: string;
}

export default function GanpatiDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth() as AuthContextType;
  const { notifyBookingRequest } = useBookingNotification();
  
  const [ganpati, setGanpati] = useState<Ganpati | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [interested, setInterested] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageDialogOpen, setImageDialogOpen] = useState<boolean>(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);

  const fetchGanpatiDetails = useCallback(async (): Promise<void> => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/ganpati/${id}`);
      const data: GanpatiDetailsResponse = await response.json();
      if (data.success && data.data) {
        setGanpati(data.data);
        setSelectedImage(data.data.images[0]);
      }
    } catch {
      showSnackbar('error', 'Failed to load Ganpati details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkInterestedStatus = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !id) return;
    
    try {
      const response = await fetch(`/api/customer/interested/check/${id}`);
      const data: InterestedCheckResponse = await response.json();
      if (data.success) {
        setInterested(data.isInterested);
      }
    } catch {
      console.error('Failed to check interested status');
    }
  }, [isAuthenticated, id]);

  const checkExistingBooking = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !id) return;
    
    try {
      const response = await fetch(`/api/customer/booking/check/${id}`);
      const data: ExistingBookingResponse = await response.json();
      if (data.success && data.booking) {
        setExistingBooking(data.booking);
      }
    } catch {
      console.error('Failed to check existing booking');
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    fetchGanpatiDetails();
    if (isAuthenticated) {
      checkInterestedStatus();
      checkExistingBooking();
    }
  }, [fetchGanpatiDetails, checkInterestedStatus, checkExistingBooking, isAuthenticated]);

  const handleInterested = async (): Promise<void> => {
    if (!isAuthenticated) {
      showConfirmation(
        'Please login to mark interest. Would you like to login now?',
        'Login Required',
        async () => navigate('/login')
      );
      return;
    }

    try {
      const response = await fetch('/api/customer/interested/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ganpatiId: id }),
      });
      const data: InterestedToggleResponse = await response.json();
      if (data.success) {
        setInterested(!interested);
        showSnackbar('success', interested ? 'Removed from interests' : 'Added to interests');
      }
    } catch {
      showSnackbar('error', 'Failed to update interest');
    }
  };

  const handleBookingRequest = (): void => {
    if (!isAuthenticated) {
      showConfirmation(
        'Please login to book this Ganpati. Would you like to login now?',
        'Login Required',
        async () => navigate('/login')
      );
      return;
    }

    setBookingDialogOpen(true);
  };

  const submitBookingRequest = async (): Promise<void> => {
    setBookingLoading(true);
    try {
      const response = await fetch('/api/customer/booking-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ganpatiId: id }),
      });
      const data: BookingRequestResponse = await response.json();
      if (data.success) {
        showSnackbar('success', 'Booking request submitted successfully!');
        if (notifyBookingRequest && user?.name && ganpati?.name) {
          notifyBookingRequest(user.name, ganpati.name);
        }
        setBookingDialogOpen(false);
        navigate('/customer/bookings');
      } else {
        showSnackbar('error', data.message || 'Failed to submit booking request');
      }
    } catch {
      showSnackbar('error', 'Failed to submit booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    const shareData = {
      title: ganpati?.name,
      text: `Check out this beautiful ${ganpati?.name} at Siddhivinayak Arts!`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        await navigator.clipboard.writeText(window.location.href);
        showSnackbar('success', 'Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showSnackbar('success', 'Link copied to clipboard!');
    }
  };

  const handleWhatsApp = (): void => {
    const message = `Check out this beautiful ${ganpati?.name} at Siddhivinayak Arts! ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading Ganpati details...</Typography>
      </Box>
    );
  }

  if (!ganpati) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Ganpati not found</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/customer/ganpati')}>
          Back to Collection
        </Button>
      </Box>
    );
  }

  const bookingSteps: string[] = [
    'Submit Request',
    'Admin Approval',
    'Pay Advance',
    'Booking Confirmed',
    'Pickup Complete',
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/customer/ganpati')}>
          Back to Collection
        </Button>
        <Box display="flex" gap={1}>
          <IconButton onClick={handleWhatsApp} sx={{ color: '#25D366' }}>
            <WhatsApp />
          </IconButton>
          <IconButton onClick={handleShare}>
            <Share />
          </IconButton>
          <IconButton onClick={handleInterested} color={interested ? 'error' : 'default'}>
            {interested ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Image Gallery */}
        <Grid size={{xs: 12, sm: 6}}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Box
              component="img"
              src={selectedImage}
              alt={ganpati.name}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                cursor: 'pointer',
              }}
              onClick={() => setImageDialogOpen(true)}
            />
            <ImageList sx={{ mt: 2, height: 100 }} cols={4} gap={8}>
              {ganpati.images.map((img: string, idx: number) => (
                <ImageListItem key={idx}>
                  <img
                    src={img}
                    alt={`${ganpati.name} ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === img ? '2px solid #1976d2' : 'none',
                    }}
                    onClick={() => setSelectedImage(img)}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        </Grid>

        {/* Details */}
        <Grid size={{xs: 12, sm: 6}}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {ganpati.name}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating value={ganpati.rating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="textSecondary">
                ({ganpati.rating || 0} stars)
              </Typography>
              {ganpati.availableSlots > 0 ? (
                <Chip 
                  label={`${ganpati.availableSlots} slots available`} 
                  color="success" 
                  size="small"
                />
              ) : (
                <Chip label="Sold Out" color="error" size="small" />
              )}
            </Box>

            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              ₹{ganpati.price.toLocaleString()}
            </Typography>

            <Typography variant="body1" color="textSecondary" paragraph>
              {ganpati.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Specifications */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Height color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Height</Typography>
                    <Typography variant="body2">{ganpati.height}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Brush color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Material</Typography>
                    <Typography variant="body2">{ganpati.material}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocalOffer color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Color Theme</Typography>
                    <Typography variant="body2">{ganpati.colorTheme}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Created</Typography>
                    <Typography variant="body2">{new Date(ganpati.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Payment Info */}
            <Card variant="outlined" sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                  <AttachMoney /> Payment Terms
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Advance Payment (30%)</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{(ganpati.price * 0.3).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Remaining (70%)</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{(ganpati.price * 0.7).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Achievements */}
            {ganpati.achievements && ganpati.achievements.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                  <EmojiEvents /> Achievements
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {ganpati.achievements.map((achievement: string, idx: number) => (
                    <Chip key={idx} icon={<Verified />} label={achievement} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box display="flex" gap={2} mt={3}>
              {existingBooking ? (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/customer/bookings/${existingBooking.id}`)}
                >
                  View My Booking
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={ganpati.availableSlots === 0}
                  onClick={handleBookingRequest}
                  sx={{ flexGrow: 1 }}
                >
                  Request Booking
                </Button>
              )}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Phone />}
                onClick={() => window.location.href = 'tel:+919876543210'}
              >
                Contact
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Image Fullscreen Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          <img src={selectedImage} alt={ganpati.name} style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Booking Request Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => !bookingLoading && setBookingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Booking Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              You are requesting to book:
            </Typography>
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{ganpati.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Height: {ganpati.height} | Material: {ganpati.material}
              </Typography>
              <Typography variant="h6" color="primary">
                ₹{ganpati.price.toLocaleString()}
              </Typography>
            </Card>

            <Typography variant="subtitle2" gutterBottom>
              Booking Process:
            </Typography>
            <Stepper activeStep={0} orientation="vertical" sx={{ mt: 2 }}>
              {bookingSteps.map((step: string) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              After submission, admin will review your request and notify you via email/WhatsApp.
              Once approved, you'll need to pay 30% advance to confirm the booking.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)} disabled={bookingLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={submitBookingRequest}
            disabled={bookingLoading}
            startIcon={bookingLoading ? <LinearProgress sx={{ width: 20 }} /> : <CheckCircle />}
          >
            {bookingLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}