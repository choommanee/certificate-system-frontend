import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Paper,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as CertificateIcon,
  Description as TemplateIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  Star as StarIcon,
  Search as SearchIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');


  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setVerificationMessage('กรุณากรอกรหัสเกียรติบัตร');
      return;
    }

    setVerificationLoading(true);
    setVerificationMessage('');

    try {
      // Navigate to verification page with code
      navigate(`/verify/${verificationCode.trim()}`);
    } catch (error) {
      setVerificationMessage('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setVerificationLoading(false);
    }
  };

  const features = [
    {
      title: 'ออกแบบเกียรติบัตรออนไลน์',
      description: 'เครื่องมือ Drag & Drop ที่ใช้งานง่าย สำหรับการออกแบบเกียรติบัตรที่สวยงามและเป็นมืออาชีพ',
      icon: <CertificateIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: 'จัดการเทมเพลต',
      description: 'สร้างและจัดการเทมเพลตเกียรติบัตรสำหรับกิจกรรมต่างๆ ของคณะเศรษฐศาสตร์',
      icon: <TemplateIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c'
    },
    {
      title: 'ส่งออก PDF คุณภาพสูง',
      description: 'ส่งออกเกียรติบัตรเป็นไฟล์ PDF ความละเอียดสูง พร้อมสำหรับการพิมพ์และแจกจ่าย',
      icon: <DownloadIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00'
    },
    {
      title: 'ระบบรักษาความปลอดภัย',
      description: 'ระบบการจัดการสิทธิ์แบบ Role-based เพื่อความปลอดภัยและการควบคุมการเข้าถึง',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f'
    },
    {
      title: 'ประสิทธิภาพสูง',
      description: 'ระบบที่ตอบสนองเร็ว ใช้งานง่าย และรองรับการทำงานหลายคนพร้อมกัน',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2'
    },
    {
      title: 'การทำงานร่วมกัน',
      description: 'รองรับการทำงานเป็นทีม ระหว่างนักศึกษา เจ้าหน้าที่ และรองคณบดีฝ่ายการนักศึกษา',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: '#00796b'
    }
  ];

  const stats = [
    { number: '500+', label: 'เกียรติบัตรที่สร้าง', icon: <CertificateIcon />, color: '#1976d2' },
    { number: '50+', label: 'เทมเพลตพร้อมใช้', icon: <TemplateIcon />, color: '#388e3c' },
    { number: '100+', label: 'ผู้ใช้งานในระบบ', icon: <GroupIcon />, color: '#f57c00' },
    { number: '99.9%', label: 'ความพึงพอใจ', icon: <StarIcon />, color: '#d32f2f' }
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SchoolIcon sx={{ mr: 2, fontSize: 32, color: 'white' }} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.2
                }}
              >
                ระบบเกียรติบัตรออนไลน์
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem'
                }}
              >
                คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
              </Typography>
            </Box>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <IconButton size="large" onClick={handleUserMenu} color="inherit">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} sx={{ mt: 1 }}>
                  <MenuItem onClick={() => { navigate('/dashboard'); handleCloseMenu(); }}>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>แดชบอร์ด</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/certificates'); handleCloseMenu(); }}>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>เกียรติบัตร</Typography>
                  </MenuItem>
                  {(user?.role === 'staff' || user?.role === 'admin') && (
                    <MenuItem onClick={() => { navigate('/templates'); handleCloseMenu(); }}>
                      <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>แม่แบบ</Typography>
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    handleCloseMenu();
                  }}>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif', color: 'error.main' }}>
                      ออกจากระบบ
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontFamily: 'Sarabun, sans-serif',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleCloseMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          color: 'white',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Box sx={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  สร้างเกียรติบัตร
                  <br />
                  <Box component="span" sx={{ color: '#ffeb3b' }}>ออนไลน์</Box>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    lineHeight: 1.4
                  }}
                >
                  ระบบจัดการเกียรติบัตรที่ทันสมัย สำหรับคณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  {!isAuthenticated ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LoginIcon />}
                      onClick={() => navigate('/login')}
                      sx={{
                        bgcolor: '#ffeb3b',
                        color: '#1976d2',
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: '#fff59d',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(255, 235, 59, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      เริ่มใช้งาน
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        bgcolor: '#ffeb3b',
                        color: '#1976d2',
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: '#fff59d',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(255, 235, 59, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ไปยังแดชบอร์ด
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
            <Box sx={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                {/* Certificate Verification Section */}
                <Paper
                  elevation={20}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <VerifiedIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: '#1976d2',
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      ตรวจสอบเกียรติบัตร
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: 'text.secondary',
                        mb: 3
                      }}
                    >
                      กรอกรหัสเกียรติบัตรเพื่อตรวจสอบความถูกต้อง
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="รหัสเกียรติบัตร"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="กรอกรหัสเกียรติบัตร เช่น CERT-2024-001"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#1976d2' }} />
                          </InputAdornment>
                        ),
                        sx: { fontFamily: 'Sarabun, sans-serif' }
                      }}
                      InputLabelProps={{
                        sx: { fontFamily: 'Sarabun, sans-serif' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2'
                        }
                      }}
                    />

                    {verificationMessage && (
                      <Alert
                        severity={verificationMessage.includes('ข้อผิดพลาด') ? 'error' : 'info'}
                        sx={{ fontFamily: 'Sarabun, sans-serif' }}
                      >
                        {verificationMessage}
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleVerification}
                      disabled={verificationLoading}
                      startIcon={<VerifiedIcon />}
                      sx={{
                        bgcolor: '#4caf50',
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: '#45a049'
                        },
                        '&:disabled': {
                          bgcolor: 'grey.300'
                        }
                      }}
                    >
                      {verificationLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบเกียรติบัตร'}
                    </Button>
                  </Stack>
                </Paper>

                {/* Sample Certificate */}
                <Paper
                  elevation={10}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textAlign: 'center',
                    transform: { md: 'rotate(2deg)' },
                    '&:hover': { transform: { md: 'rotate(0deg)' } },
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <CertificateIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      color: '#1976d2',
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    เกียรติบัตรตัวอย่าง
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      color: 'text.secondary'
                    }}
                  >
                    ออกแบบได้ตามต้องการ
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Certificate Verification Section */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
                mb: 2,
                color: 'text.primary'
              }}
            >
              ตรวจสอบเกียรติบัตร
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                color: 'text.secondary',
                mb: 6
              }}
            >
              สำหรับบุคคลทั่วไป ตรวจสอบความถูกต้องของเกียรติบัตรได้ทันที
            </Typography>
          </Box>

          <Paper
            elevation={10}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Box sx={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      color: '#4caf50',
                      mb: 2
                    }}
                  >
                    ตรวจสอบทันที
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      color: 'text.secondary',
                      lineHeight: 1.6
                    }}
                  >
                    ไม่ต้องสมัครสมาชิก<br />
                    ใช้งานได้ทันที<br />
                    ตรวจสอบได้ 24 ชั่วโมง
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2
                    }}
                  >
                    กรอกรหัสเกียรติบัตรเพื่อตรวจสอบ
                  </Typography>

                  <TextField
                    fullWidth
                    label="รหัสเกียรติบัตร"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="กรอกรหัสเกียรติบัตร เช่น CERT-2024-001"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#4caf50' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        fontFamily: 'Sarabun, sans-serif',
                        fontSize: '1.1rem'
                      }
                    }}
                    InputLabelProps={{
                      sx: { fontFamily: 'Sarabun, sans-serif' }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4caf50'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4caf50'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#4caf50'
                      }
                    }}
                  />

                  {verificationMessage && (
                    <Alert
                      severity={verificationMessage.includes('ข้อผิดพลาด') ? 'error' : 'info'}
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      {verificationMessage}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleVerification}
                    disabled={verificationLoading}
                    startIcon={<VerifiedIcon />}
                    sx={{
                      bgcolor: '#4caf50',
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      py: 2,
                      fontSize: '1.2rem',
                      '&:hover': {
                        bgcolor: '#45a049',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                      },
                      '&:disabled': {
                        bgcolor: 'grey.300'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {verificationLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบเกียรติบัตร'}
                  </Button>

                  <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        color: '#4caf50',
                        mb: 1
                      }}
                    >
                      💡 วิธีการใช้งาน
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: 'text.secondary',
                        lineHeight: 1.6
                      }}
                    >
                      1. กรอกรหัสเกียรติบัตรที่ได้รับ<br />
                      2. กดปุ่ม "ตรวจสอบเกียรติบัตร"<br />
                      3. ระบบจะแสดงข้อมูลเกียรติบัตรและสถานะความถูกต้อง
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Box key={index} sx={{ xs: 6, md: 3, p: 1 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}20`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${stat.color}20`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: 'white'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: stat.color,
                      mb: 1
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      color: 'text.secondary'
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
                mb: 2,
                color: 'text.primary'
              }}
            >
              ฟีเจอร์ที่โดดเด่น
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              เครื่องมือครบครันสำหรับการจัดการเกียรติบัตรออนไลน์
              ที่ตอบสนองทุกความต้องการของคณะเศรษฐศาสตร์
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ xs: 12, md: 6, lg: 4, p: 2 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 40px ${feature.color}20`,
                      borderColor: feature.color
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        bgcolor: `${feature.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: feature.color
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        mb: 2,
                        color: 'text.primary'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        flexGrow: 1
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              พร้อมเริ่มต้นแล้วหรือยัง?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                mb: 4,
                opacity: 0.9
              }}
            >
              เข้าร่วมกับเราและสร้างเกียรติบัตรที่สวยงามสำหรับกิจกรรมของคุณ
            </Typography>
            {!isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#ffeb3b',
                  color: '#1976d2',
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  '&:hover': {
                    bgcolor: '#fff59d',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255, 235, 59, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                เริ่มใช้งานฟรี
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Box sx={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SchoolIcon sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    ระบบเกียรติบัตรออนไลน์
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>
                    Certificate Management System
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  opacity: 0.8,
                  lineHeight: 1.6
                }}
              >
                ระบบจัดการเกียรติบัตรออนไลน์สำหรับคณะเศรษฐศาสตร์
                มหาวิทยาลัยธรรมศาสตร์ ที่ช่วยให้การสร้างและจัดการเกียรติบัตรเป็นเรื่องง่าย
              </Typography>
            </Box>

            <Box sx={{ xs: 12, md: 6 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 3 }}>
                ติดต่อเรา
              </Typography>
              <Stack spacing={2}>
                <Typography sx={{ fontFamily: 'Sarabun, sans-serif', opacity: 0.8 }}>
                  📞 02-613-2200 ต่อ 2301
                </Typography>
                <Typography sx={{ fontFamily: 'Sarabun, sans-serif', opacity: 0.8 }}>
                  📧 certificate@econ.tu.ac.th
                </Typography>
                <Typography sx={{ fontFamily: 'Sarabun, sans-serif', opacity: 0.8 }}>
                  🕐 เวลาทำการ: จันทร์-ศุกร์ 8:30-16:30 น.
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              © 2024 มหาวิทยาลัยธรรมศาสตร์ | ระบบจัดการเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', opacity: 0.6, mt: 1 }}>
              Thammasat University | Faculty of Economics Certificate Management System
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
