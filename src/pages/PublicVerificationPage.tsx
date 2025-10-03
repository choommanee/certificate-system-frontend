import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Verified,
  Error,
  QrCodeScanner,
  Search,
  Download,
  Share,
  Print,
  Close,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import publicService, { VerificationResponse } from '../services/publicService';

interface CertificateData {
  id: string;
  recipient_name: string;
  course_name: string;
  issue_date: string;
  certificate_number: string;
  template_name: string;
  issuer: string;
  status: 'valid' | 'revoked' | 'expired';
  qr_code: string;
  pdf_url: string;
  verification_count: number;
  last_verified: string;
}

const PublicVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState(
    searchParams.get('code') || ''
  );
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string>('');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);

  // Auto-verify if code is in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setVerificationCode(code);
      handleVerify(code);
    }
  }, [searchParams]);

  const handleVerify = async (code?: string) => {
    const codeToVerify = code || verificationCode;

    if (!codeToVerify.trim()) {
      setError('กรุณาใส่รหัสตรวจสอบ');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerificationResult(null);

    try {
      const result = await publicService.verifyCertificate(codeToVerify);
      setVerificationResult(result);

      if (result.valid && result.certificate) {
        // Convert API response to UI format
        const cert: CertificateData = {
          id: result.certificate.id,
          recipient_name: result.certificate.recipientNameTh,
          course_name: result.certificate.activityName,
          issue_date: result.certificate.issueDate,
          certificate_number: result.certificate.certificateNumber,
          template_name: result.certificate.certificateType,
          issuer: 'คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์',
          status: result.certificate.status === 'generated' ? 'valid' : 'revoked',
          qr_code: codeToVerify,
          pdf_url: result.certificate.certificateFile || '',
          verification_count: 0,
          last_verified: result.verificationLog?.verifiedAt || new Date().toISOString()
        };
        setCertificate(cert);
      } else {
        setError(result.message || 'ไม่พบเกียรติบัตรที่ตรงกับรหัสที่ระบุ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (certificate?.id) {
      try {
        await publicService.downloadCertificate(certificate.id);
        setSnackbarMessage('กำลังดาวน์โหลดเกียรติบัตร...');
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage('เกิดข้อผิดพลาดในการดาวน์โหลด');
        setSnackbarOpen(true);
      }
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/verify?code=${verificationCode}`;
    navigator.clipboard.writeText(url);
    setSnackbarMessage('คัดลอกลิงก์เรียบร้อยแล้ว');
    setSnackbarOpen(true);
  };

  const handleQRScan = (data: string) => {
    setVerificationCode(data);
    setQrScannerOpen(false);
    handleVerify(data);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'revoked': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'ใช้งานได้';
      case 'revoked': return 'ถูกยกเลิก';
      case 'expired': return 'หมดอายุ';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'white',
              color: 'primary.main',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Verified sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              color: 'white',
              mb: 1,
            }}
          >
            ตรวจสอบเกียรติบัตร
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            คณะเศรษฐศาสตร์ มหาวิทยาลัยเชียงใหม่
          </Typography>
        </Box>

        {/* Verification Form */}
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center',
            }}
          >
            🔍 ใส่รหัสตรวจสอบ
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="รหัสตรวจสอบ หรือ URL"
              placeholder="ใส่รหัสตรวจสอบจากเกียรติบัตร"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { fontFamily: 'Sarabun, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Sarabun, sans-serif' }
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              sx={{
                minWidth: 120,
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<QrCodeScanner />}
              onClick={() => setQrScannerOpen(true)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              สแกน QR Code
            </Button>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 3, fontFamily: 'Sarabun, sans-serif' }}
            >
              {error}
            </Alert>
          )}
        </Paper>

        {/* Certificate Result */}
        {certificate && (
          <Paper
            elevation={10}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Status Header */}
            <Box
              sx={{
                bgcolor: certificate.status === 'valid' ? 'success.main' : 'error.main',
                color: 'white',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                {certificate.status === 'valid' ? (
                  <Verified sx={{ fontSize: 40 }} />
                ) : (
                  <Error sx={{ fontSize: 40 }} />
                )}
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                    }}
                  >
                    {certificate.status === 'valid' ? '✅ เกียรติบัตรถูกต้อง' : '❌ เกียรติบัตรไม่ถูกต้อง'}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      opacity: 0.9,
                    }}
                  >
                    สถานะ: {getStatusText(certificate.status)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Certificate Details */}
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 3,
                    }}
                  >
                    📋 รายละเอียดเกียรติบัตร
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}
                      >
                        ชื่อผู้รับ
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                      >
                        {certificate.recipient_name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}
                      >
                        หลักสูตร/กิจกรรม
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: 'Sarabun, sans-serif' }}
                      >
                        {certificate.course_name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}
                      >
                        หน่วยงานที่ออกเกียรติบัตร
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: 'Sarabun, sans-serif' }}
                      >
                        {certificate.issuer}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}
                        >
                          วันที่ออกเกียรติบัตร
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        >
                          {new Date(certificate.issue_date).toLocaleDateString('th-TH')}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}
                        >
                          เลขที่เกียรติบัตร
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        >
                          {certificate.certificate_number}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  >
                    📊 สถิติการตรวจสอบ
                  </Typography>

                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          fontWeight: 'bold',
                          color: 'primary.main',
                          textAlign: 'center',
                        }}
                      >
                        {certificate.verification_count}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          textAlign: 'center',
                          color: 'text.secondary',
                        }}
                      >
                        ครั้งที่ตรวจสอบ
                      </Typography>
                    </CardContent>
                  </Card>

                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      color: 'text.secondary',
                      textAlign: 'center',
                    }}
                  >
                    ตรวจสอบล่าสุด:{' '}
                    {new Date(certificate.last_verified).toLocaleDateString('th-TH')}
                  </Typography>

                  <Chip
                    label={getStatusText(certificate.status)}
                    color={getStatusColor(certificate.status) as any}
                    sx={{
                      mt: 2,
                      width: '100%',
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  ดาวน์โหลด PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  แชร์ลิงก์
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  พิมพ์
                </Button>
              </Box>
            </CardContent>
          </Paper>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            © 2024 คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์ | ระบบตรวจสอบเกียรติบัตรออนไลน์
          </Typography>
        </Box>

        {/* QR Scanner Dialog */}
        <Dialog
          open={qrScannerOpen}
          onClose={() => setQrScannerOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                สแกน QR Code
              </Typography>
              <Button
                onClick={() => setQrScannerOpen(false)}
                sx={{ minWidth: 'auto' }}
              >
                <Close />
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 3,
              }}
            >
              <QrCodeScanner sx={{ fontSize: 80, color: 'primary.main' }} />
              <Typography
                variant="body1"
                sx={{ fontFamily: 'Sarabun, sans-serif', textAlign: 'center' }}
              >
                เปิดกล้องและจ่อไปที่ QR Code บนเกียรติบัตร
              </Typography>
              <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif', width: '100%' }}>
                ฟีเจอร์การสแกน QR Code กำลังพัฒนา
                <br />
                กรุณาใช้รหัสตรวจสอบแทนในตอนนี้
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setQrScannerOpen(false)}
              variant="contained"
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Container>
    </Box>
  );
};

export default PublicVerificationPage;
