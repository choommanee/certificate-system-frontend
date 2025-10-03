import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Warning,
  Error,
  Info,
  Storage,
  Memory,
  Speed,
  NetworkCheck,
  Email,
  CloudUpload,
  Security,
  Schedule,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface SystemStatus {
  overall_status: 'healthy' | 'warning' | 'critical';
  last_updated: string;
  services: ServiceStatus[];
  performance: PerformanceMetrics;
  storage: StorageInfo;
  recent_incidents: Incident[];
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  response_time: number;
  uptime: number;
  last_check: string;
  description: string;
}

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  active_users: number;
  requests_per_minute: number;
}

interface StorageInfo {
  total_space: number;
  used_space: number;
  available_space: number;
  file_count: number;
  database_size: number;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

const SystemStatusPage: React.FC = () => {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock data
  const mockSystemStatus: SystemStatus = {
    overall_status: 'healthy',
    last_updated: new Date().toISOString(),
    services: [
      {
        name: 'Web Application',
        status: 'online',
        response_time: 245,
        uptime: 99.9,
        last_check: new Date().toISOString(),
        description: 'Main web application server'
      },
      {
        name: 'Database',
        status: 'online',
        response_time: 12,
        uptime: 99.8,
        last_check: new Date().toISOString(),
        description: 'PostgreSQL database server'
      },
      {
        name: 'Email Service',
        status: 'degraded',
        response_time: 1200,
        uptime: 98.5,
        last_check: new Date().toISOString(),
        description: 'SMTP email delivery service'
      },
      {
        name: 'File Storage',
        status: 'online',
        response_time: 89,
        uptime: 99.9,
        last_check: new Date().toISOString(),
        description: 'File upload and storage system'
      },
      {
        name: 'Authentication',
        status: 'online',
        response_time: 156,
        uptime: 99.7,
        last_check: new Date().toISOString(),
        description: 'User authentication service'
      }
    ],
    performance: {
      cpu_usage: 45.2,
      memory_usage: 67.8,
      disk_usage: 34.5,
      network_latency: 23,
      active_users: 127,
      requests_per_minute: 1450
    },
    storage: {
      total_space: 1000,
      used_space: 345,
      available_space: 655,
      file_count: 2847,
      database_size: 156
    },
    recent_incidents: [
      {
        id: '1',
        title: 'Email delivery delays',
        description: 'Some users experiencing delays in email notifications',
        severity: 'medium',
        status: 'monitoring',
        created_at: '2024-03-20T10:30:00Z'
      },
      {
        id: '2',
        title: 'Database maintenance completed',
        description: 'Scheduled database maintenance completed successfully',
        severity: 'low',
        status: 'resolved',
        created_at: '2024-03-19T02:00:00Z',
        resolved_at: '2024-03-19T03:30:00Z'
      }
    ]
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSystemStatus(mockSystemStatus);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSystemStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'resolved':
        return 'success';
      case 'degraded':
      case 'warning':
      case 'monitoring':
        return 'warning';
      case 'offline':
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle />;
      case 'degraded':
      case 'warning':
        return <Warning />;
      case 'offline':
      case 'critical':
        return <Error />;
      default:
        return <Info />;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'web application':
        return <NetworkCheck />;
      case 'database':
        return <Storage />;
      case 'email service':
        return <Email />;
      case 'file storage':
        return <CloudUpload />;
      case 'authentication':
        return <Security />;
      default:
        return <CheckCircle />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดสถานะระบบ...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              สถานะระบบ
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ตรวจสอบสถานะและประสิทธิภาพของระบบ
            </Typography>
          </Box>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outlined"
          >
            {refreshing ? 'กำลังอัปเดต...' : 'อัปเดต'}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Overall Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${getStatusColor(systemStatus?.overall_status || '')}.main` }}>
                  {getStatusIcon(systemStatus?.overall_status || '')}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ระบบทำงานปกติ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    อัปเดตล่าสุด: {systemStatus?.last_updated ? new Date(systemStatus.last_updated).toLocaleString('th-TH') : '-'}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={systemStatus?.overall_status === 'healthy' ? 'ปกติ' : 
                       systemStatus?.overall_status === 'warning' ? 'เตือน' : 'วิกฤต'}
                color={getStatusColor(systemStatus?.overall_status || '') as any}
                variant="outlined"
                size="large"
              />
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Services Status */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  สถานะบริการ
                </Typography>
                <List>
                  {systemStatus?.services.map((service, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: `${getStatusColor(service.status)}.main` }}>
                          {getServiceIcon(service.name)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {service.name}
                            </Typography>
                            <Chip
                              label={service.status === 'online' ? 'ออนไลน์' : 
                                     service.status === 'degraded' ? 'ช้า' : 'ออฟไลน์'}
                              color={getStatusColor(service.status) as any}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              เวลาตอบสนอง: {service.response_time}ms • 
                              Uptime: {service.uptime}% • 
                              ตรวจสอบล่าสุด: {new Date(service.last_check).toLocaleTimeString('th-TH')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ประสิทธิภาพระบบ
                </Typography>
                
                {/* CPU Usage */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">การใช้งาน CPU</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {systemStatus?.performance.cpu_usage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus?.performance.cpu_usage || 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Memory Usage */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">การใช้งานหน่วยความจำ</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {systemStatus?.performance.memory_usage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus?.performance.memory_usage || 0}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Disk Usage */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">การใช้งานดิสก์</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {systemStatus?.performance.disk_usage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus?.performance.disk_usage || 0}
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Active Users */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1, mb: 1 }}>
                  <Typography variant="body2">ผู้ใช้งานออนไลน์</Typography>
                  <Typography variant="h6" color="primary.main">
                    {systemStatus?.performance.active_users || 0}
                  </Typography>
                </Box>

                {/* Requests per minute */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">คำขอต่อนาที</Typography>
                  <Typography variant="h6" color="secondary.main">
                    {systemStatus?.performance.requests_per_minute || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Storage Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  พื้นที่จัดเก็บข้อมูล
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">พื้นที่ใช้งาน</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatBytes((systemStatus?.storage.used_space || 0) * 1024 * 1024)} / {formatBytes((systemStatus?.storage.total_space || 0) * 1024 * 1024)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus?.storage.used_space && systemStatus?.storage.total_space ? 
                      (systemStatus.storage.used_space / systemStatus.storage.total_space) * 100 : 0}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      {systemStatus?.storage.file_count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ไฟล์ทั้งหมด
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary.main">
                      {formatBytes((systemStatus?.storage.database_size || 0) * 1024 * 1024)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ขนาดฐานข้อมูล
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Incidents */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  เหตุการณ์ล่าสุด
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>เหตุการณ์</TableCell>
                        <TableCell>ความรุนแรง</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>เวลา</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {systemStatus?.recent_incidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {incident.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {incident.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={incident.severity === 'critical' ? 'วิกฤต' :
                                     incident.severity === 'high' ? 'สูง' :
                                     incident.severity === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                              color={getSeverityColor(incident.severity) as any}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={incident.status === 'investigating' ? 'กำลังตรวจสอบ' :
                                     incident.status === 'identified' ? 'ระบุสาเหตุแล้ว' :
                                     incident.status === 'monitoring' ? 'กำลังติดตาม' : 'แก้ไขแล้ว'}
                              color={getStatusColor(incident.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(incident.created_at).toLocaleString('th-TH')}
                            </Typography>
                            {incident.resolved_at && (
                              <Typography variant="caption" color="text.secondary">
                                แก้ไข: {new Date(incident.resolved_at).toLocaleString('th-TH')}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default SystemStatusPage;