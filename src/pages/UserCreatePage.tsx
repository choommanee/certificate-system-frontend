import React, { useState } from 'react';
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
  Alert,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  InputAdornment,
  FormHelperText,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  Email,
  Phone,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Work,
  School,
  PhotoCamera,
  Check,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface UserForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'staff' | 'admin';
  profile: {
    phone?: string;
    department?: string;
    student_id?: string;
    position?: string;
  };
}

const steps = ['ข้อมูลพื้นฐาน', 'บัญชีผู้ใช้', 'ข้อมูลเพิ่มเติม', 'ตรวจสอบและบันทึก'];

const UserCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<UserForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'student',
    profile: {}
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 0:
        if (!form.first_name.trim()) newErrors.first_name = 'กรุณากรอกชื่อ';
        if (!form.last_name.trim()) newErrors.last_name = 'กรุณากรอกนามสกุล';
        if (!form.role) newErrors.role = 'กรุณาเลือกบทบาท';
        break;
      case 1:
        if (!form.username.trim()) newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
        if (form.username.length < 3) newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
        if (!form.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
        if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        if (!form.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
        if (form.password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
        break;
      case 2:
        if (form.role === 'student' && !form.profile.student_id) {
          newErrors.student_id = 'กรุณากรอกรหัสนักศึกษา';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: string, value: any) => {
    if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '');
      setForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      // TODO: Submit to API
      console.log('Creating user:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/users', { 
        state: { message: 'สร้างผู้ใช้ใหม่สำเร็จ' }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: <AdminPanelSettings />,
          title: 'ผู้ดูแลระบบ',
          description: 'มีสิทธิ์เข้าถึงและจัดการระบบทั้งหมด',
          color: 'error'
        };
      case 'staff':
        return {
          icon: <Work />,
          title: 'เจ้าหน้าที่',
          description: 'สามารถสร้างและจัดการเกียรติบัตร',
          color: 'warning'
        };
      case 'student':
        return {
          icon: <School />,
          title: 'นักศึกษา',
          description: 'สามารถดูและดาวน์โหลดเกียรติบัตรของตนเอง',
          color: 'info'
        };
      default:
        return {
          icon: <Person />,
          title: 'ผู้ใช้',
          description: '',
          color: 'default'
        };
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลส่วนตัว
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ชื่อ"
                    value={form.first_name}
                    onChange={(e) => handleFormChange('first_name', e.target.value)}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="นามสกุล"
                    value={form.last_name}
                    onChange={(e) => handleFormChange('last_name', e.target.value)}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.role} required>
                    <InputLabel>บทบาท</InputLabel>
                    <Select
                      value={form.role}
                      label="บทบาท"
                      onChange={(e) => handleFormChange('role', e.target.value)}
                    >
                      <MenuItem value="student">นักศึกษา</MenuItem>
                      <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                      <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                {/* Role Information */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${getRoleInfo(form.role).color}.main` }}>
                        {getRoleInfo(form.role).icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {getRoleInfo(form.role).title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getRoleInfo(form.role).description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลบัญชีผู้ใช้
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ชื่อผู้ใช้"
                    value={form.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    error={!!errors.username}
                    helperText={errors.username || 'ใช้สำหรับเข้าสู่ระบบ (อย่างน้อย 3 ตัวอักษร)'}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="อีเมล"
                    value={form.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="รหัสผ่าน"
                    value={form.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || 'อย่างน้อย 6 ตัวอักษร'}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="ยืนยันรหัสผ่าน"
                    value={form.confirmPassword}
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    required
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
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลเพิ่มเติม
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="เบอร์โทรศัพท์"
                    value={form.profile.phone || ''}
                    onChange={(e) => handleFormChange('profile.phone', e.target.value)}
                    placeholder="02-123-4567 หรือ 08-123-4567"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="หน่วยงาน/คณะ"
                    value={form.profile.department || ''}
                    onChange={(e) => handleFormChange('profile.department', e.target.value)}
                    placeholder="เช่น คณะเศรษฐศาสตร์"
                  />
                </Grid>
                
                {form.role === 'student' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="รหัสนักศึกษา"
                      value={form.profile.student_id || ''}
                      onChange={(e) => handleFormChange('profile.student_id', e.target.value)}
                      error={!!errors.student_id}
                      helperText={errors.student_id}
                      placeholder="เช่น 6401234567"
                      required
                    />
                  </Grid>
                )}
                
                {(form.role === 'staff' || form.role === 'admin') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ตำแหน่ง"
                      value={form.profile.position || ''}
                      onChange={(e) => handleFormChange('profile.position', e.target.value)}
                      placeholder="เช่น เจ้าหน้าที่, หัวหน้างาน"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ตรวจสอบข้อมูลก่อนบันทึก
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ข้อมูลส่วนตัว
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary="ชื่อ-นามสกุล"
                          secondary={`${form.first_name} ${form.last_name}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {getRoleInfo(form.role).icon}
                        </ListItemIcon>
                        <ListItemText
                          primary="บทบาท"
                          secondary={getRoleInfo(form.role).title}
                        />
                      </ListItem>
                      {form.profile.phone && (
                        <ListItem>
                          <ListItemIcon>
                            <Phone />
                          </ListItemIcon>
                          <ListItemText
                            primary="เบอร์โทรศัพท์"
                            secondary={form.profile.phone}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ข้อมูลบัญชี
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText
                          primary="ชื่อผู้ใช้"
                          secondary={form.username}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText
                          primary="อีเมล"
                          secondary={form.email}
                        />
                      </ListItem>
                      {form.profile.department && (
                        <ListItem>
                          <ListItemIcon>
                            <Work />
                          </ListItemIcon>
                          <ListItemText
                            primary="หน่วยงาน"
                            secondary={form.profile.department}
                          />
                        </ListItem>
                      )}
                      {form.profile.student_id && (
                        <ListItem>
                          <ListItemIcon>
                            <School />
                          </ListItemIcon>
                          <ListItemText
                            primary="รหัสนักศึกษา"
                            secondary={form.profile.student_id}
                          />
                        </ListItem>
                      )}
                      {form.profile.position && (
                        <ListItem>
                          <ListItemIcon>
                            <Work />
                          </ListItemIcon>
                          <ListItemText
                            primary="ตำแหน่ง"
                            secondary={form.profile.position}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/users')}
            sx={{ mr: 2 }}
          >
            กลับ
          </Button>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              เพิ่มผู้ใช้ใหม่
            </Typography>
            <Typography variant="body1" color="text.secondary">
              สร้างบัญชีผู้ใช้ใหม่สำหรับระบบเกียรติบัตรออนไลน์
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Box sx={{ mb: 3 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                ย้อนกลับ
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={<Save />}
                >
                  {loading ? 'กำลังบันทึก...' : 'สร้างผู้ใช้'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  ถัดไป
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default UserCreatePage;