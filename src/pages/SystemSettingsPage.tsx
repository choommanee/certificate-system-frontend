import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Restore,
  Security,
  Email,
  Storage,
  Notifications,
  Language,
  Palette,
  CloudUpload,
  Download,
  Refresh,
  Warning,
  CheckCircle,
  Info,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface SystemSettings {
  general: {
    site_name: string;
    site_description: string;
    default_language: string;
    timezone: string;
    date_format: string;
    items_per_page: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    smtp_encryption: string;
    from_email: string;
    from_name: string;
    email_notifications: boolean;
  };
  security: {
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_lowercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    session_timeout: number;
    max_login_attempts: number;
    two_factor_auth: boolean;
  };
  storage: {
    max_file_size: number;
    allowed_file_types: string[];
    storage_path: string;
    auto_cleanup: boolean;
    cleanup_days: number;
  };
  notifications: {
    certificate_created: boolean;
    certificate_approved: boolean;
    certificate_rejected: boolean;
    user_registered: boolean;
    system_maintenance: boolean;
  };
}

const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Mock data
  const mockSettings: SystemSettings = {
    general: {
      site_name: 'ระบบเกียรติบัตรออนไลน์',
      site_description: 'ระบบจัดการเกียรติบัตรดิจิทัล คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์',
      default_language: 'th',
      timezone: 'Asia/Bangkok',
      date_format: 'DD/MM/YYYY',
      items_per_page: 10
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_username: 'system@university.ac.th',
      smtp_password: '••••••••',
      smtp_encryption: 'TLS',
      from_email: 'noreply@university.ac.th',
      from_name: 'ระบบเกียรติบัตรออนไลน์',
      email_notifications: true
    },
    security: {
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_lowercase: true,
      password_require_numbers: true,
      password_require_symbols: false,
      session_timeout: 30,
      max_login_attempts: 5,
      two_factor_auth: false
    },
    storage: {
      max_file_size: 10,
      allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      storage_path: '/uploads',
      auto_cleanup: true,
      cleanup_days: 30
    },
    notifications: {
      certificate_created: true,
      certificate_approved: true,
      certificate_rejected: true,
      user_registered: true,
      system_maintenance: true
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
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
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('บันทึกการตั้งค่าสำเร็จ');
      setUnsavedChanges(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('คุณต้องการรีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นหรือไม่?')) {
      setSettings(mockSettings);
      setUnsavedChanges(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    try {
      // TODO: Send test email
      console.log('Sending test email to:', testEmail);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('ส่งอีเมลทดสอบสำเร็จ');
      setTestEmailDialog(false);
      setTestEmail('');
    } catch (err: any) {
      setError('ไม่สามารถส่งอีเมลทดสอบได้');
    }
  };

  const tabs = [
    { label: 'ทั่วไป', icon: <Info /> },
    { label: 'อีเมล', icon: <Email /> },
    { label: 'ความปลอดภัย', icon: <Security /> },
    { label: 'จัดเก็บไฟล์', icon: <Storage /> },
    { label: 'การแจ้งเตือน', icon: <Notifications /> }
  ];

  const renderGeneralSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
        <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
        การตั้งค่าทั่วไป
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="ชื่อเว็บไซต์"
            value={settings?.general.site_name || ''}
            onChange={(e) => handleSettingChange('general', 'site_name', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="ชื่อที่จะแสดงในหัวเรื่องของเว็บไซต์"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>ภาษาเริ่มต้น</InputLabel>
            <Select
              value={settings?.general.default_language || 'th'}
              label="ภาษาเริ่มต้น"
              onChange={(e) => handleSettingChange('general', 'default_language', e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="th">ไทย</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="คำอธิบายเว็บไซต์"
            value={settings?.general.site_description || ''}
            onChange={(e) => handleSettingChange('general', 'site_description', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="คำอธิบายสั้นๆ เกี่ยวกับเว็บไซต์ที่จะแสดงในหน้าหลัก"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>เขตเวลา</InputLabel>
            <Select
              value={settings?.general.timezone || 'Asia/Bangkok'}
              label="เขตเวลา"
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</MenuItem>
              <MenuItem value="UTC">UTC (UTC+0)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>รูปแบบวันที่</InputLabel>
            <Select
              value={settings?.general.date_format || 'DD/MM/YYYY'}
              label="รูปแบบวันที่"
              onChange={(e) => handleSettingChange('general', 'date_format', e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="จำนวนรายการต่อหน้า"
            value={settings?.general.items_per_page || 10}
            onChange={(e) => handleSettingChange('general', 'items_per_page', parseInt(e.target.value))}
            inputProps={{ min: 5, max: 100 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="จำนวนรายการที่แสดงในแต่ละหน้า (5-100)"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderEmailSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
        <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
        การตั้งค่าอีเมล
      </Typography>
      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          fontSize: '1rem'
        }}
      >
        การตั้งค่าอีเมลใช้สำหรับส่งการแจ้งเตือนและเกียรติบัตรให้ผู้ใช้งาน
      </Alert>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SMTP Host"
            value={settings?.email.smtp_host || ''}
            onChange={(e) => handleSettingChange('email', 'smtp_host', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="เซิร์ฟเวอร์ SMTP สำหรับส่งอีเมล"
            placeholder="smtp.gmail.com"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="SMTP Port"
            value={settings?.email.smtp_port || 587}
            onChange={(e) => handleSettingChange('email', 'smtp_port', parseInt(e.target.value))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="พอร์ตสำหรับเชื่อมต่อ SMTP"
            inputProps={{ min: 1, max: 65535 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="SMTP Username"
            value={settings?.email.smtp_username || ''}
            onChange={(e) => handleSettingChange('email', 'smtp_username', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ SMTP"
            placeholder="username@domain.com"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="password"
            label="SMTP Password"
            value={settings?.email.smtp_password || ''}
            onChange={(e) => handleSettingChange('email', 'smtp_password', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="รหัสผ่านสำหรับเข้าสู่ระบบ SMTP"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>การเข้ารหัส</InputLabel>
            <Select
              value={settings?.email.smtp_encryption || 'TLS'}
              label="การเข้ารหัส"
              onChange={(e) => handleSettingChange('email', 'smtp_encryption', e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="TLS">TLS (แนะนำ)</MenuItem>
              <MenuItem value="SSL">SSL</MenuItem>
              <MenuItem value="None">ไม่เข้ารหัส</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="email"
            label="อีเมลผู้ส่ง"
            value={settings?.email.from_email || ''}
            onChange={(e) => handleSettingChange('email', 'from_email', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="อีเมลที่จะแสดงเป็นผู้ส่ง"
            placeholder="noreply@university.ac.th"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="ชื่อผู้ส่ง"
            value={settings?.email.from_name || ''}
            onChange={(e) => handleSettingChange('email', 'from_name', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="ชื่อที่จะแสดงเป็นผู้ส่ง"
            placeholder="ระบบเกียรติบัตรออนไลน์"
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.email.email_notifications || false}
                  onChange={(e) => handleSettingChange('email', 'email_notifications', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    เปิดใช้งานการแจ้งเตือนทางอีเมล
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    อนุญาตให้ระบบส่งอีเมลแจ้งเตือนต่างๆ ให้ผู้ใช้งาน
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={() => setTestEmailDialog(true)}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              px: 3,
              fontWeight: 600
            }}
          >
            ทดสอบการส่งอีเมล
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSecuritySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
        <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
        การตั้งค่าความปลอดภัย
      </Typography>
      <Alert 
        severity="warning" 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          fontSize: '1rem'
        }}
      >
        การเปลี่ยนแปลงการตั้งค่าความปลอดภัยจะมีผลกับผู้ใช้ทั้งหมดในระบบ
      </Alert>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="ความยาวรหัสผ่านขั้นต่ำ"
            value={settings?.security.password_min_length || 8}
            onChange={(e) => handleSettingChange('security', 'password_min_length', parseInt(e.target.value))}
            inputProps={{ min: 6, max: 20 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="จำนวนตัวอักษรขั้นต่ำของรหัสผ่าน (6-20)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="จำนวนครั้งที่เข้าสู่ระบบผิดสูงสุด"
            value={settings?.security.max_login_attempts || 5}
            onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
            inputProps={{ min: 3, max: 10 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="จำนวนครั้งที่อนุญาตให้เข้าสู่ระบบผิด (3-10)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="หมดเวลาเซสชัน (นาที)"
            value={settings?.security.session_timeout || 30}
            onChange={(e) => handleSettingChange('security', 'session_timeout', parseInt(e.target.value))}
            inputProps={{ min: 15, max: 480 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="เวลาที่เซสชันจะหมดอายุ (15-480 นาที)"
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              ข้อกำหนดรหัสผ่าน
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.password_require_uppercase || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_uppercase', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">ต้องมีตัวอักษรพิมพ์ใหญ่</Typography>
                      <Typography variant="caption" color="text.secondary">A-Z</Typography>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.password_require_lowercase || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_lowercase', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">ต้องมีตัวอักษรพิมพ์เล็ก</Typography>
                      <Typography variant="caption" color="text.secondary">a-z</Typography>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.password_require_numbers || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_numbers', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">ต้องมีตัวเลข</Typography>
                      <Typography variant="caption" color="text.secondary">0-9</Typography>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.security.password_require_symbols || false}
                      onChange={(e) => handleSettingChange('security', 'password_require_symbols', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">ต้องมีสัญลักษณ์พิเศษ</Typography>
                      <Typography variant="caption" color="text.secondary">!@#$%^&*</Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.security.two_factor_auth || false}
                  onChange={(e) => handleSettingChange('security', 'two_factor_auth', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    เปิดใช้งานการยืนยันตัวตนสองขั้นตอน (2FA)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    เพิ่มความปลอดภัยด้วยการยืนยันตัวตนผ่านแอปพลิเคชันหรือ SMS
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStorageSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
        <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
        การตั้งค่าจัดเก็บไฟล์
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="ขนาดไฟล์สูงสุด (MB)"
            value={settings?.storage.max_file_size || 10}
            onChange={(e) => handleSettingChange('storage', 'max_file_size', parseInt(e.target.value))}
            inputProps={{ min: 1, max: 100 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="ขนาดไฟล์สูงสุดที่อนุญาตให้อัปโหลด (1-100 MB)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="เส้นทางจัดเก็บไฟล์"
            value={settings?.storage.storage_path || '/uploads'}
            onChange={(e) => handleSettingChange('storage', 'storage_path', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            helperText="เส้นทางโฟลเดอร์สำหรับจัดเก็บไฟล์"
            placeholder="/uploads"
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              ประเภทไฟล์ที่อนุญาต
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {settings?.storage.allowed_file_types.map((type) => (
                <Chip 
                  key={type} 
                  label={type.toUpperCase()} 
                  variant="outlined" 
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              ไฟล์ที่อนุญาตให้อัปโหลดในระบบ
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings?.storage.auto_cleanup || false}
                  onChange={(e) => handleSettingChange('storage', 'auto_cleanup', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    ลบไฟล์เก่าอัตโนมัติ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ระบบจะลบไฟล์ที่ไม่ได้ใช้งานเป็นเวลานานโดยอัตโนมัติ
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Paper>
        </Grid>
        {settings?.storage.auto_cleanup && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="ลบไฟล์ที่เก่ากว่า (วัน)"
              value={settings?.storage.cleanup_days || 30}
              onChange={(e) => handleSettingChange('storage', 'cleanup_days', parseInt(e.target.value))}
              inputProps={{ min: 7, max: 365 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText="จำนวนวันที่จะเก็บไฟล์ไว้ก่อนลบ (7-365 วัน)"
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderNotificationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
        <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
        การตั้งค่าการแจ้งเตือน
      </Typography>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          <ListItem sx={{ py: 3, px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemIcon>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.main' }}>
                <CheckCircle />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  เกียรติบัตรถูกสร้าง
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  แจ้งเตือนผู้ดูแลเมื่อมีการสร้างเกียรติบัตรใหม่ในระบบ
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications.certificate_created || false}
                onChange={(e) => handleSettingChange('notifications', 'certificate_created', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem sx={{ py: 3, px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemIcon>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.main' }}>
                <CheckCircle />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  เกียรติบัตรได้รับการอนุมัติ
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  แจ้งเตือนผู้รับเกียรติบัตรเมื่อได้รับการอนุมัติ
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications.certificate_approved || false}
                onChange={(e) => handleSettingChange('notifications', 'certificate_approved', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem sx={{ py: 3, px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemIcon>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'error.light', color: 'error.main' }}>
                <Warning />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  เกียรติบัตรถูกปฏิเสธ
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  แจ้งเตือนผู้ส่งคำขอเมื่อเกียรติบัตรถูกปฏิเสธ
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications.certificate_rejected || false}
                onChange={(e) => handleSettingChange('notifications', 'certificate_rejected', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem sx={{ py: 3, px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemIcon>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'info.light', color: 'info.main' }}>
                <Info />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  ผู้ใช้ใหม่ลงทะเบียน
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  แจ้งเตือนผู้ดูแลเมื่อมีผู้ใช้ใหม่ลงทะเบียนเข้าระบบ
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications.user_registered || false}
                onChange={(e) => handleSettingChange('notifications', 'user_registered', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem sx={{ py: 3, px: 3 }}>
            <ListItemIcon>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main' }}>
                <Warning />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  การบำรุงรักษาระบบ
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  แจ้งเตือนผู้ใช้ทั้งหมดเมื่อมีการบำรุงรักษาระบบ
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings?.notifications.system_maintenance || false}
                onChange={(e) => handleSettingChange('notifications', 'system_maintenance', e.target.checked)}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );

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
      <Box>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              ⚙️ ตั้งค่าระบบ
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              จัดการการตั้งค่าทั่วไปของระบบเกียรติบัตรออนไลน์
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<Restore />}
              onClick={handleReset}
              variant="outlined"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.3)',
                  borderColor: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              รีเซ็ต
            </Button>
            <Button
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: 4, pb: 4 }}>
          {/* Unsaved Changes Warning */}
          {unsavedChanges && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                fontSize: '1rem',
                '& .MuiAlert-icon': { fontSize: '1.5rem' }
              }}
            >
              คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก กรุณาบันทึกก่อนออกจากหน้านี้
            </Alert>
          )}

          {/* Success/Error Messages */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                fontSize: '1rem',
                '& .MuiAlert-icon': { fontSize: '1.5rem' }
              }} 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                fontSize: '1rem',
                '& .MuiAlert-icon': { fontSize: '1.5rem' }
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Settings Tabs */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 2,
                '& .MuiTab-root': {
                  minHeight: 72,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>

            <Box sx={{ p: 4 }}>
              {activeTab === 0 && renderGeneralSettings()}
              {activeTab === 1 && renderEmailSettings()}
              {activeTab === 2 && renderSecuritySettings()}
              {activeTab === 3 && renderStorageSettings()}
              {activeTab === 4 && renderNotificationSettings()}
            </Box>
          </Paper>
        </Box>

        {/* Test Email Dialog */}
        <Dialog open={testEmailDialog} onClose={() => setTestEmailDialog(false)}>
          <DialogTitle>ทดสอบการส่งอีเมล</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              type="email"
              label="อีเมลปลายทาง"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              sx={{ mt: 1 }}
              placeholder="test@example.com"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestEmailDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleTestEmail} variant="contained" disabled={!testEmail}>
              ส่งทดสอบ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;