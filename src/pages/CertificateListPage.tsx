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
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Download,
  Send,
  CheckCircle,
  Schedule,
  Cancel,
  Person,
  Assignment,
  CheckCircleOutline,
  CancelOutlined,
  Publish,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CertificateApprovalDialog from '../components/dialogs/CertificateApprovalDialog';
import certificateApprovalService from '../services/certificateApprovalService';

interface Certificate {
  id: string;
  name: string;
  course_name: string;
  template_name: string;
  recipient_name: string;
  recipient_email: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;
  issued_date?: string;
  pdf_url?: string;
}

const CertificateListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [certificateForApproval, setCertificateForApproval] = useState<Certificate | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data
  const mockCertificates: Certificate[] = [
    {
      id: '1',
      name: 'เกียรติบัตรการเข้าร่วมสัมมนา',
      course_name: 'การพัฒนาเศรษฐกิจดิจิทัล',
      template_name: 'เทมเพลตสัมมนา',
      recipient_name: 'นายสมชาย ใจดี',
      recipient_email: 'somchai@example.com',
      status: 'published',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-16T14:30:00Z',
      created_by: 'staff@example.com',
      approved_by: 'admin@example.com',
      issued_date: '2024-01-16',
      pdf_url: '/certificates/cert1.pdf'
    },
    {
      id: '2',
      name: 'เกียรติบัตรการฝึกอบรม',
      course_name: 'การวิเคราะห์ข้อมูลทางเศรษฐกิจ',
      template_name: 'เทมเพลตฝึกอบรม',
      recipient_name: 'นางสาวสุดา เก่งมาก',
      recipient_email: 'suda@example.com',
      status: 'approved',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-02-21T11:45:00Z',
      created_by: 'staff@example.com',
      approved_by: 'admin@example.com',
      issued_date: '2024-02-21'
    },
    {
      id: '3',
      name: 'เกียรติบัตรการแข่งขัน',
      course_name: 'การแข่งขันนำเสนอผลงาน',
      template_name: 'เทมเพลตการแข่งขัน',
      recipient_name: 'นายวิชัย ชนะเลิศ',
      recipient_email: 'wichai@example.com',
      status: 'pending',
      created_at: '2024-03-10T13:20:00Z',
      updated_at: '2024-03-10T13:20:00Z',
      created_by: 'staff@example.com'
    },
    {
      id: '4',
      name: 'เกียรติบัตรการอบรมออนไลน์',
      course_name: 'เทคโนโลジีการเงินดิจิทัล',
      template_name: 'เทมเพลตออนไลน์',
      recipient_name: 'นางสาวมาลี สวยงาม',
      recipient_email: 'malee@example.com',
      status: 'draft',
      created_at: '2024-03-15T16:00:00Z',
      updated_at: '2024-03-15T16:00:00Z',
      created_by: 'staff@example.com'
    },
    {
      id: '5',
      name: 'เกียรติบัตรการสำเร็จการศึกษา',
      course_name: 'หลักสูตรเศรษฐศาสตร์ธุรกิจ',
      template_name: 'เทมเพลตจบการศึกษา',
      recipient_name: 'นายประยุทธ์ เรียนดี',
      recipient_email: 'prayuth@example.com',
      status: 'rejected',
      created_at: '2024-03-12T08:30:00Z',
      updated_at: '2024-03-13T10:15:00Z',
      created_by: 'staff@example.com'
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
      case 'published': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'เผยแพร่แล้ว';
      case 'approved': return 'อนุมัติแล้ว';
      case 'pending': return 'รอการอนุมัติ';
      case 'draft': return 'ร่าง';
      case 'rejected': return 'ถูกปฏิเสธ';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle />;
      case 'approved': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'draft': return <Assignment />;
      case 'rejected': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedCertificates = filteredCertificates.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, certificate: Certificate) => {
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

  const handleEdit = () => {
    if (selectedCertificate) {
      navigate(`/certificates/${selectedCertificate.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedCertificate) {
      setCertificates(prev => prev.filter(cert => cert.id !== selectedCertificate.id));
      setDeleteDialogOpen(false);
      setSelectedCertificate(null);
    }
  };

  const handleDownload = () => {
    if (selectedCertificate?.pdf_url) {
      window.open(selectedCertificate.pdf_url, '_blank');
    }
    handleMenuClose();
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

  const handleSubmitForApproval = async (certificateId: string) => {
    try {
      await certificateApprovalService.submitForApproval(certificateId);
      // Reload certificates
      const updatedCerts = certificates.map(cert =>
        cert.id === certificateId ? { ...cert, status: 'pending' as const } : cert
      );
      setCertificates(updatedCerts);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งอนุมัติ');
    }
    handleMenuClose();
  };

  const handleApprovalAction = (certificate: Certificate) => {
    setCertificateForApproval(certificate);
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  const handleApprove = async (certificateId: string, comment?: string) => {
    try {
      await certificateApprovalService.approveCertificate(certificateId, comment);
      const updatedCerts = certificates.map(cert =>
        cert.id === certificateId ? { ...cert, status: 'approved' as const } : cert
      );
      setCertificates(updatedCerts);
    } catch (err: any) {
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async (certificateId: string, reason: string, comment?: string) => {
    try {
      await certificateApprovalService.rejectCertificate(certificateId, reason, comment);
      const updatedCerts = certificates.map(cert =>
        cert.id === certificateId ? { ...cert, status: 'rejected' as const } : cert
      );
      setCertificates(updatedCerts);
    } catch (err: any) {
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const handlePublish = async (certificateId: string) => {
    try {
      await certificateApprovalService.publishCertificate(certificateId);
      const updatedCerts = certificates.map(cert =>
        cert.id === certificateId ? { ...cert, status: 'published' as const } : cert
      );
      setCertificates(updatedCerts);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเผยแพร่');
    }
    handleMenuClose();
  };

  const canCreateCertificate = user?.role === 'staff' || user?.role === 'admin';
  const canEditCertificate = user?.role === 'staff' || user?.role === 'admin';
  const canDeleteCertificate = user?.role === 'admin';
  const canApprove = certificateApprovalService.canApprove(user?.role || '');

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
              จัดการเกียรติบัตร
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ดูและจัดการเกียรติบัตรทั้งหมดในระบบ
            </Typography>
          </Box>
          {canCreateCertificate && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/certificates/create')}
              sx={{ borderRadius: 2 }}
            >
              สร้างเกียรติบัตรใหม่
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

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
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  label="สถานะ"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="draft">ร่าง</MenuItem>
                  <MenuItem value="pending">รอการอนุมัติ</MenuItem>
                  <MenuItem value="approved">อนุมัติแล้ว</MenuItem>
                  <MenuItem value="published">เผยแพร่แล้ว</MenuItem>
                  <MenuItem value="rejected">ถูกปฏิเสธ</MenuItem>
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
        {selectedCertificates.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                เลือกแล้ว {selectedCertificates.length} รายการ
              </Typography>
              <Button startIcon={<Send />} sx={{ mr: 1 }}>
                ส่งอีเมล
              </Button>
              <Button startIcon={<Download />} sx={{ mr: 1 }}>
                ดาวน์โหลด
              </Button>
              {canDeleteCertificate && (
                <Button startIcon={<Delete />} color="error">
                  ลบ
                </Button>
              )}
            </Toolbar>
          </Card>
        )}

        {/* Certificates Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedCertificates.length > 0 && selectedCertificates.length < paginatedCertificates.length}
                      checked={paginatedCertificates.length > 0 && selectedCertificates.length === paginatedCertificates.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>เกียรติบัตร</TableCell>
                  <TableCell>ผู้รับ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>วันที่สร้าง</TableCell>
                  <TableCell>ผู้สร้าง</TableCell>
                  <TableCell align="center">การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCertificates.map((certificate) => (
                  <TableRow key={certificate.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCertificates.includes(certificate.id)}
                        onChange={() => handleSelectCertificate(certificate.id)}
                      />
                    </TableCell>
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
                        icon={getStatusIcon(certificate.status)}
                        label={getStatusText(certificate.status)}
                        color={getStatusColor(certificate.status) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(certificate.created_at).toLocaleDateString('th-TH')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(certificate.created_at).toLocaleTimeString('th-TH')}
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
            {canEditCertificate && (
              <MenuItemComponent onClick={handleEdit}>
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                <ListItemText>แก้ไข</ListItemText>
              </MenuItemComponent>
            )}
            {selectedCertificate?.pdf_url && (
              <MenuItemComponent onClick={handleDownload}>
                <ListItemIcon>
                  <Download />
                </ListItemIcon>
                <ListItemText>ดาวน์โหลด PDF</ListItemText>
              </MenuItemComponent>
            )}
            {selectedCertificate && selectedCertificate.status === 'draft' && canEditCertificate && (
              <MenuItemComponent onClick={() => handleSubmitForApproval(selectedCertificate.id)}>
                <ListItemIcon>
                  <Send color="primary" />
                </ListItemIcon>
                <ListItemText>ส่งอนุมัติ</ListItemText>
              </MenuItemComponent>
            )}
            {selectedCertificate && selectedCertificate.status === 'pending' && canApprove && (
              <MenuItemComponent onClick={() => handleApprovalAction(selectedCertificate)}>
                <ListItemIcon>
                  <CheckCircleOutline color="success" />
                </ListItemIcon>
                <ListItemText>พิจารณาอนุมัติ</ListItemText>
              </MenuItemComponent>
            )}
            {selectedCertificate && selectedCertificate.status === 'approved' && canEditCertificate && (
              <MenuItemComponent onClick={() => handlePublish(selectedCertificate.id)}>
                <ListItemIcon>
                  <Publish color="primary" />
                </ListItemIcon>
                <ListItemText>เผยแพร่</ListItemText>
              </MenuItemComponent>
            )}
            {canDeleteCertificate && (
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
              คุณแน่ใจหรือไม่ที่จะลบเกียรติบัตร "{selectedCertificate?.name}"?
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

        {/* Approval Dialog */}
        <CertificateApprovalDialog
          open={approvalDialogOpen}
          onClose={() => {
            setApprovalDialogOpen(false);
            setCertificateForApproval(null);
          }}
          certificate={certificateForApproval as any}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Box>
    </DashboardLayout>
  );
};

export default CertificateListPage;