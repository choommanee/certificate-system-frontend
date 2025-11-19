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
  Chip,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  CardMedia,
  CardActions,
  LinearProgress,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  FileCopy,
  Download,
  Share,
  Category,
  Description,
  TrendingUp,
  Star,
  StarBorder,
  Public,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { templateService } from '../services/api/templateService';
import type { Template } from '../services/api/types';

interface TemplateStats {
  total_templates: number;
  published_templates: number;
  draft_templates: number;
  most_used_template: string;
  total_usage: number;
}

const TemplateListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);

  // Fetch templates from API
  const fetchTemplates = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page,
        limit: 12,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (categoryFilter && categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (statusFilter && statusFilter !== 'all') {
        const statusMap: { [key: string]: boolean } = {
          'published': true,
          'draft': false,
        };
        if (statusFilter in statusMap) {
          params.isActive = statusMap[statusFilter];
        }
      }

      const response = await templateService.getTemplates(params);

      if (response.success && response.data) {
        setTemplates(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalTemplates(response.data.total);

        // Calculate stats from loaded data
        const activeTemplates = response.data.data.filter((t: Template) => t.isActive);
        const inactiveTemplates = response.data.data.filter((t: Template) => !t.isActive);
        const totalUsage = response.data.data.reduce((sum: number, t: Template) => sum + (t.usageCount || 0), 0);
        const mostUsed = response.data.data.reduce((prev: Template | null, curr: Template) =>
          !prev || (curr.usageCount || 0) > (prev.usageCount || 0) ? curr : prev, null as Template | null
        );

        setStats({
          total_templates: response.data.total,
          published_templates: activeTemplates.length,
          draft_templates: inactiveTemplates.length,
          most_used_template: mostUsed?.name || '-',
          total_usage: totalUsage
        });
      }
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, categoryFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchTemplates();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Show success message from navigation state
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const categories = ['สัมมนา', 'ฝึกอบรม', 'การแข่งขัน', 'การศึกษา', 'อื่นๆ'];

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'warning';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'เผยแพร่แล้ว' : 'ร่าง';
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, template: Template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleView = () => {
    if (selectedTemplate) {
      navigate(`/templates/${selectedTemplate.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      navigate(`/templates/${selectedTemplate.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDuplicate = () => {
    if (selectedTemplate) {
      setDuplicateName(`${selectedTemplate.name} (สำเนา)`);
      setDuplicateDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmDuplicate = async () => {
    if (selectedTemplate && duplicateName) {
      try {
        setLoading(true);
        const response = await templateService.cloneTemplate(selectedTemplate.id, duplicateName);

        if (response.success) {
          setSuccessMessage('ทำสำเนาเทมเพลตสำเร็จ');
          fetchTemplates(); // Refresh the list
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการทำสำเนาเทมเพลต');
      } finally {
        setLoading(false);
        setDuplicateDialogOpen(false);
        setDuplicateName('');
        setSelectedTemplate(null);
      }
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedTemplate) {
      try {
        setLoading(true);
        const response = await templateService.deleteTemplate(selectedTemplate.id);

        if (response.success) {
          setSuccessMessage('ลบเทมเพลตสำเร็จ');
          fetchTemplates(); // Refresh the list
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบเทมเพลต');
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setSelectedTemplate(null);
      }
    }
  };

  const handleTogglePublic = async (template: Template) => {
    try {
      const response = await templateService.togglePublic(template.id, !template.isPublic);

      if (response.success) {
        setTemplates(prev =>
          prev.map(t =>
            t.id === template.id ? { ...t, isPublic: !t.isPublic } : t
          )
        );
        setSuccessMessage(`เปลี่ยนสถานะเป็น${!template.isPublic ? 'สาธารณะ' : 'ส่วนตัว'}แล้ว`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const canCreateTemplate = user?.role === 'staff' || user?.role === 'admin';
  const canEditTemplate = user?.role === 'staff' || user?.role === 'admin';
  const canDeleteTemplate = user?.role === 'admin';

  const renderGridView = () => (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {/* Thumbnail */}
            <Box
              sx={{
                height: 200,
                bgcolor: template.backgroundColor || 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundImage: template.backgroundImageUrl ? `url(${template.backgroundImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!template.backgroundImageUrl && (
                <Description sx={{ fontSize: 64, color: 'text.secondary' }} />
              )}

              {/* Status Badge */}
              <Chip
                label={getStatusText(template.isActive)}
                color={getStatusColor(template.isActive) as any}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />

              {/* Public Icon */}
              <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                {template.isPublic ? (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                    <Public sx={{ fontSize: 16 }} />
                  </Avatar>
                ) : (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.500' }}>
                    <Lock sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
              </Box>

              {/* Usage Count */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem'
                }}
              >
                ใช้งาน {template.usageCount || 0} ครั้ง
              </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom noWrap>
                {template.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {template.description || 'ไม่มีคำอธิบาย'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {template.category && (
                  <Chip label={template.category} size="small" color="primary" variant="outlined" />
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                สร้างโดย: {template.createdBy || 'ไม่ระบุ'}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                ขนาด: {template.width}x{template.height} px
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <Visibility />
                </IconButton>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, template)}
              >
                <MoreVert />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Card>
      <CardContent>
        {templates.map((template, index) => (
          <Box key={template.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <Description />
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {template.name}
                  </Typography>
                  <Chip
                    label={getStatusText(template.isActive)}
                    color={getStatusColor(template.isActive) as any}
                    size="small"
                    variant="outlined"
                  />
                  {template.isPublic ? <Public color="success" sx={{ fontSize: 16 }} /> : <Lock color="disabled" sx={{ fontSize: 16 }} />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {template.description || 'ไม่มีคำอธิบาย'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {template.category && (
                    <Typography variant="caption" color="text.secondary">
                      หมวดหมู่: {template.category}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    ใช้งาน: {template.usageCount || 0} ครั้ง
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ขนาด: {template.width}x{template.height} px
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  ดู
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, template)}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
            {index < templates.length - 1 && <Divider />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              จัดการเทมเพลต
            </Typography>
            <Typography variant="body1" color="text.secondary">
              สร้าง แก้ไข และจัดการเทมเพลตเกียรติบัตร
            </Typography>
          </Box>
          {canCreateTemplate && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/templates/create')}
              sx={{ borderRadius: 2 }}
            >
              สร้างเทมเพลตใหม่
            </Button>
          )}
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

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Description color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary.main">
                  {stats?.total_templates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เทมเพลตทั้งหมด
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Public color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {stats?.published_templates || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เผยแพร่แล้ว
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {stats?.total_usage || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  การใช้งานทั้งหมด
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Star color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" color="warning.main" noWrap>
                  {stats?.most_used_template || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ใช้งานมากที่สุด
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="ค้นหาเทมเพลต, หมวดหมู่, หรือแท็ก..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="หมวดหมู่"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={statusFilter}
                    label="สถานะ"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="published">เผยแพร่แล้ว</MenuItem>
                    <MenuItem value="draft">ร่าง</MenuItem>
                    <MenuItem value="archived">เก็บถาวร</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  fullWidth
                >
                  ตัวกรองเพิ่มเติม
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('grid')}
                    size="small"
                  >
                    ตาราง
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('list')}
                    size="small"
                  >
                    รายการ
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Loading Progress */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Templates Display */}
        {!loading && templates.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                ไม่พบเทมเพลต
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'ไม่พบเทมเพลตที่ตรงกับเงื่อนไขการค้นหา'
                  : 'ยังไม่มีเทมเพลตในระบบ'}
              </Typography>
              {canCreateTemplate && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/templates/create')}
                >
                  สร้างเทมเพลตแรก
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuList>
            <MenuItemComponent onClick={handleView}>
              <ListItemIcon>
                <Visibility />
              </ListItemIcon>
              <ListItemText>ดูรายละเอียด</ListItemText>
            </MenuItemComponent>
            {canEditTemplate && (
              <MenuItemComponent onClick={handleEdit}>
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                <ListItemText>แก้ไข</ListItemText>
              </MenuItemComponent>
            )}
            <MenuItemComponent onClick={handleDuplicate}>
              <ListItemIcon>
                <FileCopy />
              </ListItemIcon>
              <ListItemText>ทำสำเนา</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => window.open('#', '_blank')}>
              <ListItemIcon>
                <Download />
              </ListItemIcon>
              <ListItemText>ดาวน์โหลด</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => {}}>
              <ListItemIcon>
                <Share />
              </ListItemIcon>
              <ListItemText>แชร์</ListItemText>
            </MenuItemComponent>
            {canDeleteTemplate && (
              <MenuItemComponent onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Delete color="error" />
                </ListItemIcon>
                <ListItemText>ลบ</ListItemText>
              </MenuItemComponent>
            )}
          </MenuList>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogContent>
            <Typography>
              คุณแน่ใจหรือไม่ที่จะลบเทมเพลต "{selectedTemplate?.name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              การดำเนินการนี้ไม่สามารถยกเลิกได้
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
        <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
          <DialogTitle>ทำสำเนาเทมเพลต</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="ชื่อเทมเพลตใหม่"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDuplicateDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={confirmDuplicate} variant="contained" disabled={!duplicateName}>
              สร้างสำเนา
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default TemplateListPage;