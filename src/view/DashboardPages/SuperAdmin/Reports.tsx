import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  SelectChangeEvent,
  useTheme,
  alpha,
  Avatar,
  styled,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  BookOnline,
  People,
  Download,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';
import { adminService } from '@/services/AdminService';

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

interface GanpatiStats {
  name: string;
  bookings: number;
  revenue: number;
}

interface PaymentMethodBreakdown {
  name: string;
  value: number;
}

interface DashboardReport {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  completedPickups: number;
  revenueTrend: number;
  bookingTrend: number;
  monthlyData: RevenueData[];
  topGanpati: GanpatiStats[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StyledCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    background: alpha(theme.palette.common.white, 0.96),
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.92),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  padding: theme.spacing(3),
}));

const StyledButton = styled(Button)({
  borderRadius: 30,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 24px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
});

export default function Reports() {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<DashboardReport | null>(null);
  const [dateRange, setDateRange] = useState<string>('month');
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchReportData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminService.getReports(dateRange);
      if (response.success && response.data) {
        setReportData(response.data);
      }
    } catch {
      showSnackbar('error', 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDateRangeChange = (event: SelectChangeEvent<string>): void => {
    setDateRange(event.target.value);
  };

  const handleExport = async (): Promise<void> => {
    setExporting(true);
    try {
      const blob = await adminService.exportReport(dateRange);
      const url: string = window.URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = url;
      a.download = `report-${dateRange}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSnackbar('success', 'Report exported successfully');
    } catch {
      showSnackbar('error', 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                  backgroundClip: 'text', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Analytics & Reports
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Track your business performance and insights
              </Typography>
            </Box>
          </motion.div>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select 
                value={dateRange} 
                onChange={handleDateRangeChange} 
                label="Date Range"
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
            <StyledButton 
              variant="outlined" 
              startIcon={<Download />} 
              onClick={handleExport} 
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export Report'}
            </StyledButton>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 3 }} mb={4}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Total Revenue
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.primary.main }}>
                        ₹{reportData?.totalRevenue.toLocaleString() || 0}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {(reportData?.revenueTrend || 0) > 0 ? (
                          <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                        )}
                        <Typography variant="caption" color={(reportData?.revenueTrend || 0) > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                          {Math.abs(reportData?.revenueTrend || 0)}% from last period
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <AttachMoney sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Total Bookings
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.warning.main }}>
                        {reportData?.totalBookings || 0}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {(reportData?.bookingTrend || 0) > 0 ? (
                          <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                        )}
                        <Typography variant="caption" color={(reportData?.bookingTrend || 0) > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                          {Math.abs(reportData?.bookingTrend || 0)}% from last period
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                      <BookOnline sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Total Customers
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.success.main }}>
                        {reportData?.totalCustomers || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                      <People sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Completed Pickups
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: theme.palette.info.main }}>
                        {reportData?.completedPickups || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                      <CheckCircle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <GlassPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Revenue & Booking Trends
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportData?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#82ca9d" name="Bookings" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </GlassPaper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <GlassPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Payment Methods
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData?.paymentMethodBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(reportData?.paymentMethodBreakdown || []).map((_entry: PaymentMethodBreakdown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </GlassPaper>
          </Grid>

          <Grid size={12}>
            <GlassPaper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Performing Ganpati
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Ganpati Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Bookings</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(reportData?.topGanpati || []).map((ganpati: GanpatiStats) => (
                      <TableRow key={ganpati.name} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                        <TableCell>{ganpati.name}</TableCell>
                        <TableCell align="right">{ganpati.bookings}</TableCell>
                        <TableCell align="right">₹{ganpati.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {(!reportData?.topGanpati || reportData.topGanpati.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlassPaper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}