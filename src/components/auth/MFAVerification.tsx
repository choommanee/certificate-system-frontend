import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
  Timer as TimerIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({
  onSuccess,
  onCancel
}) => {
  const { verifyMFA, error, clearError, isLoading } = useEnhancedAuth();
  
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onCancel(); // Auto-cancel when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  // Focus input on mount
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isBackupCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) return;
    
    clearError();
    
    try {
      const success = await verifyMFA(code.trim(), isBackupCode);
      
      if (success) {
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        setCode('');
        
        if (attempts + 1 >= maxAttempts) {
          setTimeout(() => {
            onCancel();
          }, 2000);
        }
      }
    } catch (err) {
      setAttempts(prev => prev + 1);
      setCode('');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (isBackupCode) {
      // Backup codes are alphanumeric
      setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8));
    } else {
      // TOTP codes are numeric
      setCode(value.replace(/\D/g, '').substring(0, 6));
    }
  };

  const toggleBackupCode = () => {
    setIsBackupCode(!isBackupCode);
    setCode('');
    clearError();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCodeValid = isBackupCode ? code.length === 8 : code.length === 6;
  const isMaxAttemptsReached = attempts >= maxAttempts;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'grey.50',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 450,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <SecurityIcon
          sx={{
            fontSize: 64,
            color: 'primary.main',
            mb: 2
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            fontWeight: 'bold',
            mb: 1
          }}
        >
          ยืนยันตัวตน
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            color: 'text.secondary',
            mb: 3
          }}
        >
          {isBackupCode
            ? 'กรอกรหัสสำรองเพื่อเข้าสู่ระบบ'
            : 'กรอกรหัส 6 หลักจากแอป Authenticator'
          }
        </Typography>

        {/* Timer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            p: 1,
            bgcolor: timeLeft <= 60 ? 'error.light' : 'info.light',
            borderRadius: 1
          }}
        >
          <TimerIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              color: timeLeft <= 60 ? 'error.dark' : 'info.dark'
            }}
          >
            เหลือเวลา: {formatTime(timeLeft)}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, textAlign: 'left' }}
            onClose={clearError}
          >
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              {error}
              {isMaxAttemptsReached && (
                <><br />ครบจำนวนครั้งที่อนุญาต กรุณาลองใหม่อีกครั้งในภายหลัง</>
              )}
            </Typography>
          </Alert>
        )}

        {/* Attempts Warning */}
        {attempts > 0 && !isMaxAttemptsReached && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              ความพยายามที่ {attempts} จาก {maxAttempts} ครั้ง
            </Typography>
          </Alert>
        )}

        {/* MFA Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            ref={codeInputRef}
            fullWidth
            value={code}
            onChange={handleCodeChange}
            placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
            disabled={isLoading || isMaxAttemptsReached}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
              endAdornment: isBackupCode && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowBackupCode(!showBackupCode)}
                    edge="end"
                  >
                    {showBackupCode ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '0.2em'
              },
              type: isBackupCode && !showBackupCode ? 'password' : 'text'
            }}
            inputProps={{
              style: { textAlign: 'center' },
              autoComplete: 'one-time-code'
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!isCodeValid || isLoading || isMaxAttemptsReached}
            sx={{
              mb: 2,
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                กำลังตรวจสอบ...
              </>
            ) : (
              'ยืนยัน'
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Toggle between TOTP and Backup Code */}
        <Box sx={{ mb: 2 }}>
          <Link
            component="button"
            type="button"
            onClick={toggleBackupCode}
            disabled={isLoading || isMaxAttemptsReached}
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {isBackupCode
              ? 'ใช้รหัสจากแอป Authenticator'
              : 'ใช้รหัสสำรอง'
            }
          </Link>
        </Box>

        {/* Cancel Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={isLoading}
          sx={{
            fontFamily: 'Sarabun, sans-serif'
          }}
        >
          ยกเลิก
        </Button>

        {/* Help Text */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            color: 'text.secondary',
            mt: 2,
            display: 'block'
          }}
        >
          {isBackupCode
            ? 'รหัสสำรองคือรหัส 8 หลักที่ได้รับเมื่อตั้งค่า MFA'
            : 'เปิดแอป Google Authenticator หรือแอปที่รองรับ TOTP'
          }
        </Typography>
      </Paper>
    </Box>
  );
};

export default MFAVerification;