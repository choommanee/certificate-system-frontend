import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Paper,
  Stack,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Draw as SignatureIcon,
  Assignment as CertificateIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Notifications as NotificationIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SignerDashboardLayout from '../components/signer/SignerDashboardLayout';
import PendingDocumentsList from '../components/signer/PendingDocumentsList';
import SigningHistory from '../components/signer/SigningHistory';
import SignerAnalytics from '../components/signer/SignerAnalytics';
import NotificationCenter from '../components/signer/NotificationCenter';
import SignatureManagement from '../components/signer/SignatureManagement';
import DocumentViewer from '../components/signer/DocumentViewer';
import DocumentSigningInterface from '../components/signer/DocumentSigningInterface';
import { SigningProgressWidget, QuickStatsWidget, RecentActivityWidget } from '../components/signer/widgets';
import { usePendingDocuments, useSigningStats, useNotifications, useDocumentSigning } from '../hooks/useSigner';
import { PendingDocument, DocumentToSign, SigningForm } from '../types/signer';

const SignerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { documents, loading: documentsLoading, refreshDocuments } = usePendingDocuments();
  const { stats, loading: statsLoading, refreshStats } = useSigningStats();
  const { unreadCount } = useNotifications();
  const { signDocument } = useDocumentSigning();

  // Dialog states
  const [selectedDocument, setSelectedDocument] = useState<PendingDocument | null>(null);
  const [documentToSign, setDocumentToSign] = useState<DocumentToSign | null>(null);
  const [showSignatureManagement, setShowSignatureManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleDocumentSelect = async (document: PendingDocument) => {
    setSelectedDocument(document);
    // In a real implementation, this would load the full document details
    // For now, we'll create a mock DocumentToSign
    const mockDocumentToSign: DocumentToSign = {
      id: document.id,
      title: document.title,
      description: document.description || '',
      activityDetails: {
        id: '1',
        name: document.title,
        type: document.activityType,
        description: document.description || '',
        date: document.requestDate,
        organizer: document.requestedBy.first_name + ' ' + document.requestedBy.last_name
      },
      recipients: [], // Would be loaded from API
      certificatePreview: '/api/placeholder-certificate.png',
      signaturePosition: { x: 50, y: 80, width: 200, height: 80 },
      metadata: {
        totalPages: 1,
        fileSize: 1024000,
        format: 'PDF',
        createdBy: document.requestedBy.first_name + ' ' + document.requestedBy.last_name,
        lastModified: new Date()
      },
      requestedBy: document.requestedBy,
      requestDate: document.requestDate,
      dueDate: document.dueDate,
      priority: document.priority
    };
    setDocumentToSign(mockDocumentToSign);
  };

  const handleDocumentSign = (document: PendingDocument) => {
    handleDocumentSelect(document);
  };

  const handleSigningSubmit = async (signingData: SigningForm): Promise<boolean> => {
    try {
      const success = await signDocument(signingData);
      if (success) {
        setDocumentToSign(null);
        setSelectedDocument(null);
        refreshDocuments();
        refreshStats();
      }
      return success;
    } catch (error) {
      console.error('Signing failed:', error);
      return false;
    }
  };

  const handleDocumentReject = async (reason: string, comments?: string) => {
    // Implementation for document rejection
    console.log('Document rejected:', reason, comments);
    setSelectedDocument(null);
    setDocumentToSign(null);
    refreshDocuments();
  };

  const quickActions = [
    {
      icon: <SignatureIcon />,
      label: 'จัดการลายเซ็น',
      color: 'primary' as const,
      onClick: () => setShowSignatureManagement(true)
    },
    {
      icon: <AnalyticsIcon />,
      label: 'ดูสถิติ',
      color: 'secondary' as const,
      onClick: () => setShowAnalytics(true)
    },
    {
      icon: <NotificationIcon />,
      label: 'การแจ้งเตือน',
      color: 'info' as const,
      onClick: () => setShowNotifications(true),
      badge: unreadCount
    },
    {
      icon: <HistoryIcon />,
      label: 'ประวัติ',
      color: 'success' as const,
      onClick: () => {} // Would navigate to history page
    }
  ];

  return (
    <SignerDashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 1
                }}
              >
                แดชบอร์ดผู้ลงนาม
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  color: 'text.secondary'
                }}
              >
                ยินดีต้อนรับ {user?.first_name} {user?.last_name} - จัดการลายเซ็นและอนุมัติเกียรติบัตร
              </Typography>
            </Box>
            
            <Tooltip title="รีเฟรชข้อมูล">
              <IconButton
                onClick={() => {
                  refreshDocuments();
                  refreshStats();
                }}
                disabled={documentsLoading || statsLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                      {stats?.pendingCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      รอลงนาม
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#f57c00', width: 56, height: 56 }}>
                    <PendingIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {stats?.completedThisMonth || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      ลงนามแล้ว
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                    <ApprovedIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                      {stats?.activeSignatures || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      ลายเซ็นที่ใช้งาน
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                    <SignatureIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {stats?.totalSigned || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      ทั้งหมดในเดือนนี้
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#9c27b0', width: 56, height: 56 }}>
                    <CertificateIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Pending Documents */}
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Badge badgeContent={documents.length} color="error">
                        <PendingIcon color="warning" />
                      </Badge>
                      เอกสารรอลงนาม
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      ดูทั้งหมด
                    </Button>
                  </Box>

                  <PendingDocumentsList
                    onDocumentSelect={handleDocumentSelect}
                    onDocumentSign={handleDocumentSign}
                    compact
                  />
                </CardContent>
              </Card>

              {/* Recent History */}
              <Card elevation={3}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <HistoryIcon color="primary" />
                    ประวัติการลงนามล่าสุด
                  </Typography>

                  <SigningHistory compact />
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Card elevation={3}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    ⚡ การดำเนินการด่วน
                  </Typography>
                  <Stack spacing={2}>
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        fullWidth
                        startIcon={action.badge ? (
                          <Badge badgeContent={action.badge} color="error">
                            {action.icon}
                          </Badge>
                        ) : action.icon}
                        onClick={action.onClick}
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          py: 1.5,
                          justifyContent: 'flex-start'
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Quick Stats Widget */}
              <QuickStatsWidget layout="list" />

              {/* Signing Progress Widget */}
              <SigningProgressWidget />

              {/* Recent Activity Widget */}
              <RecentActivityWidget maxItems={3} />

              {/* Notifications */}
              <NotificationCenter compact />

              {/* Analytics */}
              <SignerAnalytics compact />
            </Stack>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setShowSignatureManagement(true)}
        >
          <AddIcon />
        </Fab>

        {/* Document Viewer Dialog */}
        <Dialog
          open={!!selectedDocument && !documentToSign}
          onClose={() => setSelectedDocument(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { height: '90vh' } }}
        >
          {selectedDocument && (
            <>
              <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                รายละเอียดเอกสาร
              </DialogTitle>
              <DialogContent>
                {/* Document details would be shown here */}
                <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  {selectedDocument.title}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setSelectedDocument(null)}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  ปิด
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleDocumentSign(selectedDocument)}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  ลงนาม
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Document Signing Dialog */}
        <Dialog
          open={!!documentToSign}
          onClose={() => setDocumentToSign(null)}
          maxWidth="xl"
          fullWidth
          PaperProps={{ sx: { height: '95vh' } }}
        >
          {documentToSign && (
            <>
              <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                ลงนามเอกสาร
              </DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                <DocumentSigningInterface
                  document={documentToSign}
                  onSign={handleSigningSubmit}
                  onCancel={() => setDocumentToSign(null)}
                />
              </DialogContent>
            </>
          )}
        </Dialog>

        {/* Signature Management Dialog */}
        <Dialog
          open={showSignatureManagement}
          onClose={() => setShowSignatureManagement(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { height: '90vh' } }}
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            จัดการลายเซ็น
          </DialogTitle>
          <DialogContent>
            <SignatureManagement />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowSignatureManagement(false)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog
          open={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{ sx: { height: '95vh' } }}
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            การวิเคราะห์และรายงาน
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <SignerAnalytics />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowAnalytics(false)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications Dialog */}
        <Dialog
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { height: '90vh' } }}
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            ศูนย์การแจ้งเตือน
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <NotificationCenter />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowNotifications(false)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerDashboardPage;