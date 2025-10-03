import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button, Paper, Typography } from '@mui/material';
import { Lock as LockIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useEnhancedAuth, Permission } from '../../contexts/EnhancedAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: string[];
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/login',
  showUnauthorized = true
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    user,
    canAccess,
    hasAnyRole,
    mfaRequired
  } = useEnhancedAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Handle MFA requirement
  if (mfaRequired) {
    return <Navigate to="/mfa-verification" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (showUnauthorized) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            
            <Typography
              variant="h5"
              sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
            >
              ไม่มีสิทธิ์เข้าใช้งาน
            </Typography>
            
            <Typography
              variant="body1"
              sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3, color: 'text.secondary' }}
            >
              คุณไม่มีสิทธิ์เข้าใช้งานหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>บทบาทปัจจุบัน:</strong> {user?.role}<br />
                <strong>บทบาทที่ต้องการ:</strong> {requiredRoles.join(', ')}
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              onClick={() => window.history.back()}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              กลับหน้าก่อนหน้า
            </Button>
          </Paper>
        </Box>
      );
    }
    
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && !canAccess(requiredPermissions)) {
    if (showUnauthorized) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
            <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            
            <Typography
              variant="h5"
              sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
            >
              สิทธิ์การเข้าใช้งานไม่เพียงพอ
            </Typography>
            
            <Typography
              variant="body1"
              sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3, color: 'text.secondary' }}
            >
              คุณต้องมีสิทธิ์เพิ่มเติมเพื่อเข้าใช้งานฟีเจอร์นี้
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>สิทธิ์ที่ต้องการ:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {requiredPermissions.map((perm, index) => (
                    <li key={index}>
                      {perm.action} on {perm.resource}
                      {perm.conditions && ` (${JSON.stringify(perm.conditions)})`}
                    </li>
                  ))}
                </ul>
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                กลับหน้าก่อนหน้า
              </Button>
              
              <Button
                variant="contained"
                onClick={() => window.location.href = '/dashboard'}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                ไปหน้าหลัก
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }
    
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;