import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Lock as LockIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          <Card
            elevation={10}
            sx={{
              maxWidth: 500,
              width: '100%',
              borderRadius: 4,
              textAlign: 'center'
            }}
          >
            <CardContent sx={{ p: 6 }}>
              {/* Icon */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  color: 'white'
                }}
              >
                <LockIcon sx={{ fontSize: 50 }} />
              </Box>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 2
                }}
              >
                ไม่มีสิทธิ์เข้าถึง
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  color: 'text.secondary',
                  mb: 1
                }}
              >
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              </Typography>

              {user && (
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    color: 'text.secondary',
                    mb: 4
                  }}
                >
                  บทบาทปัจจุบัน: {user.role?.name === 'admin' ? 'ผู้ดูแลระบบ' :
                                   user.role?.name === 'staff' ? 'เจ้าหน้าที่' :
                                   user.role?.name === 'signer' ? 'อาจารย์ผู้ลงนาม' :
                                   user.role?.name === 'student' ? 'นักศึกษา' : 'บุคคลทั่วไป'}
                </Typography>
              )}

              {/* Actions */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={handleGoBack}
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  กลับ
                </Button>
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  หน้าหลัก
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;