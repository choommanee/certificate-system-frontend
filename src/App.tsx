import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RoleBasedDashboard from './components/common/RoleBasedDashboard';
import DesignerPage from './pages/DesignerPage';
import DesignerTestPage from './pages/DesignerTestPage';
import HybridDesignerTestPage from './pages/HybridDesignerTestPage';
import FixedDesignerTestPage from './pages/FixedDesignerTestPage';
import BulkOperationsPage from './pages/BulkOperationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VerificationPage from './pages/VerificationPage';
import SearchPage from './pages/SearchPage';
import FileManagerPage from './pages/FileManagerPage';
import CertificateListPage from './pages/CertificateListPage';
import CertificateCreatePage from './pages/CertificateCreatePage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import CertificateEditPage from './pages/CertificateEditPage';
import ApprovalPage from './pages/ApprovalPage';
import UserListPage from './pages/UserListPage';
import UserCreatePage from './pages/UserCreatePage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import SystemStatusPage from './pages/SystemStatusPage';
import TemplateListPage from './pages/TemplateListPage';
import TemplateCreatePage from './pages/TemplateCreatePage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import TemplateDesignerPage from './pages/TemplateDesignerPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ActivityListPage from './pages/ActivityListPage';
import ActivityCreatePage from './pages/ActivityCreatePage';
import SignatoryManagementPage from './pages/SignatoryManagementPage';
import VerificationHistoryPage from './pages/VerificationHistoryPage';
import PublicVerificationPage from './pages/PublicVerificationPage';
import SignerPendingPage from './pages/signer/SignerPendingPage';
import SignerSigningPage from './pages/signer/SignerSigningPage';
import PendingDocumentsPage from './pages/signer/PendingDocumentsPage';
import ApiTestPage from './pages/ApiTestPage';
import DistributionManagementPage from './pages/DistributionManagementPage';
import CertificateGenerationPage from './pages/CertificateGenerationPage';
import QRCodeManagementPage from './pages/QRCodeManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';

// Create Material-UI theme inspired by Fund system
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#388e3c',
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Sarabun", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Sarabun", sans-serif',
    },
    body2: {
      fontFamily: '"Sarabun", sans-serif',
    },
    button: {
      fontFamily: '"Sarabun", sans-serif',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/designer"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <DesignerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <CertificateListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates/create"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <CertificateCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates/:id"
              element={
                <ProtectedRoute>
                  <CertificateDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin', 'signer']}>
                  <CertificateEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals/pending"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin', 'super_admin']}>
                  <PendingApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <TemplateListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/create"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <TemplateDesignerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:id"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <TemplateDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <TemplateDesignerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/designer-test"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <DesignerTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hybrid-designer-test"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <HybridDesignerTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fixed-designer-test"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <FixedDesignerTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ApprovalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-status"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemStatusPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bulk-operations"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <BulkOperationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/files"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <FileManagerPage />
                </ProtectedRoute>
              }
            />
            {/* Activity Management routes */}
            <Route
              path="/activities"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <ActivityListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/create"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <ActivityCreatePage />
                </ProtectedRoute>
              }
            />

            {/* Certificate Generation routes */}
            <Route
              path="/certificates/generate"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <CertificateGenerationPage />
                </ProtectedRoute>
              }
            />

            {/* Distribution Management routes */}
            <Route
              path="/distribution"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <DistributionManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/distribution/email"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <DistributionManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Signatory Management routes */}
            <Route
              path="/signatures"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <SignatoryManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signatories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SignatoryManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signatures/history"
              element={
                <ProtectedRoute allowedRoles={['signer', 'admin']}>
                  <VerificationHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Verification & QR Management routes */}
            <Route
              path="/verification-history"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <VerificationHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qr-management"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <QRCodeManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Audit Log routes */}
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />

            {/* Download Center for students */}
            <Route
              path="/downloads"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CertificateListPage />
                </ProtectedRoute>
              }
            />

            {/* Signer Routes */}
            <Route
              path="/signer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/pending"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <PendingDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/sign"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <SignerSigningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/sign/:id"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <SignerSigningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/urgent"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <CertificateListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/completed"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <CertificateListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/returned"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <CertificateListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/signatures"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <SignatoryManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/signatures/upload"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <SignatoryManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/history"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <VerificationHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/analytics"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/reports/monthly"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/reports/performance"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/notifications"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/notifications/urgent"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/notifications/settings"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/profile"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signer/settings"
              element={
                <ProtectedRoute allowedRoles={['signer']}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Public verification routes - no authentication required */}
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/verify/:code" element={<VerificationPage />} />
            <Route path="/public-verify" element={<PublicVerificationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
