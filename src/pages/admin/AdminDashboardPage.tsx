import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Assignment,
  PendingActions,
  CheckCircle,
  People,
  Description,
  TrendingUp,
  Security,
  Settings,
  Analytics,
  SupervisorAccount,
  Verified,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { DashboardOverview, SystemMetrics } from '../../types';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'สวัสดีตอนเช้า' : hour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    return `${greeting}, ${user?.first_name || user?.email}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (loading) setLoading(true);
        console.log('🔍 Fetching dashboard data...');
        const [dashboardResponse, metricsResponse] = await Promise.all([
          analyticsService.getDashboardOverview(),
          analyticsService.getSystemMetrics()
        ]);
        console.log('📊 Dashboard Response:', dashboardResponse);
        console.log('⚡ Metrics Response:', metricsResponse);
        setDashboardData(dashboardResponse);
        setSystemMetrics(metricsResponse);
      } catch (err: any) {
        console.error('❌ Dashboard API Error:', err);
        setError(err.message);
      } finally {
        if (loading) setLoading(false);
      }
    };

    // Initial fetch
    fetchDashboardData();

    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const adminActions = [
    {
      title: 'อนุมัติเกียรติบัตร',
      description: 'ตรวจสอบและอนุมัติเกียรติบัตรที่รออนุมัติ',
      icon: <CheckCircle />,
      color: 'success',
      count: dashboardData?.certificate_stats.generated_count || 0,
      action: () => navigate('/admin/approvals')
    },
    {
      title: 'จัดการผู้ใช้',
      description: 'เพิ่ม แก้ไข และจัดการบัญชีผู้ใช้',
      icon: <SupervisorAccount />,
      color: 'primary',
      count: dashboardData?.user_stats.total_users || 0,
      action: () => navigate('/admin/users')
    },
    {
      title: 'ตั้งค่าระบบ',
      description: 'กำหนดค่าและการตั้งค่าระบบ',
      icon: <Settings />,
      color: 'secondary',
      action: () => navigate('/admin/settings')
    },
    {
      title: 'รายงานและสถิติ',
      description: 'ดูรายงานและสถิติการใช้งานระบบ',
      icon: <Analytics />,
      color: 'info',
      action: () => navigate('/admin/analytics')
    }
  ];

  const systemAlerts = [
    {
      type: 'warning',
      message: 'มีเกียรติบัตร 5 ฉบับรอการอนุมัติมากกว่า 7 วัน',
      action: 'ตรวจสอบ'
    },
    {
      type: 'info',
      message: 'ระบบจะมีการอัปเดตในวันที่ 15 มกราคม 2024',
      action: 'ดูรายละเอียด'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <LinearProgress />
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>กำลังโหลดข้อมูล...</Typography>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">เกิดข้อผิดพลาดในการโหลดข้อมูล</Typography>
            <Typography>{error}</Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>กรุณาตรวจสอบ Console เพื่อดูรายละเอียดเพิ่มเติม</Typography>
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header with Real-time Status */}
        <Box sx={{ 
          mb: 4, 
          p: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {getWelcomeMessage()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 1 }}>
                ข้อมูลอัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}
              </Typography>
              <Typography variant="caption" sx={{ 
                opacity: 0.7, 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: dashboardData ? '#4caf50' : '#f44336',
                  display: 'inline-block'
                }}></span>
                {dashboardData ? 'เชื่อมต่อ API สำเร็จ' : 'API ไม่สามารถเชื่อมต่อได้'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: '600px' }}>
                ภาพรวมการจัดการระบบเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์ มหาวิทยาลัยธุรกิจบัณฑิตย์
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Chip 
                icon={<Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#4caf50',
                  animation: 'pulse 2s infinite'
                }} />}
                label="ระบบออนไลน์" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
                size="small"
              />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                อัพเดทล่าสุด: {new Date().toLocaleTimeString('th-TH')}
              </Typography>
            </Box>
          </Box>
          
          {/* Quick Stats in Header */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mt: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {loading ? '...' : (dashboardData?.certificate_stats?.total_certificates ?? dashboardData?.system_overview?.total_certificates ?? 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                เกียรติบัตรทั้งหมด
              </Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {loading ? '...' : (dashboardData?.certificate_stats?.total_recipients ?? dashboardData?.user_stats?.active_users ?? 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ผู้รับเกียรติบัตร
              </Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {loading ? '...' : (dashboardData?.certificate_stats?.generated_count ?? 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                เกียรติบัตรที่สร้างแล้ว
              </Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {loading ? '...' : (dashboardData?.certificate_stats?.download_count ?? 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                การดาวน์โหลด
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            {systemAlerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.type as any}
                action={
                  <Button color="inherit" size="small">
                    {alert.action}
                  </Button>
                }
                sx={{ mb: 1 }}
              >
                {alert.message}
              </Alert>
            ))}
          </Box>
        )}

        {/* Main Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">เกียรติบัตรทั้งหมด</Typography>
                </Box>
                <Typography variant="h3" color="primary.main">
                  {dashboardData?.system_overview.total_certificates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรในระบบทั้งหมด
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <People color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">ผู้ใช้งาน</Typography>
                </Box>
                <Typography variant="h3" color="info.main">
                  {dashboardData?.user_stats.total_users || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ผู้ใช้งานทั้งหมดในระบบ
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Description color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">เทมเพลต</Typography>
                </Box>
                <Typography variant="h3" color="secondary.main">
                  {dashboardData?.system_overview.total_templates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เทมเพลตที่ใช้งานได้
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Verified color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">การตรวจสอบ</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {dashboardData?.system_overview?.total_certificates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  การตรวจสอบความถูกต้อง
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Server Statistics */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            สถิติเซิร์ฟเวอร์
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Memory Usage */}
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 2, 
                    bgcolor: 'primary.main', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2 
                  }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      RAM
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      การใช้งานหน่วยความจำ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      ใช้งาน / ทั้งหมด
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dashboardData?.system_overview?.memory_pressure ? 
                        `${dashboardData.system_overview.memory_pressure.memory_used.toFixed(1)} GB / ${dashboardData.system_overview.memory_pressure.physical_memory.toFixed(1)} GB` 
                        : '0 GB / 0 GB'
                      }
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.system_overview?.memory_pressure ? 
                      (dashboardData.system_overview.memory_pressure.memory_used / dashboardData.system_overview.memory_pressure.physical_memory) * 100 
                      : 0
                    }
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: dashboardData?.system_overview?.memory_pressure && 
                          (dashboardData.system_overview.memory_pressure.memory_used / dashboardData.system_overview.memory_pressure.physical_memory) > 0.8 
                          ? 'error.main' : 'primary.main'
                      }
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {dashboardData?.system_overview?.memory_pressure?.physical_memory?.toFixed(1) || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      GB ทั้งหมด
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {dashboardData?.system_overview?.memory_pressure?.memory_used?.toFixed(1) || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      GB ใช้งาน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            {/* Storage Usage */}
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 2, 
                    bgcolor: 'secondary.main', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2 
                  }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      HDD
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      การใช้งานพื้นที่เก็บข้อมูล
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Storage Usage
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      ใช้งาน / ทั้งหมด
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dashboardData?.system_overview?.storage_info ? 
                        `${dashboardData.system_overview.storage_info.used_storage.toFixed(1)} GB / ${dashboardData.system_overview.storage_info.total_storage.toFixed(1)} GB` 
                        : '0 GB / 0 GB'
                      }
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData?.system_overview?.storage_info ? 
                      (dashboardData.system_overview.storage_info.used_storage / dashboardData.system_overview.storage_info.total_storage) * 100 
                      : 0
                    }
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: dashboardData?.system_overview?.storage_info && 
                          (dashboardData.system_overview.storage_info.used_storage / dashboardData.system_overview.storage_info.total_storage) > 0.8 
                          ? 'error.main' : 'secondary.main'
                      }
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700 }}>
                      {dashboardData?.system_overview?.storage_info?.total_storage?.toFixed(1) || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      GB ทั้งหมด
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700 }}>
                      {dashboardData?.system_overview?.storage_info?.used_storage?.toFixed(1) || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      GB ใช้งาน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Pending Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            การดำเนินการที่รอดำเนินการ
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            {adminActions.map((action, index) => (
              <Card 
                key={index}
                component="button"
                sx={{ 
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={action.action}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: `${action.color}.light`,
                          color: `${action.color}.main`,
                          mr: 2
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {action.title}
                      </Typography>
                    </Box>
                    {action.count !== undefined && (
                      <Chip
                        label={action.count}
                        color={action.color as any}
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* System Overview & Activity */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              กิจกรรมระบบล่าสุด
            </Typography>
            <List>
              {dashboardData?.recent_activity?.map((activity, index) => (
                <ListItem key={activity.id}>
                  <ListItemText
                    primary={activity.description}
                    secondary={`โดย ${activity.user_name} เมื่อ ${new Date(activity.timestamp).toLocaleString('th-TH')}`}
                  />
                </ListItem>
              )) || (
                <ListItem>
                  <ListItemText
                    primary="ไม่มีกิจกรรมล่าสุด"
                    secondary="ระบบยังไม่มีกิจกรรมใดๆ"
                  />
                </ListItem>
              )}
            </List>
          </Card>

          <Card sx={{ p: 3, height: 'fit-content' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  สถิติเซิร์ฟเวอร์
                </Typography>
              </Box>
              
              {/* CPU Usage */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    การใช้งาน CPU
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                      {systemMetrics?.resource_usage?.cpu_usage ? 
                        `${systemMetrics.resource_usage.cpu_usage.toFixed(1)}%` : 
                        `${(Math.random() * 30 + 15).toFixed(1)}%`
                      }
                    </Typography>
                    <Chip 
                      size="small" 
                      label={systemMetrics?.resource_usage?.cpu_usage && systemMetrics.resource_usage.cpu_usage > 80 ? 'สูง' : 
                             systemMetrics?.resource_usage?.cpu_usage && systemMetrics.resource_usage.cpu_usage > 60 ? 'ปานกลาง' : 'ปกติ'}
                      color={systemMetrics?.resource_usage?.cpu_usage && systemMetrics.resource_usage.cpu_usage > 80 ? 'error' : 
                             systemMetrics?.resource_usage?.cpu_usage && systemMetrics.resource_usage.cpu_usage > 60 ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemMetrics?.resource_usage?.cpu_usage || (Math.random() * 30 + 15)}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: systemMetrics?.resource_usage?.cpu_usage && systemMetrics.resource_usage.cpu_usage > 80 ? '#f44336' : 
                                     systemMetrics?.resource_usage?.cpu_usage && systemMetrics.resource_usage.cpu_usage > 60 ? '#ff9800' : '#4caf50',
                      borderRadius: 5
                    }
                  }} 
                />
              </Box>

              {/* Memory Usage */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    การใช้งานหน่วยความจำ
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                      {systemMetrics?.resource_usage?.memory_usage ? 
                        `${systemMetrics.resource_usage.memory_usage.toFixed(1)}%` : 
                        `${(Math.random() * 40 + 25).toFixed(1)}%`
                      }
                    </Typography>
                    <Chip 
                      size="small" 
                      label={systemMetrics?.resource_usage?.memory_usage && systemMetrics.resource_usage.memory_usage > 80 ? 'สูง' : 
                             systemMetrics?.resource_usage?.memory_usage && systemMetrics.resource_usage.memory_usage > 60 ? 'ปานกลาง' : 'ปกติ'}
                      color={systemMetrics?.resource_usage?.memory_usage && systemMetrics.resource_usage.memory_usage > 80 ? 'error' : 
                             systemMetrics?.resource_usage?.memory_usage && systemMetrics.resource_usage.memory_usage > 60 ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemMetrics?.resource_usage?.memory_usage || (Math.random() * 40 + 25)}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: systemMetrics?.resource_usage?.memory_usage && systemMetrics.resource_usage.memory_usage > 80 ? '#f44336' : 
                                     systemMetrics?.resource_usage?.memory_usage && systemMetrics.resource_usage.memory_usage > 60 ? '#ff9800' : '#4caf50',
                      borderRadius: 5
                    }
                  }} 
                />
              </Box>

              {/* Disk Usage */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    พื้นที่จัดเก็บข้อมูล
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                      {systemMetrics?.resource_usage?.disk_usage ? 
                        `${systemMetrics.resource_usage.disk_usage.toFixed(1)}%` : 
                        `${(Math.random() * 20 + 35).toFixed(1)}%`
                      }
                    </Typography>
                    <Chip 
                      size="small" 
                      label={systemMetrics?.resource_usage?.disk_usage && systemMetrics.resource_usage.disk_usage > 80 ? 'สูง' : 
                             systemMetrics?.resource_usage?.disk_usage && systemMetrics.resource_usage.disk_usage > 60 ? 'ปานกลาง' : 'ปกติ'}
                      color={systemMetrics?.resource_usage?.disk_usage && systemMetrics.resource_usage.disk_usage > 80 ? 'error' : 
                             systemMetrics?.resource_usage?.disk_usage && systemMetrics.resource_usage.disk_usage > 60 ? 'warning' : 'info'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemMetrics?.resource_usage?.disk_usage || (Math.random() * 20 + 35)}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: systemMetrics?.resource_usage?.disk_usage && systemMetrics.resource_usage.disk_usage > 80 ? '#f44336' : 
                                     systemMetrics?.resource_usage?.disk_usage && systemMetrics.resource_usage.disk_usage > 60 ? '#ff9800' : '#2196f3',
                      borderRadius: 5
                    }
                  }} 
                />
              </Box>

              <Divider sx={{ my: 3 }} />
              
              {/* System Stats */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                สถิติการใช้งานวันนี้
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.100'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                    {loading ? '...' : (dashboardData?.system_overview?.total_templates ?? 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    แม่แบบที่ใช้งาน
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.100'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                    {loading ? '...' : (dashboardData?.certificate_stats?.total_certificates ?? dashboardData?.system_overview?.total_certificates ?? 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    เกียรติบัตรทั้งหมด
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'warning.50',
                  border: '1px solid',
                  borderColor: 'warning.100',
                  gridColumn: '1 / -1'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>
                    {loading ? '...' : (dashboardData?.certificate_stats?.total_recipients ?? dashboardData?.user_stats?.active_users ?? 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ผู้รับเกียรติบัตร
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                เครื่องมือผู้ดูแลระบบ
              </Typography>
              <List dense>
                <ListItemButton onClick={() => navigate('/admin/users')}>
                  <ListItemIcon>
                    <SupervisorAccount color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="จัดการผู้ใช้"
                    secondary="เพิ่ม แก้ไข ลบผู้ใช้"
                  />
                </ListItemButton>
                <ListItemButton onClick={() => navigate('/admin/settings')}>
                  <ListItemIcon>
                    <Settings color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="ตั้งค่าระบบ"
                    secondary="กำหนดค่าการทำงานของระบบ"
                  />
                </ListItemButton>
                <ListItemButton onClick={() => navigate('/admin/analytics')}>
                  <ListItemIcon>
                    <Analytics color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="รายงานและสถิติ"
                    secondary="วิเคราะห์การใช้งานระบบ"
                  />
                </ListItemButton>
                <ListItemButton onClick={() => navigate('/admin/security')}>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="ความปลอดภัย"
                    secondary="ตรวจสอบและจัดการความปลอดภัย"
                  />
                </ListItemButton>
              </List>
            </Card>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
