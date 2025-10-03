import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  CloudUpload,
  Visibility,
  Search,
  Person,
  Work,
  Email,
  Phone,
  Badge,
  Image,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface Signatory {
  id: string;
  name: string;
  position: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  signature: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface SignatoryForm {
  name: string;
  position: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  signature: File | null;
}

const SignatoryManagementPage: React.FC = () => {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSignatory, setEditingSignatory] = useState<Signatory | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSignatory, setSelectedSignatory] = useState<Signatory | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<SignatoryForm>({
    name: '',
    position: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    signature: null,
  });

  // Mock data
  const mockSignatories: Signatory[] = [
    {
      id: '1',
      name: 'ศ.ดร.สมชาย ใจดี',
      position: 'คณบดีคณะเศรษฐศาสตร์',
      title: 'ศาสตราจารย์',
      department: 'คณะเศรษฐศาสตร์',
      email: 'somchai@econ.tu.ac.th',
      phone: '02-613-2200',
      signature: '/signatures/somchai.png',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'รศ.ดร.สมหญิง รักงาน',
      position: 'รองคณบดีฝ่ายวิชาการ',
      title: 'รองศาสตราจารย์',
      department: 'คณะเศรษฐศาสตร์',
      email: 'somying@econ.tu.ac.th',
      phone: '02-613-2201',
      signature: '/signatures/somying.png',
      status: 'active',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-02-15T11:00:00Z'
    },
    {
      id: '3',
      name: 'ผศ.ดร.บุญชู ขยัน',
      position: 'หัวหน้าภาควิชาเศรษฐศาสตร์',
      title: 'ผู้ช่วยศาสตราจารย์',
      department: 'ภาควิชาเศรษฐศาสตร์',
      email: 'boonchoo@econ.tu.ac.th',
      phone: '02-613-2202',
      signature: null,
      status: 'inactive',
      createdAt: '2024-01-05T08:00:00Z',
      updatedAt: '2024-01-05T08:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSignatories(mockSignatories);
      setLoading(false);
    }, 1000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setForm(prev => ({ ...prev, signature: acceptedFiles[0] }));
      }
    }
  });

  const handleInputChange = (field: keyof SignatoryForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleOpenDialog = (signatory?: Signatory) => {
    if (signatory) {
      setEditingSignatory(signatory);
      setForm({
        name: signatory.name,
        position: signatory.position,
        title: signatory.title,
        department: signatory.department,
        email: signatory.email,
        phone: signatory.phone,
        signature: null,
      });
    } else {
      setEditingSignatory(null);
      setForm({
        name: '',
        position: '',
        title: '',
        department: '',
        email: '',
        phone: '',
        signature: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSignatory(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!form.name || !form.position || !form.email) {
      setError('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    try {
      // TODO: Submit to API
      console.log('Saving signatory:', form);
      
      if (editingSignatory) {
        // Update existing
        setSignatories(prev => prev.map(s => 
          s.id === editingSignatory.id 
            ? { ...s, ...form, updatedAt: new Date().toISOString() }
            : s
        ));
        setSuccess('อัปเดตข้อมูลผู้ลงนามสำเร็จ');
      } else {
        // Create new
        const newSignatory: Signatory = {
          id: Date.now().toString(),
          ...form,
          signature: form.signature ? `/signatures/${form.signature.name}` : null,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSignatories(prev => [...prev, newSignatory]);
        setSuccess('เพิ่มผู้ลงนามใหม่สำเร็จ');
      }
      
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, signatory: Signatory) => {
    setAnchorEl(event.currentTarget);
    setSelectedSignatory(signatory);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSignatory(null);
  };

  const handleDelete = () => {
    if (selectedSignatory) {
      setSignatories(prev => prev.filter(s => s.id !== selectedSignatory.id));
      setDeleteDialog(false);
      handleMenuClose();
    }
  };

  const handleToggleStatus = () => {
    if (selectedSignatory) {
      setSignatories(prev => prev.map(s => 
        s.id === selectedSignatory.id 
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      ));
      handleMenuClose();
    }
  };

  const filteredSignatories = signatories.filter(signatory =>
    signatory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signatory.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signatory.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              ✍️ จัดการผู้มีอำนาจลงนาม
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              จัดการข้อมูลและลายเซ็นของผู้มีอำนาจลงนามในเกียรติบัตร
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            เพิ่มผู้ลงนาม
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <TextField
            fullWidth
            placeholder="ค้นหาผู้ลงนาม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Paper>

        {/* Signatories Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>กำลังโหลดข้อมูลผู้ลงนาม...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredSignatories.map((signatory) => (
              <Grid item xs={12} md={6} lg={4} key={signatory.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={signatory.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        color={signatory.status === 'active' ? 'success' : 'default'}
                        size="small"
                        variant="filled"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, signatory)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Avatar and Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem'
                        }}
                      >
                        {signatory.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {signatory.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {signatory.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {signatory.position}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {signatory.department}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {signatory.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {signatory.phone}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Signature Status */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Image sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          ลายเซ็น:
                        </Typography>
                        <Chip
                          label={signatory.signature ? 'อัปโหลดแล้ว' : 'ยังไม่อัปโหลด'}
                          color={signatory.signature ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(signatory)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      disabled={!signatory.signature}
                    >
                      ดูลายเซ็น
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedSignatory) handleOpenDialog(selectedSignatory);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            แก้ไข
          </MenuItem>
          <MenuItem onClick={handleToggleStatus}>
            {selectedSignatory?.status === 'active' ? (
              <>
                <Person sx={{ mr: 1 }} />
                ปิดใช้งาน
              </>
            ) : (
              <>
                <Person sx={{ mr: 1 }} />
                เปิดใช้งาน
              </>
            )}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setDeleteDialog(true)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            ลบ
          </MenuItem>
        </Menu>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingSignatory ? 'แก้ไขข้อมูลผู้ลงนาม' : 'เพิ่มผู้ลงนามใหม่'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ชื่อ-นามสกุล"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="คำนำหน้า/ตำแหน่งทางวิชาการ"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  placeholder="เช่น ศ.ดร., รศ.ดร., ผศ.ดร."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ตำแหน่งงาน"
                  value={form.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  placeholder="เช่น คณบดีคณะเศรษฐศาสตร์"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="หน่วยงาน/ภาควิชา"
                  value={form.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="อีเมล"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  อัปโหลดลายเซ็น
                </Typography>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'primary.light' : 'grey.50',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {form.signature ? form.signature.name : 'ลากไฟล์มาวางที่นี่'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    รองรับไฟล์ PNG, JPG, JPEG เท่านั้น
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              {editingSignatory ? 'อัปเดต' : 'เพิ่ม'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>ยืนยันการลบผู้ลงนาม</DialogTitle>
          <DialogContent>
            <Typography>
              คุณต้องการลบ "{selectedSignatory?.name}" หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              ลบ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default SignatoryManagementPage;