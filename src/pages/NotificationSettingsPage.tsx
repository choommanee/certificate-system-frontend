import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save,
  Notifications,
  Email,
  Sms,
  CheckCircle,
  Warning,
  Info,
  Assignment,
  Person,
  Schedule,
  Cancel,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface NotificationSettings {
  email_notifications: {
    certificate_created: boolean;
    certificate_approved: boolean;
    certificate_rejected: boolean;
    certificate_published: boolean;
    user_mentioned: boolean;
    system_updates: boolean;
    marketing: boolean;
  };
  push_notifications: {
    certificate_created: boolean;
    certificate_approved: boolean;
    certificate_rejected: boolean;
    certificate_published: boolean;
    user_mentioned: boolean;
    system_updates: boolean;
  };
  sms_notifications: {
    certificate_approved: boolean;
    certificate_rejected: boolean;
    security_alerts: boolean;
  };
  preferences: {
    notification_frequency: 'immediate' | 'daily' | 'weekly';
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    sound_enabled: boolean;
  };
}

const NotificationSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Mock data
  const mockSettings: NotificationSettings = {
    email_notifications: {
      certificate_created: true,
      certificate_approved: true,
      certificate_rejected: true,
      certificate_published: true,
      user_mentioned: false,
      system_updates: true,
      marketing: false
    },
    push_notifications: {
      certificate_created: true,
      certificate_approved: true,
      certificate_rejected: true,
      certificate_published: false,
      user_mentioned: true,
      system_updates: false
    },
    sms_notifications: {
      certificate_approved: false,
      certificate_rejected: false,
      security_alerts: true
    },
    preferences: {
      notification_frequency: 'immediate',
      quiet_hours_enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      sound_enabled: true
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingChange = (category: keyof NotificationSettings, field: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [category]: {
          ...settings[category],
          [field]: value
        }
      });
      setUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to API
      console.log('Saving notification settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ');
      setUnsavedChanges(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'certificate_created':
      case 'certificate_approved':
      case 'certificate_published':
        return <CheckCircle color="success" />;
      case 'certificate_rejected':
        return <Cancel color="error" />;
      case 'user_mentioned':
        return <Person color="info" />;
      case 'system_updates':
        return <Info color="primary" />;
      case 'marketing':
        return <Email color="secondary" />;
      case 'security_alerts':
        return <Warning color="warning" />;
      default:
        return <Notifications />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'certificate_created':
        return 'เกียรติบัตรถูกสร้าง';
      case 'certificate_approved':
        return 'เกียรติบัตรได้รับการอนุมัติ';
      case 'certificate_rejected':
        return 'เกียรติบัตรถูกปฏิเสธ';
      case 'certificate_published':
        return 'เกียรติบัตรถูกเผยแพร่';
      case 'user_mentioned':
        return 'มีคนกล่าวถึงคุณ';
      case 'system_updates':
        return 'อัปเดตระบบ';
      case 'marketing':
        return 'ข่าวสารและโปรโมชั่น';
      case 'security_alerts':
        return 'การแจ้งเตือนความปลอดภัย';
      default:
        return type;
    }
  };

  const getNotificationDescription = (type: string) => {
    switch (type) {
      case 'certificate_created':
        return 'แจ้งเตือนเมื่อมีการสร้างเกียรติบัตรใหม่';
      case 'certificate_approved':
        return 'แจ้งเตือนเมื่อเกียรติบัตรของคุณได้รับการอนุมัติ';
      case 'certificate_rejected':
        return 'แจ้งเตือนเมื่อเกียรติบัตรของคุณถูกปฏิเสธ';
      case 'certificate_published':
        return 'แจ้งเตือนเมื่อเกียรติบัตรของคุณถูกเผยแพร่';
      case 'user_mentioned':
        return 'แจ้งเตือนเมื่อมีคนกล่าวถึงคุณในความคิดเห็น';
      case 'system_updates':
        return 'แจ้งเตือนเกี่ยวกับการอัปเดตและการบำรุงรักษาระบบ';
      case 'marketing':
        return 'รับข่าวสารและข้อเสนอพิเศษจากเรา';
      case 'security_alerts':
        return 'แจ้งเตือนเกี่ยวกับความปลอดภัยของบัญชี';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดการตั้งค่า...</Typography>
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
              การตั้งค่าการแจ้งเตือน
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จัดการการแจ้งเตือนที่คุณต้องการรับ
            </Typography>
          </Box>
          <Button
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving || !unsavedChanges}
            variant="contained"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </Box>

        {/* Unsaved Changes Warning */}
        {unsavedChanges && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </Alert>
        )}

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Email Notifications */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Email />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">การแจ้งเตือนทางอีเมล</Typography>
                    <Typography variant="body2" color="text.secondary">
                      รับการแจ้งเตือนผ่านอีเมลของคุณ
                    </Typography>
                  </Box>
                </Box>
                <List>
                  {Object.entries(settings?.email_notifications || {}).map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemIcon>
                        {getNotificationIcon(key)}
                      </ListItemIcon>
                      <ListItemText
                        primary={getNotificationTitle(key)}
                        secondary={getNotificationDescription(key)}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={value}
                          onChange={(e) => handleSettingChange('email_notifications', key, e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Push Notifications */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <Notifications />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">การแจ้งเตือนแบบ Push</Typography>
                    <Typography variant="body2" color="text.secondary">
                      รับการแจ้งเตือนแบบทันทีในเบราว์เซอร์
                    </Typography>
                  </Box>
                </Box>
                <List>
                  {Object.entries(settings?.push_notifications || {}).map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemIcon>
                        {getNotificationIcon(key)}
                      </ListItemIcon>
                      <ListItemText
                        primary={getNotificationTitle(key)}
                        secondary={getNotificationDescription(key)}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={value}
                          onChange={(e) => handleSettingChange('push_notifications', key, e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* SMS Notifications */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Sms />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">การแจ้งเตือนทาง SMS</Typography>
                    <Typography variant="body2" color="text.secondary">
                      รับการแจ้งเตือนสำคัญทางข้อความ
                    </Typography>
                  </Box>
                </Box>
                <List>
                  {Object.entries(settings?.sms_notifications || {}).map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemIcon>
                        {getNotificationIcon(key)}
                      </ListItemIcon>
                      <ListItemText
                        primary={getNotificationTitle(key)}
                        secondary={getNotificationDescription(key)}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={value}
                          onChange={(e) => handleSettingChange('sms_notifications', key, e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Preferences */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">ความถี่การแจ้งเตือน</Typography>
                    <Typography variant="body2" color="text.secondary">
                      กำหนดความถี่ในการรับการแจ้งเตือน
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>ความถี่การแจ้งเตือน</InputLabel>
                      <Select
                        value={settings?.preferences.notification_frequency || 'immediate'}
                        label="ความถี่การแจ้งเตือน"
                        onChange={(e) => handleSettingChange('preferences', 'notification_frequency', e.target.value)}
                      >
                        <MenuItem value="immediate">ทันที</MenuItem>
                        <MenuItem value="daily">รายวัน</MenuItem>
                        <MenuItem value="weekly">รายสัปดาห์</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings?.preferences.sound_enabled || false}
                          onChange={(e) => handleSettingChange('preferences', 'sound_enabled', e.target.checked)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {settings?.preferences.sound_enabled ? <VolumeUp /> : <VolumeOff />}
                          เปิดเสียงการแจ้งเตือน
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings?.preferences.quiet_hours_enabled || false}
                          onChange={(e) => handleSettingChange('preferences', 'quiet_hours_enabled', e.target.checked)}
                        />
                      }
                      label="เปิดใช้งานช่วงเวลาเงียบ"
                    />
                  </Grid>

                  {settings?.preferences.quiet_hours_enabled && (
                    <>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>เริ่มเวลาเงียบ</InputLabel>
                          <Select
                            value={settings?.preferences.quiet_hours_start || '22:00'}
                            label="เริ่มเวลาเงียบ"
                            onChange={(e) => handleSettingChange('preferences', 'quiet_hours_start', e.target.value)}
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <MenuItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>สิ้นสุดเวลาเงียบ</InputLabel>
                          <Select
                            value={settings?.preferences.quiet_hours_end || '08:00'}
                            label="สิ้นสุดเวลาเงียบ"
                            onChange={(e) => handleSettingChange('preferences', 'quiet_hours_end', e.target.value)}
                          >
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <MenuItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Summary */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              สรุปการตั้งค่า
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Email sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">
                    {Object.values(settings?.email_notifications || {}).filter(Boolean).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    การแจ้งเตือนทางอีเมล
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Notifications sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">
                    {Object.values(settings?.push_notifications || {}).filter(Boolean).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    การแจ้งเตือนแบบ Push
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Sms sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6">
                    {Object.values(settings?.sms_notifications || {}).filter(Boolean).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    การแจ้งเตือนทาง SMS
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default NotificationSettingsPage;