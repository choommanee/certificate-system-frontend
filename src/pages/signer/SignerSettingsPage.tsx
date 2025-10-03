import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Palette,
  Language,
  Save,
  Lock,
  Visibility,
  VisibilityOff,
  Shield,
  Key,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const SignerSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      inApp: true,
      sms: false,
      urgent: true,
      daily: false,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      autoLock: true,
    },
    preferences: {
      theme: 'light',
      language: 'th',
      autoSave: true,
      showTips: true,
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Implementation for saving settings
    console.log('Saving settings:', settings);
  };

  return (
    <SignerDashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <Settings />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: '#1976d2' }}>
                  ตั้งค่าระบบ
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  จัดการการตั้งค่าส่วนตัวและความปลอดภัย
                </Typography>
              </Box>
            </Box>
            <Button variant="contained" startIcon={<Save />} onClick={handleSaveSettings} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              บันทึกการตั้งค่า
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Notifications color="primary" />
                  <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    การแจ้งเตือน
                  </Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemText primary="แจ้งเตือนทางอีเมล" secondary="รับการแจ้งเตือนผ่านอีเมล" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="แจ้งเตือนในระบบ" secondary="แสดงการแจ้งเตือนในระบบ" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.inApp}
                        onChange={(e) => handleSettingChange('notifications', 'inApp', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="แจ้งเตือน SMS" secondary="รับการแจ้งเตือนผ่าน SMS" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemText primary="เอกสารด่วน" secondary="แจ้งเตือนเอกสารที่ต้องลงนามด่วน" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.urgent}
                        onChange={(e) => handleSettingChange('notifications', 'urgent', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText primary="สรุปรายวัน" secondary="ส่งสรุปงานประจำวัน" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.daily}
                        onChange={(e) => handleSettingChange('notifications', 'daily', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Security color="error" />
                  <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    ความปลอดภัย
                  </Typography>
                </Box>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Shield />
                    </ListItemIcon>
                    <ListItemText primary="การยืนยันตัวตนสองขั้นตอน" secondary="เพิ่มความปลอดภัยด้วย 2FA" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.security.twoFactor}
                        onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Lock />
                    </ListItemIcon>
                    <ListItemText primary="ล็อคอัตโนมัติ" secondary="ล็อคระบบเมื่อไม่ได้ใช้งาน" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.security.autoLock}
                        onChange={(e) => handleSettingChange('security', 'autoLock', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Key />
                    </ListItemIcon>
                    <ListItemText primary="เปลี่ยนรหัสผ่าน" secondary="อัปเดตรหัสผ่านของคุณ" />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setChangePasswordOpen(true)}
                      >
                        เปลี่ยน
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Preferences */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Palette color="secondary" />
                  <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    การตั้งค่าทั่วไป
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="ธีมสี"
                      select
                      value={settings.preferences.theme}
                      onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                      SelectProps={{ native: true }}
                    >
                      <option value="light">สว่าง</option>
                      <option value="dark">มืด</option>
                      <option value="auto">อัตโนมัติ</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="ภาษา"
                      select
                      value={settings.preferences.language}
                      onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                      SelectProps={{ native: true }}
                    >
                      <option value="th">ไทย</option>
                      <option value="en">English</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="หมดเวลาเซสชัน (นาที)"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.preferences.autoSave}
                        onChange={(e) => handleSettingChange('preferences', 'autoSave', e.target.checked)}
                      />
                    }
                    label="บันทึกอัตโนมัติ"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.preferences.showTips}
                        onChange={(e) => handleSettingChange('preferences', 'showTips', e.target.checked)}
                      />
                    }
                    label="แสดงคำแนะนำ"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            เปลี่ยนรหัสผ่าน
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="รหัสผ่านปัจจุบัน"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <Button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
              />
              <TextField
                fullWidth
                label="รหัสผ่านใหม่"
                type="password"
                margin="normal"
              />
              <TextField
                fullWidth
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePasswordOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="contained" onClick={() => setChangePasswordOpen(false)}>
              เปลี่ยนรหัสผ่าน
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerSettingsPage;