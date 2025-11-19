import React, { useState } from 'react';
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
  Chip,
  Switch,
  FormControlLabel,
  Autocomplete,
  Slider,
  Divider,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  Category,
  Description,
  Palette,
  Settings,
  CloudUpload,
  Image,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { templateService } from '../services/api/templateService';
import type { TemplateCreateRequest } from '../services/api/types';

interface TemplateForm {
  name: string;
  description: string;
  category: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  backgroundColor: string;
  backgroundImageUrl?: string;
  isPublic: boolean;
}

interface BackgroundUpload {
  file: File | null;
  preview: string;
  uploading: boolean;
  uploadProgress: number;
}

const steps = ['ข้อมูลพื้นฐาน', 'การตั้งค่าผืนผ้าใบ', 'ออกแบบเทมเพลต', 'ตัวแปรและการตั้งค่า'];

const TemplateCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [form, setForm] = useState<TemplateForm>({
    name: '',
    description: '',
    category: '',
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    backgroundColor: '#ffffff',
    backgroundImageUrl: '',
    isPublic: false,
  });

  const [backgroundUpload, setBackgroundUpload] = useState<BackgroundUpload>({
    file: null,
    preview: '',
    uploading: false,
    uploadProgress: 0,
  });

  const categories = ['สัมมนา', 'ฝึกอบรม', 'การแข่งขัน', 'การศึกษา', 'อื่นๆ'];
  const canvasSizes = [
    { name: 'A4 แนวนอน', width: 1920, height: 1080, orientation: 'landscape' as const },
    { name: 'A4 แนวตั้ง', width: 1080, height: 1920, orientation: 'portrait' as const },
    { name: 'Letter แนวนอน', width: 1800, height: 1200, orientation: 'landscape' as const },
    { name: 'Letter แนวตั้ง', width: 1200, height: 1800, orientation: 'portrait' as const },
    { name: 'กำหนดเอง', width: 0, height: 0, orientation: 'landscape' as const }
  ];

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
        if (!form.name || !form.category) {
          setError('กรุณากรอกชื่อเทมเพลตและหมวดหมู่');
          return false;
        }
        if (form.name.length < 3) {
          setError('ชื่อเทมเพลตต้องมีอย่างน้อย 3 ตัวอักษร');
          return false;
        }
        break;
      case 1:
        if (form.width <= 0 || form.height <= 0) {
          setError('กรุณาตั้งค่าขนาดผืนผ้าใบให้ถูกต้อง');
          return false;
        }
        if (form.width < 100 || form.height < 100) {
          setError('ขนาดผืนผ้าใบต้องมีอย่างน้อย 100px');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCanvasSizeChange = (size: any) => {
    if (size.width === 0 && size.height === 0) {
      // Custom size - don't change values
      return;
    }
    setForm(prev => ({
      ...prev,
      width: size.width,
      height: size.height,
      orientation: size.orientation
    }));
  };

  const handleBackgroundFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBackgroundUpload(prev => ({
        ...prev,
        file,
        preview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setBackgroundUpload(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));

      const response = await templateService.uploadBackground(
        file,
        (progress) => {
          setBackgroundUpload(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      if (response.success && response.data) {
        setForm(prev => ({
          ...prev,
          backgroundImageUrl: response.data.url
        }));
        setSuccessMessage('อัปโหลดรูปพื้นหลังสำเร็จ');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      setBackgroundUpload({
        file: null,
        preview: '',
        uploading: false,
        uploadProgress: 0
      });
    } finally {
      setBackgroundUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const templateData: TemplateCreateRequest = {
        name: form.name,
        description: form.description,
        category: form.category,
        width: form.width,
        height: form.height,
        orientation: form.orientation,
        backgroundColor: form.backgroundColor,
        backgroundImageUrl: form.backgroundImageUrl,
        isPublic: form.isPublic,
        elements: [] // Empty for now, will be added in designer
      };

      const response = await templateService.createTemplate(templateData);

      if (response.success && response.data) {
        navigate('/templates', {
          state: { message: 'สร้างเทมเพลตสำเร็จ' }
        });
      }
    } catch (err: any) {
      console.error('Error creating template:', err);
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างเทมเพลต');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลพื้นฐานของเทมเพลต
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ชื่อเทมเพลต"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="เช่น เทมเพลตสัมมนาพื้นฐาน"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="คำอธิบาย"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="อธิบายการใช้งานและลักษณะของเทมเพลต"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>หมวดหมู่</InputLabel>
                    <Select
                      value={form.category}
                      label="หมวดหมู่"
                      onChange={(e) => handleFormChange('category', e.target.value)}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isPublic}
                        onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                      />
                    }
                    label="เผยแพร่สาธารณะ"
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
                การตั้งค่าผืนผ้าใบ
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    ขนาดผืนผ้าใบ
                  </Typography>
                  <Grid container spacing={2}>
                    {canvasSizes.map((size) => (
                      <Grid item xs={12} sm={6} md={4} key={size.name}>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: (form.canvas.width === size.width && form.canvas.height === size.height) ? '2px solid' : '1px solid',
                            borderColor: (form.canvas.width === size.width && form.canvas.height === size.height) ? 'primary.main' : 'divider',
                            '&:hover': {
                              boxShadow: 2
                            }
                          }}
                          onClick={() => handleCanvasSizeChange(size)}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {size.name}
                          </Typography>
                          {size.width > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              {size.width} x {size.height} px
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="ความกว้าง (px)"
                    value={form.width}
                    onChange={(e) => handleFormChange('width', parseInt(e.target.value))}
                    inputProps={{ min: 100, max: 5000 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="ความสูง (px)"
                    value={form.height}
                    onChange={(e) => handleFormChange('height', parseInt(e.target.value))}
                    inputProps={{ min: 100, max: 5000 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    สีพื้นหลัง
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => handleFormChange('backgroundColor', e.target.value)}
                      style={{ width: 50, height: 50, border: 'none', borderRadius: 4 }}
                    />
                    <TextField
                      label="รหัสสี"
                      value={form.backgroundColor}
                      onChange={(e) => handleFormChange('backgroundColor', e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    รูปภาพพื้นหลัง
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'grey.50'
                      }
                    }}
                    onClick={() => document.getElementById('background-upload')?.click()}
                  >
                    <input
                      id="background-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleBackgroundFileChange}
                    />
                    {backgroundUpload.uploading ? (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          กำลังอัปโหลด... {backgroundUpload.uploadProgress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={backgroundUpload.uploadProgress} />
                      </Box>
                    ) : backgroundUpload.preview || form.backgroundImageUrl ? (
                      <Box>
                        <Box
                          component="img"
                          src={backgroundUpload.preview || form.backgroundImageUrl}
                          sx={{ maxWidth: '100%', maxHeight: 200, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          คลิกเพื่อเปลี่ยนรูปภาพ
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" gutterBottom>
                          คลิกเพื่ออัปโหลดรูปภาพพื้นหลัง
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    ตัวอย่างผืนผ้าใบ
                  </Typography>
                  <Paper
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: form.backgroundColor,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundImage: form.backgroundImageUrl ? `url(${form.backgroundImageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!form.backgroundImageUrl && (
                      <Typography variant="body2" color="text.secondary">
                        ตัวอย่างผืนผ้าใบ ({form.width} x {form.height})
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ออกแบบเทมเพลต
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                ในขั้นตอนนี้คุณสามารถใช้เครื่องมือออกแบบเพื่อสร้างเทมเพลตของคุณ
                หรือข้ามไปขั้นตอนถัดไปเพื่อตั้งค่าตัวแปรก่อน
              </Alert>
              
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50'
                }}
              >
                <Palette sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  เครื่องมือออกแบบ
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  เครื่องมือออกแบบแบบ drag-and-drop จะแสดงที่นี่
                  <br />
                  คุณสามารถเพิ่มข้อความ รูปภาพ และองค์ประกอบอื่นๆ
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/designer')}
                >
                  เปิดเครื่องมือออกแบบ
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                สรุปและยืนยัน
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                คุณสามารถเพิ่มองค์ประกอบและตัวแปรต่างๆ ได้หลังจากสร้างเทมเพลตแล้ว
                โดยใช้เครื่องมือออกแบบ
              </Alert>

              <Typography variant="subtitle1" gutterBottom>
                สรุปเทมเพลต
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">ชื่อเทมเพลต</Typography>
                    <Typography variant="body1">{form.name || '-'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">หมวดหมู่</Typography>
                    <Typography variant="body1">{form.category || '-'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">ขนาดผืนผ้าใบ</Typography>
                    <Typography variant="body1">{form.width} x {form.height} px ({form.orientation === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'})</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">สถานะ</Typography>
                    <Typography variant="body1">{form.isPublic ? 'สาธารณะ' : 'ส่วนตัว'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>คำอธิบาย</Typography>
                    <Typography variant="body1">{form.description || 'ไม่มีคำอธิบาย'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>ตัวอย่างพื้นหลัง</Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        bgcolor: form.backgroundColor,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundImage: form.backgroundImageUrl ? `url(${form.backgroundImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!form.backgroundImageUrl && (
                        <Typography variant="body2" color="text.secondary">
                          สีพื้นหลัง: {form.backgroundColor}
                        </Typography>
                      )}
                    </Box>
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
            onClick={() => navigate('/templates')}
            sx={{ mr: 2 }}
          >
            กลับ
          </Button>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              สร้างเทมเพลตใหม่
            </Typography>
            <Typography variant="body1" color="text.secondary">
              สร้างเทมเพลตเกียรติบัตรแบบกำหนดเอง
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

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
                    variant="outlined"
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
                    {loading ? 'กำลังบันทึก...' : 'สร้างเทมเพลต'}
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
      </Box>
    </DashboardLayout>
  );
};

export default TemplateCreatePage;