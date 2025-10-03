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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface TemplateForm {
  name: string;
  description: string;
  category: string;
  tags: string[];
  is_public: boolean;
  canvas: {
    width: number;
    height: number;
    background_color: string;
    background_image?: string;
  };
  elements: TemplateElement[];
  variables: TemplateVariable[];
}

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr_code';
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: any;
  content: any;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number';
  default_value: string;
  required: boolean;
  description: string;
}

const steps = ['ข้อมูลพื้นฐาน', 'การตั้งค่าผืนผ้าใบ', 'ออกแบบเทมเพลต', 'ตัวแปรและการตั้งค่า'];

const TemplateCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [form, setForm] = useState<TemplateForm>({
    name: '',
    description: '',
    category: '',
    tags: [],
    is_public: false,
    canvas: {
      width: 1920,
      height: 1080,
      background_color: '#ffffff',
    },
    elements: [],
    variables: []
  });

  const categories = ['สัมมนา', 'ฝึกอบรม', 'การแข่งขัน', 'การศึกษา', 'อื่นๆ'];
  const commonTags = ['พื้นฐาน', 'ขั้นสูง', 'ทั่วไป', 'เชิงลึก', 'นักศึกษา', 'มหาวิทยาลัย', 'ปริญญา'];
  const canvasSizes = [
    { name: 'A4 แนวนอน', width: 1920, height: 1080 },
    { name: 'A4 แนวตั้ง', width: 1080, height: 1920 },
    { name: 'Letter แนวนอน', width: 1800, height: 1200 },
    { name: 'Letter แนวตั้ง', width: 1200, height: 1800 },
    { name: 'กำหนดเอง', width: 0, height: 0 }
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
        if (!form.name || !form.description || !form.category) {
          setError('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        break;
      case 1:
        if (form.canvas.width <= 0 || form.canvas.height <= 0) {
          setError('กรุณาตั้งค่าขนาดผืนผ้าใบ');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleFormChange = (field: string, value: any) => {
    if (field.startsWith('canvas.')) {
      const canvasField = field.replace('canvas.', '');
      setForm(prev => ({
        ...prev,
        canvas: {
          ...prev.canvas,
          [canvasField]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCanvasSizeChange = (size: any) => {
    if (size.width === 0 && size.height === 0) {
      // Custom size - don't change values
      return;
    }
    setForm(prev => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        width: size.width,
        height: size.height
      }
    }));
  };

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: `variable_${form.variables.length + 1}`,
      type: 'text',
      default_value: '',
      required: false,
      description: ''
    };
    setForm(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable]
    }));
  };

  const updateVariable = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    setForm(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Submit to API
      console.log('Creating template:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/templates', { 
        state: { message: 'สร้างเทมเพลตสำเร็จ' }
      });
    } catch (err: any) {
      setError(err.message);
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
                        checked={form.is_public}
                        onChange={(e) => handleFormChange('is_public', e.target.checked)}
                      />
                    }
                    label="เผยแพร่สาธารณะ"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={commonTags}
                    freeSolo
                    value={form.tags}
                    onChange={(_, newValue) => handleFormChange('tags', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="แท็ก"
                        placeholder="เพิ่มแท็กเพื่อช่วยในการค้นหา"
                      />
                    )}
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
                    value={form.canvas.width}
                    onChange={(e) => handleFormChange('canvas.width', parseInt(e.target.value))}
                    inputProps={{ min: 100, max: 5000 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="ความสูง (px)"
                    value={form.canvas.height}
                    onChange={(e) => handleFormChange('canvas.height', parseInt(e.target.value))}
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
                      value={form.canvas.background_color}
                      onChange={(e) => handleFormChange('canvas.background_color', e.target.value)}
                      style={{ width: 50, height: 50, border: 'none', borderRadius: 4 }}
                    />
                    <TextField
                      label="รหัสสี"
                      value={form.canvas.background_color}
                      onChange={(e) => handleFormChange('canvas.background_color', e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: form.canvas.background_color,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      ตัวอย่างผืนผ้าใบ ({form.canvas.width} x {form.canvas.height})
                    </Typography>
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
                ตัวแปรและการตั้งค่า
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  ตัวแปรในเทมเพลต
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={addVariable}
                >
                  เพิ่มตัวแปร
                </Button>
              </Box>

              {form.variables.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    ยังไม่มีตัวแปร คลิก "เพิ่มตัวแปร" เพื่อเพิ่มตัวแปรใหม่
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {form.variables.map((variable, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="ชื่อตัวแปร"
                            value={variable.name}
                            onChange={(e) => updateVariable(index, 'name', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>ประเภท</InputLabel>
                            <Select
                              value={variable.type}
                              label="ประเภท"
                              onChange={(e) => updateVariable(index, 'type', e.target.value)}
                            >
                              <MenuItem value="text">ข้อความ</MenuItem>
                              <MenuItem value="date">วันที่</MenuItem>
                              <MenuItem value="number">ตัวเลข</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="ค่าเริ่มต้น"
                            value={variable.default_value}
                            onChange={(e) => updateVariable(index, 'default_value', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="คำอธิบาย"
                            value={variable.description}
                            onChange={(e) => updateVariable(index, 'description', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={1}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={variable.required}
                                onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                                size="small"
                              />
                            }
                            label="จำเป็น"
                            labelPlacement="top"
                          />
                        </Grid>
                        <Grid item xs={12} md={1}>
                          <Button
                            color="error"
                            onClick={() => removeVariable(index)}
                            size="small"
                          >
                            ลบ
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                สรุปเทมเพลต
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">ชื่อเทมเพลต</Typography>
                    <Typography variant="body1">{form.name}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">หมวดหมู่</Typography>
                    <Typography variant="body1">{form.category}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">ขนาดผืนผ้าใบ</Typography>
                    <Typography variant="body1">{form.canvas.width} x {form.canvas.height} px</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">จำนวนตัวแปร</Typography>
                    <Typography variant="body1">{form.variables.length} ตัวแปร</Typography>
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