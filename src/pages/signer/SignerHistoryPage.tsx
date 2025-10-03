import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  History,
  Search,
  FilterList,
  Download,
  Visibility,
  CheckCircle,
  Schedule,
  TrendingUp,
  CalendarToday,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import { useSigner } from '../../hooks/useSigner';
import SigningHistory from '../../components/signer/SigningHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`history-tabpanel-${index}`}
      aria-labelledby={`history-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SignerHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { signingHistory, stats, loading, refreshData } = useSigner();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });

  useEffect(() => {
    refreshData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const mockHistoryData = [
    {
      id: 1,
      documentTitle: 'เกียรติบัตรการแข่งขันคณิตศาสตร์',
      activityType: 'competition',
      recipientCount: 25,
      signedAt: new Date('2024-01-15T10:30:00'),
      processingTime: 180, // seconds
      status: 'completed'
    },
    {
      id: 2,
      documentTitle: 'เกียรติบัตรงานวิทยาศาสตร์',
      activityType: 'event',
      recipientCount: 15,
      signedAt: new Date('2024-01-14T14:20:00'),
      processingTime: 120,
      status: 'completed'
    },
    {
      id: 3,
      documentTitle: 'เกียรติบัตรโครงการพัฒนาทักษะ',
      activityType: 'workshop',
      recipientCount: 30,
      signedAt: new Date('2024-01-13T09:15:00'),
      processingTime: 240,
      status: 'completed'
    }
  ];

  const filteredHistory = mockHistoryData.filter(item => {
    const matchesSearch = item.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesDate = item.signedAt >= dateRange.startDate && item.signedAt <= dateRange.endDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'เสร็จสิ้น';
      case 'pending': return 'รอดำเนินการ';
      case 'rejected': return 'ถูกปฏิเสธ';
      default: return status;
    }
  };

  return (
    <SignerDashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                <History />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: '#1976d2' }}>
                  ประวัติการลงนาม
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  ดูประวัติและสถิติการลงนามเอกสารทั้งหมด
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Download />} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                ส่งออกรายงาน
              </Button>
              <Button variant="contained" startIcon={<FilterList />} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                ตัวกรอง
              </Button>
            </Box>
          </Box>

          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {stats?.totalSigned || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontFamily: 'Sarabun, sans-serif' }}>
                        ลงนามทั้งหมด
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {stats?.completedThisMonth || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontFamily: 'Sarabun, sans-serif' }}>
                        เดือนนี้
                      </Typography>
                    </Box>
                    <CalendarToday sx={{ color: 'primary.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {Math.round((stats?.averageProcessingTime || 0) / 60)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'info.main', fontFamily: 'Sarabun, sans-serif' }}>
                        นาที/ฉบับ
                      </Typography>
                    </Box>
                    <Schedule sx={{ color: 'info.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {Math.round(((stats?.completedThisMonth || 0) / Math.max((stats?.totalSigned || 1), 1)) * 100)}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'warning.main', fontFamily: 'Sarabun, sans-serif' }}>
                        ประสิทธิภาพ
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ color: 'warning.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="ค้นหาเอกสาร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  label="สถานะ"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                  <MenuItem value="pending">รอดำเนินการ</MenuItem>
                  <MenuItem value="rejected">ถูกปฏิเสธ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="วันที่เริ่มต้น"
                type="date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="วันที่สิ้นสุด"
                type="date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* History Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    เอกสาร
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    ประเภท
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    จำนวนผู้รับ
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    วันที่ลงนาม
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    เวลาที่ใช้
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    สถานะ
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                    การดำเนินการ
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment color="primary" />
                          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {row.documentTitle}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.activityType}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                          {row.recipientCount} คน
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                          {row.signedAt.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                          {Math.round(row.processingTime / 60)} นาที
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(row.status)}
                          color={getStatusColor(row.status) as any}
                          size="small"
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="ดูรายละเอียด">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ดาวน์โหลด">
                          <IconButton size="small" color="secondary">
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="แถวต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          />
        </Paper>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerHistoryPage;