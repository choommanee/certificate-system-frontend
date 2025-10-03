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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  InputAdornment,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  People,
  Assignment,
  CalendarToday,
  LocationOn,
  TrendingUp,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  certificateTemplate: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Mock data
  const mockActivities: Activity[] = [
    {
      id: '1',
      name: 'สัมมนาเศรษฐกิจดิจิทัล 2024',
      description: 'การสัมมนาเกี่ยวกับแนวโน้มเศรษฐกิจดิจิทัลและผลกระทบต่อสังคมไทย',
      category: 'สัมมนา',
      status: 'active',
      startDate: '2024-03-15',
      endDate: '2024-03-16',
      location: 'หอประชุมใหญ่ คณะเศรษฐศาสตร์',
      maxParticipants: 200,
      currentParticipants: 156,
      certificateTemplate: 'เทมเพลตสัมมนา A',
      organizer: {
        id: '1',
        name: 'ดร.สมชาย ใจดี',
        avatar: null
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'หลักสูตรการวิเคราะห์ข้อมูลทางเศรษฐกิจ',
      description: 'หลักสูตรเข้มข้น 5 วัน เรียนรู้การใช้เครื่องมือวิเคราะห์ข้อมูลสำหรับนักเศรษฐศาสตร์',
      category: 'หลักสูตร',
      status: 'completed',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      location: 'ห้องปฏิบัติการคอมพิวเตอร์ 301',
      maxParticipants: 30,
      currentParticipants: 28,
      certificateTemplate: 'เทมเพลตหลักสูตร B',
      organizer: {
        id: '2',
        name: 'อ.สมหญิง รักงาน',
        avatar: null
      },
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-02-06T16:00:00Z'
    },
    {
      id: '3',
      name: 'การแข่งขันแผนธุรกิจนักศึกษา',
      description: 'การแข่งขันนำเสนอแผนธุรกิจสำหรับนักศึกษาระดับปริญญาตรี',
      category: 'การแข่งขัน',
      status: 'draft',
      startDate: '2024-04-10',
      endDate: '2024-04-12',
      location: 'อาคารเรียนรวม ชั้น 5',
      maxParticipants: 50,
      currentParticipants: 0,
      certificateTemplate: 'เทมเพลตการแข่งขัน C',
      organizer: {
        id: '3',
        name: 'ผศ.บุญชู ขยัน',
        avatar: null
      },
      createdAt: '2024-02-25T11:00:00Z',
      updatedAt: '2024-02-25T11:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setTotalPages(Math.ceil(mockActivities.length / 10));
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'draft': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'กำลังดำเนินการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'draft': return 'ร่าง';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'completed': return <Assignment />;
      case 'draft': return <Schedule />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, activity: Activity) => {
    setAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActivity(null);
  };

  const handleDelete = () => {
    if (selectedActivity) {
      setActivities(prev => prev.filter(a => a.id !== selectedActivity.id));
      setDeleteDialog(false);
      handleMenuClose();
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = ['สัมมนา', 'หลักสูตร', 'การแข่งขัน', 'ประชุม', 'อบรม'];

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
              📅 จัดการกิจกรรม
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              จัดการกิจกรรมและการออกเกียรติบัตร
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/activities/create')}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            สร้างกิจกรรมใหม่
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="ค้นหากิจกรรม..."
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
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  label="สถานะ"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">ทุกสถานะ</MenuItem>
                  <MenuItem value="active">กำลังดำเนินการ</MenuItem>
                  <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                  <MenuItem value="draft">ร่าง</MenuItem>
                  <MenuItem value="cancelled">ยกเลิก</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={categoryFilter}
                  label="หมวดหมู่"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">ทุกหมวดหมู่</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                ตัวกรอง
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Activities Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>กำลังโหลดข้อมูลกิจกรรม...</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {filteredActivities.map((activity) => (
                <Grid item xs={12} md={6} lg={4} key={activity.id}>
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
                          icon={getStatusIcon(activity.status)}
                          label={getStatusText(activity.status)}
                          color={getStatusColor(activity.status) as any}
                          size="small"
                          variant="filled"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, activity)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      {/* Title */}
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        {activity.name}
                      </Typography>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                        {activity.description.length > 100 
                          ? `${activity.description.substring(0, 100)}...` 
                          : activity.description}
                      </Typography>

                      {/* Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.startDate).toLocaleDateString('th-TH')} - {new Date(activity.endDate).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {activity.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {activity.currentParticipants}/{activity.maxParticipants} คน
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            ผู้เข้าร่วม
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round((activity.currentParticipants / activity.maxParticipants) * 100)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(activity.currentParticipants / activity.maxParticipants) * 100}
                          sx={{ borderRadius: 1, height: 6 }}
                        />
                      </Box>

                      {/* Organizer */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {activity.organizer.name.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {activity.organizer.name}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/activities/${activity.id}`)}
                      >
                        ดูรายละเอียด
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/activities/${activity.id}/edit`)}
                      >
                        แก้ไข
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedActivity) navigate(`/activities/${selectedActivity.id}`);
            handleMenuClose();
          }}>
            <Visibility sx={{ mr: 1 }} />
            ดูรายละเอียด
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedActivity) navigate(`/activities/${selectedActivity.id}/edit`);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            แก้ไข
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialog(true)}>
            <Delete sx={{ mr: 1 }} />
            ลบ
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>ยืนยันการลบกิจกรรม</DialogTitle>
          <DialogContent>
            <Typography>
              คุณต้องการลบกิจกรรม "{selectedActivity?.name}" หรือไม่?
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

export default ActivityListPage;