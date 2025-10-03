import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  Paper,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  Person,
  Assignment,
  Description,
  Add,
  Delete,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview_url: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  department?: string;
}

interface CertificateForm {
  name: string;
  course_name: string;
  template_id: string;
  recipients: Recipient[];
  issue_date: string;
  description: string;
  custom_fields: { [key: string]: string };
}

const steps = ['ข้อมูลพื้นฐาน', 'เลือกเทมเพลต', 'เลือกผู้รับ', 'ตรวจสอบและบันทึก'];

const CertificateCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [availableRecipients, setAvailableRecipients] = useState<Recipient[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');

  const [form, setForm] = useState<CertificateForm>({
    name: '',
    course_name: '',
    template_id: '',
    recipients: [],
    issue_date: new Date().toISOString().split('T')[0],
    description: '',
    custom_fields: {}
  });

  // Mock data
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'เทมเพลตสัมมนา',
      category: 'สัมมนา',
      description: 'เทมเพลตสำหรับเกียรติบัตรการเข้าร่วมสัมมนา',
      preview_url: '/templates/preview1.jpg'
    },
    {
      id: '2',
      name: 'เทมเพลตฝึกอบรม',
      category: 'ฝึกอบรม',
      description: 'เทมเพลตสำหรับเกียรติบัตรการฝึกอบรม',
      preview_url: '/templates/preview2.jpg'
    },
    {
      id: '3',
      name: 'เทมเพลตการแข่งขัน',
      category: 'การแข่งขัน',
      description: 'เทมเพลตสำหรับเกียรติบัตรการแข่งขัน',
      preview_url: '/templates/preview3.jpg'
    }
  ];

  const mockRecipients: Recipient[] = [
    {
      id: '1',
      name: 'นายสมชาย ใจดี',
      email: 'somchai@example.com',
      student_id: '6401234567',
      department: 'เศรษฐศาสตร์'
    },
    {
      id: '2',
      name: 'นางสาวสุดา เก่งมาก',
      email: 'suda@example.com',
      student_id: '6401234568',
      department: 'เศรษฐศาสตร์'
    },
    {
      id: '3',
      name: 'นายวิชัย ชนะเลิศ',
      email: 'wichai@example.com',
      student_id: '6401234569',
      department: 'เศรษฐศาสตร์'
    },
    {
      id: '4',
      name: 'นางสาวมาลี สวยงาม',
      email: 'malee@example.com',
      student_id: '6401234570',
      department: 'เศรษฐศาสตร์'
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
    setAvailableRecipients(mockRecipients);
  }, []);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!form.name || !form.course_name) {
          setError('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        break;
      case 1:
        if (!form.template_id) {
          setError('กรุณาเลือกเทมเพลต');
          return false;
        }
        break;
      case 2:
        if (form.recipients.length === 0) {
          setError('กรุณาเลือกผู้รับอย่างน้อย 1 คน');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleFormChange = (field: keyof CertificateForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddRecipient = (recipient: Recipient) => {
    if (!form.recipients.find(r => r.id === recipient.id)) {
      setForm(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipient]
      }));
    }
  };

  const handleRemoveRecipient = (recipientId: string) => {
    setForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.id !== recipientId)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Submit to API
      console.log('Submitting certificate:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/certificates', { 
        state: { message: 'สร้างเกียรติบัตรสำเร็จ' }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === form.template_id);

  const filteredRecipients = availableRecipients.filter(recipient =>
    recipient.name.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
    recipient.email.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
    recipient.student_id?.toLowerCase().includes(recipientSearchTerm.toLowerCase())
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลพื้นฐานของเกียรติบัตร
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ชื่อเกียรติบัตร"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="เช่น เกียรติบัตรการเข้าร่วมสัมมนา"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ชื่อหลักสูตร/กิจกรรม"
                    value={form.course_name}
                    onChange={(e) => handleFormChange('course_name', e.target.value)}
                    placeholder="เช่น การพัฒนาเศรษฐกิจดิจิทัล"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="วันที่ออกเกียรติบัตร"
                    value={form.issue_date}
                    onChange={(e) => handleFormChange('issue_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="รายละเอียดเพิ่มเติม"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="รายละเอียดเกี่ยวกับเกียรติบัตรนี้..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                เลือกเทมเพลตเกียรติบัตร
              </Typography>
              <Grid container spacing={3}>
                {templates.map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: form.template_id === template.id ? '2px solid' : '1px solid',
                        borderColor: form.template_id === template.id ? 'primary.main' : 'divider',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleFormChange('template_id', template.id)}
                    >
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Description sx={{ fontSize: 64, color: 'text.secondary' }} />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        <Chip label={template.category} size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                เลือกผู้รับเกียรติบัตร
              </Typography>
              
              {/* Search Recipients */}
              <TextField
                fullWidth
                placeholder="ค้นหาผู้รับ..."
                value={recipientSearchTerm}
                onChange={(e) => setRecipientSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
              />

              <Grid container spacing={3}>
                {/* Available Recipients */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ผู้รับที่สามารถเลือกได้
                    </Typography>
                    <List>
                      {filteredRecipients.map((recipient) => (
                        <ListItem
                          key={recipient.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleAddRecipient(recipient)}
                              disabled={form.recipients.some(r => r.id === recipient.id)}
                            >
                              <Add />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={recipient.name}
                            secondary={
                              <Box>
                                <Typography variant="body2">{recipient.email}</Typography>
                                {recipient.student_id && (
                                  <Typography variant="caption">
                                    รหัสนักศึกษา: {recipient.student_id}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Selected Recipients */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ผู้รับที่เลือกแล้ว ({form.recipients.length})
                    </Typography>
                    <List>
                      {form.recipients.map((recipient) => (
                        <ListItem
                          key={recipient.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveRecipient(recipient.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={recipient.name}
                            secondary={
                              <Box>
                                <Typography variant="body2">{recipient.email}</Typography>
                                {recipient.student_id && (
                                  <Typography variant="caption">
                                    รหัสนักศึกษา: {recipient.student_id}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ตรวจสอบข้อมูลก่อนบันทึก
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ข้อมูลเกียรติบัตร
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ชื่อเกียรติบัตร</Typography>
                      <Typography variant="body1">{form.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">หลักสูตร/กิจกรรม</Typography>
                      <Typography variant="body1">{form.course_name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">วันที่ออก</Typography>
                      <Typography variant="body1">
                        {new Date(form.issue_date).toLocaleDateString('th-TH')}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">เทมเพลต</Typography>
                      <Typography variant="body1">{selectedTemplate?.name}</Typography>
                    </Box>
                    {form.description && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">รายละเอียด</Typography>
                        <Typography variant="body1">{form.description}</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      ผู้รับเกียรติบัตร ({form.recipients.length} คน)
                    </Typography>
                    <List dense>
                      {form.recipients.slice(0, 5).map((recipient) => (
                        <ListItem key={recipient.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={recipient.name}
                            secondary={recipient.email}
                          />
                        </ListItem>
                      ))}
                      {form.recipients.length > 5 && (
                        <ListItem>
                          <ListItemText
                            primary={`และอีก ${form.recipients.length - 5} คน...`}
                            sx={{ fontStyle: 'italic' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/certificates')}
            sx={{ mr: 2 }}
          >
            กลับ
          </Button>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              สร้างเกียรติบัตรใหม่
            </Typography>
            <Typography variant="body1" color="text.secondary">
              สร้างเกียรติบัตรสำหรับผู้เข้าร่วมกิจกรรมหรือหลักสูตร
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Box sx={{ mb: 3 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                ย้อนกลับ
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep === steps.length - 1 && (
                  <Button
                    startIcon={<Preview />}
                    onClick={() => setPreviewDialogOpen(true)}
                  >
                    ดูตัวอย่าง
                  </Button>
                )}
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={<Save />}
                  >
                    {loading ? 'กำลังบันทึก...' : 'บันทึกเกียรติบัตร'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    ถัดไป
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ตัวอย่างเกียรติบัตร</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                height: 400,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <Typography variant="h6" color="text.secondary">
                ตัวอย่างเกียรติบัตรจะแสดงที่นี่
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>
              ปิด
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CertificateCreatePage;