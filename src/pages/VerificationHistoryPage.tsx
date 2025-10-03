import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  InputAdornment,
  Alert,
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Download,
  Refresh,
  LocationOn,
  AccessTime,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Computer,
  Smartphone,
  Tablet,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface VerificationLog {
  id: string;
  certificateId: string;
  certificateTitle: string;
  recipientName: string;
  verificationCode: string;
  verifierInfo: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    device: 'desktop' | 'mobile' | 'tablet';
  };
  result: 'valid' | 'invalid' | 'expired' | 'revoked';
  verifiedAt: string;
  responseTime: number; // in milliseconds
}

const VerificationHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // Mock data
  const mockLogs: VerificationLog[] = [
    {
      id: '1',
      certificateId: 'CERT-2024-001',
      certificateTitle: 'เกียรติบัตรสัมมนาเศรษฐกิจดิจิทัล 2024',
      recipientName: 'นายสมชาย ใจดี',
      verificationCode: 'VER-ABC123',
      verifierInfo: {
        ipAddress: '203.154.123.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'กรุงเทพมหานคร, ประเทศไทย',
        device: 'desktop'
      },
      result: 'valid',
      verifiedAt: '2024-03-15T14:30:00Z',
      responseTime: 245
    },
    {
      id: '2',
      certificateId: 'CERT-2024-002',
      certificateTitle: 'เกียรติบัตรหลักสูตรการวิเคราะห์ข้อมูล',
      recipientName: 'นางสาวสมหญิง รักงาน',
      verificationCode: 'VER-DEF456',
      verifierInfo: {
        ipAddress: '180.183.45.67',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        location: 'เชียงใหม่, ประเทศไทย',
        device: 'mobile'
      },
      result: 'valid',
      verifiedAt: '2024-03-15T13:15:00Z',
      responseTime: 189
    },
    {
      id: '3',
      certificateId: 'CERT-2023-089',
      certificateTitle: 'เกียรติบัตรการแข่งขันแผนธุรกิจ',
      recipientName: 'นายบุญชู ขยัน',
      verificationCode: 'VER-GHI789',
      verifierInfo: {
        ipAddress: '202.44.78.90',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
        location: 'ขอนแก่น, ประเทศไทย',
        device: 'tablet'
      },
      result: 'expired',
      verifiedAt: '2024-03-15T11:45:00Z',
      responseTime: 312
    },
    {
      id: '4',
      certificateId: 'CERT-2024-003',
      certificateTitle: 'เกียรติบัตรการอบรมผู้นำ',
      recipientName: 'นางมาลี สวยงาม',
      verificationCode: 'VER-JKL012',
      verifierInfo: {
        ipAddress: '125.26.147.88',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'ภูเก็ต, ประเทศไทย',
        device: 'desktop'
      },
      result: 'invalid',
      verifiedAt: '2024-03-15T10:20:00Z',
      responseTime: 156
    },
    {
      id: '5',
      certificateId: 'CERT-2024-004',
      certificateTitle: 'เกียรติบัตรสัมมนาการเงินระหว่างประเทศ',
      recipientName: 'ดร.สมศักดิ์ เก่งงาน',
      verificationCode: 'VER-MNO345',
      verifierInfo: {
        ipAddress: '203.113.45.22',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'กรุงเทพมหานคร, ประเทศไทย',
        device: 'desktop'
      },
      result: 'valid',
      verifiedAt: '2024-03-14T16:30:00Z',
      responseTime: 198
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      case 'expired': return 'warning';
      case 'revoked': return 'error';
      default: return 'default';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'valid': return 'ถูกต้อง';
      case 'invalid': return 'ไม่ถูกต้อง';
      case 'expired': return 'หมดอายุ';
      case 'revoked': return 'ถูกยกเลิก';
      default: return result;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'valid': return <CheckCircle />;
      case 'invalid': return <Cancel />;
      case 'expired': return <Warning />;
      case 'revoked': return <Cancel />;
      default: return <Info />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Computer />;
      case 'mobile': return <Smartphone />;
      case 'tablet': return <Tablet />;
      default: return <Computer />;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  };

  const handleViewDetails = (log: VerificationLog) => {
    setSelectedLog(log);
    setDetailDialog(true);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.certificateTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.verificationCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.result === statusFilter;
    const matchesDevice = deviceFilter === 'all' || log.verifierInfo.device === deviceFilter;
    
    const logDate = new Date(log.verifiedAt);
    const matchesDateFrom = !dateFrom || logDate >= dateFrom;
    const matchesDateTo = !dateTo || logDate <= dateTo;
    
    return matchesSearch && matchesStatus && matchesDevice && matchesDateFrom && matchesDateTo;
  });

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const stats = {
    total: logs.length,
    valid: logs.filter(l => l.result === 'valid').length,
    invalid: logs.filter(l => l.result === 'invalid').length,
    expired: logs.filter(l => l.result === 'expired').length,
    avgResponseTime: Math.round(logs.reduce((sum, l) => sum + l.responseTime, 0) / logs.length)
  };

  return (
    <DashboardLayout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                📋 ประวัติการตรวจสอบ
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                ติดตามและวิเคราะห์การตรวจสอบเกียรติบัตร
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              รีเฟรช
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    การตรวจสอบทั้งหมด
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                    {stats.valid}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ถูกต้อง
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
                    {stats.invalid + stats.expired}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ไม่ถูกต้อง/หมดอายุ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                    {stats.avgResponseTime}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    เวลาตอบสนอง (ms)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              ตัวกรองข้อมูล
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="ค้นหา..."
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
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>ผลการตรวจสอบ</InputLabel>
                  <Select
                    value={statusFilter}
                    label="ผลการตรวจสอบ"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="valid">ถูกต้อง</MenuItem>
                    <MenuItem value="invalid">ไม่ถูกต้อง</MenuItem>
                    <MenuItem value="expired">หมดอายุ</MenuItem>
                    <MenuItem value="revoked">ถูกยกเลิก</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>อุปกรณ์</InputLabel>
                  <Select
                    value={deviceFilter}
                    label="อุปกรณ์"
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    <MenuItem value="desktop">คอมพิวเตอร์</MenuItem>
                    <MenuItem value="mobile">มือถือ</MenuItem>
                    <MenuItem value="tablet">แท็บเล็ต</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={dateFrom}
                  onChange={setDateFrom}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="วันที่สิ้นสุด"
                  value={dateTo}
                  onChange={setDateTo}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Results Table */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography>กำลังโหลดประวัติการตรวจสอบ...</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>เกียรติบัตร</TableCell>
                        <TableCell>ผู้รับ</TableCell>
                        <TableCell>รหัสตรวจสอบ</TableCell>
                        <TableCell>ผลการตรวจสอบ</TableCell>
                        <TableCell>อุปกรณ์</TableCell>
                        <TableCell>ที่อยู่ IP</TableCell>
                        <TableCell>เวลา</TableCell>
                        <TableCell>การดำเนินการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {log.certificateTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.certificateId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {log.recipientName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {log.recipientName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {log.verificationCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getResultIcon(log.result)}
                              label={getResultText(log.result)}
                              color={getResultColor(log.result) as any}
                              size="small"
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title={log.verifierInfo.userAgent}>
                              <Chip
                                icon={getDeviceIcon(log.verifierInfo.device)}
                                label={log.verifierInfo.device}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {log.verifierInfo.ipAddress}
                              </Typography>
                              {log.verifierInfo.location && (
                                <Typography variant="caption" color="text.secondary">
                                  <LocationOn sx={{ fontSize: 12, mr: 0.5 }} />
                                  {log.verifierInfo.location}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {new Date(log.verifiedAt).toLocaleDateString('th-TH')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                                {formatDistanceToNow(new Date(log.verifiedAt), {
                                  addSuffix: true,
                                  locale: th
                                })}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(log)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredLogs.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  labelRowsPerPage="แถวต่อหน้า:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
                  }
                />
              </>
            )}
          </Paper>

          {/* Detail Dialog */}
          <Dialog 
            open={detailDialog} 
            onClose={() => setDetailDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>รายละเอียดการตรวจสอบ</DialogTitle>
            <DialogContent>
              {selectedLog && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      เกียรติบัตร
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {selectedLog.certificateTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      รหัส: {selectedLog.certificateId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ผู้รับเกียรติบัตร
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedLog.recipientName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      รหัสตรวจสอบ
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {selectedLog.verificationCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ผลการตรวจสอบ
                    </Typography>
                    <Chip
                      icon={getResultIcon(selectedLog.result)}
                      label={getResultText(selectedLog.result)}
                      color={getResultColor(selectedLog.result) as any}
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ข้อมูลผู้ตรวจสอบ
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>IP Address:</strong> {selectedLog.verifierInfo.ipAddress}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>อุปกรณ์:</strong> {selectedLog.verifierInfo.device}
                      </Typography>
                      {selectedLog.verifierInfo.location && (
                        <Typography variant="body2" gutterBottom>
                          <strong>ตำแหน่ง:</strong> {selectedLog.verifierInfo.location}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        <strong>User Agent:</strong> {selectedLog.verifierInfo.userAgent}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      เวลาที่ตรวจสอบ
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedLog.verifiedAt).toLocaleString('th-TH')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      เวลาตอบสนอง
                    </Typography>
                    <Typography variant="body1">
                      {selectedLog.responseTime} มิลลิวินาที
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialog(false)}>
                ปิด
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </LocalizationProvider>
    </DashboardLayout>
  );
};

export default VerificationHistoryPage;