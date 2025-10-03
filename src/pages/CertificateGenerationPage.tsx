import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  type: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  orientation: 'portrait' | 'landscape';
}

interface Recipient {
  id: string;
  nameTh: string;
  nameEn: string;
  studentId: string;
  email: string;
  department?: string;
  selected: boolean;
}

interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  progress: number;
  results: GenerationResult[];
}

interface GenerationResult {
  recipientId: string;
  recipientName: string;
  status: 'success' | 'failed';
  certificateId?: string;
  pdfUrl?: string;
  error?: string;
}

const steps = ['เลือกกิจกรรม', 'เลือกเทมเพลต', 'เลือกผู้รับ', 'ตรวจสอบและสร้าง', 'ผลลัพธ์'];

const CertificateGenerationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Activity Selection
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  // Step 2: Template Selection
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Step 3: Recipients Selection
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Step 4: Generation Options
  const [generationOptions, setGenerationOptions] = useState({
    autoNumber: true,
    numberPrefix: 'CERT',
    startNumber: 1,
    sendEmail: false,
    emailTemplate: '',
  });

  // Step 5: Results
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [previewRecipient, setPreviewRecipient] = useState<Recipient | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      loadTemplates();
    }
  }, [selectedActivity]);

  useEffect(() => {
    if (selectedActivity && selectedTemplate) {
      loadRecipients();
    }
  }, [selectedActivity, selectedTemplate]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockActivities: Activity[] = [
        {
          id: '1',
          name: 'Workshop AI และ Machine Learning',
          description: 'อบรมเชิงปฏิบัติการ AI',
          date: '2024-01-15',
          type: 'Workshop',
        },
        {
          id: '2',
          name: 'Seminar เศรษฐศาสตร์ดิจิทัล',
          description: 'สัมมนาเศรษฐศาสตร์ยุคดิจิทัล',
          date: '2024-02-01',
          type: 'Seminar',
        },
        {
          id: '3',
          name: 'Conference นวัตกรรมธุรกิจ 2024',
          description: 'การประชุมวิชาการนวัตกรรมธุรกิจ',
          date: '2024-03-01',
          type: 'Conference',
        },
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Modern Certificate - Portrait',
          category: 'Modern',
          thumbnail: '/templates/modern-portrait.jpg',
          orientation: 'portrait',
        },
        {
          id: '2',
          name: 'Classic Certificate - Landscape',
          category: 'Classic',
          thumbnail: '/templates/classic-landscape.jpg',
          orientation: 'landscape',
        },
        {
          id: '3',
          name: 'Elegant Certificate - Portrait',
          category: 'Elegant',
          thumbnail: '/templates/elegant-portrait.jpg',
          orientation: 'portrait',
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockRecipients: Recipient[] = [
        {
          id: '1',
          nameTh: 'สมชาย ใจดี',
          nameEn: 'Somchai Jaidee',
          studentId: '650123456',
          email: 'somchai@example.com',
          department: 'Computer Science',
          selected: false,
        },
        {
          id: '2',
          nameTh: 'สมหญิง รักดี',
          nameEn: 'Somying Rakdee',
          studentId: '650123457',
          email: 'somying@example.com',
          department: 'Computer Science',
          selected: false,
        },
        {
          id: '3',
          nameTh: 'ประเสริฐ วิชาการ',
          nameEn: 'Prasoet Wichakan',
          studentId: '650123458',
          email: 'prasoet@example.com',
          department: 'Engineering',
          selected: false,
        },
      ];
      setRecipients(mockRecipients);
    } catch (error) {
      console.error('Failed to load recipients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      // Start generation when moving from step 3 (review) to step 4 (results)
      handleGenerate();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedActivity('');
    setSelectedTemplate('');
    setRecipients([]);
    setGenerationJob(null);
  };

  const handleSelectAllRecipients = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setRecipients(recipients.map((r) => ({ ...r, selected: checked })));
  };

  const handleSelectRecipient = (recipientId: string) => {
    setRecipients(
      recipients.map((r) => (r.id === recipientId ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    const selectedRecipients = recipients.filter((r) => r.selected);

    try {
      // TODO: Replace with actual API call
      // Simulate generation progress
      const job: GenerationJob = {
        id: 'job-' + Date.now(),
        status: 'processing',
        total: selectedRecipients.length,
        processed: 0,
        successful: 0,
        failed: 0,
        progress: 0,
        results: [],
      };

      setGenerationJob(job);

      // Simulate progress
      for (let i = 0; i < selectedRecipients.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const result: GenerationResult = {
          recipientId: selectedRecipients[i].id,
          recipientName: selectedRecipients[i].nameTh,
          status: Math.random() > 0.1 ? 'success' : 'failed',
          certificateId: `cert-${Date.now()}-${i}`,
          pdfUrl: `/certificates/cert-${Date.now()}-${i}.pdf`,
          error: Math.random() > 0.1 ? undefined : 'Failed to generate certificate',
        };

        setGenerationJob((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            processed: i + 1,
            successful: prev.successful + (result.status === 'success' ? 1 : 0),
            failed: prev.failed + (result.status === 'failed' ? 1 : 0),
            progress: ((i + 1) / selectedRecipients.length) * 100,
            results: [...prev.results, result],
          };
        });
      }

      setGenerationJob((prev) => {
        if (!prev) return null;
        return { ...prev, status: 'completed' };
      });
    } catch (error) {
      console.error('Failed to generate certificates:', error);
      setGenerationJob((prev) => {
        if (!prev) return null;
        return { ...prev, status: 'failed' };
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (recipient: Recipient) => {
    setPreviewRecipient(recipient);
    setOpenPreviewDialog(true);
  };

  const handleDownloadAll = () => {
    // TODO: Implement bulk download
    console.log('Downloading all certificates...');
  };

  const handleRetryFailed = () => {
    // TODO: Implement retry failed certificates
    console.log('Retrying failed certificates...');
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedActivity !== '';
      case 1:
        return selectedTemplate !== '';
      case 2:
        return recipients.some((r) => r.selected);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getSelectedCount = () => recipients.filter((r) => r.selected).length;

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        // Step 1: Activity Selection
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              เลือกกิจกรรมที่ต้องการออกเกียรติบัตร
            </Typography>
            <Grid container spacing={3}>
              {activities.map((activity) => (
                <Grid item xs={12} sm={6} md={4} key={activity.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedActivity === activity.id ? 2 : 1,
                      borderColor: selectedActivity === activity.id ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                    onClick={() => setSelectedActivity(activity.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {activity.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {activity.description}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Chip label={activity.type} size="small" />
                        <Chip label={new Date(activity.date).toLocaleDateString('th-TH')} size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        // Step 2: Template Selection
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              เลือกเทมเพลตเกียรติบัตร
            </Typography>
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedTemplate === template.id ? 2 : 1,
                      borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">ตัวอย่างเทมเพลต</Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="h6">{template.name}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip label={template.category} size="small" />
                        <Chip label={template.orientation} size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        // Step 3: Recipients Selection
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">เลือกผู้รับเกียรติบัตร</Typography>
              <Chip label={`เลือกแล้ว ${getSelectedCount()} คน`} color="primary" />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectAll} onChange={handleSelectAllRecipients} />
                    </TableCell>
                    <TableCell><strong>รหัสนักศึกษา</strong></TableCell>
                    <TableCell><strong>ชื่อ-นามสกุล (ไทย)</strong></TableCell>
                    <TableCell><strong>ชื่อ-นามสกุล (อังกฤษ)</strong></TableCell>
                    <TableCell><strong>อีเมล</strong></TableCell>
                    <TableCell><strong>สาขา</strong></TableCell>
                    <TableCell align="center"><strong>ดูตัวอย่าง</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={recipient.selected}
                          onChange={() => handleSelectRecipient(recipient.id)}
                        />
                      </TableCell>
                      <TableCell>{recipient.studentId}</TableCell>
                      <TableCell>{recipient.nameTh}</TableCell>
                      <TableCell>{recipient.nameEn}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.department}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="ดูตัวอย่างเกียรติบัตร">
                          <IconButton size="small" onClick={() => handlePreview(recipient)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 3:
        // Step 4: Review and Options
        const selectedActivity_data = activities.find((a) => a.id === selectedActivity);
        const selectedTemplate_data = templates.find((t) => t.id === selectedTemplate);

        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              ตรวจสอบข้อมูลและตั้งค่าการสร้าง
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    ข้อมูลกิจกรรม
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ชื่อกิจกรรม
                      </Typography>
                      <Typography variant="body1">{selectedActivity_data?.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        วันที่
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity_data?.date ? new Date(selectedActivity_data.date).toLocaleDateString('th-TH') : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    เทมเพลต
                  </Typography>
                  <Box>
                    <Typography variant="body1">{selectedTemplate_data?.name}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Chip label={selectedTemplate_data?.category} size="small" />
                      <Chip label={selectedTemplate_data?.orientation} size="small" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    ผู้รับเกียรติบัตร
                  </Typography>
                  <Chip label={`${getSelectedCount()} คน`} color="primary" />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    ตั้งค่าการสร้าง
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <TextField
                        label="คำนำหน้าเลขที่เกียรติบัตร"
                        value={generationOptions.numberPrefix}
                        onChange={(e) =>
                          setGenerationOptions({ ...generationOptions, numberPrefix: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl fullWidth>
                      <TextField
                        label="เลขที่เริ่มต้น"
                        type="number"
                        value={generationOptions.startNumber}
                        onChange={(e) =>
                          setGenerationOptions({ ...generationOptions, startNumber: parseInt(e.target.value) })
                        }
                      />
                    </FormControl>
                    <Alert severity="info">
                      ระบบจะสร้างเกียรติบัตร {getSelectedCount()} ฉบับ<br />
                      เลขที่: {generationOptions.numberPrefix}{generationOptions.startNumber} - {generationOptions.numberPrefix}{generationOptions.startNumber + getSelectedCount() - 1}
                    </Alert>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        // Step 5: Results
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              ผลการสร้างเกียรติบัตร
            </Typography>

            {generationJob && (
              <Box>
                {/* Progress */}
                {generationJob.status === 'processing' && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">กำลังสร้างเกียรติบัตร...</Typography>
                      <Typography variant="body2">
                        {generationJob.processed} / {generationJob.total}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={generationJob.progress} />
                  </Box>
                )}

                {/* Summary */}
                {generationJob.status === 'completed' && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{generationJob.total}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ทั้งหมด
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="h4" color="success.dark">
                          {generationJob.successful}
                        </Typography>
                        <Typography variant="body2" color="success.dark">
                          สำเร็จ
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                        <Typography variant="h4" color="error.dark">
                          {generationJob.failed}
                        </Typography>
                        <Typography variant="body2" color="error.dark">
                          ล้มเหลว
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {/* Actions */}
                {generationJob.status === 'completed' && (
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadAll}>
                      ดาวน์โหลดทั้งหมด
                    </Button>
                    {generationJob.failed > 0 && (
                      <Button variant="outlined" color="error" startIcon={<RefreshIcon />} onClick={handleRetryFailed}>
                        ลองใหม่ ({generationJob.failed})
                      </Button>
                    )}
                  </Box>
                )}

                {/* Results Table */}
                {generationJob.results.length > 0 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>ผู้รับ</strong></TableCell>
                          <TableCell><strong>สถานะ</strong></TableCell>
                          <TableCell><strong>เลขที่เกียรติบัตร</strong></TableCell>
                          <TableCell align="center"><strong>การดำเนินการ</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generationJob.results.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell>{result.recipientName}</TableCell>
                            <TableCell>
                              {result.status === 'success' ? (
                                <Chip icon={<CheckCircleIcon />} label="สำเร็จ" color="success" size="small" />
                              ) : (
                                <Chip icon={<ErrorIcon />} label="ล้มเหลว" color="error" size="small" />
                              )}
                            </TableCell>
                            <TableCell>{result.certificateId || '-'}</TableCell>
                            <TableCell align="center">
                              {result.status === 'success' && result.pdfUrl && (
                                <Button size="small" startIcon={<DownloadIcon />}>
                                  ดาวน์โหลด
                                </Button>
                              )}
                              {result.status === 'failed' && (
                                <Tooltip title={result.error}>
                                  <IconButton size="small" color="error">
                                    <ErrorIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        ⚡ สร้างเกียรติบัตรอัตโนมัติ
      </Typography>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Content */}
      <Paper sx={{ p: 3, minHeight: 400 }}>
        {renderStepContent(activeStep)}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBackIcon />}>
          ย้อนกลับ
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleReset}>
              เริ่มต้นใหม่
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              endIcon={<ArrowForwardIcon />}
            >
              {activeStep === steps.length - 2 ? 'เริ่มสร้าง' : 'ถัดไป'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>ตัวอย่างเกียรติบัตร</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 400,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography color="text.secondary">
              ตัวอย่างเกียรติบัตรสำหรับ: {previewRecipient?.nameTh}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificateGenerationPage;
