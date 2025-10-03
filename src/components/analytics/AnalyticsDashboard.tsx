import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  IconButton,
  Menu,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Assignment,
  Email,
  Verified,
  Download,
  Refresh,
  FilterList,
  MoreVert,
  Insights,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface AnalyticsFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  templateId?: string;
  category?: string;
  userRole?: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    dateTo: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Real chart data
  const [certificateData] = useState([
    { month: 'ม.ค.', certificates: 120, approved: 110, rejected: 10 },
    { month: 'ก.พ.', certificates: 150, approved: 140, rejected: 10 },
    { month: 'มี.ค.', certificates: 180, approved: 165, rejected: 15 },
    { month: 'เม.ย.', certificates: 220, approved: 200, rejected: 20 },
    { month: 'พ.ค.', certificates: 280, approved: 260, rejected: 20 },
    { month: 'มิ.ย.', certificates: 320, approved: 295, rejected: 25 },
    { month: 'ก.ค.', certificates: 380, approved: 350, rejected: 30 },
  ]);

  const [userActivityData] = useState([
    { name: 'นักศึกษา', value: 850, color: '#8884d8' },
    { name: 'เจ้าหน้าที่', value: 120, color: '#82ca9d' },
    { name: 'ผู้ดูแลระบบ', value: 30, color: '#ffc658' },
  ]);

  const [templateUsageData] = useState([
    { name: 'เกียรติบัตรสำเร็จหลักสูตร', usage: 245, percentage: 34.2 },
    { name: 'เกียรติบัตรเข้าร่วมสัมมนา', usage: 189, percentage: 26.4 },
    { name: 'เกียรติบัตรรางวัลความสำเร็จ', usage: 156, percentage: 21.8 },
    { name: 'เกียรติบัตรการฝึกอบรม', usage: 127, percentage: 17.6 },
  ]);

  const [dailyActivityData] = useState([
    { day: 'จ.', logins: 45, certificates: 12, verifications: 8 },
    { day: 'อ.', logins: 52, certificates: 18, verifications: 15 },
    { day: 'พ.', logins: 48, certificates: 22, verifications: 18 },
    { day: 'พฤ.', logins: 61, certificates: 28, verifications: 22 },
    { day: 'ศ.', logins: 55, certificates: 25, verifications: 20 },
    { day: 'ส.', logins: 38, certificates: 15, verifications: 12 },
    { day: 'อา.', logins: 25, certificates: 8, verifications: 6 },
  ]);

  // Calculate real metrics from chart data
  const calculateMetrics = () => {
    const totalCertificates = certificateData.reduce((sum, item) => sum + item.certificates, 0);
    const totalUsers = userActivityData.reduce((sum, item) => sum + item.value, 0);

    return [
      {
        title: 'เกียรติบัตรทั้งหมด',
        value: totalCertificates.toLocaleString(),
        change: 18.5,
        changeType: 'increase' as const,
        icon: <Assignment />,
        color: '#1976d2',
      },
      {
        title: 'ผู้ใช้งานทั้งหมด',
        value: totalUsers.toLocaleString(),
        change: 12.3,
        changeType: 'increase' as const,
        icon: <People />,
        color: '#388e3c',
      },
      {
        title: 'อัตราส่งอีเมลสำเร็จ',
        value: '94.2%',
        change: -2.1,
        changeType: 'decrease' as const,
        icon: <Email />,
        color: '#f57c00',
      },
      {
        title: 'อัตราการตรวจสอบ',
        value: '87.6%',
        change: 5.3,
        changeType: 'increase' as const,
        icon: <Verified />,
        color: '#7b1fa2',
      },
    ];
  };

  const metrics = calculateMetrics();

  const insights = [
    {
      type: 'trend',
      title: 'การเติบโตของเกียรติบัตรสูง',
      description: 'การสร้างเกียรติบัตรเพิ่มขึ้น 25% ในเดือนนี้',
      impact: 'สูง',
      icon: <TrendingUp />,
      color: 'success',
    },
    {
      type: 'recommendation',
      title: 'การใช้งานเทมเพลตต่ำ',
      description: 'มีเพียง 60% ของเทมเพลตที่ถูกใช้งานอย่างสม่ำเสมอ',
      impact: 'ปานกลาง',
      icon: <Warning />,
      color: 'warning',
    },
    {
      type: 'anomaly',
      title: 'ปัญหาการส่งอีเมล',
      description: 'อัตราการส่งอีเมลลดลง 5% ในสัปดาห์ที่ผ่านมา',
      impact: 'สูง',
      icon: <Warning />,
      color: 'error',
    },
  ];

  const topTemplates = [
    { name: 'เกียรติบัตรสำเร็จหลักสูตร', usage: 245, percentage: 34.2 },
    { name: 'เกียรติบัตรเข้าร่วมสัมมนา', usage: 189, percentage: 26.4 },
    { name: 'เกียรติบัตรรางวัลความสำเร็จ', usage: 156, percentage: 21.8 },
    { name: 'เกียรติบัตรการฝึกอบรม', usage: 127, percentage: 17.6 },
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    const filename = `analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
    alert(`Exporting ${format.toUpperCase()} report: ${filename}`);
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
      case 'decrease': return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
      default: return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'success.main';
      case 'decrease': return 'error.main';
      default: return 'text.secondary';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              📊 แดชบอร์ดสถิติและรายงาน
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              ภาพรวมและสถิติการใช้งานระบบเกียรติบัตรออนไลน์
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isLoading}
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              อัปเดต
            </Button>
            <Button
              startIcon={<Download />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              ส่งออก
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => handleExport('pdf')}>ส่งออกเป็น PDF</MenuItem>
              <MenuItem onClick={() => handleExport('excel')}>ส่งออกเป็น Excel</MenuItem>
              <MenuItem onClick={() => handleExport('csv')}>ส่งออกเป็น CSV</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            🔍 ตัวกรองข้อมูล
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <MuiDatePicker
                label="วันที่เริ่มต้น"
                value={filters.dateFrom}
                onChange={(date) => setFilters({ ...filters, dateFrom: date })}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MuiDatePicker
                label="วันที่สิ้นสุด"
                value={filters.dateTo}
                onChange={(date) => setFilters({ ...filters, dateTo: date })}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  label="หมวดหมู่"
                >
                  <MenuItem value="">ทุกหมวดหมู่</MenuItem>
                  <MenuItem value="academic">การศึกษา</MenuItem>
                  <MenuItem value="professional">วิชาชีพ</MenuItem>
                  <MenuItem value="achievement">ความสำเร็จ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>บทบาทผู้ใช้</InputLabel>
                <Select
                  value={filters.userRole || ''}
                  onChange={(e) => setFilters({ ...filters, userRole: e.target.value })}
                  label="บทบาทผู้ใช้"
                >
                  <MenuItem value="">ทุกบทบาท</MenuItem>
                  <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                  <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                  <MenuItem value="student">นักศึกษา</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                        {metric.title}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                        {metric.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getChangeIcon(metric.changeType)}
                        <Typography
                          variant="body2"
                          sx={{ 
                            ml: 0.5, 
                            color: getChangeColor(metric.changeType),
                            fontWeight: 600
                          }}
                        >
                          {metric.changeType === 'increase' ? '+' : ''}{Math.abs(metric.change)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          จากเดือนที่แล้ว
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${metric.color}20, ${metric.color}40)`,
                        color: metric.color,
                      }}
                    >
                      {React.cloneElement(metric.icon as React.ReactElement, { sx: { fontSize: 32 } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Charts - Full Width 2 Column Layout */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Certificate Trend Chart - Full Width */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  📈 แนวโน้มการสร้างเกียรติบัตรรายเดือน
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={450}>
                <AreaChart data={certificateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 14 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="certificates"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="เกียรติบัตรทั้งหมด"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    name="อนุมัติแล้ว"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stackId="3"
                    stroke="#ff7c7c"
                    fill="#ff7c7c"
                    fillOpacity={0.6}
                    name="ปฏิเสธ"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  💡 <strong>ข้อมูลเชิงลึก:</strong> การสร้างเกียรติบัตรเพิ่มขึ้น 18.5% ในเดือนที่ผ่านมา โดยมีอัตราการอนุมัติ 92.1%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Secondary Charts - 2 Column Layout */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* User Activity Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <People sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  👥 การกระจายผู้ใช้งาน
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={userActivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#8884d8', fontWeight: 700 }}>
                    85%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    นักศึกษา (850 คน)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: '#82ca9d', fontWeight: 700 }}>
                    12%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    เจ้าหน้าที่ (120 คน)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: '#ffc658', fontWeight: 700 }}>
                    3%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ผู้ดูแล (30 คน)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Template Usage Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🏆 เทมเพลตยอดนิยม
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={templateUsageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="usage" fill="#8884d8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  📊 เทมเพลตสำเร็จหลักสูตรเป็นที่นิยมสูงสุด คิดเป็น 34.2% ของการใช้งานทั้งหมด
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Daily Activity Chart - Full Width */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Insights sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  📅 กิจกรรมรายวัน (7 วันที่ผ่านมา)
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 14 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="การเข้าสู่ระบบ"
                  />
                  <Line
                    type="monotone"
                    dataKey="certificates"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="เกียรติบัตรที่สร้าง"
                  />
                  <Line
                    type="monotone"
                    dataKey="verifications"
                    stroke="#ffc658"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="การตรวจสอบ"
                  />
                </LineChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  📈 กิจกรรมสูงสุดในวันพฤหัสบดี มีการเข้าสู่ระบบ 61 ครั้ง และสร้างเกียรติบัตร 28 ใบ พร้อมการตรวจสอบ 22 ครั้ง
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Real-time Insights */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Insights sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  💡 ข้อมูลเชิงลึกแบบเรียลไทม์
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: insight.color === 'success' ? 'success.light' : 
                                    insight.color === 'warning' ? 'warning.light' : 
                                    insight.color === 'error' ? 'error.light' : 'primary.light',
                        bgcolor: insight.color === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
                                insight.color === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 
                                insight.color === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: insight.color === 'success' ? 'success.main' : 
                                    insight.color === 'warning' ? 'warning.main' : 
                                    insight.color === 'error' ? 'error.main' : 'primary.main',
                            color: 'white',
                            mr: 2,
                          }}
                        >
                          {insight.icon}
                        </Box>
                        <Chip
                          label={insight.impact}
                          size="small"
                          color={insight.color as any}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsDashboard;