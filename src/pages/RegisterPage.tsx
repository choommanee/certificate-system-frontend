import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
  AdminPanelSettings as AdminIcon,
  Work as StaffIcon,
  School as StudentIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { RegisterRequest } from '../types';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'staff' | 'admin';
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const roleOptions = [
    {
      value: 'student',
      label: 'นักศึกษา',
      description: 'สำหรับนักศึกษาที่ต้องการใช้งานระบบเกียรติบัตร',
      icon: StudentIcon,
      color: '#1976d2',
    },
    {
      value: 'staff',
      label: 'เจ้าหน้าที่',
      description: 'สำหรับเจ้าหน้าที่จัดการและออกแบบเกียรติบัตร',
      icon: StaffIcon,
      color: '#388e3c',
    },
    {
      value: 'admin',
      label: 'รองคณบดีฝ่ายการนักศึกษา',
      description: 'สำหรับผู้ดูแลระบบและอนุมัติเกียรติบัตร',
      icon: AdminIcon,
      color: '#d32f2f',
    }
  ];

  const selectedRole = roleOptions.find(role => role.value === formData.role);

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      return 'กรุณากรอกข้อมูลให้ครบถ้วน';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'รหัสผ่านไม่ตรงกัน';
    }

    if (formData.password.length < 6) {
      return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setRegisterLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      };

      await authService.register(registerData);
      setSuccess('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'การสมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  ระบบเกียรติบัตรออนไลน์
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              variant="outlined"
            >
              กลับไปเข้าสู่ระบบ
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Main Registration Card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Card
            elevation={20}
            sx={{
              width: '100%',
              maxWidth: 600,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {selectedRole && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '50%',
                        backgroundColor: `${selectedRole.color}15`,
                        border: `2px solid ${selectedRole.color}30`
                      }}
                    >
                      <selectedRole.icon sx={{ fontSize: 40, color: selectedRole.color }} />
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  สมัครสมาชิก
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    color: 'text.secondary'
                  }}
                >
                  สร้างบัญชีใหม่สำหรับระบบเกียรติบัตรออนไลน์
                </Typography>
              </Box>

              {/* Role Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    mb: 2,
                    color: 'text.primary'
                  }}
                >
                  เลือกประเภทผู้ใช้งาน
                </Typography>
                <Grid container spacing={2}>
                  {roleOptions.map((role) => (
                    <Grid item xs={12} sm={4} key={role.value}>
                      <Card
                        onClick={() => handleInputChange('role', role.value)}
                        sx={{
                          cursor: 'pointer',
                          border: formData.role === role.value ? `2px solid ${role.color}` : '1px solid #e0e0e0',
                          backgroundColor: formData.role === role.value ? `${role.color}08` : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: role.color,
                            backgroundColor: `${role.color}05`
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <role.icon sx={{ fontSize: 32, color: role.color, mb: 1 }} />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: 'Sarabun, sans-serif',
                              fontWeight: 'bold',
                              color: 'text.primary'
                            }}
                          >
                            {role.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Name Fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ชื่อ"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Sarabun, sans-serif',
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Sarabun, sans-serif',
                          }
                        }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="นามสกุล"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontFamily: 'Sarabun, sans-serif',
                          },
                          '& .MuiInputLabel-root': {
                            fontFamily: 'Sarabun, sans-serif',
                          }
                        }}
                        required
                      />
                    </Grid>
                  </Grid>

                  {/* Email */}
                  <TextField
                    fullWidth
                    label="อีเมล"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={
                      formData.role === 'student' ? 'student@student.tu.ac.th' :
                      formData.role === 'staff' ? 'staff@econ.tu.ac.th' :
                      'admin@econ.tu.ac.th'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Sarabun, sans-serif',
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Sarabun, sans-serif',
                      }
                    }}
                    required
                  />

                  {/* Password */}
                  <TextField
                    fullWidth
                    label="รหัสผ่าน"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Sarabun, sans-serif',
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Sarabun, sans-serif',
                      }
                    }}
                    required
                  />

                  {/* Confirm Password */}
                  <TextField
                    fullWidth
                    label="ยืนยันรหัสผ่าน"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Sarabun, sans-serif',
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: 'Sarabun, sans-serif',
                      }
                    }}
                    required
                  />

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert severity="error" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      {success}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={registerLoading}
                    startIcon={registerLoading ? <CircularProgress size={20} /> : <RegisterIcon />}
                    sx={{
                      py: 1.5,
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      background: selectedRole ? `linear-gradient(45deg, ${selectedRole.color}, ${selectedRole.color}CC)` : undefined,
                      '&:hover': {
                        background: selectedRole ? `linear-gradient(45deg, ${selectedRole.color}DD, ${selectedRole.color}AA)` : undefined,
                      }
                    }}
                  >
                    {registerLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                  </Button>

                  {/* Login Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: 'text.secondary'
                      }}
                    >
                      มีบัญชีอยู่แล้ว?{' '}
                      <Button
                        component={Link}
                        to="/login"
                        variant="text"
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          fontWeight: 'bold',
                          textDecoration: 'none'
                        }}
                      >
                        เข้าสู่ระบบ
                      </Button>
                    </Typography>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* Help Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
                mb: 3,
                color: 'text.primary'
              }}
            >
              ต้องการความช่วยเหลือ?
            </Typography>
            <Stack spacing={2}>
              <Typography sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}>
                📞 โทร: 02-613-2200 ต่อ 2301
              </Typography>
              <Typography sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}>
                📧 อีเมล: certificate@econ.tu.ac.th
              </Typography>
              <Typography sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}>
                🕐 เวลาทำการ: จันทร์-ศุกร์ 8:30-16:30 น.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          py: 3,
          mt: 4
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif', opacity: 0.8 }}>
              © 2024 มหาวิทยาลัยธรรมศาสตร์ | ระบบจัดการเกียรติบัตรออนไลน์ คณะเศรษฐศาสตr์
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Inter, sans-serif',
                opacity: 0.6,
                mt: 1,
                display: 'block'
              }}
            >
              Thammasat University | Faculty of Economics Certificate Management System
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default RegisterPage;
