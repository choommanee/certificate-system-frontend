import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  Assignment,
  PendingActions,
  CheckCircle,
  Schedule,
  TrendingUp,
  People,
  Description,
  Verified,
  Warning,
  Info,
  Error,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import statisticsService, { DashboardStatistics } from '../services/statisticsService';
import { DashboardOverview, SystemMetrics } from '../types';
import { analyticsService } from '../services/analyticsService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStatistics | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'สวัสดีตอนเช้า' : hour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    return `${greeting}, ${user?.first_name || user?.email}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.role === 'student') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch based on user role
        let stats: DashboardStatistics | any;
        if (user.role === 'admin' || user.role === 'super_admin') {
          // Fetch admin dashboard data from Analytics API
          const [overview, metrics] = await Promise.all([
            analyticsService.getDashboardOverview(),
            analyticsService.getSystemMetrics(),
          ]);
          setDashboardData(overview);
          setSystemMetrics(metrics);

          // Also try to get old statistics for backward compatibility
          try {
            stats = await statisticsService.getDashboardStatistics();
            setDashboardStats(stats);
          } catch (e) {
            console.warn('Old statistics API not available:', e);
          }
        } else if (user.role === 'staff') {
          stats = await statisticsService.getStaffDashboardStatistics();
          setDashboardStats(stats);
        } else if (user.role === 'signer') {
          stats = await statisticsService.getSignerDashboardStatistics();
          setDashboardStats(stats);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const renderStudentDashboard = () => (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {getWelcomeMessage()}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          ยินดีต้อนรับสู่ระบบเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์
        </Typography>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
        <Box flex="1" minWidth={300}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">เกียรติบัตรของฉัน</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรที่ได้รับ
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth={300}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PendingActions color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">รอการอนุมัติ</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรที่รอการอนุมัติ
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth={300}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">อนุมัติแล้ว</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรที่อนุมัติแล้ว
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            เกียรติบัตรล่าสุด
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText
                primary="เกียรติบัตรการเข้าร่วมสัมมนา"
                secondary="วันที่ 15 มกราคม 2567"
              />
              <Chip label="อนุมัติแล้ว" color="success" size="small" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText
                primary="เกียรติบัตรการแข่งขันตอบปัญหา"
                secondary="วันที่ 10 มกราคม 2567"
              />
              <Chip label="รอการอนุมัติ" color="warning" size="small" />
            </ListItem>
          </List>
          <Box mt={2}>
            <Button variant="outlined" fullWidth>
              ดูเกียรติบัตรทั้งหมด
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderStaffDashboard = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {getWelcomeMessage()}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            ยินดีต้อนรับสู่ระบบเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์
          </Typography>
        </Box>

        {/* Certificate Stats */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Box flex="1" minWidth={300}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">เกียรติบัตรทั้งหมด</Typography>
                </Box>
                <Typography variant="h3" color="primary">
                  {dashboardStats?.certificates?.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรที่สร้างทั้งหมด
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth={300}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PendingActions color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">ฉบับร่าง</Typography>
                </Box>
                <Typography variant="h3" color="warning.main">
                  {dashboardStats?.certificates?.draft || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรฉบับร่าง
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth={300}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">ส่งแล้ว</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {dashboardStats?.certificates?.sent || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรที่อนุมัติแล้ว
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* User and Template Stats */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Box flex="1" minWidth={300}>
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
          </Box>

          <Box flex="1" minWidth={300}>
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
          </Box>

          <Box flex="1" minWidth={300}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">ผู้ใช้ใหม่</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {dashboardData?.user_stats.new_users_this_month || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ผู้ใช้ใหม่เดือนนี้
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Activity and Alerts */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Box flex="2" minWidth={500}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                กิจกรรมล่าสุด
              </Typography>
              <List>
                {dashboardData?.recent_activity?.slice(0, 5).map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={`โดย ${activity.user_name} • ${new Date(activity.timestamp).toLocaleDateString('th-TH')}`}
                    />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText primary="ไม่มีกิจกรรมล่าสุด" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>

          <Box flex="1" minWidth={300}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                การแจ้งเตือน
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {dashboardData?.alerts?.slice(0, 3).map((alert: any, index: number) => (
                  <Alert 
                    key={index} 
                    severity={alert.type} 
                    variant="outlined"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <Typography variant="subtitle2">{alert.title}</Typography>
                    <Typography variant="body2">{alert.message}</Typography>
                  </Alert>
                )) || (
                  <Typography color="text.secondary">ไม่มีการแจ้งเตือน</Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderAdminDashboard = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" flexDirection="column" gap={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {getWelcomeMessage()}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              แดชบอร์ดผู้ดูแลระบบ - ระบบเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์
            </Typography>
          </Box>

        {/* System Overview */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Box flex="1" minWidth={250}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">เกียรติบัตร</Typography>
                </Box>
                <Typography variant="h3" color="primary">
                  {dashboardData?.system_overview.total_certificates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ทั้งหมดในระบบ
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth={250}>
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
                  ผู้ใช้งานทั้งหมด
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth={250}>
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
          </Box>

          <Box flex="1" minWidth={250}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Verified color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">ผู้ใช้ใหม่</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {dashboardData?.user_stats.new_users_this_month || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เดือนนี้
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* System Health */}
        {systemMetrics && systemMetrics.performance && (
          <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
            <Box flex="1" minWidth={300}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ประสิทธิภาพระบบ
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Response Time:</Typography>
                      <Typography variant="body2" color="primary">
                        {systemMetrics.performance.response_time || 0}ms
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Throughput:</Typography>
                      <Typography variant="body2" color="primary">
                        {systemMetrics.performance.throughput || 0}/s
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Error Rate:</Typography>
                      <Typography variant="body2" color={(systemMetrics.performance.error_rate || 0) > 5 ? "error" : "success"}>
                        {systemMetrics.performance.error_rate || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box flex="1" minWidth={300}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    การใช้งานทรัพยากร
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">CPU:</Typography>
                      <Typography variant="body2" color="primary">
                        {systemMetrics.resource_usage?.cpu_usage || 0}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Memory:</Typography>
                      <Typography variant="body2" color="primary">
                        {systemMetrics.resource_usage?.memory_usage || 0}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Disk:</Typography>
                      <Typography variant="body2" color="primary">
                        {systemMetrics.resource_usage?.disk_usage || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box flex="1" minWidth={300}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    สถานะระบบ
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Chip 
                      label={systemMetrics.system_status || 'unknown'} 
                      color={(systemMetrics.system_status || 'unknown') === 'healthy' ? 'success' : 'error'}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      อัปเดตล่าสุด: {systemMetrics.last_updated ? new Date(systemMetrics.last_updated).toLocaleString('th-TH') : 'ไม่ทราบ'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Management Actions */}
        <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
          <Box flex="2" minWidth={500}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                กิจกรรมล่าสุด
              </Typography>
              <List>
                {dashboardData?.recent_activity?.slice(0, 8).map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={`โดย ${activity.user_name} • ${new Date(activity.timestamp).toLocaleDateString('th-TH')}`}
                    />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText primary="ไม่มีกิจกรรมล่าสุด" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>

          <Box flex="1" minWidth={300}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  การจัดการระบบ
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button variant="contained" color="primary" fullWidth>
                    จัดการผู้ใช้งาน
                  </Button>
                  <Button variant="outlined" color="primary" fullWidth>
                    ตั้งค่าระบบ
                  </Button>
                  <Button variant="outlined" color="secondary" fullWidth>
                    สำรองข้อมูล
                  </Button>
                  <Button variant="outlined" color="warning" fullWidth>
                    ดูบันทึกระบบ
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        </Box>
      </Container>
    );
  };

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'student':
        return renderStudentDashboard();
      case 'staff':
        return renderStaffDashboard();
      case 'admin':
        return renderAdminDashboard();
      default:
        return renderStudentDashboard();
    }
  };

  return (
    <DashboardLayout>
      <Box p={3}>
        {renderDashboardContent()}
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
