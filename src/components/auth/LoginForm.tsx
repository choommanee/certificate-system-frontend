import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [role, setRole] = useState<string>('student');

  const handleChange = (field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await login(credentials);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              ระบบเกียรติบัตรออนไลน์
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              คณะเศรษฐศาสตร์
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={credentials.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="รหัสผ่าน"
              type="password"
              value={credentials.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              disabled={isLoading}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>บทบาท</InputLabel>
              <Select
                value={role}
                label="บทบาท"
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <MenuItem value="student">นักศึกษา</MenuItem>
                <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                <MenuItem value="admin">รองคณบดีฝ่ายการนักศึกษา</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'เข้าสู่ระบบ'
              )}
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              ลืมรหัสผ่าน? <Button variant="text" size="small">คลิกที่นี่</Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
