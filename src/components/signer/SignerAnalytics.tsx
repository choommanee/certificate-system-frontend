import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Assessment as AnalyticsIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  Schedule as TimeIcon,
  Assignment as DocumentIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as SuccessIcon,
  Cancel as RejectIcon,
  Speed as SpeedIcon,
  DateRange as DateIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import { SigningRecord, DateRange } from '../../types/signer';
import { useSigningHistory, useSigningStats } from '../../hooks/useSigner';

interface SignerAnalyticsProps {
  compact?: boolean;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
  count?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SignerAnalytics: React.FC<SignerAnalyticsProps> = ({ compact = false }) => {
  const { stats, loading: statsLoading, error: statsError } = useSigningStats();
  const { history, loading: historyLoading, updateDateRange, exportReport } = useSigningHistory();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'trend' | 'performance' | 'distribution'>('trend');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!history.length) return null;

    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const daysBack = periods[selectedPeriod];
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const filteredHistory = history.filter(record => 
      new Date(record.signedAt) >= startDate
    );

    // Daily signing trend
    const dailyData: { [key: string]: { completed: number; rejected: number; total: number } } = {};
    
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { completed: 0, rejected: 0, total: 0 };
    }

    filteredHistory.forEach(record => {
      const dateStr = new Date(record.signedAt).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].total++;
        if (record.status === 'completed') {
          dailyData[dateStr].completed++;
        } else {
          dailyData[dateStr].rejected++;
        }
      }
    });

    const trendData = Object.entries(dailyData).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      completed: data.completed,
      rejected: data.rejected,
      total: data.total
    }));

    // Activity type distribution
    const activityTypes: { [key: string]: number } = {};
    filteredHistory.forEach(record => {
      activityTypes[record.activityType] = (activityTypes[record.activityType] || 0) + 1;
    });

    const distributionData = Object.entries(activityTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));

    // Performance metrics
    const completedRecords = filteredHistory.filter(r => r.status === 'completed');
    const avgProcessingTime = completedRecords.length > 0 
      ? completedRecords.reduce((sum, r) => sum + r.processingTime, 0) / completedRecords.length 
      : 0;

    const performanceData = [
      {
        name: 'เฉลี่ยเวลาลงนาม',
        value: Math.round(avgProcessingTime / 60), // minutes
        unit: 'นาที'
      },
      {
        name: 'อัตราสำเร็จ',
        value: filteredHistory.length > 0 
          ? Math.round((completedRecords.length / filteredHistory.length) * 100) 
          : 0,
        unit: '%'
      },
      {
        name: 'เอกสารต่อวัน',
        value: Math.round(filteredHistory.length / daysBack),
        unit: 'ฉบับ'
      }
    ];

    // Top activities
    const topActivities = Object.entries(activityTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      trendData,
      distributionData,
      performanceData,
      topActivities,
      totalSigned: filteredHistory.length,
      successRate: filteredHistory.length > 0 
        ? Math.round((completedRecords.length / filteredHistory.length) * 100) 
        : 0,
      avgProcessingTime: Math.round(avgProcessingTime / 60)
    };
  }, [history, selectedPeriod]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      if (dateRange) {
        await exportReport(format);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
      setExportDialogOpen(false);
    }
  };

  const renderChart = () => {
    if (!analyticsData) return null;

    switch (selectedChart) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#4caf50" 
                name="สำเร็จ"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#f44336" 
                name="ปฏิเสธ"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value}`, name]} />
              <Bar dataKey="value" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (compact) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AnalyticsIcon />
            สถิติการลงนาม
          </Typography>
          
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : stats ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.completedThisMonth}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    เดือนนี้
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.totalSigned}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ทั้งหมด
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              ไม่มีข้อมูลสถิติ
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AnalyticsIcon />
            การวิเคราะห์และรายงาน
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => setExportDialogOpen(true)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ส่งออกรายงาน
          </Button>
        </Box>

        {/* Error Alert */}
        {(statsError || !analyticsData) && (
          <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
            {statsError || 'ไม่สามารถโหลดข้อมูลการวิเคราะห์ได้'}
          </Alert>
        )}

        {/* Controls */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>ช่วงเวลา</InputLabel>
                  <Select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as any)}
                    label="ช่วงเวลา"
                  >
                    <MenuItem value="week">7 วันที่ผ่านมา</MenuItem>
                    <MenuItem value="month">30 วันที่ผ่านมา</MenuItem>
                    <MenuItem value="quarter">90 วันที่ผ่านมา</MenuItem>
                    <MenuItem value="year">1 ปีที่ผ่านมา</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>ประเภทกราฟ</InputLabel>
                  <Select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value as any)}
                    label="ประเภทกราฟ"
                  >
                    <MenuItem value="trend">แนวโน้มการลงนาม</MenuItem>
                    <MenuItem value="performance">ประสิทธิภาพ</MenuItem>
                    <MenuItem value="distribution">การกระจายตามประเภท</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {analyticsData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  <DocumentIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {analyticsData.totalSigned}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เอกสารที่ลงนาม
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <TrendUpIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="success.main">
                    +12% จากเดือนที่แล้ว
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                  <SuccessIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {analyticsData.successRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  อัตราสำเร็จ
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={analyticsData.successRate}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                  <SpeedIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {analyticsData.avgProcessingTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  นาที/เฉลี่ย
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <TrendDownIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="success.main">
                    -5% เร็วขึ้น
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                  <StarIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  4.8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  คะแนนประสิทธิภาพ
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  จาก 5.0
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  {selectedChart === 'trend' && 'แนวโน้มการลงนาม'}
                  {selectedChart === 'performance' && 'ประสิทธิภาพการทำงาน'}
                  {selectedChart === 'distribution' && 'การกระจายตามประเภทกิจกรรม'}
                </Typography>
                
                {historyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  renderChart()
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Top Activities */}
              {analyticsData && (
                <Card elevation={2}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                    >
                      กิจกรรมยอดนิยม
                    </Typography>
                    
                    <List dense>
                      {analyticsData.topActivities.map((activity, index) => (
                        <ListItem key={activity.type} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: COLORS[index % COLORS.length],
                                fontSize: '0.875rem'
                              }}
                            >
                              {index + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.type}
                            secondary={`${activity.count} ครั้ง`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Performance Summary */}
              <Card elevation={2}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                  >
                    สรุปประสิทธิภาพ
                  </Typography>
                  
                  {stats && (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          เอกสารรอลงนาม
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {stats.pendingCount}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          เวลาเฉลี่ยต่อเอกสาร
                        </Typography>
                        <Typography variant="h6" color="info.main">
                          {stats.averageProcessingTime} นาที
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ลายเซ็นที่ใช้งาน
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {stats.activeSignatures}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card elevation={2}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                  >
                    การดำเนินการด่วน
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      fullWidth
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      ดูรายงานรายละเอียด
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      fullWidth
                      onClick={() => setExportDialogOpen(true)}
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      ส่งออกข้อมูล
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<TimelineIcon />}
                      fullWidth
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      เปรียบเทียบช่วงเวลา
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Export Dialog */}
        <Dialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            ส่งออกรายงาน
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                เลือกรูปแบบและช่วงเวลาที่ต้องการส่งออก
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="วันที่เริ่มต้น"
                    value={dateRange?.startDate || null}
                    onChange={(date) => setDateRange(prev => ({ 
                      startDate: date || new Date(), 
                      endDate: prev?.endDate || new Date() 
                    }))}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="วันที่สิ้นสุด"
                    value={dateRange?.endDate || null}
                    onChange={(date) => setDateRange(prev => ({ 
                      startDate: prev?.startDate || new Date(), 
                      endDate: date || new Date() 
                    }))}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setExportDialogOpen(false)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              disabled={exportLoading || !dateRange}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              Excel
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              variant="contained"
              disabled={exportLoading || !dateRange}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              {exportLoading ? 'กำลังส่งออก...' : 'PDF'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default SignerAnalytics;