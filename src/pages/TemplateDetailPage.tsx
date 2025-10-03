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
  canvas: {
    background_color: string;
    background_image?: string;
  };
  elements: TemplateElement[];
  variables: TemplateVariable[];
  usage_history: UsageHistory[];
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

interface UsageHistory {
  id: string;
  certificate_name: string;
  recipient_name: string;
  created_by: string;
  created_at: string;
}

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data
  const mockTemplate: Template = {
    id: '1',
    name: 'เทมเพลตสัมมนาพื้นฐาน',
    description: 'เทมเพลตสำหรับเกียรติบัตรการเข้าร่วมสัมมนาทั่วไป ออกแบบมาให้ใช้งานง่ายและสวยงาม',
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
    dimensions: { width: 1920, height: 1080 },
    canvas: {
      background_color: '#ffffff',
    },
    elements: [
      {
        id: '1',
        type: 'text',
        position: { x: 100, y: 100 },
        size: { width: 400, height: 60 },
        style: { fontSize: 24, fontWeight: 'bold', color: '#333' },
        content: { text: 'เกียรติบัตร' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 100, y: 200 },
        size: { width: 300, height: 40 },
        style: { fontSize: 18, color: '#666' },
        content: { text: '{{recipient_name}}' }
      }
    ],
    variables: [
      {
        name: 'recipient_name',
        type: 'text',
        default_value: 'ชื่อผู้รับ',
        required: true,
        description: 'ชื่อผู้รับเกียรติบัตร'
      },
      {
        name: 'course_name',
        type: 'text',
        default_value: 'ชื่อหลักสูตร',
        required: true,
        description: 'ชื่อหลักสูตรหรือกิจกรรม'
      },
      {
        name: 'issue_date',
        type: 'date',
        default_value: '2024-01-01',
        required: true,
        description: 'วันที่ออกเกียรติบัตร'
      }
    ],
    usage_history: [
      {
        id: '1',
        certificate_name: 'เกียรติบัตรสัมมนาเศรษฐกิจดิจิทัล',
        recipient_name: 'นายสมชาย ใจดี',
        created_by: 'staff@example.com',
        created_at: '2024-03-20T10:00:00Z'
      },
      {
        id: '2',
        certificate_name: 'เกียรติบัตรสัมมนาการลงทุน',
        recipient_name: 'นางสาวสุดา เก่งมาก',
        created_by: 'staff@example.com',
        created_at: '2024-03-19T15:30:00Z'
      },
      {
        id: '3',
        certificate_name: 'เกียรติบัตรสัมมนาการตลาด',
        recipient_name: 'นายวิชัย ชนะเลิศ',
        created_by: 'admin@example.com',
        created_at: '2024-03-18T09:15:00Z'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTemplate(mockTemplate);
      setLoading(false);
    }, 1000);
  }, [id]);

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

  const handleEdit = () => {
    navigate(`/templates/${id}/edit`);
  };

  const handleDuplicate = () => {
    setDuplicateDialogOpen(true);
  };

  const confirmDuplicate = () => {
    // TODO: Duplicate template via API
    console.log('Duplicating template:', id);
    setDuplicateDialogOpen(false);
    navigate('/templates', {
      state: { message: 'ทำสำเนาเทมเพลตสำเร็จ' }
    });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Delete template via API
    console.log('Deleting template:', id);
    setDeleteDialogOpen(false);
    navigate('/templates', {
      state: { message: 'ลบเทมเพลตสำเร็จ' }
    });
  };

  const handleToggleFavorite = () => {
    if (template) {
      setTemplate({
        ...template,
        is_favorite: !template.is_favorite
      });
    }
  };

  const handleTogglePublic = () => {
    if (template) {
      setTemplate({
        ...template,
        is_public: !template.is_public
      });
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
                  label={getStatusText(template.status)}
                  color={getStatusColor(template.status) as any}
                  variant="outlined"
                />
                <Chip
                  icon={template.is_public ? <Public /> : <Lock />}
                  label={template.is_public ? 'สาธารณะ' : 'ส่วนตัว'}
                  color={template.is_public ? 'success' : 'default'}
                  variant="outlined"
                />
                {template.is_favorite && (
                  <Chip
                    icon={<Star />}
                    label="รายการโปรด"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleToggleFavorite}
              color={template.is_favorite ? 'warning' : 'default'}
            >
              {template.is_favorite ? <Star /> : <StarBorder />}
            </IconButton>
            
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
                    bgcolor: template.canvas.background_color,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      ตัวอย่างเทมเพลต
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.dimensions.width} x {template.dimensions.height} px
                    </Typography>
                  </Box>
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
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">แท็ก</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {template.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ขนาดไฟล์</Typography>
                      <Typography variant="body1">{template.file_size} MB</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ขนาดผืนผ้าใบ</Typography>
                      <Typography variant="body1">
                        {template.dimensions.width} x {template.dimensions.height} px
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">จำนวนองค์ประกอบ</Typography>
                      <Typography variant="body1">{template.elements.length} องค์ประกอบ</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Template Variables */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ตัวแปรในเทมเพลต
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ชื่อตัวแปร</TableCell>
                        <TableCell>ประเภท</TableCell>
                        <TableCell>ค่าเริ่มต้น</TableCell>
                        <TableCell>จำเป็น</TableCell>
                        <TableCell>คำอธิบาย</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {template.variables.map((variable) => (
                        <TableRow key={variable.name}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {`{{${variable.name}}}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={variable.type === 'text' ? 'ข้อความ' : 
                                     variable.type === 'date' ? 'วันที่' : 'ตัวเลข'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{variable.default_value}</TableCell>
                          <TableCell>
                            {variable.required ? (
                              <Chip label="จำเป็น" color="error" size="small" />
                            ) : (
                              <Chip label="ไม่จำเป็น" color="default" size="small" />
                            )}
                          </TableCell>
                          <TableCell>{variable.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Usage History */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ประวัติการใช้งาน
                </Typography>
                <List>
                  {template.usage_history.slice(0, 5).map((usage) => (
                    <ListItem key={usage.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Assignment />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={usage.certificate_name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              ผู้รับ: {usage.recipient_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              สร้างโดย {usage.created_by} • {new Date(usage.created_at).toLocaleString('th-TH')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {template.usage_history.length > 5 && (
                  <Button fullWidth variant="outlined" sx={{ mt: 1 }}>
                    ดูทั้งหมด ({template.usage_history.length} รายการ)
                  </Button>
                )}
              </CardContent>
            </Card>
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
                      secondary={template.created_by}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="วันที่สร้าง"
                      secondary={new Date(template.created_at).toLocaleDateString('th-TH')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="แก้ไขล่าสุด"
                      secondary={new Date(template.updated_at).toLocaleDateString('th-TH')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="การใช้งาน"
                      secondary={`${template.usage_count} ครั้ง`}
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
                      {template.is_public ? <Lock /> : <Public />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={template.is_public ? 'ทำให้เป็นส่วนตัว' : 'เผยแพร่สาธารณะ'} 
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
                      {Math.min(100, (template.usage_count / 50) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (template.usage_count / 50) * 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      {template.usage_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ครั้งที่ใช้
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary.main">
                      {template.variables.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ตัวแปร
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
        <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
          <DialogTitle>ทำสำเนาเทมเพลต</DialogTitle>
          <DialogContent>
            <Typography>
              คุณต้องการทำสำเนาเทมเพลต "{template.name}" หรือไม่?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              สำเนาจะถูกสร้างขึ้นพร้อมชื่อ "{template.name} (สำเนา)"
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDuplicateDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={confirmDuplicate} variant="contained">
              ทำสำเนา
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default TemplateDetailPage;