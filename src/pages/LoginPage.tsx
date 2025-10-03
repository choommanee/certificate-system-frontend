import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
    Chip
} from '@mui/material';
import {
    School as SchoolIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    AdminPanelSettings as AdminIcon,
    Work as StaffIcon,
    School as StudentIcon,
    Draw as SignerIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
    userType: 'admin' | 'staff' | 'signer' | 'student';
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, login } = useAuth();
    const [formData, setFormData] = useState<LoginFormData>({
        userType: 'student',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const userTypes = [
        {
            value: 'admin',
            label: 'ผู้ดูแลระบบ',
            description: 'เพิ่มกิจกรรม ออกเกียรติบัตร จัดการเทมเพลต จัดการผู้ลงนาม',
            icon: AdminIcon,
            color: '#d32f2f',
            placeholder: 'อีเมลผู้ดูแลระบบ (admin@econ.tu.ac.th)'
        },
        {
            value: 'staff',
            label: 'เจ้าหน้าที่',
            description: 'นำเข้าข้อมูล ตรวจสอบความถูกต้อง ออกเกียรติบัตร',
            icon: StaffIcon,
            color: '#388e3c',
            placeholder: 'อีเมลเจ้าหน้าที่ (staff@econ.tu.ac.th)'
        },
        {
            value: 'signer',
            label: 'อาจารย์ผู้ลงนาม',
            description: 'แทรกลายเซ็นในเกียรติบัตร อนุมัติและลงนามเกียรติบัตร',
            icon: SignerIcon,
            color: '#7b1fa2',
            placeholder: 'อีเมลอาจารย์ผู้ลงนาม (signer@econ.tu.ac.th)'
        },
        {
            value: 'student',
            label: 'นักศึกษา',
            description: 'ตรวจสอบและดาวน์โหลดเกียรติบัตรของตนเอง',
            icon: StudentIcon,
            color: '#1976d2',
            placeholder: 'อีเมลนักศึกษา (student@student.tu.ac.th)'
        }
    ];

    const selectedUserType = userTypes.find(type => type.value === formData.userType);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoginLoading(true);

        if (!formData.email || !formData.password) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน');
            setLoginLoading(false);
            return;
        }

        try {
            await login({
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleInputChange = (field: keyof LoginFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                        <Button
                            variant="text"
                            onClick={() => navigate('/')}
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                fontFamily: 'Sarabun, sans-serif',
                                '&:hover': { color: 'white' }
                            }}
                        >
                            กลับหน้าหลัก
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <Card
                        elevation={20}
                        sx={{
                            maxWidth: 500,
                            width: '100%',
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            {/* Header */}
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${selectedUserType?.color} 0%, ${selectedUserType?.color}CC 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                        color: 'white'
                                    }}
                                >
                                    {selectedUserType && <selectedUserType.icon sx={{ fontSize: 40 }} />}
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
                                    เข้าสู่ระบบ
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Sarabun, sans-serif',
                                        color: 'text.secondary'
                                    }}
                                >
                                    เลือกประเภทผู้ใช้และกรอกข้อมูลเพื่อเข้าสู่ระบบ
                                </Typography>
                            </Box>

                            {/* User Type Selection */}
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontFamily: 'Sarabun, sans-serif',
                                        fontWeight: 'bold',
                                        mb: 2,
                                        color: 'text.primary'
                                    }}
                                >
                                    ประเภทผู้ใช้
                                </Typography>
                                <Stack direction="column" spacing={1}>
                                    {userTypes.map((type) => {
                                        const IconComponent = type.icon;
                                        return (
                                            <Paper
                                                key={type.value}
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    border: '2px solid',
                                                    borderColor: formData.userType === type.value ? type.color : 'divider',
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    background: formData.userType === type.value ? `${type.color}08` : 'transparent',
                                                    '&:hover': {
                                                        borderColor: type.color,
                                                        background: `${type.color}05`
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => handleInputChange('userType', type.value)}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '50%',
                                                            bgcolor: type.color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mr: 2,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        <IconComponent sx={{ fontSize: 20 }} />
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontFamily: 'Sarabun, sans-serif',
                                                                fontWeight: 'bold',
                                                                color: 'text.primary'
                                                            }}
                                                        >
                                                            {type.label}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontFamily: 'Sarabun, sans-serif',
                                                                color: 'text.secondary'
                                                            }}
                                                        >
                                                            {type.description}
                                                        </Typography>
                                                    </Box>
                                                    {formData.userType === type.value && (
                                                        <Chip
                                                            label="เลือกแล้ว"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: type.color,
                                                                color: 'white',
                                                                fontFamily: 'Sarabun, sans-serif',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    {/* Email Field */}
                                    <TextField
                                        fullWidth
                                        label="อีเมล"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder={selectedUserType?.placeholder}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: selectedUserType?.color }} />
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
                                                    borderColor: selectedUserType?.color
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: selectedUserType?.color
                                                }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: selectedUserType?.color
                                            }
                                        }}
                                    />

                                    {/* Password Field */}
                                    <TextField
                                        fullWidth
                                        label="รหัสผ่าน"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: selectedUserType?.color }} />
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
                                            sx: { fontFamily: 'Sarabun, sans-serif' }
                                        }}
                                        InputLabelProps={{
                                            sx: { fontFamily: 'Sarabun, sans-serif' }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: selectedUserType?.color
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: selectedUserType?.color
                                                }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: selectedUserType?.color
                                            }
                                        }}
                                    />

                                    {/* Error Message */}
                                    {error && (
                                        <Alert severity="error" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                                            {error}
                                        </Alert>
                                    )}

                                    {/* Login Button */}
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        disabled={!formData.email || !formData.password || loginLoading}
                                        startIcon={loginLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                                        sx={{
                                            bgcolor: selectedUserType?.color,
                                            fontFamily: 'Sarabun, sans-serif',
                                            fontWeight: 'bold',
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            '&:hover': {
                                                bgcolor: selectedUserType?.color,
                                                filter: 'brightness(0.9)'
                                            },
                                            '&:disabled': {
                                                bgcolor: 'grey.300'
                                            }
                                        }}
                                    >
                                        {loginLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                    </Button>
                                </Stack>
                            </form>

                            {/* Test Accounts - Quick Login */}
                            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontFamily: 'Sarabun, sans-serif',
                                        fontWeight: 'bold',
                                        mb: 2,
                                        color: 'text.secondary',
                                        textAlign: 'center'
                                    }}
                                >
                                    บัญชีทดสอบ (คลิกเพื่อ Login)
                                </Typography>
                                <Stack spacing={1.5}>
                                    {/* Admin Account */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: '#d32f2f',
                                                bgcolor: 'rgba(211, 47, 47, 0.05)',
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                        onClick={() => {
                                            setFormData({
                                                userType: 'admin',
                                                email: 'admin@econ.tu.ac.th',
                                                password: 'password123'
                                            });
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AdminIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 600, display: 'block' }}>
                                                        ผู้ดูแลระบบ
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        admin@econ.tu.ac.th
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip label="Admin" size="small" sx={{ bgcolor: '#d32f2f', color: 'white', fontSize: '0.7rem' }} />
                                        </Box>
                                    </Paper>

                                    {/* Staff Account */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: '#388e3c',
                                                bgcolor: 'rgba(56, 142, 60, 0.05)',
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                        onClick={() => {
                                            setFormData({
                                                userType: 'staff',
                                                email: 'staff@econ.tu.ac.th',
                                                password: 'password123'
                                            });
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <StaffIcon sx={{ fontSize: 18, color: '#388e3c' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 600, display: 'block' }}>
                                                        เจ้าหน้าที่
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        staff@econ.tu.ac.th
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip label="Staff" size="small" sx={{ bgcolor: '#388e3c', color: 'white', fontSize: '0.7rem' }} />
                                        </Box>
                                    </Paper>

                                    {/* Signer Account */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: '#7b1fa2',
                                                bgcolor: 'rgba(123, 31, 162, 0.05)',
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                        onClick={() => {
                                            setFormData({
                                                userType: 'signer',
                                                email: 'signer@econ.tu.ac.th',
                                                password: 'password123'
                                            });
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <SignerIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 600, display: 'block' }}>
                                                        อาจารย์ผู้ลงนาม
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        signer@econ.tu.ac.th
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip label="Signer" size="small" sx={{ bgcolor: '#7b1fa2', color: 'white', fontSize: '0.7rem' }} />
                                        </Box>
                                    </Paper>

                                    {/* Student Account */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: '#1976d2',
                                                bgcolor: 'rgba(25, 118, 210, 0.05)',
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                        onClick={() => {
                                            setFormData({
                                                userType: 'student',
                                                email: '66114411001@student.tu.ac.th',
                                                password: 'password123'
                                            });
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <StudentIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 600, display: 'block' }}>
                                                        นักศึกษา
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        66114411001@student.tu.ac.th
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip label="Student" size="small" sx={{ bgcolor: '#1976d2', color: 'white', fontSize: '0.7rem' }} />
                                        </Box>
                                    </Paper>

                                    <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', textAlign: 'center', display: 'block', mt: 1 }}>
                                        รหัสผ่านทั้งหมด: password123
                                    </Typography>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Help Section */}
                <Box sx={{ mt: 8, textAlign: 'center' }}>
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
                    mt: 8
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: 'Sarabun, sans-serif', opacity: 0.8 }}>
                            © 2024 มหาวิทยาลัยธรรมศาสตร์ | ระบบจัดการเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์
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

export default LoginPage;