import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Snackbar,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  FileCopy,
  Download,
  Share,
  Star,
  StarBorder,
  Public,
  Lock,
  Visibility,
  MoreVert,
  Description,
  Category,
  Person,
  CalendarToday,
  TrendingUp,
  Assignment,
  Palette,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { templateService } from '../services/api/templateService';
import type { Template } from '../services/api/types';

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch template details
  const fetchTemplate = async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await templateService.getTemplate(id);

      if (response.success && response.data) {
        setTemplate(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching template:', err);
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'warning';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'เผยแพร่แล้ว' : 'ร่าง';
  };

  const handleEdit = () => {
    navigate(`/templates/${id}/edit`);
  };

  const handleDuplicate = () => {
    if (template) {
      setDuplicateName(`${template.name} (สำเนา)`);
      setDuplicateDialogOpen(true);
    }
  };

  const confirmDuplicate = async () => {
    if (!id || !duplicateName) return;

    try {
      setLoading(true);
      const response = await templateService.cloneTemplate(id, duplicateName);

      if (response.success) {
        navigate('/templates', {
          state: { message: 'ทำสำเนาเทมเพลตสำเร็จ' }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการทำสำเนาเทมเพลต');
    } finally {
      setLoading(false);
      setDuplicateDialogOpen(false);
      setDuplicateName('');
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await templateService.deleteTemplate(id);

      if (response.success) {
        navigate('/templates', {
          state: { message: 'ลบเทมเพลตสำเร็จ' }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบเทมเพลต');
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!template || !id) return;

    try {
      const response = await templateService.togglePublic(id, !template.isPublic);

      if (response.success && response.data) {
        setTemplate(response.data);
        setSuccessMessage(`เปลี่ยนสถานะเป็น${!template.isPublic ? 'สาธารณะ' : 'ส่วนตัว'}แล้ว`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleDownload = () => {
    // TODO: Download template
    console.log('Downloading template:', id);
  };

  const handleShare = () => {
    // TODO: Share template
    const shareUrl = `${window.location.origin}/templates/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('คัดลอกลิงก์แล้ว');
  };

  const canEditTemplate = user?.role === 'staff' || user?.role === 'admin';
  const canDeleteTemplate = user?.role === 'admin';

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!template) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">ไม่พบเทมเพลตที่ต้องการ</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/templates')}
              sx={{ mr: 2 }}
            >
              กลับ
            </Button>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                {template.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={getStatusText(template.isActive)}
                  color={getStatusColor(template.isActive) as any}
                  variant="outlined"
                />
                <Chip
                  icon={template.isPublic ? <Public /> : <Lock />}
                  label={template.isPublic ? 'สาธารณะ' : 'ส่วนตัว'}
                  color={template.isPublic ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {canEditTemplate && (
              <Button
                startIcon={<Edit />}
                onClick={handleEdit}
                variant="outlined"
              >
                แก้ไข
              </Button>
            )}

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
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

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Template Preview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ตัวอย่างเทมเพลต
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    bgcolor: template.backgroundColor || '#ffffff',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: template.backgroundImageUrl ? `url(${template.backgroundImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!template.backgroundImageUrl && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        ตัวอย่างเทมเพลต
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.width} x {template.height} px
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Template Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  รายละเอียดเทมเพลต
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">คำอธิบาย</Typography>
                      <Typography variant="body1">{template.description}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">หมวดหมู่</Typography>
                      <Typography variant="body1">{template.category}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ขนาดผืนผ้าใบ</Typography>
                      <Typography variant="body1">
                        {template.width} x {template.height} px ({template.orientation === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'})
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">จำนวนองค์ประกอบ</Typography>
                      <Typography variant="body1">{template.elements?.length || 0} องค์ประกอบ</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">สีพื้นหลัง</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: template.backgroundColor,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1
                          }}
                        />
                        <Typography variant="body1">{template.backgroundColor}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Template Elements */}
            {template.elements && template.elements.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    องค์ประกอบในเทมเพลต
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ประเภท</TableCell>
                          <TableCell>ตำแหน่ง</TableCell>
                          <TableCell>ขนาด</TableCell>
                          <TableCell>เนื้อหา</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {template.elements.map((element, index) => (
                          <TableRow key={element.id || index}>
                            <TableCell>
                              <Chip
                                label={element.type === 'text' ? 'ข้อความ' :
                                       element.type === 'image' ? 'รูปภาพ' :
                                       element.type === 'shape' ? 'รูปทรง' :
                                       element.type === 'qr' ? 'QR Code' :
                                       element.type === 'signature' ? 'ลายเซ็น' : element.type}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                ({element.x}, {element.y})
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {element.width} x {element.height}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {element.content || element.variableName || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Template Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลเทมเพลต
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="ผู้สร้าง"
                      secondary={template.createdBy || 'ไม่ระบุ'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="วันที่สร้าง"
                      secondary={new Date(template.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="แก้ไขล่าสุด"
                      secondary={new Date(template.updatedAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="การใช้งาน"
                      secondary={`${template.usageCount || 0} ครั้ง`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  การดำเนินการ
                </Typography>
                <List dense>
                  <ListItem button onClick={() => navigate(`/certificates/create?template=${id}`)}>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText primary="สร้างเกียรติบัตร" />
                  </ListItem>
                  
                  {canEditTemplate && (
                    <ListItem button onClick={handleEdit}>
                      <ListItemIcon>
                        <Edit />
                      </ListItemIcon>
                      <ListItemText primary="แก้ไขเทมเพลต" />
                    </ListItem>
                  )}

                  <ListItem button onClick={handleDuplicate}>
                    <ListItemIcon>
                      <FileCopy />
                    </ListItemIcon>
                    <ListItemText primary="ทำสำเนา" />
                  </ListItem>

                  <ListItem button onClick={handleDownload}>
                    <ListItemIcon>
                      <Download />
                    </ListItemIcon>
                    <ListItemText primary="ดาวน์โหลด" />
                  </ListItem>

                  <ListItem button onClick={handleShare}>
                    <ListItemIcon>
                      <Share />
                    </ListItemIcon>
                    <ListItemText primary="แชร์" />
                  </ListItem>

                  <ListItem button onClick={handleTogglePublic}>
                    <ListItemIcon>
                      {template.isPublic ? <Lock /> : <Public />}
                    </ListItemIcon>
                    <ListItemText
                      primary={template.isPublic ? 'ทำให้เป็นส่วนตัว' : 'เผยแพร่สาธารณะ'}
                    />
                  </ListItem>

                  {canDeleteTemplate && (
                    <ListItem button onClick={handleDelete} sx={{ color: 'error.main' }}>
                      <ListItemIcon>
                        <Delete color="error" />
                      </ListItemIcon>
                      <ListItemText primary="ลบเทมเพลต" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  สถิติการใช้งาน
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">ความนิยม</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.min(100, ((template.usageCount || 0) / 50) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, ((template.usageCount || 0) / 50) * 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      {template.usageCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ครั้งที่ใช้
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary.main">
                      {template.elements?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      องค์ประกอบ
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => navigate('/designer')}>
            <Palette sx={{ mr: 1 }} />
            เปิดในเครื่องมือออกแบบ
          </MenuItem>
          <MenuItem onClick={handleDuplicate}>
            <FileCopy sx={{ mr: 1 }} />
            ทำสำเนา
          </MenuItem>
          <MenuItem onClick={handleDownload}>
            <Download sx={{ mr: 1 }} />
            ดาวน์โหลด
          </MenuItem>
          <MenuItem onClick={handleShare}>
            <Share sx={{ mr: 1 }} />
            แชร์
          </MenuItem>
          {canDeleteTemplate && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Delete sx={{ mr: 1 }} />
              ลบ
            </MenuItem>
          )}
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogContent>
            <Typography>
              คุณแน่ใจหรือไม่ที่จะลบเทมเพลต "{template.name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              การดำเนินการนี้ไม่สามารถยกเลิกได้ และจะส่งผลต่อเกียรติบัตรที่ใช้เทมเพลตนี้
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              ลบ
            </Button>
          </DialogActions>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>ทำสำเนาเทมเพลต</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              คุณต้องการทำสำเนาเทมเพลต "{template.name}" หรือไม่?
            </Typography>
            <TextField
              fullWidth
              label="ชื่อเทมเพลตใหม่"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              sx={{ mt: 2 }}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDuplicateDialogOpen(false);
              setDuplicateName('');
            }}>
              ยกเลิก
            </Button>
            <Button onClick={confirmDuplicate} variant="contained" disabled={!duplicateName || loading}>
              {loading ? 'กำลังทำสำเนา...' : 'ทำสำเนา'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default TemplateDetailPage;