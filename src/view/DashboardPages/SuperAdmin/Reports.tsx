// src/view/DashboardPages/SuperAdmin/Reports.tsx
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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  BookOnline,
  People,
  Download,
} from '@mui/icons-material';
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

interface ReportApiResponse {
  success: boolean;
  data: DashboardReport;
}


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Reports() {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<DashboardReport | null>(null);
  const [dateRange, setDateRange] = useState<string>('month');
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchReportData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?range=${dateRange}`);
      const data: ReportApiResponse = await response.json();
      if (data.success && data.data) {
        setReportData(data.data);
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
      const response = await fetch(`/api/admin/reports/export?range=${dateRange}`);
      const blob: Blob = await response.blob();
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Analytics & Reports
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Date Range</InputLabel>
            <Select 
              value={dateRange} 
              onChange={handleDateRangeChange} 
              label="Date Range"
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 3 Months</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Total Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ₹{reportData?.totalRevenue.toLocaleString() || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {(reportData?.revenueTrend || 0) > 0 ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" color={(reportData?.revenueTrend || 0) > 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(reportData?.revenueTrend || 0)}% from last period
                    </Typography>
                  </Box>
                </Box>
                <AttachMoney sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Total Bookings</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>{reportData?.totalBookings || 0}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {(reportData?.bookingTrend || 0) > 0 ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" color={(reportData?.bookingTrend || 0) > 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(reportData?.bookingTrend || 0)}% from last period
                    </Typography>
                  </Box>
                </Box>
                <BookOnline sx={{ fontSize: 48, color: 'secondary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Total Customers</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>{reportData?.totalCustomers || 0}</Typography>
                </Box>
                <People sx={{ fontSize: 48, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="caption">Completed Pickups</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>{reportData?.completedPickups || 0}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{xs: 12, lg: 8}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Revenue & Booking Trends</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportData?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#82ca9d" name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, lg: 4}}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Payment Methods</Typography>
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
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Top Performing Ganpati</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ganpati Name</TableCell>
                    <TableCell align="right">Bookings</TableCell>
                    <TableCell align="right">Revenue (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reportData?.topGanpati || []).map((ganpati: GanpatiStats) => (
                    <TableRow key={ganpati.name}>
                      <TableCell>{ganpati.name}</TableCell>
                      <TableCell align="right">{ganpati.bookings}</TableCell>
                      <TableCell align="right">{ganpati.revenue.toLocaleString()}</TableCell>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}