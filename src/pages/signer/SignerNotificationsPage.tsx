import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Paper,
  IconButton,
  Badge,
  Chip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Notifications,
  NotificationImportant,
  Assignment,
  Schedule,
  CheckCircle,
  Settings,
  MarkEmailRead,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import NotificationCenter from '../../components/signer/NotificationCenter';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SignerNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const mockNotifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'เอกสารด่วนรอลงนาม',
      message: 'มีเกียรติบัตรการแข่งขันคณิตศาสตร์ 25 ฉบับ รอการลงนาม (ครบกำหนด: วันนี้)',
      timestamp: new Date(),
      isRead: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'document',
      title: 'เอกสารใหม่เข้าระบบ',
      message: 'เกียรติบัตรงานวิทยาศาสตร์ 15 ฉบับ ได้รับการส่งเข้าระบบแล้ว',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'completed',
      title: 'ลงนามเสร็จสิ้น',
      message: 'คุณได้ลงนามเกียรติบัตรโครงการพัฒนาทักษะ 30 ฉบับ เรียบร้อยแล้ว',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low'
    }
  ];

  return (
    <SignerDashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                <Notifications />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: '#1976d2' }}>
                  ศูนย์การแจ้งเตือน
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  จัดการการแจ้งเตือนและตั้งค่าการรับข้อมูล
                </Typography>
              </Box>
            </Box>
            <Button variant="contained" startIcon={<Refresh />} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              รีเฟรช
            </Button>
          </Box>
        </Box>

        {/* Notification Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><NotificationImportant /><span>ด่วน</span><Badge badgeContent={1} color="error" /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Notifications /><span>ทั้งหมด</span><Badge badgeContent={3} color="primary" /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Settings /><span>ตั้งค่า</span></Box>} />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <NotificationCenter notifications={mockNotifications.filter(n => n.priority === 'high')} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NotificationCenter notifications={mockNotifications} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3 }}>
              ตั้งค่าการแจ้งเตือน
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      การแจ้งเตือนทั่วไป
                    </Typography>
                    <FormControlLabel control={<Switch defaultChecked />} label="เอกสารใหม่เข้าระบบ" />
                    <FormControlLabel control={<Switch defaultChecked />} label="เอกสารด่วน" />
                    <FormControlLabel control={<Switch />} label="สรุปรายวัน" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      ช่องทางการแจ้งเตือน
                    </Typography>
                    <FormControlLabel control={<Switch defaultChecked />} label="อีเมล" />
                    <FormControlLabel control={<Switch defaultChecked />} label="ในระบบ" />
                    <FormControlLabel control={<Switch />} label="SMS" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerNotificationsPage;