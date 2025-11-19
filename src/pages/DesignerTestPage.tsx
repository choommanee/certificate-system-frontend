// Test Page for Enhanced Designer with Certificate Template Support

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import SimpleCertificateDesigner from '../components/designer/SimpleCertificateDesigner';
import { SAMPLE_CERTIFICATE_DATA, AVAILABLE_DATA_FIELDS } from '../types/certificate-template';
import DataBindingService from '../services/dataBindingService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { authService } from '../services/authService';
import { User } from '../types';

const DesignerTestPage: React.FC = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleSave = (document: any) => {
    setCurrentDocument(document);
    console.log('Document saved:', document);
    alert('เอกสารถูกบันทึกแล้ว! ดูใน Console สำหรับรายละเอียด');
  };

  const handleExport = (format: 'pdf' | 'png' | 'jpg', document: any) => {
    console.log('Export format:', format, 'Document:', document);
    alert(`ส่งออกเป็น ${format.toUpperCase()} แล้ว! ดูใน Console สำหรับรายละเอียด`);
  };

  const handleAddTemplateVariable = () => {
    // Example: Add a template variable for user's full name
    const userNameBinding = AVAILABLE_DATA_FIELDS.find(field => field.fieldPath === 'user.fullName');
    if (userNameBinding) {
      const templateVar = DataBindingService.createTemplateVariable(
        userNameBinding,
        100,
        100,
        300,
        50
      );
      console.log('Created template variable:', templateVar);
      alert('เพิ่ม Template Variable สำหรับชื่อ-นามสกุลแล้ว! ลองดูใน Canvas');
    }
  };

  const handlePreviewWithData = () => {
    if (currentDocument) {
      try {
        const previewDoc = DataBindingService.previewTemplate(currentDocument, SAMPLE_CERTIFICATE_DATA);
        console.log('Preview document with data:', previewDoc);
        setIsPreviewMode(true);
        alert('แสดงตัวอย่างเกียรติบัตรพร้อมข้อมูลจริงแล้ว!');
      } catch (error) {
        console.error('Preview error:', error);
        alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง: ' + error);
      }
    } else {
      alert('กรุณาบันทึกเอกสารก่อนแสดงตัวอย่าง');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Try to get current user
      authService.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token might be expired
          localStorage.removeItem('token');
          setShowLoginDialog(true);
        });
    } else {
      setShowLoginDialog(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoginError('');
      const response = await authService.login(loginForm);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      setShowLoginDialog(false);
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowLoginDialog(true);
  };

  return (
    <DashboardLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          p: 2,
          boxShadow: 1
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1">
                🎨 Certificate Template Designer
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Canvas-based certificate designer with data binding support
              </Typography>
              {currentUser && (
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  👤 {currentUser.first_name_th} {currentUser.last_name_th} ({typeof currentUser.role === 'string' ? currentUser.role : currentUser.role?.name || 'N/A'})
                </Typography>
              )}
            </Box>

            {/* Preview Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPreviewMode}
                    onChange={(e) => setIsPreviewMode(e.target.checked)}
                    color="default"
                  />
                }
                label="โหมดแสดงตัวอย่าง"
                sx={{ color: 'white' }}
              />

              <Button
                variant="contained"
                color="secondary"
                onClick={handlePreviewWithData}
                disabled={!currentDocument}
                size="small"
              >
                แสดงตัวอย่างพร้อมข้อมูล
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Designer */}
        <Box sx={{ flex: 1, overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
          {isAuthenticated && currentUser ? (
            <SimpleCertificateDesigner
              currentUser={{
                id: String(currentUser.id),
                name: `${currentUser.first_name_th} ${currentUser.last_name_th}`,
                role: typeof currentUser.role === 'string' ? currentUser.role : currentUser.role?.name || ''
              }}
              onSave={handleSave}
              onExport={handleExport}
              isPreviewMode={isPreviewMode}
              certificateData={isPreviewMode ? SAMPLE_CERTIFICATE_DATA : undefined}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                กรุณาเข้าสู่ระบบเพื่อใช้งาน Designer
              </Typography>
            </Box>
          )}
        </Box>

        {/* Login Dialog */}
        <Dialog open={showLoginDialog} onClose={() => {}} maxWidth="sm" fullWidth>
          <DialogTitle>เข้าสู่ระบบ</DialogTitle>
          <DialogContent>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="อีเมล"
              type="email"
              fullWidth
              variant="outlined"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="รหัสผ่าน"
              type="password"
              fullWidth
              variant="outlined"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogin} variant="contained">
              เข้าสู่ระบบ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default DesignerTestPage;
