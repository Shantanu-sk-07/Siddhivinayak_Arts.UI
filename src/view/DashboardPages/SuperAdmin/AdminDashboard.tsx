// src/view/DashboardPages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Category,
  PendingActions,
  AttachMoney,
  Payment,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { DashboardStats } from '@/types';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" variant="caption" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp sx={{ fontSize: 16, color: trend > 0 ? 'success.main' : 'error.main' }} />
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trend}% from last week
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}20`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // API call to fetch stats
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch  {
      showSnackbar('error', 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const statCards = [
    {
      title: 'Total Ganpati',
      value: stats?.totalGanpati || 0,
      icon: <Category sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: <PendingActions sx={{ fontSize: 32, color: theme.palette.warning.main }} />,
      color: theme.palette.warning.main,
      trend: 12,
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 32, color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
      trend: 8,
    },
    {
      title: 'Pending Payments',
      value: `₹${(stats?.pendingPayments || 0).toLocaleString()}`,
      icon: <Payment sx={{ fontSize: 32, color: theme.palette.error.main }} />,
      color: theme.palette.error.main,
    },
    {
      title: 'Interested Users',
      value: stats?.interestedUsers || 0,
      icon: <People sx={{ fontSize: 32, color: theme.palette.info.main }} />,
      color: theme.palette.info.main,
      trend: 25,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Welcome Back, Admin!
      </Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid size={{xs:12, sm:6,md:4}} key={card.title}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{xs:12, md:8}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Trends
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">Chart Component Here</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:4}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Festival Analytics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Occupancy Rate</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.festivalAnalytics?.occupancyRate || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats?.festivalAnalytics?.occupancyRate || 0} 
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Bookings</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.festivalAnalytics?.totalBookings || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Completed Pickups</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.festivalAnalytics?.completedPickups || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}