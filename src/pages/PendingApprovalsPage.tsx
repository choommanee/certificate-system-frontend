import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
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
  InputAdornment,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  FilterList,
  Person,
  CalendarToday,
  Assignment,
  MoreVert,
  Visibility,
  CheckCircleOutline,
  CancelOutlined,
  Send,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CertificateApprovalDialog from '../components/dialogs/CertificateApprovalDialog';
import certificateApprovalService, { Certificate, PendingApprovalsResponse } from '../services/certificateApprovalService';

const PendingApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [statistics, setStatistics] = useState({
    total_pending: 0,
    total_approved: 0,
    total_rejected: 0,
    avg_approval_time: 0,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCertificate, setMenuCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadPendingApprovals();
    loadStatistics();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const response: PendingApprovalsResponse = await certificateApprovalService.getPendingApprovals();
      setCertificates(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await certificateApprovalService.getApprovalStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleApprove = async (certificateId: string, comment?: string) => {
    try {
      await certificateApprovalService.approveCertificate(certificateId, comment);
      await loadPendingApprovals();
      await loadStatistics();
    } catch (err: any) {
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async (certificateId: string, reason: string, comment?: string) => {
    try {
      await certificateApprovalService.rejectCertificate(certificateId, reason, comment);
      await loadPendingApprovals();
      await loadStatistics();
    } catch (err: any) {
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedCertificates.length === 0) return;

    try {
      const result = await certificateApprovalService.batchApprove(selectedCertificates);
      await loadPendingApprovals();
      await loadStatistics();
      setSelectedCertificates([]);

      if (result.failed > 0) {
        setError(`อนุมัติสำเร็จ ${result.success} รายการ, ล้มเหลว ${result.failed} รายการ`);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอนุมัติหลายรายการ');
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCertificates(filteredCertificates.map(cert => cert.id));
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

  const openApprovalDialog = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setApprovalDialogOpen(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, certificate: Certificate) => {
    setAnchorEl(event.currentTarget);
    setMenuCertificate(certificate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCertificate(null);
  };

  const handleViewDetails = () => {
    if (menuCertificate) {
      navigate(`/certificates/${menuCertificate.id}`);
    }
    handleMenuClose();
  };

  const handleViewHistory = async () => {
    if (menuCertificate) {
      // TODO: Implement history view
      console.log('View history for:', menuCertificate.id);
    }
    handleMenuClose();
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = searchTerm === '' ||
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.template_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Check if user can approve
  const canApprove = certificateApprovalService.canApprove(user?.role || '');

  if (!canApprove) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            คุณไม่มีสิทธิ์ในการอนุมัติเกียรติบัตร
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutline fontSize="large" color="primary" />
            รอการอนุมัติ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            จัดการและพิจารณาอนุมัติเกียรติบัตรที่รอการพิจารณา
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">รอพิจารณา</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {statistics.total_pending}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">อนุมัติแล้ว</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
                    {statistics.total_approved}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">ปฏิเสธแล้ว</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                    {statistics.total_rejected}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light', color: 'error.dark' }}>
                  <Cancel />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">เวลาเฉลี่ย</Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {statistics.avg_approval_time}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">ชั่วโมง</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}>
                  <Timeline />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Actions */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="ค้นหาเกียรติบัตร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              {selectedCertificates.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={handleBatchApprove}
                  >
                    อนุมัติที่เลือก ({selectedCertificates.length})
                  </Button>
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Certificates Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedCertificates.length > 0 && selectedCertificates.length < filteredCertificates.length}
                      checked={filteredCertificates.length > 0 && selectedCertificates.length === filteredCertificates.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>ชื่อเกียรติบัตร</TableCell>
                  <TableCell>กิจกรรม</TableCell>
                  <TableCell>ผู้สร้าง</TableCell>
                  <TableCell>เทมเพลต</TableCell>
                  <TableCell>วันที่สร้าง</TableCell>
                  <TableCell>จำนวนผู้รับ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="center">การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? 'ไม่พบเกียรติบัตรที่ค้นหา' : 'ไม่มีเกียรติบัตรรอการอนุมัติ'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCertificates.map((certificate) => (
                    <TableRow
                      key={certificate.id}
                      hover
                      selected={selectedCertificates.includes(certificate.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCertificates.includes(certificate.id)}
                          onChange={() => handleSelectCertificate(certificate.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {certificate.title}
                            </Typography>
                            {certificate.description && (
                              <Typography variant="caption" color="text.secondary">
                                {certificate.description.length > 50
                                  ? certificate.description.substring(0, 50) + '...'
                                  : certificate.description
                                }
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{certificate.event_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(certificate.event_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">
                            {certificate.creator_name || 'ไม่ระบุ'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={certificate.template_name || 'ไม่ระบุ'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(certificate.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={certificate.recipients_count || 0}
                          size="small"
                          color="info"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={certificateApprovalService.getStatusLabel(certificate.status)}
                          color={certificateApprovalService.getStatusColor(certificate.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="อนุมัติ/ปฏิเสธ">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openApprovalDialog(certificate)}
                            >
                              <Send />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, certificate)}
                          >
                            <MoreVert />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItemComponent onClick={handleViewDetails}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>ดูรายละเอียด</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={handleViewHistory}>
            <ListItemIcon>
              <Timeline fontSize="small" />
            </ListItemIcon>
            <ListItemText>ประวัติการอนุมัติ</ListItemText>
          </MenuItemComponent>
        </Menu>

        {/* Approval Dialog */}
        <CertificateApprovalDialog
          open={approvalDialogOpen}
          onClose={() => {
            setApprovalDialogOpen(false);
            setSelectedCertificate(null);
          }}
          certificate={selectedCertificate}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Box>
    </DashboardLayout>
  );
};

export default PendingApprovalsPage;
