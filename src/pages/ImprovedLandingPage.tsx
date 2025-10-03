import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Grow
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
  VerifiedUser as VerifiedIcon,
  QrCodeScanner as QrIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import statisticsService, { PublicStatistics } from '../services/statisticsService';
import publicService from '../services/publicService';

const ImprovedLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [stats, setStats] = useState<PublicStatistics>({
    totalCertificates: 0,
    totalActivities: 0,
    totalVerifications: 0,
    totalUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);
      const data = await statisticsService.getPublicStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

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
      navigate(`/public-verify?code=${verificationCode.trim()}`);
    } catch (error) {
      setVerificationMessage('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleScanQR = () => {
    navigate('/public-verify?scan=true');
  };

  const features = [
    {
      title: 'ออกแบบเกียรติบัตรออนไลน์',
      description: 'เครื่องมือ Drag & Drop ที่ใช้งานง่าย สำหรับการออกแบบเกียรติบัตรที่สวยงามและเป็นมืออาชีพ',
      icon: <CertificateIcon sx={{ fontSize: 48 }} />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
    },
    {
      title: 'จัดการเทมเพลต',
      description: 'สร้างและจัดการเทมเพลตเกียรติบัตรสำหรับกิจกรรมต่างๆ ของคณะเศรษฐศาสตร์',
      icon: <TemplateIcon sx={{ fontSize: 48 }} />,
      color: '#388e3c',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)'
    },
    {
      title: 'ส่งออก PDF คุณภาพสูง',
      description: 'ส่งออกเกียรติบัตรเป็นไฟล์ PDF ความละเอียดสูง พร้อมสำหรับการพิมพ์และแจกจ่าย',
      icon: <DownloadIcon sx={{ fontSize: 48 }} />,
      color: '#f57c00',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ffa726 100%)'
    },
    {
      title: 'ระบบรักษาความปลอดภัย',
      description: 'ระบบการจัดการสิทธิ์แบบ Role-based เพื่อความปลอดภัยและการควบคุมการเข้าถึง',
      icon: <SecurityIcon sx={{ fontSize: 48 }} />,
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)'
    },
    {
      title: 'QR Code & Verification',
      description: 'ระบบตรวจสอบเกียรติบัตรด้วย QR Code เพื่อความน่าเชื่อถือและป้องกันการปลอมแปลง',
      icon: <QrIcon sx={{ fontSize: 48 }} />,
      color: '#7b1fa2',
      gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)'
    },
    {
      title: 'การทำงานร่วมกัน',
      description: 'รองรับการทำงานเป็นทีม ระหว่างนักศึกษา เจ้าหน้าที่ และผู้มีอำนาจลงนาม',
      icon: <GroupIcon sx={{ fontSize: 48 }} />,
      color: '#00796b',
      gradient: 'linear-gradient(135deg, #00796b 0%, #26a69a 100%)'
    }
  ];

  const displayStats = [
    {
      number: statsLoading ? '...' : `${stats.totalCertificates.toLocaleString()}+`,
      label: 'เกียรติบัตรที่สร้าง',
      icon: <CertificateIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      trend: '+12% จากเดือนที่แล้ว'
    },
    {
      number: statsLoading ? '...' : `${stats.totalActivities.toLocaleString()}+`,
      label: 'กิจกรรมทั้งหมด',
      icon: <TemplateIcon sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      trend: '+8% จากเดือนที่แล้ว'
    },
    {
      number: statsLoading ? '...' : `${stats.totalVerifications.toLocaleString()}+`,
      label: 'การตรวจสอบ',
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      trend: '+25% จากเดือนที่แล้ว'
    },
    {
      number: statsLoading ? '...' : `${stats.totalUsers.toLocaleString()}+`,
      label: 'ผู้ใช้งานในระบบ',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      trend: '+15% จากเดือนที่แล้ว'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }}
               onClick={() => navigate('/')}>
            <SchoolIcon sx={{ mr: 2, fontSize: 36, color: 'white' }} />
            <Box>
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
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
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
              </Typography>
            </Box>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/public-verify')}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ตรวจสอบเกียรติบัตร
            </Button>
            {isAuthenticated ? (
              <>
                <IconButton size="large" onClick={handleUserMenu} color="inherit">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  sx={{ mt: 1 }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      minWidth: 200
                    }
                  }}
                >
                  <MenuItem onClick={() => { navigate('/dashboard'); handleCloseMenu(); }}>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>แดชบอร์ด</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/profile'); handleCloseMenu(); }}>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>โปรไฟล์</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
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
                color="secondary"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 600,
                  px: 3,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            display: { xs: 'none', md: 'block' }
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: { xs: '2rem', md: '3rem' }
                    }}
                  >
                    ระบบเกียรติบัตรออนไลน์
                    <br />
                    ที่ทันสมัยและปลอดภัย
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      mb: 4,
                      opacity: 0.95,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}
                  >
                    สร้าง จัดการ และแจกจ่ายเกียรติบัตรอิเล็กทรอนิกส์
                    <br />
                    พร้อมระบบตรวจสอบความถูกต้องด้วย QR Code
                  </Typography>

                  {/* Feature badges */}
                  <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="ใช้งานง่าย"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontFamily: 'Sarabun, sans-serif'
                      }}
                    />
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="ปลอดภัย"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontFamily: 'Sarabun, sans-serif'
                      }}
                    />
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="รวดเร็ว"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontFamily: 'Sarabun, sans-serif'
                      }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {!isAuthenticated && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        onClick={() => navigate('/login')}
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        เข้าสู่ระบบ
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<VerifiedIcon />}
                      onClick={() => navigate('/public-verify')}
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ตรวจสอบเกียรติบัตร
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grow in timeout={1500}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 3,
                      color: 'text.primary',
                      textAlign: 'center'
                    }}
                  >
                    ตรวจสอบเกียรติบัตรของคุณ
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="กรอกรหัสตรวจสอบ หรือเลขที่เกียรติบัตร"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerification()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: verificationLoading && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Sarabun, sans-serif'
                      }
                    }}
                  />

                  {verificationMessage && (
                    <Alert severity="warning" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
                      {verificationMessage}
                    </Alert>
                  )}

                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleVerification}
                      disabled={verificationLoading}
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 600,
                        py: 1.5
                      }}
                    >
                      ตรวจสอบเกียรติบัตร
                    </Button>

                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        หรือ
                      </Typography>
                    </Divider>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<QrIcon />}
                      onClick={handleScanQR}
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 600,
                        py: 1.5
                      }}
                    >
                      สแกน QR Code
                    </Button>
                  </Stack>
                </Paper>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {displayStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        mb: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        mb: 1,
                        color: stat.color
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        mb: 1,
                        color: 'text.secondary'
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="caption" color="success.main" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        {stat.trend}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            ฟีเจอร์ที่โดดเด่น
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              mb: 6
            }}
          >
            ระบบที่ครบครันสำหรับการจัดการเกียรติบัตรออนไลน์
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Grow in timeout={1000 + index * 150}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: 2,
                          background: feature.gradient,
                          color: 'white',
                          mb: 2
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          lineHeight: 1.7
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            align="center"
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
            align="center"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              mb: 4,
              opacity: 0.95
            }}
          >
            เข้าสู่ระบบเพื่อเริ่มสร้างเกียรติบัตรออนไลน์ของคุณได้เลยวันนี้
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {!isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                เข้าสู่ระบบ
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/public-verify')}
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              ตรวจสอบเกียรติบัตร
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  ระบบเกียรติบัตรออนไลน์
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  lineHeight: 1.7
                }}
              >
                คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
                <br />
                ระบบจัดการเกียรติบัตรออนไลน์ที่ทันสมัยและปลอดภัย
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                เมนูด่วน
              </Typography>
              <Stack spacing={1}>
                <Button
                  onClick={() => navigate('/public-verify')}
                  sx={{
                    justifyContent: 'flex-start',
                    fontFamily: 'Sarabun, sans-serif',
                    color: 'text.secondary'
                  }}
                >
                  ตรวจสอบเกียรติบัตร
                </Button>
                {!isAuthenticated && (
                  <Button
                    onClick={() => navigate('/login')}
                    sx={{
                      justifyContent: 'flex-start',
                      fontFamily: 'Sarabun, sans-serif',
                      color: 'text.secondary'
                    }}
                  >
                    เข้าสู่ระบบ
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                ติดต่อเรา
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  lineHeight: 1.7
                }}
              >
                Email: info@econ.tu.ac.th
                <br />
                Website: https://econ.tu.ac.th
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{
              fontFamily: 'Sarabun, sans-serif'
            }}
          >
            © {new Date().getFullYear()} คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ImprovedLandingPage;
