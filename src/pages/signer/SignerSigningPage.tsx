import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  Draw,
  Save,
  Clear,
  Check,
  Visibility,
  Download,
} from '@mui/icons-material';
// import SignatureCanvas from 'react-signature-canvas';

interface SigningDocument {
  id: string;
  recipient_name: string;
  course_name: string;
  certificate_number: string;
  template_name: string;
  preview_url: string;
}

const SignerSigningPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [signatureData, setSignatureData] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sigCanvas = useRef<any>(null);

  // Mock document data
  const document: SigningDocument = {
    id: '1',
    recipient_name: 'นายสมชาย ใจดี',
    course_name: 'หลักสูตรการพัฒนาเว็บแอปพลิเคชัน',
    certificate_number: 'CERT-2024-001',
    template_name: 'เกียรติบัตรการอบรม',
    preview_url: '/preview/cert-001.pdf'
  };

  const steps = [
    'ตรวจสอบเอกสาร',
    'ลงนาม',
    'ยืนยันและส่ง'
  ];

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData('');
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL();
      setSignatureData(dataURL);
      setActiveStep(2);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleConfirmSign = () => {
    setConfirmDialog(true);
  };

  const confirmSigning = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCompleted(true);
    setConfirmDialog(false);
  };

  if (completed) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Card sx={{ p: 4, bgcolor: 'success.50' }}>
          <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2, color: 'success.main' }}>
            ✅ ลงนามสำเร็จ!
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3 }}>
            เกียรติบัตรของ {document.recipient_name} ได้รับการลงนามเรียบร้อยแล้ว
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" startIcon={<Download />}>
              ดาวน์โหลด PDF
            </Button>
            <Button variant="outlined" onClick={() => window.history.back()}>
              กลับไปหน้าหลัก
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 4 }}>
        📝 ลงนามเอกสาร
      </Typography>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontFamily: 'Sarabun, sans-serif' } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={4}>
        {/* Document Preview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}>
                📄 ตัวอย่างเกียรติบัตร
              </Typography>
              <Box sx={{ height: 400, bgcolor: 'grey.100', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  ตัวอย่างเกียรติบัตรจะแสดงที่นี่
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  <strong>ผู้รับ:</strong> {document.recipient_name}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  <strong>หลักสูตร:</strong> {document.course_name}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  <strong>เลขที่:</strong> {document.certificate_number}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Signing Area */}
        <Grid item xs={12} md={6}>
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}>
                  ✅ ตรวจสอบข้อมูล
                </Typography>
                <Alert severity="info" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
                  กรุณาตรวจสอบข้อมูลในเกียรติบัตรให้ถูกต้องก่อนดำเนินการลงนาม
                </Alert>
                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" onClick={handleNext} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    ข้อมูลถูกต้อง ดำเนินการต่อ
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}>
                  ✍️ ลงนาม
                </Typography>
                <Box sx={{ border: '2px dashed', borderColor: 'primary.main', borderRadius: 1, p: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 400,
                      height: 200,
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}>
                      📝 พื้นที่สำหรับลงนาม
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<Clear />} onClick={clearSignature}>
                    ลบลายเซ็น
                  </Button>
                  <Button variant="contained" startIcon={<Save />} onClick={saveSignature}>
                    บันทึกลายเซ็น
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}>
                  🔍 ยืนยันการลงนาม
                </Typography>
                {signatureData && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}>
                      ลายเซ็นของคุณ:
                    </Typography>
                    <img src={signatureData} alt="Signature" style={{ border: '1px solid #ccc', borderRadius: '4px' }} />
                  </Box>
                )}
                <Alert severity="warning" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
                  การลงนามจะไม่สามารถยกเลิกได้ กรุณาตรวจสอบให้ถูกต้อง
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack}>
                    แก้ไขลายเซ็น
                  </Button>
                  <Button variant="contained" color="success" startIcon={<Check />} onClick={handleConfirmSign}>
                    ยืนยันลงนาม
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ยืนยันการลงนาม
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            คุณต้องการลงนามในเกียรติบัตรนี้หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>ยกเลิก</Button>
          <Button onClick={confirmSigning} variant="contained" color="success">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SignerSigningPage;
