// src/view/DashboardPages/Customer/GanpatiListing.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  LinearProgress,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  Favorite,
  FavoriteBorder,
  Visibility,
} from '@mui/icons-material';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/useAuth';
import { ganpatiService } from '@/services/GanpatiService';
import { customerService } from '@/services/CustomerService';
import { GanpatiResponseDto } from '@/types';
import { getBookingWhatsAppMessage, sendWhatsAppMessage } from '@/utils/Whatsapp';

export default function GanpatiListing() {
  const { user,isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [filteredList, setFilteredList] = useState<GanpatiResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [heightFilter, setHeightFilter] = useState<string>('all');
  const [interestedItems, setInterestedItems] = useState<Set<string>>(new Set());
  const [selectedGanpati, setSelectedGanpati] = useState<GanpatiResponseDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const fetchGanpatiList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await ganpatiService.getAll();
      if (response.success && response.data) {
        setGanpatiList(response.data);
        setFilteredList(response.data);
      }
    } catch {
      showSnackbar('error', 'Failed to load Ganpati list');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInterestedItems = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    try {
      const response = await customerService.getInterestedItems();
      if (response.success && response.data) {
        setInterestedItems(new Set(response.data));
      }
    } catch {
      console.error('Failed to fetch interested items');
    }
  }, [isAuthenticated]);

  const filterGanpati = useCallback((): void => {
    let filtered = [...ganpatiList];
    if (searchTerm) {
      filtered = filtered.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (heightFilter !== 'all') {
      filtered = filtered.filter(g => g.height === heightFilter);
    }
    setFilteredList(filtered);
  }, [ganpatiList, searchTerm, heightFilter]);

  useEffect(() => {
    fetchGanpatiList();
    fetchInterestedItems();
  }, [fetchGanpatiList, fetchInterestedItems]);

  useEffect(() => {
    filterGanpati();
  }, [filterGanpati]);

  const handleInterested = async (ganpatiId: string): Promise<void> => {
    if (!isAuthenticated) {
      showSnackbar('warning', 'Please login to add to interested list');
      navigate('/login');
      return;
    }

    try {
      const response = await customerService.toggleInterested(ganpatiId);
      if (response.success) {
        const newInterested = new Set(interestedItems);
        if (newInterested.has(ganpatiId)) {
          newInterested.delete(ganpatiId);
          showSnackbar('info', 'Removed from interested');
        } else {
          newInterested.add(ganpatiId);
          showSnackbar('success', 'Added to interested list');
        }
        setInterestedItems(newInterested);
      }
    } catch {
      showSnackbar('error', 'Failed to update interested status');
    }
  };

  const handleBookingRequest = async (ganpati: GanpatiResponseDto): Promise<void> => {
  if (!isAuthenticated) {
    showSnackbar('warning', 'Please login to book Ganpati');
    navigate('/login');
    return;
  }

  await showConfirmation({
    message: `You are about to book "${ganpati.name}"`,
    title: "Confirm Booking",
    confirmText: "Book Now",
    cancelText: "Cancel",
    confirmColor: "success",
    icon: "📖",
    description: "WhatsApp will open with booking details. Just click Send.",
    showPrice: true,
    price: ganpati.price,
    advancePercent: 30,
    onConfirm: async () => {
      const response = await customerService.requestBooking(ganpati.id);
      if (response.success) {
        const adminNumber = '918767739911';
        const message = getBookingWhatsAppMessage(
          user?.name || 'Customer',
          user?.phone || 'N/A',
          ganpati.name,
          ganpati.price,
          response.data.bookingId
        );
        sendWhatsAppMessage(adminNumber, message);
        
        showSnackbar('success', 'Booking submitted! WhatsApp opened.');
        navigate('/customer/bookings');
      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    }
  });
};
  const viewDetails = (ganpati: GanpatiResponseDto): void => {
    setSelectedGanpati(ganpati);
    setDetailsOpen(true);
  };

  const heights: string[] = ['all', '2ft', '3ft', '4ft', '5ft', '6ft', '7ft'];

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Our Ganpati Collection</Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField placeholder="Search Ganpati..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ flexGrow: 1, minWidth: 200 }} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }} />
        <TextField select label="Filter by Height" value={heightFilter} onChange={(e) => setHeightFilter(e.target.value)} sx={{ minWidth: 150 }}>
          {heights.map((height) => (<MenuItem key={height} value={height}>{height === 'all' ? 'All Heights' : height}</MenuItem>))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {filteredList.map((ganpati) => (
          <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={ganpati.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia component="img" height="200" image={ganpati.images?.[0] || '/placeholder.jpg'} alt={ganpati.name} sx={{ objectFit: 'cover' }} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Typography variant="h6" gutterBottom>{ganpati.name}</Typography>
                  <IconButton size="small" onClick={() => handleInterested(ganpati.id)} color={interestedItems.has(ganpati.id) ? 'error' : 'default'}>
                    {interestedItems.has(ganpati.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="textSecondary">Height: {ganpati.height} | Material: {ganpati.material}</Typography>
                <Box display="flex" alignItems="center" gap={1} my={1}>
                  <Rating value={ganpati.rating || 0} precision={0.5} size="small" readOnly />
                  <Typography variant="caption">({ganpati.rating || 0})</Typography>
                </Box>
                <Typography variant="h5" color="primary" sx={{ my: 1 }}>₹{ganpati.price.toLocaleString()}</Typography>
                <Chip label={`${ganpati.availableSlots} slots available`} size="small" color={ganpati.availableSlots > 0 ? 'success' : 'error'} sx={{ mb: 2 }} />
                <Box display="flex" gap={1}>
                  <Button variant="outlined" size="small" startIcon={<Visibility />} onClick={() => viewDetails(ganpati)}>Details</Button>
                  <Button variant="contained" size="small" disabled={ganpati.availableSlots === 0} onClick={() => handleBookingRequest(ganpati)} sx={{ flexGrow: 1 }}>Request Booking</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredList.length === 0 && (<Box textAlign="center" py={8}><Typography variant="h6" color="textSecondary">No Ganpati found</Typography></Box>)}

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedGanpati && (
          <>
            <DialogTitle>{selectedGanpati.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{xs:12,sm:6}}>
                  <img src={selectedGanpati.images?.[0]} alt={selectedGanpati.name} style={{ width: '100%', borderRadius: 8 }} />
                </Grid>
                <Grid size={{xs:12,sm:6}}>
                  <Typography variant="body2" paragraph>{selectedGanpati.description}</Typography>
                  <Typography variant="body2"><strong>Height:</strong> {selectedGanpati.height}</Typography>
                  <Typography variant="body2"><strong>Material:</strong> {selectedGanpati.material}</Typography>
                  <Typography variant="body2"><strong>Color Theme:</strong> {selectedGanpati.colorTheme}</Typography>
                  <Typography variant="body2"><strong>Price:</strong> ₹{selectedGanpati.price.toLocaleString()}</Typography>
                  <Typography variant="body2"><strong>Available Slots:</strong> {selectedGanpati.availableSlots}</Typography>
                  {selectedGanpati.achievements?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2">Achievements:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {selectedGanpati.achievements.map((ach, idx) => (<Chip key={idx} label={ach} size="small" />))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => { setDetailsOpen(false); handleBookingRequest(selectedGanpati); }} disabled={selectedGanpati.availableSlots === 0}>
                Request Booking
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}