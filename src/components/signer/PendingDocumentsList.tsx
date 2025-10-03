import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  Pagination,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Assignment as DocumentIcon,
  Schedule as ClockIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Visibility as ViewIcon,
  Draw as SignIcon,
  Clear as ClearIcon,
  PriorityHigh as UrgentIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { PendingDocument, DocumentFilter } from '../../types/signer';
import { usePendingDocuments } from '../../hooks/useSigner';

interface PendingDocumentsListProps {
  onDocumentSelect?: (document: PendingDocument) => void;
  onDocumentSign?: (document: PendingDocument) => void;
  showActions?: boolean;
}

type SortField = 'requestDate' | 'priority' | 'recipientCount' | 'title';
type SortOrder = 'asc' | 'desc';

const PendingDocumentsList: React.FC<PendingDocumentsListProps> = ({
  onDocumentSelect,
  onDocumentSign,
  showActions = true
}) => {
  const {
    documents,
    loading,
    error,
    filter,
    pagination,
    fetchDocuments,
    updateFilter
  } = usePendingDocuments();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('requestDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.requestedBy.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.requestedBy.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'requestDate':
          aValue = new Date(a.requestDate).getTime();
          bValue = new Date(b.requestDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'recipientCount':
          aValue = a.recipientCount;
          bValue = b.recipientCount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
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
  }, [documents, searchTerm, sortField, sortOrder]);

  const handleFilterChange = (newFilter: Partial<DocumentFilter>) => {
    updateFilter({ ...filter, ...newFilter });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    updateFilter({});
    setSortField('requestDate');
    setSortOrder('desc');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'ด่วน';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'ไม่ด่วน';
      default: return 'ปกติ';
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

  const getDaysOverdue = (dueDate?: Date): number => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📋 เอกสารรอลงนาม
            {documents.length > 0 && (
              <Badge badgeContent={documents.length} color="primary" />
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="ตัวกรอง">
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="ล้างตัวกรอง">
              <IconButton onClick={handleClearFilters}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="ค้นหาเอกสาร, กิจกรรม, หรือผู้ขอ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: showFilters ? 2 : 0 }}
        />

        {/* Filters Panel */}
        {showFilters && (
          <Paper elevation={1} sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>ระดับความสำคัญ</InputLabel>
                  <Select
                    value={filter.priority || ''}
                    onChange={(e) => handleFilterChange({ priority: e.target.value as any })}
                    label="ระดับความสำคัญ"
                  >
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="high">ด่วน</MenuItem>
                    <MenuItem value="medium">ปานกลาง</MenuItem>
                    <MenuItem value="low">ไม่ด่วน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>ประเภทกิจกรรม</InputLabel>
                  <Select
                    value={filter.activityType || ''}
                    onChange={(e) => handleFilterChange({ activityType: e.target.value })}
                    label="ประเภทกิจกรรม"
                  >
                    <MenuItem value="">ทั้งหมด</MenuItem>
                    <MenuItem value="สัมมนา">สัมมนา</MenuItem>
                    <MenuItem value="การแข่งขัน">การแข่งขัน</MenuItem>
                    <MenuItem value="การฝึกอบรม">การฝึกอบรม</MenuItem>
                    <MenuItem value="ประชุม">ประชุม</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>เรียงตาม</InputLabel>
                  <Select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    label="เรียงตาม"
                  >
                    <MenuItem value="requestDate">วันที่ขอ</MenuItem>
                    <MenuItem value="priority">ความสำคัญ</MenuItem>
                    <MenuItem value="recipientCount">จำนวนผู้รับ</MenuItem>
                    <MenuItem value="title">ชื่อเอกสาร</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>ลำดับ</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    label="ลำดับ"
                  >
                    <MenuItem value="desc">มากไปน้อย</MenuItem>
                    <MenuItem value="asc">น้อยไปมาก</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
          {error}
        </Alert>
      )}

      {/* Documents List */}
      {filteredAndSortedDocuments.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}
          >
            {searchTerm || Object.keys(filter).length > 0 
              ? 'ไม่พบเอกสารที่ตรงกับเงื่อนไข' 
              : 'ไม่มีเอกสารรอลงนาม'
            }
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            {searchTerm || Object.keys(filter).length > 0 
              ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง'
              : 'เอกสารใหม่จะปรากฏที่นี่เมื่อมีการส่งคำขอลงนาม'
            }
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredAndSortedDocuments.map((document) => {
            const daysOverdue = getDaysOverdue(document.dueDate);
            const isOverdue = daysOverdue > 0;

            return (
              <Card
                key={document.id}
                elevation={document.priority === 'high' ? 4 : 2}
                sx={{
                  border: document.priority === 'high' ? '2px solid' : '1px solid',
                  borderColor: document.priority === 'high' ? 'error.main' : 'divider',
                  '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Sarabun, sans-serif',
                            fontWeight: 'bold',
                            flex: 1
                          }}
                        >
                          {document.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip
                            label={getPriorityText(document.priority)}
                            color={getPriorityColor(document.priority) as any}
                            size="small"
                            icon={document.priority === 'high' ? <UrgentIcon /> : undefined}
                          />
                          
                          {isOverdue && (
                            <Chip
                              label={`เกินกำหนด ${daysOverdue} วัน`}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}
                      >
                        📋 {document.activityType}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                              {document.recipientCount} คน
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                              {document.requestedBy.first_name} {document.requestedBy.last_name}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ClockIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                              {formatDate(document.requestDate)}
                            </Typography>
                          </Box>
                        </Grid>

                        {document.dueDate && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" color={isOverdue ? 'error' : 'action'} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'Sarabun, sans-serif',
                                  color: isOverdue ? 'error.main' : 'text.secondary'
                                }}
                              >
                                กำหนด: {formatDate(document.dueDate)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Box>
                </CardContent>

                {showActions && (
                  <>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => onDocumentSelect?.(document)}
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        >
                          ดูรายละเอียด
                        </Button>
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SignIcon />}
                        onClick={() => onDocumentSign?.(document)}
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          bgcolor: document.priority === 'high' ? 'error.main' : 'primary.main',
                          '&:hover': {
                            bgcolor: document.priority === 'high' ? 'error.dark' : 'primary.dark'
                          }
                        }}
                      >
                        ลงนาม
                      </Button>
                    </CardActions>
                  </>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, page) => fetchDocuments(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Summary */}
      {filteredAndSortedDocuments.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif', textAlign: 'center' }}>
            แสดง {filteredAndSortedDocuments.length} จาก {pagination.total} เอกสาร
            {searchTerm && ` • ค้นหา: "${searchTerm}"`}
            {Object.keys(filter).length > 0 && ` • มีตัวกรองใช้งาน`}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default PendingDocumentsList;