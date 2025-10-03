import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as CancelIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Assignment as DocumentIcon,
  Person as PersonIcon,
  Schedule as TimeIcon,
  Email as EmailIcon,
  Note as NoteIcon,
  Attachment as AttachmentIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { DocumentToSign, SigningRecord } from '../../types/signer';

interface DocumentReturnProps {
  document: DocumentToSign;
  signingRecord?: SigningRecord;
  onReturn: (notes?: string, attachments?: File[]) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

interface ReturnStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

const DocumentReturn: React.FC<DocumentReturnProps> = ({
  document,
  signingRecord,
  onReturn,
  onCancel,
  loading = false,
  error = null
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [returnNotes, setReturnNotes] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailStaff: true,
    emailRecipients: false,
    generateReport: true
  });

  const steps: ReturnStep[] = [
    {
      id: 'review',
      label: 'ตรวจสอบผลลัพธ์',
      description: 'ตรวจสอบเอกสารที่ลงนามเสร็จแล้ว',
      completed: !!signingRecord
    },
    {
      id: 'notes',
      label: 'เพิ่มหมายเหตุ',
      description: 'เพิ่มหมายเหตุหรือข้อความสำหรับเจ้าหน้าที่',
      completed: false,
      optional: true
    },
    {
      id: 'attachments',
      label: 'แนบไฟล์เพิ่มเติม',
      description: 'แนบไฟล์เอกสารเพิ่มเติมหากจำเป็น',
      completed: false,
      optional: true
    },
    {
      id: 'notification',
      label: 'ตั้งค่าการแจ้งเตือน',
      description: 'เลือกวิธีการแจ้งเตือนเจ้าหน้าที่',
      completed: false
    },
    {
      id: 'confirm',
      label: 'ยืนยันการส่งกลับ',
      description: 'ตรวจสอบและยืนยันการส่งเอกสารกลับ',
      completed: false
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด 10MB)`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleReturn = async () => {
    const success = await onReturn(returnNotes.trim() || undefined, attachments);
    if (success) {
      setConfirmDialogOpen(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Review
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
              เอกสารได้รับการลงนามเรียบร้อยแล้ว
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                    ข้อมูลการลงนาม
                  </Typography>
                  
                  {signingRecord && (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        ⏰ เวลาที่ลงนาม: {formatDate(signingRecord.signedAt)}
                      </Typography>
                      <Typography variant="body2">
                        👥 จำนวนผู้รับ: {signingRecord.recipientCount} คน
                      </Typography>
                      <Typography variant="body2">
                        ⚡ เวลาที่ใช้: {Math.round(signingRecord.processingTime / 60)} นาที
                      </Typography>
                      <Typography variant="body2">
                        ✅ สถานะ: {signingRecord.status === 'completed' ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                      </Typography>
                    </Stack>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                    ข้อมูลเอกสาร
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      📋 {document.title}
                    </Typography>
                    <Typography variant="body2">
                      🎯 {document.activityDetails.name}
                    </Typography>
                    <Typography variant="body2">
                      👤 ขอโดย: {document.requestedBy.first_name} {document.requestedBy.last_name}
                    </Typography>
                    <Typography variant="body2">
                      📅 วันที่ขอ: {formatDate(document.requestDate)}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Notes
        return (
          <Box>
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
              เพิ่มหมายเหตุหรือข้อความสำหรับเจ้าหน้าที่ (ไม่บังคับ)
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="หมายเหตุ"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="เช่น ข้อสังเกต, คำแนะนำ, หรือข้อมูลเพิ่มเติมที่เจ้าหน้าที่ควรทราบ"
              sx={{ mb: 2 }}
            />
            
            <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              หมายเหตุนี้จะถูกส่งไปยังเจ้าหน้าที่ที่ขอการลงนามและจะแสดงในประวัติการทำงาน
            </Alert>
          </Box>
        );

      case 2: // Attachments
        return (
          <Box>
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
              แนบไฟล์เอกสารเพิ่มเติม (ไม่บังคับ)
            </Typography>
            
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'grey.300',
                cursor: 'pointer',
                mb: 2,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <AttachmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}>
                คลิกเพื่อเลือกไฟล์
              </Typography>
              <Typography variant="body2" color="text.secondary">
                รองรับไฟล์ PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (สูงสุด 10MB)
              </Typography>
            </Paper>

            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {attachments.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                  ไฟล์ที่แนบ ({attachments.length})
                </Typography>
                
                <List>
                  {attachments.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <AttachmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)} • ${file.type}`}
                      />
                      <IconButton
                        edge="end"
                        onClick={() => removeAttachment(index)}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 3: // Notification
        return (
          <Box>
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3 }}>
              เลือกวิธีการแจ้งเตือนเจ้าหน้าที่
            </Typography>
            
            <Stack spacing={2}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="primary" />
                    <Box>
                      <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        แจ้งเตือนเจ้าหน้าที่ทางอีเมล
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ส่งอีเมลแจ้งเตือนไปยัง {document.requestedBy.first_name} {document.requestedBy.last_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant={notificationSettings.emailStaff ? 'contained' : 'outlined'}
                    onClick={() => setNotificationSettings(prev => ({ ...prev, emailStaff: !prev.emailStaff }))}
                  >
                    {notificationSettings.emailStaff ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Button>
                </Box>
              </Paper>

              <Paper elevation={1} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="secondary" />
                    <Box>
                      <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        แจ้งเตือนผู้รับเกียรติบัตร
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ส่งอีเมลแจ้งเตือนไปยังผู้รับเกียรติบัตรทั้งหมด ({document.recipients.length} คน)
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant={notificationSettings.emailRecipients ? 'contained' : 'outlined'}
                    onClick={() => setNotificationSettings(prev => ({ ...prev, emailRecipients: !prev.emailRecipients }))}
                  >
                    {notificationSettings.emailRecipients ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Button>
                </Box>
              </Paper>

              <Paper elevation={1} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DocumentIcon color="info" />
                    <Box>
                      <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        สร้างรายงานสรุป
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        สร้างรายงานสรุปการลงนามและแนบไปกับการแจ้งเตือน
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant={notificationSettings.generateReport ? 'contained' : 'outlined'}
                    onClick={() => setNotificationSettings(prev => ({ ...prev, generateReport: !prev.generateReport }))}
                  >
                    {notificationSettings.generateReport ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </Box>
        );

      case 4: // Confirm
        return (
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3 }}>
              ตรวจสอบข้อมูลก่อนส่งกลับ
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  📋 ข้อมูลเอกสาร
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">ชื่อเอกสาร:</Typography>
                    <Typography variant="body1">{document.title}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">จำนวนผู้รับ:</Typography>
                    <Typography variant="body1">{document.recipients.length} คน</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">ผู้ขอ:</Typography>
                    <Typography variant="body1">
                      {document.requestedBy.first_name} {document.requestedBy.last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">สถานะ:</Typography>
                    <Chip label="ลงนามเสร็จสิ้น" color="success" size="small" />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {returnNotes && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    📝 หมายเหตุ
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">{returnNotes}</Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {attachments.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    📎 ไฟล์แนบ ({attachments.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {attachments.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <AttachmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={formatFileSize(file.size)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  🔔 การแจ้งเตือน
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notificationSettings.emailStaff ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    <Typography variant="body2">แจ้งเตือนเจ้าหน้าที่ทางอีเมล</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notificationSettings.emailRecipients ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    <Typography variant="body2">แจ้งเตือนผู้รับเกียรติบัตร</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notificationSettings.generateReport ? <CheckIcon color="success" /> : <CancelIcon color="error" />}
                    <Typography variant="body2">สร้างรายงานสรุป</Typography>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            fontWeight: 'bold',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          📤 ส่งเอกสารกลับ
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          ส่งเอกสารที่ลงนามเสร็จแล้วกลับไปยังเจ้าหน้าที่
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Stepper */}
        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
              >
                ขั้นตอนการส่งกลับ
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel
                      optional={step.optional && (
                        <Typography variant="caption">ไม่บังคับ</Typography>
                      )}
                    >
                      <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'Sarabun, sans-serif' }}
                      >
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Content */}
        <Grid item xs={12} lg={8}>
          <Card elevation={3}>
            <CardContent sx={{ minHeight: 400 }}>
              {getStepContent(activeStep)}
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                ย้อนกลับ
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  ยกเลิก
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={loading}
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  >
                    {loading ? 'กำลังส่ง...' : 'ส่งเอกสารกลับ'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  >
                    ถัดไป
                  </Button>
                )}
              </Box>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ยืนยันการส่งเอกสารกลับ
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
            คุณกำลังจะส่งเอกสารที่ลงนามเสร็จแล้วกลับไปยังเจ้าหน้าที่
          </Alert>
          
          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            <strong>เอกสาร:</strong> {document.title}
          </Typography>
          
          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            <strong>ผู้รับ:</strong> {document.requestedBy.first_name} {document.requestedBy.last_name}
          </Typography>
          
          {returnNotes && (
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
              <strong>หมายเหตุ:</strong> {returnNotes.substring(0, 100)}{returnNotes.length > 100 ? '...' : ''}
            </Typography>
          )}
          
          {attachments.length > 0 && (
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
              <strong>ไฟล์แนบ:</strong> {attachments.length} ไฟล์
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleReturn}
            variant="contained"
            disabled={loading}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            {loading ? 'กำลังส่ง...' : 'ยืนยันส่งกลับ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentReturn;