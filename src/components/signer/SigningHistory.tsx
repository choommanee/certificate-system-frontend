import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar
} from '@mui/material';
import {
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Cancel as RejectIcon,
  Schedule as TimeIcon,
  Assignment as DocumentIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  DateRange as DateIcon,
  TrendingUp as TrendIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as ReportIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import { SigningRecord, DateRange } from '../../types/signer';
import { useSigningHistory } from '../../hooks/useSigner';

interface SigningHistoryProps {
  onRecordClick?: (record: SigningRecord) => void;
  compact?: boolean;
}

type SortField = 'signedAt' | 'documentTitle' | 'recipientCount' | 'processingTime';
type SortOrder = 'asc' | 'desc';

const SigningHistory: React.FC<SigningHistoryProps> = ({
  onRecordClick,
  compact = false
}) => {
  const {
    history,
    loading,
    error,
    dateRange,
    pagination,
    fetchHistory,
    updateDateRange,
    exportReport
  } = useSigningHistory();

  const [sortField, setSortField] = useState<SortField>('signedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SigningRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Filter and sort history
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = [...history];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.activityType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'signedAt':
          aValue = new Date(a.signedAt).getTime();
          bValue = new Date(b.signedAt).getTime();
          break;
        case 'documentTitle':
          aValue = a.documentTitle.toLowerCase();
          bValue = b.documentTitle.toLowerCase();
          break;
        case 'recipientCount':
          aValue = a.recipientCount;
          bValue = b.recipientCount;
          break;
        case 'processingTime':
          aValue = a.processingTime;
          bValue = b.processingTime;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [history, statusFilter, searchTerm, sortField, sortOrder]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const completed = history.filter(r => r.status === 'completed');
    const rejected = history.filter(r => r.status === 'rejected');
    const totalRecipients = history.reduce((sum, r) => sum + r.recipientCount, 0);
    const avgProcessingTime = completed.length > 0 
      ? completed.reduce((sum, r) => sum + r.processingTime, 0) / completed.length 
      : 0;

    return {
      total: history.length,
      completed: completed.length,
      rejected: rejected.length,
      totalRecipients,
      avgProcessingTime: Math.round(avgProcessingTime / 60), // Convert to minutes
      successRate: history.length > 0 ? Math.round((completed.length / history.length) * 100) : 0
    };
  }, [history]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      updateDateRange({ startDate: start, endDate: end });
    } else {
      updateDateRange(undefined);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await exportReport(format);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} นาที ${remainingSeconds} วินาที`;
    }
    return `${remainingSeconds} วินาที`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'สำเร็จ';
      case 'rejected':
        return 'ปฏิเสธ';
      default:
        return 'ไม่ทราบ';
    }
  };

  if (compact) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <HistoryIcon />
              ประวัติการลงนาม
            </Typography>
            
            <Button
              size="small"
              variant="outlined"
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ดูทั้งหมด
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List dense>
              {history.slice(0, 5).map((record) => (
                <ListItem
                  key={record.id}
                  button
                  onClick={() => onRecordClick?.(record)}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon>
                    {record.status === 'completed' ? (
                      <SuccessIcon color="success" />
                    ) : (
                      <RejectIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                      >
                        {record.documentTitle}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(record.signedAt)} • {record.recipientCount} คน
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {history.length === 0 && !loading && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 2 }}
            >
              ยังไม่มีประวัติการลงนาม
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <HistoryIcon />
            ประวัติการลงนาม
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ตัวกรอง
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => handleExport('excel')}
              disabled={exportLoading || history.length === 0}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ส่งออก
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {statistics.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ทั้งหมด
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {statistics.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                สำเร็จ
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {statistics.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ปฏิเสธ
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {statistics.totalRecipients}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ผู้รับทั้งหมด
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {statistics.avgProcessingTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                นาที/เฉลี่ย
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {statistics.successRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                อัตราสำเร็จ
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        {showFilters && (
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ค้นหา"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ชื่อเอกสาร, ประเภทกิจกรรม"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>สถานะ</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      label="สถานะ"
                    >
                      <MenuItem value="all">ทั้งหมด</MenuItem>
                      <MenuItem value="completed">สำเร็จ</MenuItem>
                      <MenuItem value="rejected">ปฏิเสธ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="วันที่เริ่มต้น"
                    value={dateRange?.startDate || null}
                    onChange={(date) => handleDateRangeChange(date, dateRange?.endDate || null)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="วันที่สิ้นสุด"
                    value={dateRange?.endDate || null}
                    onChange={(date) => handleDateRangeChange(dateRange?.startDate || null, date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      handleDateRangeChange(null, null);
                    }}
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  >
                    ล้างตัวกรอง
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card elevation={3}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredAndSortedHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}
                >
                  {searchTerm || statusFilter !== 'all' || dateRange 
                    ? 'ไม่พบประวัติที่ตรงกับเงื่อนไข' 
                    : 'ยังไม่มีประวัติการลงนาม'
                  }
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  {searchTerm || statusFilter !== 'all' || dateRange 
                    ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหา'
                    : 'ประวัติการลงนามจะปรากฏที่นี่หลังจากลงนามเอกสาร'
                  }
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'documentTitle'}
                          direction={sortField === 'documentTitle' ? sortOrder : 'asc'}
                          onClick={() => handleSort('documentTitle')}
                          sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                        >
                          เอกสาร
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'signedAt'}
                          direction={sortField === 'signedAt' ? sortOrder : 'asc'}
                          onClick={() => handleSort('signedAt')}
                          sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                        >
                          วันที่ลงนาม
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'recipientCount'}
                          direction={sortField === 'recipientCount' ? sortOrder : 'asc'}
                          onClick={() => handleSort('recipientCount')}
                          sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                        >
                          จำนวนผู้รับ
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'processingTime'}
                          direction={sortField === 'processingTime' ? sortOrder : 'asc'}
                          onClick={() => handleSort('processingTime')}
                          sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                        >
                          เวลาที่ใช้
                        </TableSortLabel>
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
                    {filteredAndSortedHistory.map((record) => (
                      <TableRow
                        key={record.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRecord(record)}
                      >
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                            >
                              {record.documentTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.activityType}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {formatDate(record.signedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {record.recipientCount}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDuration(record.processingTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(record.status)}
                            color={getStatusColor(record.status) as any}
                            size="small"
                            icon={record.status === 'completed' ? <SuccessIcon /> : <RejectIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(_, page) => fetchHistory(page)}
              color="primary"
              size="large"
            />
          </Box>
        )}

        {/* Record Detail Dialog */}
        <Dialog
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedRecord && (
            <>
              <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                รายละเอียดการลงนาม
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                        ข้อมูลเอกสาร
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>ชื่อเอกสาร:</strong> {selectedRecord.documentTitle}
                        </Typography>
                        <Typography variant="body2">
                          <strong>ประเภทกิจกรรม:</strong> {selectedRecord.activityType}
                        </Typography>
                        <Typography variant="body2">
                          <strong>จำนวนผู้รับ:</strong> {selectedRecord.recipientCount} คน
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                        ข้อมูลการลงนาม
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>วันที่ลงนาม:</strong> {formatDate(selectedRecord.signedAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>เวลาที่ใช้:</strong> {formatDuration(selectedRecord.processingTime)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>สถานะ:</strong> 
                          <Chip
                            label={getStatusText(selectedRecord.status)}
                            color={getStatusColor(selectedRecord.status) as any}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {selectedRecord.rejectionReason && (
                          <Typography variant="body2">
                            <strong>เหตุผลการปฏิเสธ:</strong> {selectedRecord.rejectionReason}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setSelectedRecord(null)}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  ปิด
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  ดาวน์โหลดรายงาน
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default SigningHistory;