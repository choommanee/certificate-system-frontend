import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
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
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { activityService } from '../services/api';
import type { Activity } from '../services/api/types';

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const itemsPerPage = 9;

  // ฟังก์ชันดึงข้อมูลกิจกรรมจาก API
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await activityService.getActivities({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        // ✅ API ส่ง {data: [...], pagination: {totalItems, totalPages}}
        setActivities(response.data.data || []);
        setTotalCount(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.response?.data?.message || err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  // โหลดข้อมูลครั้งแรกและเมื่อมีการเปลี่ยนแปลง filter
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // แสดง success message ถ้ามีการส่งมาจากหน้าอื่น
  useEffect(() => {
    if (location.state?.message) {
      setSnackbar({ open: true, message: location.state.message, severity: 'success' });
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'ongoing':
        return 'success';
      case 'completed': return 'primary';
      case 'draft': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'เผยแพร่แล้ว';
      case 'ongoing': return 'กำลังดำเนินการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'draft': return 'ร่าง';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
      case 'ongoing':
        return <CheckCircle />;
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

  const handleDelete = async () => {
    if (!selectedActivity) return;

    try {
      setDeleteLoading(true);
      const response = await activityService.deleteActivity(selectedActivity.id);

      if (response.success) {
        setSnackbar({ open: true, message: 'ลบกิจกรรมสำเร็จ', severity: 'success' });
        setDeleteDialog(false);
        handleMenuClose();
        // Refresh the list
        fetchActivities();
      } else {
        setSnackbar({ open: true, message: response.message || 'ไม่สามารถลบกิจกรรมได้', severity: 'error' });
      }
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการลบกิจกรรม',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Client-side category filter (since API might not support it)
  const filteredActivities = categoryFilter === 'all'
    ? activities
    : activities.filter(activity => activity.activityType === categoryFilter);

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
                onChange={(e) => handleSearchChange(e.target.value)}
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
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">ทุกสถานะ</MenuItem>
                  <MenuItem value="draft">ร่าง</MenuItem>
                  <MenuItem value="published">เผยแพร่แล้ว</MenuItem>
                  <MenuItem value="ongoing">กำลังดำเนินการ</MenuItem>
                  <MenuItem value="completed">เสร็จสิ้น</MenuItem>
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
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
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
              <Tooltip title="จำนวนทั้งหมด">
                <Box sx={{ textAlign: 'center', p: 1.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {totalCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    กิจกรรม
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

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
                        {activity.description && activity.description.length > 100
                          ? `${activity.description.substring(0, 100)}...`
                          : activity.description || 'ไม่มีคำอธิบาย'}
                      </Typography>

                      {/* Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.startDate).toLocaleDateString('th-TH')} - {new Date(activity.endDate).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                        {activity.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {activity.location}
                            </Typography>
                          </Box>
                        )}
                        {activity.maxParticipants && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {activity.participantCount || 0}/{activity.maxParticipants} คน
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            เกียรติบัตร: {activity.certificateCount || 0} ใบ
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progress */}
                      {activity.maxParticipants && activity.maxParticipants > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ผู้เข้าร่วม
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(((activity.participantCount || 0) / activity.maxParticipants) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={((activity.participantCount || 0) / activity.maxParticipants) * 100}
                            sx={{ borderRadius: 1, height: 6 }}
                          />
                        </Box>
                      )}

                      {/* Organizer */}
                      {activity.organizer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {activity.organizer.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {activity.organizer}
                          </Typography>
                        </Box>
                      )}
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
        <Dialog open={deleteDialog} onClose={() => !deleteLoading && setDeleteDialog(false)}>
          <DialogTitle>ยืนยันการลบกิจกรรม</DialogTitle>
          <DialogContent>
            <Typography>
              คุณต้องการลบกิจกรรม "{selectedActivity?.name}" หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)} disabled={deleteLoading}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'กำลังลบ...' : 'ลบ'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default ActivityListPage;