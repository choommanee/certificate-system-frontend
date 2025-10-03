import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  NotificationsActive as ActiveNotificationIcon,
  Assignment as DocumentIcon,
  PriorityHigh as UrgentIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Notification } from '../../types/signer';
import { useNotifications } from '../../hooks/useSigner';

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  compact?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationClick,
  compact = false
}) => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    urgentOnly: false,
    soundEnabled: true
  });

  // Filter notifications by type
  const allNotifications = notifications;
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const urgentNotifications = notifications.filter(n => n.priority === 'high');
  const documentNotifications = notifications.filter(n => n.type === 'document_received' || n.type === 'urgent_document');

  const getNotificationIcon = (type: string, priority?: string) => {
    const iconProps = { 
      fontSize: 'small' as const,
      color: priority === 'high' ? 'error' : 'primary' as any
    };

    switch (type) {
      case 'document_received':
        return <DocumentIcon {...iconProps} />;
      case 'urgent_document':
        return <UrgentIcon {...iconProps} />;
      case 'signing_reminder':
        return <TimeIcon {...iconProps} />;
      case 'system_update':
        return <InfoIcon {...iconProps} />;
      default:
        return <NotificationIcon {...iconProps} />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'document_received':
        return 'เอกสารใหม่';
      case 'urgent_document':
        return 'เอกสารด่วน';
      case 'signing_reminder':
        return 'แจ้งเตือนลงนาม';
      case 'system_update':
        return 'อัปเดตระบบ';
      default:
        return 'การแจ้งเตือน';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
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

  const formatDate = (date: Date): string => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else {
      return notificationDate.toLocaleDateString('th-TH', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    setSelectedNotification(notification);
    onNotificationClick?.(notification);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const renderNotificationList = (notificationList: Notification[]) => {
    if (notificationList.length === 0) {
      return (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <NotificationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}
          >
            ไม่มีการแจ้งเตือน
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            การแจ้งเตือนใหม่จะปรากฏที่นี่
          </Typography>
        </Paper>
      );
    }

    return (
      <List>
        {notificationList.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem
              button
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                border: notification.priority === 'high' ? '1px solid' : 'none',
                borderColor: 'error.main',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }}
            >
              <ListItemIcon>
                <Badge
                  variant="dot"
                  color="error"
                  invisible={notification.isRead}
                >
                  {getNotificationIcon(notification.type, notification.priority)}
                </Badge>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: notification.isRead ? 'normal' : 'bold'
                      }}
                    >
                      {notification.title}
                    </Typography>
                    
                    <Chip
                      label={getNotificationTypeText(notification.type)}
                      size="small"
                      color={getPriorityColor(notification.priority) as any}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: notification.isRead ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </Stack>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (notification.isRead) {
                      // Mark as unread functionality would go here
                    } else {
                      markAsRead(notification.id);
                    }
                  }}
                  size="small"
                >
                  {notification.isRead ? <UnreadIcon /> : <ReadIcon />}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            
            {index < notificationList.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  if (compact) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationIcon />
              </Badge>
              การแจ้งเตือน
            </Typography>
            
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              อ่านทั้งหมด
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {renderNotificationList(notifications.slice(0, 5))}
            </Box>
          )}
          
          {notifications.length > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                ดูทั้งหมด ({notifications.length})
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
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
          <Badge badgeContent={unreadCount} color="error">
            <NotificationIcon />
          </Badge>
          ศูนย์การแจ้งเตือน
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="รีเฟรช">
            <IconButton onClick={fetchNotifications} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="ตัวกรอง">
            <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="ตั้งค่า">
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              การแจ้งเตือนทั้งหมด: <strong>{notifications.length}</strong> รายการ
              {unreadCount > 0 && (
                <Chip
                  label={`ยังไม่อ่าน ${unreadCount}`}
                  color="error"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<ReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              อ่านทั้งหมด
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Card elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab
              label={
                <Badge badgeContent={notifications.length} color="primary" max={99}>
                  <span style={{ fontFamily: 'Sarabun, sans-serif' }}>ทั้งหมด</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <span style={{ fontFamily: 'Sarabun, sans-serif' }}>ยังไม่อ่าน</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={urgentNotifications.length} color="warning" max={99}>
                  <span style={{ fontFamily: 'Sarabun, sans-serif' }}>ด่วน</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={documentNotifications.length} color="info" max={99}>
                  <span style={{ fontFamily: 'Sarabun, sans-serif' }}>เอกสาร</span>
                </Badge>
              }
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={activeTab} index={0}>
                {renderNotificationList(allNotifications)}
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                {renderNotificationList(unreadNotifications)}
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                {renderNotificationList(urgentNotifications)}
              </TabPanel>
              
              <TabPanel value={activeTab} index={3}>
                {renderNotificationList(documentNotifications)}
              </TabPanel>
            </>
          )}
        </CardContent>
      </Card>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => setActiveTab(0)}>
          <ListItemIcon><NotificationIcon /></ListItemIcon>
          <ListItemText primary="ทั้งหมด" />
        </MenuItem>
        <MenuItem onClick={() => setActiveTab(1)}>
          <ListItemIcon><UnreadIcon /></ListItemIcon>
          <ListItemText primary="ยังไม่อ่าน" />
        </MenuItem>
        <MenuItem onClick={() => setActiveTab(2)}>
          <ListItemIcon><UrgentIcon /></ListItemIcon>
          <ListItemText primary="ด่วน" />
        </MenuItem>
        <MenuItem onClick={() => setActiveTab(3)}>
          <ListItemIcon><DocumentIcon /></ListItemIcon>
          <ListItemText primary="เอกสาร" />
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตั้งค่าการแจ้งเตือน
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    emailNotifications: e.target.checked
                  }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    การแจ้งเตือนทางอีเมล
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รับการแจ้งเตือนผ่านอีเมลเมื่อมีเอกสารใหม่
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    pushNotifications: e.target.checked
                  }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    การแจ้งเตือนแบบ Push
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รับการแจ้งเตือนแบบ real-time ในเบราว์เซอร์
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.urgentOnly}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    urgentOnly: e.target.checked
                  }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    เฉพาะเอกสารด่วน
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    แจ้งเตือนเฉพาะเอกสารที่มีความสำคัญสูงเท่านั้น
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    soundEnabled: e.target.checked
                  }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    เสียงแจ้งเตือน
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    เปิดเสียงเมื่อมีการแจ้งเตือนใหม่
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSettingsOpen(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={() => {
              // Save settings logic would go here
              setSettingsOpen(false);
            }}
            variant="contained"
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Detail Dialog */}
      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
                {selectedNotification.title}
                <Chip
                  label={getNotificationTypeText(selectedNotification.type)}
                  size="small"
                  color={getPriorityColor(selectedNotification.priority) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography
                variant="body1"
                sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}
              >
                {selectedNotification.message}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                {formatDate(selectedNotification.createdAt)}
              </Typography>
              
              {selectedNotification.documentId && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DocumentIcon />}
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  >
                    ดูเอกสาร
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSelectedNotification(null)}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                ปิด
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;