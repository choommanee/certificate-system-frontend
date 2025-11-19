import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Avatar,
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  CalendarToday,
  LocationOn,
  People,
  Assignment,
  Settings,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { activityService, templateService } from '../services/api';
import type { ActivityCreateRequest } from '../services/api/types';

interface ActivityForm {
  name: string;
  description: string;
  activityType: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  maxParticipants: number;
  certificateTemplateId: string;
  organizer: string;
}

const ActivityCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState<ActivityForm>({
    name: '',
    description: '',
    activityType: '',
    startDate: null,
    endDate: null,
    location: '',
    maxParticipants: 50,
    certificateTemplateId: '',
    organizer: '',
  });

  const steps = [
    'ข้อมูลพื้นฐาน',
    'รายละเอียดกิจกรรม',
    'การตั้งค่า',
    'ตรวจสอบ'
  ];

  const categories = [
    'สัมมนา',
    'หลักสูตร',
    'การแข่งขัน',
    'ประชุม',
    'อบรม',
    'งานสัมมนา',
    'กิจกรรมนักศึกษา'
  ];

  // Load templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const response = await templateService.getTemplates({ page: 1, limit: 100 });
        if (response.success && response.data) {
          setTemplates(response.data.data.map(t => ({ id: t.id, name: t.name })));
        }
      } catch (err) {
        console.error('Error loading templates:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleInputChange = (field: keyof ActivityForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!form.name || !form.activityType) {
          setError('กรุณากรอกชื่อกิจกรรมและหมวดหมู่');
          return false;
        }
        return true;
      case 1:
        if (!form.startDate || !form.endDate) {
          setError('กรุณาเลือกวันที่เริ่มและสิ้นสุดกิจกรรม');
          return false;
        }
        if (form.startDate > form.endDate) {
          setError('วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด');
          return false;
        }
        return true;
      case 2:
        if (!form.certificateTemplateId) {
          setError('กรุณาเลือกเทมเพลตเกียรติบัตร');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for API
      const activityData: ActivityCreateRequest = {
        name: form.name,
        description: form.description || undefined,
        activityType: form.activityType,
        startDate: form.startDate!.toISOString(),
        endDate: form.endDate!.toISOString(),
        location: form.location || undefined,
        organizer: form.organizer || undefined,
        maxParticipants: form.maxParticipants > 0 ? form.maxParticipants : undefined,
        certificateTemplateId: form.certificateTemplateId || undefined,
      };

      const response = await activityService.createActivity(activityData);

      if (response.success) {
        navigate('/activities', {
          state: { message: 'สร้างกิจกรรมสำเร็จ' }
        });
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการสร้างกิจกรรม');
      }
    } catch (err: any) {
      console.error('Error creating activity:', err);
      setError(err.response?.data?.message || err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อกิจกรรม"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                helperText="ชื่อกิจกรรมที่จะแสดงในเกียรติบัตร"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="คำอธิบายกิจกรรม"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                helperText="อธิบายรายละเอียดของกิจกรรม"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>หมวดหมู่กิจกรรม</InputLabel>
                <Select
                  value={form.activityType}
                  label="หมวดหมู่กิจกรรม"
                  onChange={(e) => handleInputChange('activityType', e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="จำนวนผู้เข้าร่วมสูงสุด"
                value={form.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 1000 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="วันที่เริ่มกิจกรรม"
                  value={form.startDate}
                  onChange={(date) => handleInputChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="วันที่สิ้นสุดกิจกรรม"
                  value={form.endDate}
                  onChange={(date) => handleInputChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="สถานที่จัดกิจกรรม"
                  value={form.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  helperText="ระบุสถานที่จัดกิจกรรมอย่างชัดเจน"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ผู้จัดกิจกรรม"
                  value={form.organizer}
                  onChange={(e) => handleInputChange('organizer', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  helperText="ระบุชื่อผู้จัดหรือหน่วยงานที่จัดกิจกรรม"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>เทมเพลตเกียรติบัตร</InputLabel>
                <Select
                  value={form.certificateTemplateId}
                  label="เทมเพลตเกียรติบัตร"
                  onChange={(e) => handleInputChange('certificateTemplateId', e.target.value)}
                  sx={{ borderRadius: 2 }}
                  disabled={templatesLoading}
                >
                  {templatesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      กำลังโหลดเทมเพลต...
                    </MenuItem>
                  ) : templates.length > 0 ? (
                    templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>ไม่พบเทมเพลต</MenuItem>
                  )}
                </Select>
              </FormControl>
              {!templatesLoading && templates.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ยังไม่มีเทมเพลตเกียรติบัตรในระบบ กรุณาสร้างเทมเพลตก่อนสร้างกิจกรรม
                </Alert>
              )}
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  คุณสามารถกำหนดเทมเพลตเกียรติบัตรที่จะใช้สำหรับกิจกรรมนี้
                  หากไม่ระบุ คุณสามารถเลือกเทมเพลตได้ในภายหลัง
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              กรุณาตรวจสอบข้อมูลก่อนสร้างกิจกรรม
            </Alert>
            
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  ข้อมูลพื้นฐาน
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">ชื่อกิจกรรม:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">หมวดหมู่:</Typography>
                    <Chip label={form.activityType} size="small" color="primary" />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">คำอธิบาย:</Typography>
                    <Typography variant="body1">{form.description || 'ไม่ได้ระบุ'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  รายละเอียดกิจกรรม
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">วันที่จัด:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {form.startDate?.toLocaleDateString('th-TH')} - {form.endDate?.toLocaleDateString('th-TH')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">สถานที่:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.location || 'ไม่ได้ระบุ'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">จำนวนผู้เข้าร่วม:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.maxParticipants > 0 ? `${form.maxParticipants} คน` : 'ไม่จำกัด'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">ผู้จัด:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.organizer || 'ไม่ได้ระบุ'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  การตั้งค่า
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">เทมเพลตเกียรติบัตร:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {form.certificateTemplateId
                        ? templates.find(t => t.id === form.certificateTemplateId)?.name || 'ไม่พบเทมเพลต'
                        : 'ไม่ได้ระบุ (สามารถเลือกได้ในภายหลัง)'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              ➕ สร้างกิจกรรมใหม่
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              สร้างกิจกรรมและกำหนดการออกเกียรติบัตร
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/activities')}
            sx={{ 
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': { 
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            กลับ
          </Button>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {completed ? <CheckCircle /> : index + 1}
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form Content */}
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Divider sx={{ my: 4 }} />

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ borderRadius: 2 }}
            >
              ย้อนกลับ
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Preview />}
                    sx={{ borderRadius: 2 }}
                  >
                    ดูตัวอย่าง
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    {loading ? 'กำลังสร้าง...' : 'สร้างกิจกรรม'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ borderRadius: 2 }}
                >
                  ถัดไป
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default ActivityCreatePage;