import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import StudentDashboardPage from '../../pages/student/StudentDashboardPage';
import StaffDashboardPage from '../../pages/staff/StaffDashboardPage';
import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';
import SignerDashboardPage from '../../pages/SignerDashboardPage';
import TemplatesPage from '../../pages/TemplatesPage';
import { Box, Typography, Alert } from '@mui/material';
import DashboardLayout from '../dashboard/DashboardLayout';
import SignerDashboardLayout from '../signer/SignerDashboardLayout';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  // Handle specific paths
  const currentPath = location.pathname;

  // Get user role name (support both string and object format)
  const userRole = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();

  // Templates page (Staff/Admin only)
  if (currentPath === '/templates') {
    if (userRole === 'staff' || userRole === 'admin') {
      return <TemplatesPage />;
    } else {
      return (
        <DashboardLayout>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </Alert>
          </Box>
        </DashboardLayout>
      );
    }
  }

  // For other paths, show role-based dashboard content
  const renderRoleBasedContent = () => {
    switch (userRole) {
      case 'student':
        return <StudentDashboardPage />;
      case 'staff':
        return <StaffDashboardPage />;
      case 'signer':
        return <SignerDashboardPage />;
      case 'admin':
        return <AdminDashboardPage />;
      default:
        return (
          <DashboardLayout>
            <Box sx={{ p: 3 }}>
              <Alert severity="warning">
                ไม่พบสิทธิ์การใช้งานที่ถูกต้อง: {userRole} กรุณาติดต่อผู้ดูแลระบบ
              </Alert>
            </Box>
          </DashboardLayout>
        );
    }
  };

  // Handle different paths based on role
  switch (currentPath) {
    case '/dashboard':
    case '/certificates':
    case '/approvals':
    case '/users':
    case '/students':
    case '/settings':
      return renderRoleBasedContent();
    
    default:
      return renderRoleBasedContent();
  }
};

export default RoleBasedDashboard;
