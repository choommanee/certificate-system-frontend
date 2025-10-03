import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  Work,
  School,
  Badge,
  Security,
  History,
  Analytics,
  PhotoCamera,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useSigner } from '../../hooks/useSigner';

const SignerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats } = useSigner();
  const [editMode, setEditMode] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'อาจารย์ผู้ลงนาม',
    email: user?.email || 'signer@example.com',
    phone: '02-123-4567',
    department: 'คณะเศรษฐศาสตร์',
    position: 'อาจารย์ประจำ',
    employeeId: 'EMP001',
    specialization: 'เศรษฐศาสตร์การเงิน',
    education: 'ปริญญาเอก เศรษฐศาสตร์',
    experience: '15 ปี',
  });

  const handleSaveProfile = () => {
    // Implementation for saving profile
    console.log('Saving profile:', profileData);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SignerDashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: '#1976d2' }}>
                  โปรไฟล์ของฉัน
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  จัดการข้อมูลส่วนตัวและประวัติการทำงาน
                </Typography>
              </Box>
            </Box>
            
            {!editMode ? (
              <Button variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                แก้ไขข้อมูล
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancelEdit} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  ยกเลิก
                </Button>
                <Button variant="contained" startIcon={<Save />} onClick={handleSaveProfile} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  บันทึก
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      margin: '0 auto'
                    }}
                  >
                    <Edit />
                  </Avatar>
                  {editMode && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                      onClick={() => setAvatarDialogOpen(true)}
                    >
                      <PhotoCamera />
                    </IconButton>
                  )}
                </Box>
                
                <Typography variant="h5" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 1 }}>
                  {profileData.name}
                </Typography>
                
                <Chip
                  label="ผู้ลงนาม"
                  color="primary"
                  sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}>
                  {profileData.position}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  {profileData.department}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                {/* Quick Stats */}
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {stats?.totalSigned || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ลงนามแล้ว
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      {stats?.pendingCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      รอลงนาม
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {profileData.experience}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ประสบการณ์
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 3 }}>
                  ข้อมูลส่วนตัว
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ชื่อ-นามสกุล"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="อีเมล"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="เบอร์โทรศัพท์"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="รหัสพนักงาน"
                      value={profileData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="หน่วยงาน"
                      value={profileData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ตำแหน่ง"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ความเชี่ยวชาญ"
                      value={profileData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      disabled={!editMode}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="วุฒิการศึกษา"
                      value={profileData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 3 }}>
                  สรุปกิจกรรม
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {stats?.totalSigned || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        เอกสารที่ลงนามทั้งหมด
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {stats?.completedThisMonth || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        เอกสารเดือนนี้
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {Math.round((stats?.averageProcessingTime || 0) / 60)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        เวลาเฉลี่ย (นาที)
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                      <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {stats?.rejectedCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        เอกสารที่ส่งคืน
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Avatar Upload Dialog */}
        <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            เปลี่ยนรูปโปรไฟล์
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
              />
              <label htmlFor="avatar-upload">
                <Button variant="contained" component="span" startIcon={<PhotoCamera />}>
                  เลือกรูปภาพ
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="contained" onClick={() => setAvatarDialogOpen(false)}>
              อัปโหลด
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerProfilePage;