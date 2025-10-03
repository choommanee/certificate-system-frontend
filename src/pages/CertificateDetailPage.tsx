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
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Download,
  Send,
  Share,
  CheckCircle,
  Schedule,
  Cancel,
  Person,
  Assignment,
  Email,
  CalendarToday,
  Description,
  Verified,
  MoreVert,
  Print,
  QrCode,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

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
  verification_code?: string;
  description?: string;
  custom_fields?: { [key: string]: string };
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data
  const mockCertificate: Certificate = {
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
    pdf_url: '/certificates/cert1.pdf',
    verification_code: 'CERT-2024-001',
    description: 'เกียรติบัตรสำหรับผู้เข้าร่วมสัมมนาการพัฒนาเศรษฐกิจดิจิทัล',
    custom_fields: {
      'duration': '8 ชั่วโมง',
      'location': 'ห้องประชุมใหญ่ คณะเศรษฐศาสตร์'
    }
  };

  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      action: 'สร้างเกียรติบัตร',
      user: 'staff@example.com',
      timestamp: '2024-01-15T10:00:00Z',
      details: 'สร้างเกียรติบัตรใหม่'
    },
    {
      id: '2',
      action: 'ส่งขออนุมัติ',
      user: 'staff@example.com',
      timestamp: '2024-01-15T14:00:00Z',
      details: 'ส่งเกียรติบัตรเพื่อขออนุมัติ'
    },
    {
      id: '3',
      action: 'อนุมัติเกียรติบัตร',
      user: 'admin@example.com',
      timestamp: '2024-01-16T09:00:00Z',
      details: 'อนุมัติเกียรติบัตรแล้ว'
    },
    {
      id: '4',
      action: 'เผยแพร่เกียรติบัตร',
      user: 'admin@example.com',
      timestamp: '2024-01-16T14:30:00Z',
      details: 'เผยแพร่เกียรติบัตรและส่งอีเมลให้ผู้รับ'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCertificate(mockCertificate);
      setActivityLogs(mockActivityLogs);
      setLoading(false);
    }, 1000);
  }, [id]);

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

  const handleEdit = () => {
    navigate(`/certificates/${id}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Delete certificate
    navigate('/certificates', {
      state: { message: 'ลบเกียรติบัตรสำเร็จ' }
    });
  };

  const handleApprove = () => {
    setApprovalDialogOpen(true);
  };

  const confirmApproval = () => {
    // TODO: Approve certificate
    if (certificate) {
      setCertificate({
        ...certificate,
        status: 'approved',
        approved_by: user?.email || 'admin@example.com'
      });
    }
    setApprovalDialogOpen(false);
    setApprovalComment('');
  };

  const handleReject = () => {
    // TODO: Reject certificate
    if (certificate) {
      setCertificate({
        ...certificate,
        status: 'rejected'
      });
    }
  };

  const handleDownload = () => {
    if (certificate?.pdf_url) {
      window.open(certificate.pdf_url, '_blank');
    }
  };

  const handleSendEmail = () => {
    // TODO: Send email to recipient
    alert('ส่งอีเมลให้ผู้รับแล้ว');
  };

  const handleShare = () => {
    if (certificate?.verification_code) {
      const verificationUrl = `${window.location.origin}/verify/${certificate.verification_code}`;
      navigator.clipboard.writeText(verificationUrl);
      alert('คัดลอกลิงก์ตรวจสอบแล้ว');
    }
  };

  const canEdit = user?.role === 'staff' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const canApprove = user?.role === 'admin' && certificate?.status === 'pending';

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!certificate) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">ไม่พบเกียรติบัตรที่ต้องการ</Alert>
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
              onClick={() => navigate('/certificates')}
              sx={{ mr: 2 }}
            >
              กลับ
            </Button>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                {certificate.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={getStatusIcon(certificate.status)}
                  label={getStatusText(certificate.status)}
                  color={getStatusColor(certificate.status) as any}
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  รหัสตรวจสอบ: {certificate.verification_code}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {certificate.pdf_url && (
              <Button
                startIcon={<Download />}
                onClick={handleDownload}
                variant="outlined"
              >
                ดาวน์โหลด
              </Button>
            )}
            
            {canApprove && (
              <Button
                startIcon={<CheckCircle />}
                onClick={handleApprove}
                variant="contained"
                color="success"
              >
                อนุมัติ
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
            {/* Certificate Preview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ตัวอย่างเกียรติบัตร
                </Typography>
                <Box
                  sx={{
                    height: 400,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      ตัวอย่างเกียรติบัตร
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {certificate.name}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Certificate Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  รายละเอียดเกียรติบัตร
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ชื่อเกียรติบัตร</Typography>
                      <Typography variant="body1">{certificate.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">หลักสูตร/กิจกรรม</Typography>
                      <Typography variant="body1">{certificate.course_name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">เทมเพลต</Typography>
                      <Typography variant="body1">{certificate.template_name}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">วันที่ออก</Typography>
                      <Typography variant="body1">
                        {certificate.issued_date ? new Date(certificate.issued_date).toLocaleDateString('th-TH') : '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">ผู้สร้าง</Typography>
                      <Typography variant="body1">{certificate.created_by}</Typography>
                    </Box>
                    {certificate.approved_by && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">ผู้อนุมัติ</Typography>
                        <Typography variant="body1">{certificate.approved_by}</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                {certificate.description && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">รายละเอียด</Typography>
                    <Typography variant="body1">{certificate.description}</Typography>
                  </Box>
                )}

                {certificate.custom_fields && Object.keys(certificate.custom_fields).length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ข้อมูลเพิ่มเติม
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(certificate.custom_fields).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {key}
                            </Typography>
                            <Typography variant="body2">
                              {value}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ประวัติการดำเนินการ
                </Typography>
                <List>
                  {activityLogs.map((log, index) => (
                    <React.Fragment key={log.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <Assignment />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={log.action}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                โดย {log.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(log.timestamp).toLocaleString('th-TH')}
                              </Typography>
                              {log.details && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {log.details}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < activityLogs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Recipient Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลผู้รับ
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {certificate.recipient_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {certificate.recipient_email}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  fullWidth
                  startIcon={<Email />}
                  onClick={handleSendEmail}
                  variant="outlined"
                  sx={{ mb: 1 }}
                >
                  ส่งอีเมล
                </Button>
                <Button
                  fullWidth
                  startIcon={<Share />}
                  onClick={handleShare}
                  variant="outlined"
                >
                  แชร์ลิงก์ตรวจสอบ
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  การดำเนินการ
                </Typography>
                <List dense>
                  {certificate.pdf_url && (
                    <ListItem button onClick={handleDownload}>
                      <ListItemIcon>
                        <Download />
                      </ListItemIcon>
                      <ListItemText primary="ดาวน์โหลด PDF" />
                    </ListItem>
                  )}
                  
                  <ListItem button onClick={() => window.print()}>
                    <ListItemIcon>
                      <Print />
                    </ListItemIcon>
                    <ListItemText primary="พิมพ์" />
                  </ListItem>

                  <ListItem button onClick={() => navigate(`/verify/${certificate.verification_code}`)}>
                    <ListItemIcon>
                      <Verified />
                    </ListItemIcon>
                    <ListItemText primary="ตรวจสอบความถูกต้อง" />
                  </ListItem>

                  {canEdit && (
                    <ListItem button onClick={handleEdit}>
                      <ListItemIcon>
                        <Edit />
                      </ListItemIcon>
                      <ListItemText primary="แก้ไข" />
                    </ListItem>
                  )}

                  {canDelete && (
                    <ListItem button onClick={handleDelete} sx={{ color: 'error.main' }}>
                      <ListItemIcon>
                        <Delete color="error" />
                      </ListItemIcon>
                      <ListItemText primary="ลบ" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Verification Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลการตรวจสอบ
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">รหัสตรวจสอบ</Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {certificate.verification_code}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">ลิงก์ตรวจสอบ</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {`${window.location.origin}/verify/${certificate.verification_code}`}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  startIcon={<QrCode />}
                  variant="outlined"
                >
                  สร้าง QR Code
                </Button>
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
          {canEdit && (
            <MenuItem onClick={handleEdit}>
              <Edit sx={{ mr: 1 }} />
              แก้ไข
            </MenuItem>
          )}
          <MenuItem onClick={handleSendEmail}>
            <Send sx={{ mr: 1 }} />
            ส่งอีเมล
          </MenuItem>
          <MenuItem onClick={handleShare}>
            <Share sx={{ mr: 1 }} />
            แชร์
          </MenuItem>
          {canDelete && (
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
              คุณแน่ใจหรือไม่ที่จะลบเกียรติบัตร "{certificate.name}"?
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
        <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
          <DialogTitle>อนุมัติเกียรติบัตร</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              คุณต้องการอนุมัติเกียรติบัตร "{certificate.name}" หรือไม่?
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="ความเห็นเพิ่มเติม (ไม่บังคับ)"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleReject} color="error">
              ปฏิเสธ
            </Button>
            <Button onClick={confirmApproval} color="success" variant="contained">
              อนุมัติ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CertificateDetailPage;