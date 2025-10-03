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
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Toolbar,
  Tooltip,
  Avatar,
  Badge,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  MoreVert,
  Visibility,
  Person,
  Assignment,
  FilterList,
  Search,
  Comment,
  History,
  Send,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface PendingCertificate {
  id: string;
  name: string;
  course_name: string;
  template_name: string;
  recipient_name: string;
  recipient_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by: string;
  submitted_at: string;
  priority: 'low' | 'medium' | 'high';
  days_pending: number;
  comments?: string;
}

interface ApprovalAction {
  certificateId: string;
  action: 'approve' | 'reject';
  comment: string;
}

const ApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<PendingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<PendingCertificate | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<ApprovalAction>({
    certificateId: '',
    action: 'approve',
    comment: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data
  const mockCertificates: PendingCertificate[] = [
    {
      id: '1',
      name: 'เกียรติบัตรการเข้าร่วมสัมมนา',
      course_name: 'การพัฒนาเศรษฐกิจดิจิทัล',
      template_name: 'เทมเพลตสัมมนา',
      recipient_name: 'นายสมชาย ใจดี',
      recipient_email: 'somchai@example.com',
      status: 'pending',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 'staff@example.com',
      submitted_at: '2024-01-15T14:00:00Z',
      priority: 'high',
      days_pending: 7
    },
    {
      id: '2',
      name: 'เกียรติบัตรการฝึกอบรม',
      course_name: 'การวิเคราะห์ข้อมูลทางเศรษฐกิจ',
      template_name: 'เทมเพลตฝึกอบรม',
      recipient_name: 'นางสาวสุดา เก่งมาก',
      recipient_email: 'suda@example.com',
      status: 'pending',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-02-20T09:15:00Z',
      created_by: 'staff@example.com',
      submitted_at: '2024-02-20T11:00:00Z',
      priority: 'medium',
      days_pending: 3
    },
    {
      id: '3',
      name: 'เกียรติบัตรการแข่งขัน',
      course_name: 'การแข่งขันนำเสนอผลงาน',
      template_name: 'เทมเพลตการแข่งขัน',
      recipient_name: 'นายวิชัย ชนะเลิศ',
      recipient_email: 'wichai@example.com',
      status: 'approved',
      created_at: '2024-03-10T13:20:00Z',
      updated_at: '2024-03-11T10:30:00Z',
      created_by: 'staff@example.com',
      submitted_at: '2024-03-10T15:00:00Z',
      priority: 'low',
      days_pending: 1
    },
    {
      id: '4',
      name: 'เกียรติบัตรการอบรมออนไลน์',
      course_name: 'เทคโนโลยีการเงินดิจิทัล',
      template_name: 'เทมเพลตออนไลน์',
      recipient_name: 'นางสาวมาลี สวยงาม',
      recipient_email: 'malee@example.com',
      status: 'rejected',
      created_at: '2024-03-15T16:00:00Z',
      updated_at: '2024-03-16T09:00:00Z',
      created_by: 'staff@example.com',
      submitted_at: '2024-03-15T17:00:00Z',
      priority: 'medium',
      days_pending: 1,
      comments: 'ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบและส่งใหม่'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'pending': return 'รอการอนุมัติ';
      case 'rejected': return 'ถูกปฏิเสธ';
      default: return status;
    }
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
      case 'high': return 'สูง';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'ต่ำ';
      default: return priority;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || cert.priority === priorityFilter;
    
    // Tab filtering
    if (tabValue === 0) return matchesSearch && cert.status === 'pending' && matchesPriority;
    if (tabValue === 1) return matchesSearch && cert.status === 'approved' && matchesPriority;
    if (tabValue === 2) return matchesSearch && cert.status === 'rejected' && matchesPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const paginatedCertificates = filteredCertificates.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, certificate: PendingCertificate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCertificate(certificate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCertificate(null);
  };

  const handleView = () => {
    if (selectedCertificate) {
      navigate(`/certificates/${selectedCertificate.id}`);
    }
    handleMenuClose();
  };

  const handleApprove = () => {
    if (selectedCertificate) {
      setApprovalAction({
        certificateId: selectedCertificate.id,
        action: 'approve',
        comment: ''
      });
      setApprovalDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleReject = () => {
    if (selectedCertificate) {
      setApprovalAction({
        certificateId: selectedCertificate.id,
        action: 'reject',
        comment: ''
      });
      setApprovalDialogOpen(true);
    }
    handleMenuClose();
  };

  const confirmApprovalAction = () => {
    // TODO: Submit approval/rejection to API
    setCertificates(prev => 
      prev.map(cert => 
        cert.id === approvalAction.certificateId
          ? { 
              ...cert, 
              status: approvalAction.action === 'approve' ? 'approved' : 'rejected',
              comments: approvalAction.comment || cert.comments
            }
          : cert
      )
    );
    setApprovalDialogOpen(false);
    setApprovalAction({ certificateId: '', action: 'approve', comment: '' });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCertificates(paginatedCertificates.map(cert => cert.id));
    } else {
      setSelectedCertificates([]);
    }
  };

  const handleSelectCertificate = (certificateId: string) => {
    setSelectedCertificates(prev => 
      prev.includes(certificateId)
        ? prev.filter(id => id !== certificateId)
        : [...prev, certificateId]
    );
  };

  const handleBulkApprove = () => {
    setCertificates(prev => 
      prev.map(cert => 
        selectedCertificates.includes(cert.id)
          ? { ...cert, status: 'approved' as const }
          : cert
      )
    );
    setSelectedCertificates([]);
  };

  const handleBulkReject = () => {
    setCertificates(prev => 
      prev.map(cert => 
        selectedCertificates.includes(cert.id)
          ? { ...cert, status: 'rejected' as const }
          : cert
      )
    );
    setSelectedCertificates([]);
  };

  const pendingCount = certificates.filter(c => c.status === 'pending').length;
  const approvedCount = certificates.filter(c => c.status === 'approved').length;
  const rejectedCount = certificates.filter(c => c.status === 'rejected').length;

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <LinearProgress />
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>กำลังโหลดข้อมูล...</Typography>
          </Box>
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
              อนุมัติเกียรติบัตร
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ตรวจสอบและอนุมัติเกียรติบัตรที่รอการอนุมัติ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<Schedule />}
              label={`รอการอนุมัติ ${pendingCount}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<CheckCircle />}
              label={`อนุมัติแล้ว ${approvedCount}`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label={
                <Badge badgeContent={pendingCount} color="warning">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule />
                    รอการอนุมัติ
                  </Box>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={approvedCount} color="success">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle />
                    อนุมัติแล้ว
                  </Box>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={rejectedCount} color="error">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cancel />
                    ถูกปฏิเสธ
                  </Box>
                </Badge>
              }
            />
          </Tabs>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                placeholder="ค้นหาเกียรติบัตร, หลักสูตร, หรือผู้รับ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>ความสำคัญ</InputLabel>
                <Select
                  value={priorityFilter}
                  label="ความสำคัญ"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="high">สูง</MenuItem>
                  <MenuItem value="medium">ปานกลาง</MenuItem>
                  <MenuItem value="low">ต่ำ</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ borderRadius: 2 }}
              >
                ตัวกรองเพิ่มเติม
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCertificates.length > 0 && tabValue === 0 && (
          <Card sx={{ mb: 3 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                เลือกแล้ว {selectedCertificates.length} รายการ
              </Typography>
              <Button
                startIcon={<CheckCircle />}
                onClick={handleBulkApprove}
                color="success"
                variant="contained"
                sx={{ mr: 1 }}
              >
                อนุมัติทั้งหมด
              </Button>
              <Button
                startIcon={<Cancel />}
                onClick={handleBulkReject}
                color="error"
                variant="outlined"
              >
                ปฏิเสธทั้งหมด
              </Button>
            </Toolbar>
          </Card>
        )}

        {/* Certificates Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {tabValue === 0 && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedCertificates.length > 0 && selectedCertificates.length < paginatedCertificates.length}
                        checked={paginatedCertificates.length > 0 && selectedCertificates.length === paginatedCertificates.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                  )}
                  <TableCell>เกียรติบัตร</TableCell>
                  <TableCell>ผู้รับ</TableCell>
                  <TableCell>ความสำคัญ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>วันที่ส่ง</TableCell>
                  <TableCell>ผู้สร้าง</TableCell>
                  <TableCell align="center">การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCertificates.map((certificate) => (
                  <TableRow key={certificate.id} hover>
                    {tabValue === 0 && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCertificates.includes(certificate.id)}
                          onChange={() => handleSelectCertificate(certificate.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {certificate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {certificate.course_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          เทมเพลต: {certificate.template_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {certificate.recipient_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {certificate.recipient_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityText(certificate.priority)}
                        color={getPriorityColor(certificate.priority) as any}
                        size="small"
                        variant="outlined"
                      />
                      {certificate.days_pending > 5 && (
                        <Tooltip title="รอการอนุมัติมากกว่า 5 วัน">
                          <Warning color="warning" sx={{ ml: 1, fontSize: 16 }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(certificate.status)}
                        color={getStatusColor(certificate.status) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(certificate.submitted_at).toLocaleDateString('th-TH')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {certificate.days_pending} วันที่แล้ว
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {certificate.created_by}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ตัวเลือกเพิ่มเติม">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, certificate)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </Card>

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
            {selectedCertificate?.status === 'pending' && (
              <>
                <MenuItemComponent onClick={handleApprove}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText>อนุมัติ</ListItemText>
                </MenuItemComponent>
                <MenuItemComponent onClick={handleReject}>
                  <ListItemIcon>
                    <Cancel color="error" />
                  </ListItemIcon>
                  <ListItemText>ปฏิเสธ</ListItemText>
                </MenuItemComponent>
              </>
            )}
          </MenuList>
        </Menu>

        {/* Approval/Rejection Dialog */}
        <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {approvalAction.action === 'approve' ? 'อนุมัติเกียรติบัตร' : 'ปฏิเสธเกียรติบัตร'}
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              คุณต้องการ{approvalAction.action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}เกียรติบัตร 
              "{selectedCertificate?.name}" หรือไม่?
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={approvalAction.action === 'approve' ? 'ความเห็นเพิ่มเติม (ไม่บังคับ)' : 'เหตุผลในการปฏิเสธ'}
              value={approvalAction.comment}
              onChange={(e) => setApprovalAction(prev => ({ ...prev, comment: e.target.value }))}
              sx={{ mt: 2 }}
              required={approvalAction.action === 'reject'}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={confirmApprovalAction}
              color={approvalAction.action === 'approve' ? 'success' : 'error'}
              variant="contained"
              disabled={approvalAction.action === 'reject' && !approvalAction.comment.trim()}
            >
              {approvalAction.action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ApprovalPage;