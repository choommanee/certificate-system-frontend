import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Container,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Send,
  CheckCircle,
  ArrowBack,
  School,
  VpnKey,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ResetForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [currentStep, setCurrentStep] = useState(token ? 2 : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<ResetForm>({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const steps = [
    'ใส่อีเมล',
    'ตรวจสอบอีเมล',
    'รีเซ็ตรหัสผ่าน'
  ];

  const handleInputChange = (field: keyof ResetForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError('กรุณาใส่อีเมล');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send reset email
      console.log('Sending reset email to:', form.email);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.newPassword || !form.confirmPassword) {
      setError('กรุณาใส่รหัสผ่านใหม่และยืนยันรหัสผ่าน');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to reset password
      console.log('Resetting password with token:', token);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form onSubmit={handleSendResetEmail}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                รีเซ็ตรหัสผ่าน
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ใส่อีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              placeholder="example@university.ac.th"
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? null : <Send />}
              sx={{ mb: 3, py: 1.5, borderRadius: 2, fontWeight: 600 }}
            >
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}
            </Button>
          </form>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              ตรวจสอบอีเมลของคุณ
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง <strong>{form.email}</strong> แล้ว
              <br />
              กรุณาคลิกลิงก์ในอีเมลเพื่อดำเนินการต่อ
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>หมายเหตุ:</strong>
                <br />
                • ตรวจสอบโฟลเดอร์ Spam หากไม่พบอีเมล
                <br />
                • ลิงก์จะหมดอายุใน 1 ชั่วโมง
                <br />
                • หากไม่ได้รับอีเมล กรุณาลองส่งใหม่อีกครั้ง
              </Typography>
            </Alert>

            <Button
              variant="outlined"
              onClick={() => setCurrentStep(0)}
              sx={{ borderRadius: 2 }}
            >
              ส่งอีเมลใหม่
            </Button>
          </Box>
        );

      case 2:
        return (
          <form onSubmit={handleResetPassword}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <VpnKey sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                ตั้งรหัสผ่านใหม่
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ใส่รหัสผ่านใหม่ที่คุณต้องการใช้
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="รหัสผ่านใหม่"
              type={showPassword ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              required
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
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
              helperText="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
            />

            <TextField
              fullWidth
              label="ยืนยันรหัสผ่านใหม่"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
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
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? null : <VpnKey />}
              sx={{ mb: 3, py: 1.5, borderRadius: 2, fontWeight: 600 }}
            >
              {loading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
            </Button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <School sx={{ fontSize: 48, color: 'white', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
            ระบบเกียรติบัตรออนไลน์
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
          </Typography>
        </Box>

        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {/* Stepper */}
          {currentStep < 2 && (
            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {renderStepContent()}

            {/* Back to Login */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                component={Link}
                to="/login"
                startIcon={<ArrowBack />}
                sx={{ textDecoration: 'none' }}
              >
                กลับไปเข้าสู่ระบบ
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Help Section */}
        <Card sx={{ mt: 4, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ต้องการความช่วยเหลือ?
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📞 โทร: 02-613-2200 ต่อ 2301
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📧 อีเมล: certificate@econ.tu.ac.th
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🕐 เวลาทำการ: จันทร์-ศุกร์ 8:30-16:30 น.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PasswordResetPage;