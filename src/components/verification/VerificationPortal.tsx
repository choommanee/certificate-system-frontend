import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  QrCodeScanner,
  Search,
  Verified,
  Error,
  Person,
  School,
  DateRange,
  Assignment,
  Download,
  Share,
  Print,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

interface CertificateData {
  id: string;
  recipient_name: string;
  recipient_email: string;
  template_name: string;
  issued_date: string;
  issuer_name: string;
  issuer_organization: string;
  verification_code: string;
  status: 'valid' | 'revoked' | 'expired';
  template_variables: Record<string, any>;
  qr_code_url?: string;
}

interface VerificationResult {
  success: boolean;
  certificate?: CertificateData;
  error?: string;
  verification_count?: number;
  last_verified?: string;
}

const VerificationPortal: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);

  // Mock verification function
  const handleVerification = async (code: string) => {
    setIsVerifying(true);
    setResult(null);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock verification result
      if (code.toLowerCase().includes('invalid')) {
        setResult({
          success: false,
          error: 'Certificate not found or verification code is invalid',
        });
      } else if (code.toLowerCase().includes('revoked')) {
        setResult({
          success: false,
          error: 'This certificate has been revoked',
        });
      } else {
        // Mock valid certificate
        const mockCertificate: CertificateData = {
          id: 'cert-12345',
          recipient_name: 'John Doe',
          recipient_email: 'john.doe@example.com',
          template_name: 'Course Completion Certificate',
          issued_date: '2024-01-15',
          issuer_name: 'Dr. Jane Smith',
          issuer_organization: 'Tech Academy',
          verification_code: code,
          status: 'valid',
          template_variables: {
            course_name: 'Advanced React Development',
            completion_date: '2024-01-15',
            grade: 'A',
            duration: '40 hours',
          },
        };

        setResult({
          success: true,
          certificate: mockCertificate,
          verification_count: 12,
          last_verified: '2024-01-20T10:30:00Z',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Verification service is temporarily unavailable',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim()) {
      handleVerification(verificationCode.trim());
    }
  };

  const handleQrScan = (scannedCode: string) => {
    setVerificationCode(scannedCode);
    setShowQrScanner(false);
    handleVerification(scannedCode);
  };

  const handleDownloadCertificate = () => {
    // Mock download functionality
    alert('Certificate download started...');
  };

  const handleShareCertificate = () => {
    if (result?.certificate) {
      const shareUrl = `${window.location.origin}/verify/${result.certificate.verification_code}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Verification link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'revoked': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle />;
      case 'revoked': return <Cancel />;
      case 'expired': return <Error />;
      default: return <Error />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Verified sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            ตรวจสอบเกียรติบัตร
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ป้อนรหัสตรวจสอบหรือสแกน QR Code เพื่อตรวจสอบความถูกต้องของเกียรติบัตร
          </Typography>
        </Box>

      {/* Verification Form */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Verification Code"
                placeholder="Enter verification code (e.g., CERT-ABC123)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isVerifying}
                helperText="Enter the verification code found on your certificate"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Search />}
                  disabled={!verificationCode.trim() || isVerifying}
                  sx={{ flexGrow: 1 }}
                >
                  {isVerifying ? <CircularProgress size={20} /> : 'Verify'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  onClick={() => setShowQrScanner(true)}
                  disabled={isVerifying}
                >
                  Scan
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Sample codes for testing */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Sample codes for testing:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="CERT-VALID123"
              size="small"
              onClick={() => setVerificationCode('CERT-VALID123')}
              clickable
            />
            <Chip
              label="CERT-REVOKED456"
              size="small"
              onClick={() => setVerificationCode('CERT-REVOKED456')}
              clickable
            />
            <Chip
              label="CERT-INVALID789"
              size="small"
              onClick={() => setVerificationCode('CERT-INVALID789')}
              clickable
            />
          </Box>
        </Box>
      </Paper>

      {/* Verification Result */}
      {result && (
        <Paper sx={{ p: 4 }}>
          {result.success && result.certificate ? (
            // Valid Certificate
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ✓ Certificate Verified Successfully
                </Typography>
                <Typography variant="body2">
                  This certificate is authentic and has been verified {result.verification_count} times.
                  Last verified: {new Date(result.last_verified!).toLocaleString()}
                </Typography>
              </Alert>

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      {result.certificate.template_name}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(result.certificate.status)}
                      label={result.certificate.status.toUpperCase()}
                      color={getStatusColor(result.certificate.status) as any}
                    />
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText
                            primary="Recipient"
                            secondary={`${result.certificate.recipient_name} (${result.certificate.recipient_email})`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <School />
                          </ListItemIcon>
                          <ListItemText
                            primary="Issuer"
                            secondary={`${result.certificate.issuer_name}, ${result.certificate.issuer_organization}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <DateRange />
                          </ListItemIcon>
                          <ListItemText
                            primary="Issue Date"
                            secondary={formatDate(result.certificate.issued_date)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Assignment />
                          </ListItemIcon>
                          <ListItemText
                            primary="Certificate ID"
                            secondary={result.certificate.id}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Certificate Details
                      </Typography>
                      <List dense>
                        {Object.entries(result.certificate.template_variables).map(([key, value]) => (
                          <ListItem key={key}>
                            <ListItemText
                              primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              secondary={value}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<Verified />}
                      onClick={() => setShowCertificateDialog(true)}
                    >
                      View Certificate
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleDownloadCertificate}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShareCertificate}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            // Invalid Certificate
            <Alert severity="error">
              <Typography variant="h6" gutterBottom>
                ✗ Certificate Verification Failed
              </Typography>
              <Typography variant="body2">
                {result.error}
              </Typography>
            </Alert>
          )}
        </Paper>
      )}

      {/* QR Scanner Dialog */}
      <Dialog
        open={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 1,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <QrCodeScanner sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                QR Code Scanner would be implemented here
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => handleQrScan('CERT-VALID123')}
              >
                Simulate Scan (Valid)
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrScanner(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Preview Dialog */}
      <Dialog
        open={showCertificateDialog}
        onClose={() => setShowCertificateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Certificate Preview</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {result?.certificate?.template_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certificate preview would be rendered here
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCertificateDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Section */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          How to Verify a Certificate
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <QrCodeScanner sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                1. Scan QR Code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use your phone camera or click "Scan" to read the QR code on the certificate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Search sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                2. Enter Code Manually
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type the verification code found on the certificate into the input field
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Verified sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                3. View Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant verification results with certificate details and authenticity status
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      </Box>
    </Box>
  );
};

export default VerificationPortal;