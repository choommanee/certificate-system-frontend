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
  Container,
  Grid,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  PendingActions,
  CheckCircle,
  People,
  Description,
  TrendingUp,
  Add,
  Edit,
  Send,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { analyticsService } from '../../services/analyticsService';
import { DashboardOverview } from '../../types';

const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
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
        setLoading(true);
        const data = await analyticsService.getDashboardOverview();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'สร้างเกียรติบัตรใหม่',
      description: 'สร้างเกียรติบัตรสำหรับนักศึกษา',
      icon: <Add />,
      color: 'primary',
      action: () => navigate('/staff/certificates/create')
    },
    {
      title: 'จัดการเทมเพลต',
      description: 'แก้ไขและสร้างเทมเพลตใหม่',
      icon: <Edit />,
      color: 'secondary',
      action: () => navigate('/staff/templates')
    },
    {
      title: 'ส่งอีเมลแบบกลุ่ม',
      description: 'ส่งเกียรติบัตรให้นักศึกษา',
      icon: <Send />,
      color: 'info',
      action: () => navigate('/staff/bulk-operations')
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {getWelcomeMessage()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            จัดการเกียรติบัตรและเทมเพลตสำหรับคณะเศรษฐศาสตร์
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
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
                  เกียรติบัตรที่สร้างทั้งหมด
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PendingActions color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">รอการอนุมัติ</Typography>
                </Box>
                <Typography variant="h3" color="warning.main">
                  {dashboardData?.certificate_stats.pending_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรที่รอการอนุมัติ
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">อนุมัติแล้ว</Typography>
                </Box>
                <Typography variant="h3" color="success.main">
                  {dashboardData?.certificate_stats.approved_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรที่อนุมัติแล้ว
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
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              การดำเนินการด่วน
            </Typography>
          </Grid>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  }
                }}
                onClick={action.action}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
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
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity & Statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
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
                      secondary={`โดย ${activity.user} • ${new Date(activity.timestamp).toLocaleDateString('th-TH')}`}
                    />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText primary="ไม่มีกิจกรรมล่าสุด" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สถิติการใช้งาน
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">เกียรติบัตรที่สร้างวันนี้</Typography>
                  <Chip label="12" color="primary" size="small" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">เทมเพลตที่ใช้งาน</Typography>
                  <Chip label="8/10" color="secondary" size="small" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={80} 
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">อีเมลที่ส่งสำเร็จ</Typography>
                  <Chip label="95%" color="success" size="small" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={95} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                เครื่องมือสำหรับเจ้าหน้าที่
              </Typography>
              <List dense>
                <ListItem button onClick={() => navigate('/staff/certificates')}>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary="จัดการเกียรติบัตร"
                    secondary="สร้าง แก้ไข และจัดการเกียรติบัตร"
                  />
                </ListItem>
                <ListItem button onClick={() => navigate('/staff/templates')}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary="จัดการเทมเพลต"
                    secondary="ออกแบบและแก้ไขเทมเพลต"
                  />
                </ListItem>
                <ListItem button onClick={() => navigate('/staff/bulk-operations')}>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText
                    primary="การดำเนินการแบบกลุ่ม"
                    secondary="ส่งเกียรติบัตรให้หลายคนพร้อมกัน"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default StaffDashboardPage;
