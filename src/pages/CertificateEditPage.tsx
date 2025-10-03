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
  Alert,
  Grid,
  Paper,
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
  Divider,
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
  Edit,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
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

interface Certificate {
  id: string;
  name: string;
  course_name: string;
  template_id: string;
  template_name: string;
  recipient: Recipient;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  issue_date: string;
  description: string;
  custom_fields: { [key: string]: string };
  created_at: string;
  updated_at: string;
}

const CertificateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [availableRecipients, setAvailableRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');

  // Mock data
  const mockCertificate: Certificate = {
    id: '1',
    name: 'เกียรติบัตรการเข้าร่วมสัมมนา',
    course_name: 'การพัฒนาเศรษฐกิจดิจิทัล',
    template_id: '1',
    template_name: 'เทมเพลตสัมมนา',
    recipient: {
      id: '1',
      name: 'นายสมชาย ใจดี',
      email: 'somchai@example.com',
      student_id: '6401234567',
      department: 'เศรษฐศาสตร์'
    },
    status: 'draft',
    issue_date: '2024-01-16',
    description: 'เกียรติบัตรสำหรับผู้เข้าร่วมสัมมนาการพัฒนาเศรษฐกิจดิจิทัล',
    custom_fields: {
      'duration': '8 ชั่วโมง',
      'location': 'ห้องประชุมใหญ่ คณะเศรษฐศาสตร์'
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

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
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCertificate(mockCertificate);
      setTemplates(mockTemplates);
      setAvailableRecipients(mockRecipients);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleFieldChange = (field: string, value: any) => {
    if (certificate) {
      setCertificate({
        ...certificate,
        [field]: value
      });
      setUnsavedChanges(true);
    }
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    if (certificate) {
      setCertificate({
        ...certificate,
        custom_fields: {
          ...certificate.custom_fields,
          [key]: value
        }
      });
      setUnsavedChanges(true);
    }
  };

  const handleRecipientChange = (recipient: Recipient | null) => {
    if (certificate && recipient) {
      setCertificate({
        ...certificate,
        recipient
      });
      setUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!certificate) return;

    setSaving(true);
    try {
      // TODO: Save to API
      console.log('Saving certificate:', certificate);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUnsavedChanges(false);
      navigate(`/certificates/${id}`, {
        state: { message: 'บันทึกการแก้ไขสำเร็จ' }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      if (window.confirm('คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?')) {
        navigate(`/certificates/${id}`);
      }
    } else {
      navigate(`/certificates/${id}`);
    }
  };

  const selectedTemplate = templates.find(t => t.id === certificate?.template_id);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!certificate) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">ไม่พบเกียรติบัตรที่ต้องการแก้ไข</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleCancel}
              sx={{ mr: 2 }}
            >
              กลับ
            </Button>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                แก้ไขเกียรติบัตร
              </Typography>
              <Typography variant="body1" color="text.secondary">
                แก้ไขข้อมูลเกียรติบัตร: {certificate.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Preview />}
              onClick={() => setPreviewDialogOpen(true)}
              variant="outlined"
            >
              ดูตัวอย่าง
            </Button>
            <Button
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving || !unsavedChanges}
              variant="contained"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Box>
        </Box>

        {/* Unsaved Changes Warning */}
        {unsavedChanges && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} lg={8}>
            {/* Basic Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลพื้นฐาน
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ชื่อเกียรติบัตร"
                      value={certificate.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ชื่อหลักสูตร/กิจกรรม"
                      value={certificate.course_name}
                      onChange={(e) => handleFieldChange('course_name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="วันที่ออกเกียรติบัตร"
                      value={certificate.issue_date}
                      onChange={(e) => handleFieldChange('issue_date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="รายละเอียดเพิ่มเติม"
                      value={certificate.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  เทมเพลตเกียรติบัตร
                </Typography>
                <Grid container spacing={2}>
                  {templates.map((template) => (
                    <Grid item xs={12} sm={6} md={4} key={template.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: certificate.template_id === template.id ? '2px solid' : '1px solid',
                          borderColor: certificate.template_id === template.id ? 'primary.main' : 'divider',
                          '&:hover': {
                            boxShadow: 2
                          }
                        }}
                        onClick={() => handleFieldChange('template_id', template.id)}
                      >
                        <Box
                          sx={{
                            height: 120,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Description sx={{ fontSize: 48, color: 'text.secondary' }} />
                        </Box>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {template.name}
                          </Typography>
                          <Chip label={template.category} size="small" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลเพิ่มเติม
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(certificate.custom_fields).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <TextField
                        fullWidth
                        label={key}
                        value={value}
                        onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Current Recipient */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ผู้รับเกียรติบัตร
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {certificate.recipient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {certificate.recipient.email}
                    </Typography>
                    {certificate.recipient.student_id && (
                      <Typography variant="caption" color="text.secondary">
                        รหัสนักศึกษา: {certificate.recipient.student_id}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    onClick={() => setRecipientSearchTerm('')}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                </Box>

                {/* Change Recipient */}
                <Autocomplete
                  options={availableRecipients}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={certificate.recipient}
                  onChange={(_, newValue) => handleRecipientChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เปลี่ยนผู้รับ"
                      placeholder="ค้นหาผู้รับใหม่..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </CardContent>
            </Card>

            {/* Certificate Status */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  สถานะเกียรติบัตร
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={certificate.status === 'draft' ? 'ร่าง' : 
                           certificate.status === 'pending' ? 'รอการอนุมัติ' :
                           certificate.status === 'approved' ? 'อนุมัติแล้ว' :
                           certificate.status === 'published' ? 'เผยแพร่แล้ว' : 'ถูกปฏิเสธ'}
                    color={certificate.status === 'published' ? 'success' :
                           certificate.status === 'approved' ? 'info' :
                           certificate.status === 'pending' ? 'warning' :
                           certificate.status === 'rejected' ? 'error' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  สร้างเมื่อ: {new Date(certificate.created_at).toLocaleString('th-TH')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  แก้ไขล่าสุด: {new Date(certificate.updated_at).toLocaleString('th-TH')}
                </Typography>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  การดำเนินการ
                </Typography>
                <List dense>
                  <ListItem button onClick={() => setPreviewDialogOpen(true)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Preview />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="ดูตัวอย่าง"
                      secondary="ดูตัวอย่างเกียรติบัตรก่อนบันทึก"
                    />
                  </ListItem>
                  
                  <ListItem button onClick={handleSave} disabled={!unsavedChanges}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Save />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="บันทึกการแก้ไข"
                      secondary="บันทึกการเปลี่ยนแปลงทั้งหมด"
                    />
                  </ListItem>

                  <ListItem button onClick={handleCancel}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <Cancel />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="ยกเลิกการแก้ไข"
                      secondary="กลับไปหน้ารายละเอียด"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  ตัวอย่างเกียรติบัตร
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {certificate.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  สำหรับ: {certificate.recipient.name}
                </Typography>
              </Box>
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

export default CertificateEditPage;