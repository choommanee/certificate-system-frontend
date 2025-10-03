import React, { useState } from 'react';
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

interface ActivityForm {
  name: string;
  description: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  maxParticipants: number;
  certificateTemplate: string;
  organizers: string[];
  requirements: string;
  objectives: string;
  isPublic: boolean;
  allowRegistration: boolean;
  registrationDeadline: Date | null;
}

const ActivityCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ActivityForm>({
    name: '',
    description: '',
    category: '',
    startDate: null,
    endDate: null,
    location: '',
    maxParticipants: 50,
    certificateTemplate: '',
    organizers: [],
    requirements: '',
    objectives: '',
    isPublic: true,
    allowRegistration: true,
    registrationDeadline: null,
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

  const templates = [
    'เทมเพลตสัมมนา A',
    'เทมเพลตหลักสูตร B',
    'เทมเพลตการแข่งขัน C',
    'เทมเพลตประชุม D',
    'เทมเพลตอบรม E'
  ];

  const organizers = [
    'ดร.สมชาย ใจดี',
    'อ.สมหญิง รักงาน',
    'ผศ.บุญชู ขยัน',
    'รศ.มาลี สวยงาม',
    'ดร.สมศักดิ์ เก่งงาน'
  ];

  const handleInputChange = (field: keyof ActivityForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return form.name && form.description && form.category;
      case 1:
        return form.startDate && form.endDate && form.location;
      case 2:
        return form.certificateTemplate && form.organizers.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    } else {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Submit to API
      console.log('Creating activity:', form);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/activities', { 
        state: { message: 'สร้างกิจกรรมสำเร็จ' }
      });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างกิจกรรม');
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
                  value={form.category}
                  label="หมวดหมู่กิจกรรม"
                  onChange={(e) => handleInputChange('category', e.target.value)}
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
                  multiline
                  rows={3}
                  label="วัตถุประสงค์ของกิจกรรม"
                  value={form.objectives}
                  onChange={(e) => handleInputChange('objectives', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  helperText="อธิบายวัตถุประสงค์และเป้าหมายของกิจกรรม"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="เงื่อนไขการเข้าร่วม"
                  value={form.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  helperText="ระบุเงื่อนไขหรือคุณสมบัติของผู้เข้าร่วม"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 2:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>เทมเพลตเกียรติบัตร</InputLabel>
                  <Select
                    value={form.certificateTemplate}
                    label="เทมเพลตเกียรติบัตร"
                    onChange={(e) => handleInputChange('certificateTemplate', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {templates.map(template => (
                      <MenuItem key={template} value={template}>{template}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={organizers}
                  value={form.organizers}
                  onChange={(_, value) => handleInputChange('organizers', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ผู้จัดกิจกรรม"
                      placeholder="เลือกผู้จัดกิจกรรม"
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        avatar={<Avatar sx={{ width: 24, height: 24 }}>{option.charAt(0)}</Avatar>}
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="เปิดให้สาธารณะเห็น"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.allowRegistration}
                      onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="เปิดรับสมัครออนไลน์"
                />
              </Grid>
              {form.allowRegistration && (
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="วันสุดท้ายของการสมัคร"
                    value={form.registrationDeadline}
                    onChange={(date) => handleInputChange('registrationDeadline', date)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </LocalizationProvider>
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
                    <Chip label={form.category} size="small" color="primary" />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">คำอธิบาย:</Typography>
                    <Typography variant="body1">{form.description}</Typography>
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
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.location}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">จำนวนผู้เข้าร่วม:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.maxParticipants} คน</Typography>
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
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">เทมเพลตเกียรติบัตร:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.certificateTemplate}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">ผู้จัดกิจกรรม:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {form.organizers.map(organizer => (
                        <Chip
                          key={organizer}
                          label={organizer}
                          avatar={<Avatar sx={{ width: 24, height: 24 }}>{organizer.charAt(0)}</Avatar>}
                          size="small"
                        />
                      ))}
                    </Box>
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