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
import { Ganpati } from '@/types';
import { showSnackbar, showConfirmation } from '@/components/uncontrolled/ToastMessage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/useAuth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
}

interface GanpatiListResponse {
  success: boolean;
  data: Ganpati[];
}

interface InterestedResponse {
  success: boolean;
  data: string[];
}

interface InterestedUpdateResponse {
  success: boolean;
  message?: string;
}

interface BookingRequestResponse {
  success: boolean;
  message?: string;
}

export default function GanpatiListing() {
  const { user } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [ganpatiList, setGanpatiList] = useState<Ganpati[]>([]);
  const [filteredList, setFilteredList] = useState<Ganpati[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [heightFilter, setHeightFilter] = useState<string>('all');
  const [interestedItems, setInterestedItems] = useState<Set<string>>(new Set());
  const [selectedGanpati, setSelectedGanpati] = useState<Ganpati | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const fetchGanpatiList = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/ganpati/all');
      const data: GanpatiListResponse = await response.json();
      if (data.success && data.data) {
        setGanpatiList(data.data);
      }
    } catch {
      showSnackbar('error', 'Failed to load Ganpati list');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInterestedItems = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const response = await fetch('/api/customer/interested');
      const data: InterestedResponse = await response.json();
      if (data.success && data.data) {
        setInterestedItems(new Set(data.data));
      }
    } catch {
      console.error('Failed to fetch interested items');
    }
  }, [user]);

  const filterGanpati = useCallback((): void => {
    let filtered = [...ganpatiList];

    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
    if (!user) {
      showSnackbar('warning', 'Please login to add to interested list');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/customer/interested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ganpatiId }),
      });
      const data: InterestedUpdateResponse = await response.json();
      if (data.success) {
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

  const handleBookingRequest = async (ganpati: Ganpati): Promise<void> => {
    if (!user) {
      showSnackbar('warning', 'Please login to book Ganpati');
      navigate('/login');
      return;
    }

    const confirmed = await showConfirmation({
      message: `Do you want to request booking for ${ganpati.name}?`,
      title: 'Booking Request',
      confirmText: 'Request Booking',
      confirmColor: 'primary',
    });

    if (confirmed) {
      try {
        const response = await fetch('/api/customer/booking-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ganpatiId: ganpati.id }),
        });
        const data: BookingRequestResponse = await response.json();
        if (data.success) {
          showSnackbar('success', 'Booking request submitted successfully');
          navigate('/customer/bookings');
        } else {
          showSnackbar('error', data.message || 'Failed to submit request');
        }
      } catch {
        showSnackbar('error', 'Failed to submit booking request');
      }
    }
  };

  const viewDetails = (ganpati: Ganpati): void => {
    setSelectedGanpati(ganpati);
    setDetailsOpen(true);
  };

  const heights: string[] = ['all', '2ft', '3ft', '4ft', '5ft', '6ft', '7ft'];

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Our Ganpati Collection
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search Ganpati..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Filter by Height"
          value={heightFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeightFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {heights.map((height: string) => (
            <MenuItem key={height} value={height}>
              {height === 'all' ? 'All Heights' : height}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {filteredList.map((ganpati: Ganpati) => (
          <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={ganpati.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={ganpati.images[0] || '/placeholder.jpg'}
                alt={ganpati.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Typography variant="h6" gutterBottom>
                    {ganpati.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleInterested(ganpati.id)}
                    color={interestedItems.has(ganpati.id) ? 'error' : 'default'}
                  >
                    {interestedItems.has(ganpati.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="textSecondary">
                  Height: {ganpati.height} | Material: {ganpati.material}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} my={1}>
                  <Rating value={ganpati.rating || 0} precision={0.5} size="small" readOnly />
                  <Typography variant="caption">({ganpati.rating || 0})</Typography>
                </Box>
                
                <Typography variant="h5" color="primary" sx={{ my: 1 }}>
                  ₹{ganpati.price.toLocaleString()}
                </Typography>
                
                <Chip 
                  label={`${ganpati.availableSlots} slots available`} 
                  size="small"
                  color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                />
                
                <Box display="flex" gap={1}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => viewDetails(ganpati)}
                  >
                    Details
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    disabled={ganpati.availableSlots === 0}
                    onClick={() => handleBookingRequest(ganpati)}
                    sx={{ flexGrow: 1 }}
                  >
                    Request Booking
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredList.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary">No Ganpati found</Typography>
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedGanpati && (
          <>
            <DialogTitle>{selectedGanpati.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 6}}>
                  <img 
                    src={selectedGanpati.images[0]} 
                    alt={selectedGanpati.name}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <Typography variant="body2" paragraph>
                    {selectedGanpati.description}
                  </Typography>
                  <Typography variant="body2"><strong>Height:</strong> {selectedGanpati.height}</Typography>
                  <Typography variant="body2"><strong>Material:</strong> {selectedGanpati.material}</Typography>
                  <Typography variant="body2"><strong>Color Theme:</strong> {selectedGanpati.colorTheme}</Typography>
                  <Typography variant="body2"><strong>Price:</strong> ₹{selectedGanpati.price.toLocaleString()}</Typography>
                  <Typography variant="body2"><strong>Available Slots:</strong> {selectedGanpati.availableSlots}</Typography>
                  
                  {selectedGanpati.achievements && selectedGanpati.achievements.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2">Achievements:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {selectedGanpati.achievements.map((achievement: string, idx: number) => (
                          <Chip key={idx} label={achievement} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setDetailsOpen(false);
                  handleBookingRequest(selectedGanpati);
                }}
                disabled={selectedGanpati.availableSlots === 0}
              >
                Request Booking
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}