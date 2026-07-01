// src/container/admin/AdminDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Avatar, useTheme, alpha, styled,
  Button, Chip, Container, LinearProgress
} from '@mui/material';
import {
  People, Category, BookOnline, TrendingUp, CalendarToday,
  Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/AdminService';
import { ganpatiService } from '@/services/GanpatiService';
import { User, GanpatiResponseDto, ConfirmedBooking } from '@/types/MurtiType';
import { UrlPath } from '@/constants/UrlPath';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`
  },
}));

const GanpatiCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.12)}`
  },
}));

const ImageBox = styled(Box)({
  width: '100%',
  height: 200,
  overflow: 'hidden',
  position: 'relative',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  }
});

interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function AdminDashboard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [ganpatiList, setGanpatiList] = useState<GanpatiResponseDto[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    mandalCustomers: 0,
    totalGanpati: 0,
    totalBookings: 0,
    newThisMonth: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      let customersData: User[] = [];
      let ganpatiData: GanpatiResponseDto[] = [];
      let bookingData: ConfirmedBooking[] = [];
      
      try {
        const [customersRes, ganpatiRes, bookingsRes] = await Promise.all([
          adminService.getAllCustomers(),
          ganpatiService.getAll(),
          adminService.getAllBookings(),
        ]);

        customersData = customersRes.success && customersRes.data ? customersRes.data : [];
        ganpatiData = ganpatiRes.success && ganpatiRes.data ? ganpatiRes.data : [];
        bookingData = bookingsRes.success && bookingsRes.data ? bookingsRes.data : [];
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('error', t('dashboard.load_error'));
      }

      setGanpatiList(ganpatiData);

      const mandalCount = customersData.filter((c: User) => 
        c.registrationType === 'MANDAL'
      ).length;
      
      const now = new Date();
      const newThisMonth = customersData.filter((c: User) => {
        const created = new Date(c.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        totalCustomers: customersData.length,
        mandalCustomers: mandalCount,
        totalGanpati: ganpatiData.length,
        totalBookings: bookingData.length,
        newThisMonth,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showSnackbar('error', t('dashboard.load_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statItems: StatItem[] = [
    {
      title: t('admin.total_customers'),
      value: stats.totalCustomers,
      icon: <People />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      title: t('admin.mandal_customers'),
      value: stats.mandalCustomers,
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      title: t('admin.total_ganpati'),
      value: stats.totalGanpati,
      icon: <Category />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
    {
      title: t('dashboard.total_bookings'),
      value: stats.totalBookings,
      icon: <BookOnline />,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.1),
    },
    {
      title: t('admin.new_this_month'),
      value: stats.newThisMonth,
      icon: <CalendarToday />,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1),
    },
  ];

  const handleViewAllGanpati = () => {
    navigate(UrlPath.ADMIN_GANPATI);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>{t('table.loading')}</Typography>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 3,
          }}
        >
          {t('admin.dashboard')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statItems.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <StatCard>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {item.title}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            color: item.color,
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: item.bgColor, color: item.color }}>
                        {item.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </StatCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            {t('admin.recent_ganpati')} ({ganpatiList.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(UrlPath.ADMIN_GANPATI)}
            sx={{ borderRadius: 30, textTransform: 'none', bgcolor: '#d32f2f' }}
          >
            {t('ganpati.add_new')}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {ganpatiList.slice(0, 4).map((ganpati, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={ganpati.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GanpatiCard>
                  <ImageBox>
                    <img 
                      src={ganpati.images?.[0] || '/placeholder.jpg'} 
                      alt={ganpati.name}
                    />
                    <Chip
                      label={`${ganpati.availableSlots} ${t('ganpati.available')}`}
                      size="small"
                      color={ganpati.availableSlots > 0 ? 'success' : 'error'}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        fontSize: '0.7rem'
                      }}
                    />
                  </ImageBox>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                      {ganpati.name}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                      <Box display="flex" gap={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          {ganpati.height}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          • {ganpati.material}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#d32f2f', fontSize: '1rem' }}>
                        ₹{ganpati.price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`${UrlPath.ADMIN_GANPATI}?id=${ganpati.id}`)}
                        startIcon={<VisibilityIcon />}
                        sx={{ 
                          borderRadius: 2, 
                          fontSize: '0.7rem', 
                          flex: 1, 
                          py: 0.5
                        }}
                      >
                        {t('ganpati.details')}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`${UrlPath.ADMIN_GANPATI}?edit=${ganpati.id}`)}
                        startIcon={<EditIcon />}
                        sx={{ 
                          borderRadius: 2, 
                          fontSize: '0.7rem', 
                          flex: 1, 
                          py: 0.5, 
                          bgcolor: '#d32f2f' 
                        }}
                      >
                        {t('button.edit')}
                      </Button>
                    </Box>
                  </Box>
                </GanpatiCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {ganpatiList.length > 4 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="text" 
              onClick={handleViewAllGanpati}
              sx={{ color: '#d32f2f' }}
            >
              {t('common.view_all')} ({ganpatiList.length - 4} {t('common.more')})
            </Button>
          </Box>
        )}

        <GlassPaper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            🌺 गणपती बाप्पा मोरया 🌺
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('dashboard.footer_message', {
              totalGanpati: stats.totalGanpati,
              totalBookings: stats.totalBookings,
              totalCustomers: stats.totalCustomers
            })}
          </Typography>
        </GlassPaper>
      </Container>
    </motion.div>
  );
}