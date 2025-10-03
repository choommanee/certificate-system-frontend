import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  School,
  Work,
  PhotoCamera,
  Visibility,
  VisibilityOff,
  Security,
  Notifications,
  History,
  Assignment,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'staff' | 'admin';
  profile: {
    phone?: string;
    department?: string;
    student_id?: string;
    position?: string;
    bio?: string;
    avatar?: string;
  };
  created_at: string;
  last_login?: string;
  certificate_count: number;
  login_history: LoginHistory[];
}

interface LoginHistory {
  id: string;
  login_at: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
}

interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState<PasswordChange>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Mock data
  const mockProfile: UserProfile = {
    id: '1',
    username: 'somchai123',
    email: 'somchai@example.com',
    first_name: 'สมชาย',
    last_name: 'ใจดี',
    role: 'student',
    profile: {
      phone: '08-123-4567',
      department: 'คณะเศรษฐศาสตร์',
      student_id: '6401234567',
      bio: 'นักศึกษาชั้นปีที่ 3 สาขาเศรษฐศาสตร์ธุรกิจ',
      avatar: ''
    },
    created_at: '2024-01-15T10:00:00Z',
    last_login: '2024-03-20T14:30:00Z',
    certificate_count: 5,
    login_history: [
      {
        id: '1',
        login_at: '2024-03-20T14:30:00Z',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true
      },
      {
        id: '2',
        login_at: '2024-03-19T09:15:00Z',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true
      },
      {
        id: '3',
        login_at: '2024-03-18T16:45:00Z',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        success: false
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile(mockProfile);
      setLoading(false);
    }, 1000);
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    if (profile) {
      if (field.startsWith('profile.')) {
        const profileField = field.replace('profile.', '');
        setProfile({
          ...profile,
          profile: {
            ...profile.profile,
            [profileField]: value
          }
        });
      } else {
        setProfile({
          ...profile,
          [field]: value
        });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to API
      console.log('Saving profile:', profile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('บันทึกข้อมูลส่วนตัวสำเร็จ');
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      // TODO: Change password via API
      console.log('Changing password');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
      setPasswordDialogOpen(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err: any) {
      setError('ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { title: 'ผู้ดูแลระบบ', color: 'error', icon: <Work /> };
      case 'staff':
        return { title: 'เจ้าหน้าที่', color: 'warning', icon: <Work /> };
      case 'student':
        return { title: 'นักศึกษา', color: 'info', icon: <School /> };
      default:
        return { title: 'ผู้ใช้', color: 'default', icon: <Person /> };
    }
  };

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      {/* Avatar Section */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
            >
              {profile?.first_name?.charAt(0) || 'U'}
            </Avatar>
            {editing && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                size="small"
              >
                <PhotoCamera />
              </IconButton>
            )}
          </Box>
          <Typography variant="h6" gutterBottom>
            {profile?.first_name} {profile?.last_name}
          </Typography>
          <Chip
            icon={getRoleInfo(profile?.role || '').icon}
            label={getRoleInfo(profile?.role || '').title}
            color={getRoleInfo(profile?.role || '').color as any}
            variant="outlined"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              สมาชิกตั้งแต่: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH') : '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              เข้าสู่ระบบล่าสุด: {profile?.last_login ? new Date(profile.last_login).toLocaleString('th-TH') : 'ยังไม่เคยเข้าสู่ระบบ'}
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Profile Form */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">ข้อมูลส่วนตัว</Typography>
            {!editing ? (
              <Button
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
                variant="outlined"
              >
                แก้ไข
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Cancel />}
                  onClick={() => setEditing(false)}
                  variant="outlined"
                >
                  ยกเลิก
                </Button>
                <Button
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                  variant="contained"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ชื่อ"
                value={profile?.first_name || ''}
                onChange={(e) => handleProfileChange('first_name', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="นามสกุล"
                value={profile?.last_name || ''}
                onChange={(e) => handleProfileChange('last_name', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ชื่อผู้ใช้"
                value={profile?.username || ''}
                onChange={(e) => handleProfileChange('username', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="อีเมล"
                value={profile?.email || ''}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={profile?.profile?.phone || ''}
                onChange={(e) => handleProfileChange('profile.phone', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="หน่วยงาน/คณะ"
                value={profile?.profile?.department || ''}
                onChange={(e) => handleProfileChange('profile.department', e.target.value)}
                disabled={!editing}
              />
            </Grid>
            {profile?.role === 'student' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="รหัสนักศึกษา"
                  value={profile?.profile?.student_id || ''}
                  onChange={(e) => handleProfileChange('profile.student_id', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
            )}
            {(profile?.role === 'staff' || profile?.role === 'admin') && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ตำแหน่ง"
                  value={profile?.profile?.position || ''}
                  onChange={(e) => handleProfileChange('profile.position', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="เกี่ยวกับฉัน"
                value={profile?.profile?.bio || ''}
                onChange={(e) => handleProfileChange('profile.bio', e.target.value)}
                disabled={!editing}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderSecurityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            รหัสผ่าน
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            เปลี่ยนรหัสผ่านของคุณเพื่อความปลอดภัย
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Security />}
            onClick={() => setPasswordDialogOpen(true)}
          >
            เปลี่ยนรหัสผ่าน
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            การเข้าสู่ระบบ
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="การเข้าสู่ระบบสำเร็จ"
                secondary={`${profile?.login_history.filter(h => h.success).length || 0} ครั้ง`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Schedule color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="การเข้าสู่ระบบล้มเหลว"
                secondary={`${profile?.login_history.filter(h => !h.success).length || 0} ครั้ง`}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderActivityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            เกียรติบัตรของฉัน
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Badge badgeContent={profile?.certificate_count} color="primary">
              <Assignment sx={{ fontSize: 40 }} />
            </Badge>
            <Box>
              <Typography variant="h4" color="primary.main">
                {profile?.certificate_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรทั้งหมด
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ประวัติการเข้าสู่ระบบ
          </Typography>
          <List dense>
            {profile?.login_history.slice(0, 3).map((history) => (
              <ListItem key={history.id}>
                <ListItemIcon>
                  {history.success ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Cancel color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={new Date(history.login_at).toLocaleString('th-TH')}
                  secondary={`IP: ${history.ip_address}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            ข้อมูลส่วนตัว
          </Typography>
          <Typography variant="body1" color="text.secondary">
            จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
          </Typography>
        </Box>

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

        {/* Profile Tabs */}
        <Card>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="ข้อมูลส่วนตัว" icon={<Person />} iconPosition="start" />
            <Tab label="ความปลอดภัย" icon={<Security />} iconPosition="start" />
            <Tab label="กิจกรรม" icon={<History />} iconPosition="start" />
          </Tabs>

          <CardContent sx={{ p: 3 }}>
            {activeTab === 0 && renderProfileTab()}
            {activeTab === 1 && renderSecurityTab()}
            {activeTab === 2 && renderActivityTab()}
          </CardContent>
        </Card>

        {/* Change Password Dialog */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="รหัสผ่านปัจจุบัน"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  label="รหัสผ่านใหม่"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="ยืนยันรหัสผ่านใหม่"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              disabled={!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
            >
              เปลี่ยนรหัสผ่าน
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default UserProfilePage;