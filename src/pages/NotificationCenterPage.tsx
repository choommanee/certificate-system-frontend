import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  MarkEmailRead,
  Delete,
  MoreVert,
  CheckCircle,
  Warning,
  Info,
  Error,
  Assignment,
  Person,
  Email,
  Schedule,
  Settings,
  Clear,
  DoneAll,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface Notification {
  id: string;
  type: 'certificate' | 'user' | 'system' | 'email';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    certificateId?: string;
    userId?: string;
    activityId?: string;
  };
}

const NotificationCenterPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    certificateNotifications: true,
    userNotifications: true,
    systemNotifications: true,
  });

  // Mock data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'certificate',
      title: 'เกียรติบัตรใหม่ได้รับการอนุมัติ',
      message: 'เกียรติบัตร "สัมมนาเศรษฐกิจดิจิทัล 2024" ของคุณสมชาย ใจดี ได้รับการอนุมัติแล้ว',
      priority: 'high',
      isRead: false,
      createdAt: '2024-03-15T10:30:00Z',
      actionUrl: '/certificates/1',
      metadata: { certificateId: '1', userId: '123' }
    },
    {
      id: '2',
      type: 'user',
      title: 'ผู้ใช้ใหม่ลงทะเบียน',
      message: 'มีผู้ใช้ใหม่ "นางสาวมาลี สวยงาม" ลงทะเบียนเข้าใช้งานระบบ',
      priority: 'medium',
      isRead: false,
      createdAt: '2024-03-15T09:15:00Z',
      actionUrl: '/users/456',
      metadata: { userId: '456' }
    },
    {
      id: '3',
      type: 'system',
      title: 'การบำรุงรักษาระบบ',
      message: 'ระบบจะมีการบำรุงรักษาในวันที่ 20 มีนาคม 2567 เวลา 02:00-04:00 น.',
      priority: 'urgent',
      isRead: true,
      createdAt: '2024-03-14T16:00:00Z'
    },
    {
      id: '4',
      type: 'email',
      title: 'การส่งอีเมลล้มเหลว',
      message: 'ไม่สามารถส่งเกียรติบัตรทางอีเมลให้ john.doe@example.com ได้',
      priority: 'high',
      isRead: false,
      createdAt: '2024-03-14T14:20:00Z'
    },
    {
      id: '5',
      type: 'certificate',
      title: 'เกียรติบัตรรอการอนุมัติ',
      message: 'มีเกียรติบัตร 5 ใบรอการอนุมัติจากคุณ',
      priority: 'medium',
      isRead: true,
      createdAt: '2024-03-14T11:45:00Z',
      actionUrl: '/approvals'
    },
    {
      id: '6',
      type: 'user',
      title: 'การเข้าสู่ระบบผิดปกติ',
      message: 'มีการพยายามเข้าสู่ระบบด้วยบัญชี admin จาก IP ที่ไม่รู้จัก',
      priority: 'urgent',
      isRead: false,
      createdAt: '2024-03-13T22:30:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Assignment />;
      case 'user': return <Person />;
      case 'email': return <Email />;
      case 'system': return <Settings />;
      default: return <Info />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'ด่วนมาก';
      case 'high': return 'สำคัญ';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'ต่ำ';
      default: return priority;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    handleMenuClose();
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = () => {
    if (selectedNotification) {
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      setDeleteDialog(false);
      handleMenuClose();
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 0: return true; // All
      case 1: return !notification.isRead; // Unread
      case 2: return notification.type === 'certificate';
      case 3: return notification.type === 'user';
      case 4: return notification.type === 'system';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const tabs = [
    { label: 'ทั้งหมด', count: notifications.length },
    { label: 'ยังไม่อ่าน', count: unreadCount },
    { label: 'เกียรติบัตร', count: notifications.filter(n => n.type === 'certificate').length },
    { label: 'ผู้ใช้งาน', count: notifications.filter(n => n.type === 'user').length },
    { label: 'ระบบ', count: notifications.filter(n => n.type === 'system').length },
  ];

  return (
    <DashboardLayout>
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
              🔔 ศูนย์แจ้งเตือน
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              จัดการการแจ้งเตือนและข้อความสำคัญ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setSettingsDialog(true)}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              ตั้งค่า
            </Button>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsActive sx={{ fontSize: 32 }} />
            </Badge>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Card sx={{ flex: 1, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {notifications.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                การแจ้งเตือนทั้งหมด
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                {unreadCount}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ยังไม่ได้อ่าน
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
                {notifications.filter(n => n.priority === 'urgent').length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ด่วนมาก
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content */}
        <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ px: 2 }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.label}
                      <Chip 
                        label={tab.count} 
                        size="small" 
                        color={index === 1 && tab.count > 0 ? 'warning' : 'default'}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Actions */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              การแจ้งเตือน ({filteredNotifications.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<DoneAll />}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                อ่านทั้งหมด
              </Button>
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={handleClearAll}
                color="error"
                disabled={notifications.length === 0}
              >
                ล้างทั้งหมด
              </Button>
            </Box>
          </Box>

          {/* Notifications List */}
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography>กำลังโหลดการแจ้งเตือน...</Typography>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <NotificationsOff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                ไม่มีการแจ้งเตือน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 1 ? 'คุณได้อ่านการแจ้งเตือนทั้งหมดแล้ว' : 'ยังไม่มีการแจ้งเตือนในหมวดหมู่นี้'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'grey.50' }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: notification.isRead ? 'grey.300' : 'primary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: notification.isRead ? 400 : 600,
                              flex: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={getPriorityText(notification.priority)}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: th
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, notification)}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedNotification && !selectedNotification.isRead && (
            <MenuItem onClick={() => handleMarkAsRead(selectedNotification.id)}>
              <MarkEmailRead sx={{ mr: 1 }} />
              ทำเครื่องหมายว่าอ่านแล้ว
            </MenuItem>
          )}
          {selectedNotification?.actionUrl && (
            <MenuItem onClick={handleMenuClose}>
              <CheckCircle sx={{ mr: 1 }} />
              ดูรายละเอียด
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => setDeleteDialog(true)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            ลบ
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>ยืนยันการลบการแจ้งเตือน</DialogTitle>
          <DialogContent>
            <Typography>
              คุณต้องการลบการแจ้งเตือนนี้หรือไม่?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              ลบ
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog 
          open={settingsDialog} 
          onClose={() => setSettingsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>ตั้งค่าการแจ้งเตือน</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                ช่องทางการแจ้งเตือน
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  />
                }
                label="การแจ้งเตือนทางอีเมล"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  />
                }
                label="การแจ้งเตือนแบบ Push"
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                ประเภทการแจ้งเตือน
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.certificateNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, certificateNotifications: e.target.checked }))}
                  />
                }
                label="เกียรติบัตร"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.userNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, userNotifications: e.target.checked }))}
                  />
                }
                label="ผู้ใช้งาน"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.systemNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, systemNotifications: e.target.checked }))}
                  />
                }
                label="ระบบ"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialog(false)}>ยกเลิก</Button>
            <Button 
              onClick={() => setSettingsDialog(false)} 
              variant="contained"
            >
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default NotificationCenterPage;