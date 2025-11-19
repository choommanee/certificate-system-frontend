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
import { analyticsService } from '../../services/api';
import type { DashboardStats, DashboardApiResponse, PendingTask, RecentActivity } from '../../services/api/types';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]); // ✅ ใช้ type ที่ถูกต้อง
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);           // ✅ ใช้ type ที่ถูกต้อง
  const [onlineUsers, setOnlineUsers] = useState<number>(0);                     // ✅ เปลี่ยนเป็น number
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'สวัสดีตอนเช้า' : hour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    return `${greeting}, ${user?.firstName || user?.email}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching admin dashboard data...');

        // เรียก API เพียง endpoint เดียว - /admin/dashboard/statistics
        const statsRes = await analyticsService.getAdminDashboardStats();

        console.log('📊 Dashboard Response:', statsRes);

        // API ส่ง response แบบ flat object (ไม่มี .data wrapper)
        const dashboardData: DashboardApiResponse = statsRes.data || statsRes; // ✅ เพิ่ม type annotation

        console.log('📊 Activities:', dashboardData.activities);
        console.log('📊 Certificates:', dashboardData.certificates);
        console.log('📋 Recent Activities:', dashboardData.recentActivities);
        console.log('⏳ Pending Tasks:', dashboardData.pendingTasks);
        console.log('👥 Users:', dashboardData.users);

        // แปลง API response เป็น format ที่ FE ต้องการ
        setStats({
          totalActivities: dashboardData.activities?.total || 0,
          totalCertificates: dashboardData.certificates?.total || 0,
          totalVerifications: dashboardData.certificates?.verified || 0,
          totalUsers: dashboardData.users?.total || 0,
          activitiesThisMonth: dashboardData.activities?.active || 0,
          certificatesThisMonth: dashboardData.certificates?.generated || 0,
          verificationsThisMonth: dashboardData.certificates?.verified || 0,
          usersThisMonth: dashboardData.users?.online || 0,
          pendingApprovals: dashboardData.certificates?.draft || 0,
          pendingSignatures: dashboardData.pendingTasks?.length || 0,
        });

        // Set activities, tasks, online users จาก response เดียวกัน
        setRecentActivities(dashboardData.recentActivities || []);
        setPendingTasks(dashboardData.pendingTasks || []);
        setOnlineUsers(dashboardData.users?.online || 0);

        setError('');
      } catch (err: any) {
        console.error('❌ Dashboard API Error:', err);
        setError(err.response?.data?.error || err.message || 'ไม่สามารถโหลดข้อมูลได้');

        // ใช้ข้อมูล mock เมื่อไม่สามารถเชื่อมต่อ API ได้
        setStats({
          totalActivities: 0,
          totalCertificates: 0,
          totalVerifications: 0,
          totalUsers: 0,
          activitiesThisMonth: 0,
          certificatesThisMonth: 0,
          verificationsThisMonth: 0,
          usersThisMonth: 0,
          pendingApprovals: 0,
          pendingSignatures: 0,
        });
      } finally {
        setLoading(false);
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
      count: stats?.pendingApprovals || 0,
      action: () => navigate('/admin/approvals')
    },
    {
      title: 'จัดการผู้ใช้',
      description: 'เพิ่ม แก้ไข และจัดการบัญชีผู้ใช้',
      icon: <SupervisorAccount />,
      color: 'primary',
      count: stats?.totalUsers || 0,
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
                  backgroundColor: error ? '#f44336' : '#4caf50',
                  display: 'inline-block'
                }}></span>
                {error ? 'API ไม่สามารถเชื่อมต่อได้' : 'เชื่อมต่อ API สำเร็จ'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: '600px', mt: 1 }}>
                ภาพรวมการจัดการระบบเกียรติบัตรออนไลน์
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
                ผู้ใช้ออนไลน์: {onlineUsers?.count || 0} คน
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
                {stats?.totalCertificates || 0}
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
                {stats?.totalActivities || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                กิจกรรมทั้งหมด
              </Typography>
            </Box>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats?.totalVerifications || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                การตรวจสอบ
              </Typography>
            </Box>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ผู้ใช้งาน
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error} (ระบบแสดงข้อมูล mock แทน)
          </Alert>
        )}

        {/* Pending Tasks Alert */}
        {pendingTasks.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            มีงาน {pendingTasks.length} รายการรอดำเนินการ
          </Alert>
        )}

        {/* Main Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">เกียรติบัตร</Typography>
                </Box>
                <Typography variant="h3" color="primary.main">
                  {stats?.totalCertificates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรในระบบทั้งหมด
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +{stats?.certificatesThisMonth || 0} เดือนนี้
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
                  {stats?.totalUsers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ผู้ใช้งานทั้งหมดในระบบ
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +{stats?.usersThisMonth || 0} เดือนนี้
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Description color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">กิจกรรม</Typography>
                </Box>
                <Typography variant="h3" color="secondary.main">
                  {stats?.totalActivities || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กิจกรรมทั้งหมด
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +{stats?.activitiesThisMonth || 0} เดือนนี้
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
                  {stats?.totalVerifications || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  การตรวจสอบความถูกต้อง
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  +{stats?.verificationsThisMonth || 0} เดือนนี้
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pending Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            การดำเนินการด่วน
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
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              กิจกรรมระบบล่าสุด
            </Typography>
            <List>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={activity.description || activity.action || 'กิจกรรม'}
                      secondary={`โดย ${activity.user_name || activity.userName || 'ไม่ระบุ'} เมื่อ ${new Date(activity.timestamp || activity.createdAt).toLocaleString('th-TH')}`}
                    />
                  </ListItem>
                ))
              ) : (
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
