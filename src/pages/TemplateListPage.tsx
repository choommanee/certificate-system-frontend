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
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  is_public: boolean;
  is_favorite: boolean;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  file_size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');

  // Mock data
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'เทมเพลตสัมมนาพื้นฐาน',
      description: 'เทมเพลตสำหรับเกียรติบัตรการเข้าร่วมสัมมนาทั่วไป',
      category: 'สัมมนา',
      thumbnail_url: '',
      created_by: 'staff@example.com',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-02-20T14:30:00Z',
      usage_count: 45,
      is_public: true,
      is_favorite: true,
      status: 'published',
      tags: ['สัมมนา', 'พื้นฐาน', 'ทั่วไป'],
      file_size: 2.5,
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '2',
      name: 'เทมเพลตฝึกอบรมขั้นสูง',
      description: 'เทมเพลตสำหรับเกียรติบัตรการฝึกอบรมเชิงลึก',
      category: 'ฝึกอบรม',
      thumbnail_url: '',
      created_by: 'admin@example.com',
      created_at: '2024-02-01T09:00:00Z',
      updated_at: '2024-03-10T16:45:00Z',
      usage_count: 32,
      is_public: true,
      is_favorite: false,
      status: 'published',
      tags: ['ฝึกอบรม', 'ขั้นสูง', 'เชิงลึก'],
      file_size: 3.2,
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '3',
      name: 'เทมเพลตการแข่งขันนักศึกษา',
      description: 'เทมเพลตสำหรับเกียรติบัตรการแข่งขันระดับมหาวิทยาลัย',
      category: 'การแข่งขัน',
      thumbnail_url: '',
      created_by: 'staff@example.com',
      created_at: '2024-02-15T11:30:00Z',
      updated_at: '2024-02-15T11:30:00Z',
      usage_count: 18,
      is_public: false,
      is_favorite: true,
      status: 'published',
      tags: ['การแข่งขัน', 'นักศึกษา', 'มหาวิทยาลัย'],
      file_size: 4.1,
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '4',
      name: 'เทมเพลตจบการศึกษา',
      description: 'เทมเพลตสำหรับเกียรติบัตรการสำเร็จการศึกษา',
      category: 'การศึกษา',
      thumbnail_url: '',
      created_by: 'admin@example.com',
      created_at: '2024-03-01T08:00:00Z',
      updated_at: '2024-03-01T08:00:00Z',
      usage_count: 8,
      is_public: true,
      is_favorite: false,
      status: 'draft',
      tags: ['การศึกษา', 'จบการศึกษา', 'ปริญญา'],
      file_size: 5.7,
      dimensions: { width: 1920, height: 1080 }
    }
  ];

  const mockStats: TemplateStats = {
    total_templates: 4,
    published_templates: 3,
    draft_templates: 1,
    most_used_template: 'เทมเพลตสัมมนาพื้นฐาน',
    total_usage: 103
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTemplates(mockTemplates);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['สัมมนา', 'ฝึกอบรม', 'การแข่งขัน', 'การศึกษา', 'อื่นๆ'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'เผยแพร่แล้ว';
      case 'draft': return 'ร่าง';
      case 'archived': return 'เก็บถาวร';
      default: return status;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const confirmDuplicate = () => {
    if (selectedTemplate && duplicateName) {
      // TODO: Duplicate template via API
      console.log('Duplicating template:', selectedTemplate.id, 'with name:', duplicateName);
      setDuplicateDialogOpen(false);
      setDuplicateName('');
      setSelectedTemplate(null);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedTemplate) {
      setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => 
      prev.map(t => 
        t.id === templateId 
          ? { ...t, is_favorite: !t.is_favorite }
          : t
      )
    );
  };

  const handleTogglePublic = (templateId: string) => {
    setTemplates(prev => 
      prev.map(t => 
        t.id === templateId 
          ? { ...t, is_public: !t.is_public }
          : t
      )
    );
  };

  const canCreateTemplate = user?.role === 'staff' || user?.role === 'admin';
  const canEditTemplate = user?.role === 'staff' || user?.role === 'admin';
  const canDeleteTemplate = user?.role === 'admin';

  const renderGridView = () => (
    <Grid container spacing={3}>
      {filteredTemplates.map((template) => (
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
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Description sx={{ fontSize: 64, color: 'text.secondary' }} />
              
              {/* Status Badge */}
              <Chip
                label={getStatusText(template.status)}
                color={getStatusColor(template.status) as any}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8
                }}
              />

              {/* Favorite & Public Icons */}
              <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                {template.is_favorite && (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                    <Star sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                {template.is_public ? (
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
                ใช้งาน {template.usage_count} ครั้ง
              </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom noWrap>
                {template.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {template.description}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Chip label={template.category} size="small" color="primary" variant="outlined" />
                {template.tags.slice(0, 2).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {template.tags.length > 2 && (
                  <Chip label={`+${template.tags.length - 2}`} size="small" variant="outlined" />
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                สร้างโดย: {template.created_by}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                ขนาด: {template.file_size} MB • {template.dimensions.width}x{template.dimensions.height}
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleFavorite(template.id)}
                  color={template.is_favorite ? 'warning' : 'default'}
                >
                  {template.is_favorite ? <Star /> : <StarBorder />}
                </IconButton>
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
        {filteredTemplates.map((template, index) => (
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
                    label={getStatusText(template.status)}
                    color={getStatusColor(template.status) as any}
                    size="small"
                    variant="outlined"
                  />
                  {template.is_favorite && <Star color="warning" sx={{ fontSize: 16 }} />}
                  {template.is_public ? <Public color="success" sx={{ fontSize: 16 }} /> : <Lock color="disabled" sx={{ fontSize: 16 }} />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    หมวดหมู่: {template.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ใช้งาน: {template.usage_count} ครั้ง
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ขนาด: {template.file_size} MB
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
            {index < filteredTemplates.length - 1 && <Divider />}
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

        {/* Templates Display */}
        {viewMode === 'grid' ? renderGridView() : renderListView()}

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