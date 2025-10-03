import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Assignment,
  Person,
  CalendarToday,
  Visibility,
  Edit,
  Check,
  Close,
  History,
  PriorityHigh,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface PendingDocument {
  id: string;
  certificate_id: string;
  recipient_name: string;
  course_name: string;
  template_name: string;
  submitted_date: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_review' | 'ready_to_sign';
  submitted_by: string;
  notes?: string;
  preview_url?: string;
}

const SignerPendingPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signDialog, setSignDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const fetchPendingDocuments = async () => {
    // Mock data for demonstration
    const mockData: PendingDocument[] = [
      {
        id: '1',
        certificate_id: 'CERT-2024-001',
        recipient_name: 'นายสมชาย ใจดี',
        course_name: 'หลักสูตรการพัฒนาเว็บแอปพลิเคชัน',
        template_name: 'เกียรติบัตรการอบรม',
        submitted_date: '2024-01-20T09:00:00Z',
        deadline: '2024-01-25T17:00:00Z',
        priority: 'high',
        status: 'ready_to_sign',
        submitted_by: 'นางสาวจันทร์ เพ็ญ (เจ้าหน้าที่)',
        notes: 'เกียรติบัตรสำหรับผู้เข้าร่วมอบรมครบ 40 ชั่วโมง',
        preview_url: '/preview/cert-001.pdf'
      },
      {
        id: '2',
        certificate_id: 'CERT-2024-002',
        recipient_name: 'นางสาวสุดา ดีมาก',
        course_name: 'การบริหารจัดการโครงการ',
        template_name: 'เกียรติบัตรการอบรม',
        submitted_date: '2024-01-19T14:30:00Z',
        deadline: '2024-01-24T17:00:00Z',
        priority: 'medium',
        status: 'pending',
        submitted_by: 'นายวิชัย สมบูรณ์ (เจ้าหน้าที่)',
        notes: 'ผู้เข้าร่วมอบรมและสอบผ่าน',
      }
    ];

    setPendingDocs(mockData);
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
      case 'high': return 'ด่วนมาก';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'ไม่ด่วน';
      default: return 'ไม่ระบุ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_sign': return 'success';
      case 'in_review': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_to_sign': return 'พร้อมลงนาม';
      case 'in_review': return 'กำลังตรวจสอบ';
      case 'pending': return 'รอดำเนินการ';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePreview = (doc: PendingDocument) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  const handleSign = (doc: PendingDocument) => {
    setSelectedDoc(doc);
    setSignDialog(true);
  };

  const handleReject = (doc: PendingDocument) => {
    setSelectedDoc(doc);
    setRejectDialog(true);
  };

  const confirmSign = async () => {
    if (!selectedDoc) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPendingDocs(prev => prev.filter(doc => doc.id !== selectedDoc.id));
      setSignDialog(false);
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error signing document:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedDoc || !rejectReason.trim()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPendingDocs(prev => prev.filter(doc => doc.id !== selectedDoc.id));
      setRejectDialog(false);
      setSelectedDoc(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const urgentDocs = pendingDocs.filter(doc => doc.priority === 'high').length;
  const readyToSign = pendingDocs.filter(doc => doc.status === 'ready_to_sign').length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          📝 เอกสารรอลงนาม
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            color: 'text.secondary',
            mb: 3,
          }}
        >
          รายการเกียรติบัตรที่รอการลงนามจากท่าน
        </Typography>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <PriorityHigh />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                      {urgentDocs}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      เอกสารด่วน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Check />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                      {readyToSign}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      พร้อมลงนาม
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                      {pendingDocs.length}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      ทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <AccessTime />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                      2
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                      ใกล้หมดเขต
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Pending Documents List */}
      {pendingDocs.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            fontSize: '1.1rem',
          }}
        >
          🎉 ยินดีด้วย! ไม่มีเอกสารรอลงนามในขณะนี้
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {pendingDocs.map((doc) => {
            const daysLeft = getDaysUntilDeadline(doc.deadline);
            const isUrgent = daysLeft <= 2;

            return (
              <Card
                key={doc.id}
                elevation={doc.priority === 'high' ? 8 : 2}
                sx={{
                  border: doc.priority === 'high' ? '2px solid' : '1px solid',
                  borderColor: doc.priority === 'high' ? 'error.main' : 'divider',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                {/* Priority Badge */}
                {doc.priority === 'high' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -1,
                      right: -1,
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: '0 8px 0 8px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      fontFamily: 'Sarabun, sans-serif',
                    }}
                  >
                    🚨 ด่วน
                  </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 400px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mt: 0.5 }}>
                          <Assignment />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Sarabun, sans-serif',
                              fontWeight: 'bold',
                              mb: 1,
                            }}
                          >
                            {doc.recipient_name}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontFamily: 'Sarabun, sans-serif',
                              color: 'text.secondary',
                              mb: 1,
                            }}
                          >
                            {doc.course_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Sarabun, sans-serif',
                              color: 'text.secondary',
                            }}
                          >
                            เทมเพลต: {doc.template_name}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                          label={getPriorityText(doc.priority)}
                          color={getPriorityColor(doc.priority) as any}
                          size="small"
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        />
                        <Chip
                          label={getStatusText(doc.status)}
                          color={getStatusColor(doc.status) as any}
                          size="small"
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        />
                        {isUrgent && (
                          <Chip
                            label={`เหลือ ${daysLeft} วัน`}
                            color="error"
                            size="small"
                            sx={{ fontFamily: 'Sarabun, sans-serif' }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'Sarabun, sans-serif' }}
                          >
                            {doc.submitted_by}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'Sarabun, sans-serif' }}
                          >
                            ส่งเมื่อ: {new Date(doc.submitted_date).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                      </Box>

                      {doc.notes && (
                        <Box
                          sx={{
                            bgcolor: 'grey.50',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Sarabun, sans-serif',
                              fontStyle: 'italic',
                            }}
                          >
                            💬 หมายเหตุ: {doc.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box
                        sx={{
                          bgcolor: isUrgent ? 'error.50' : 'info.50',
                          p: 2,
                          borderRadius: 1,
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}
                        >
                          กำหนดส่ง
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Sarabun, sans-serif',
                            fontWeight: 'bold',
                            color: isUrgent ? 'error.main' : 'info.main',
                          }}
                        >
                          {new Date(doc.deadline).toLocaleDateString('th-TH')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'Sarabun, sans-serif',
                            color: isUrgent ? 'error.main' : 'text.secondary',
                          }}
                        >
                          ({daysLeft > 0 ? `เหลือ ${daysLeft} วัน` : 'หมดเขตแล้ว'})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handlePreview(doc)}
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        >
                          ดูตัวอย่าง
                        </Button>
                        
                        {doc.status === 'ready_to_sign' && (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<Edit />}
                            onClick={() => handleSign(doc)}
                            sx={{ fontFamily: 'Sarabun, sans-serif' }}
                          >
                            ลงนาม
                          </Button>
                        )}
                        
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => handleReject(doc)}
                          sx={{ fontFamily: 'Sarabun, sans-serif' }}
                        >
                          ปฏิเสธ
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตัวอย่างเกียรติบัตร
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 400,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}
          >
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              📄 ตัวอย่างเกียรติบัตรจะแสดงที่นี่
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sign Dialog */}
      <Dialog
        open={signDialog}
        onClose={() => setSignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ยืนยันการลงนาม
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            คุณต้องการลงนามในเกียรติบัตรของ <strong>{selectedDoc?.recipient_name}</strong> หรือไม่?
          </Typography>
          <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            การลงนามจะไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSignDialog(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={confirmSign}
            variant="contained"
            color="success"
            disabled={loading}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            {loading ? 'กำลังลงนาม...' : 'ยืนยันลงนาม'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ปฏิเสธการลงนาม
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            กรุณาระบุเหตุผลในการปฏิเสธการลงนาม
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="เหตุผลในการปฏิเสธ"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="เช่น ข้อมูลไม่ถูกต้อง, เอกสารไม่ครบถ้วน, ฯลฯ"
            sx={{ mt: 1 }}
            InputProps={{
              sx: { fontFamily: 'Sarabun, sans-serif' }
            }}
            InputLabelProps={{
              sx: { fontFamily: 'Sarabun, sans-serif' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialog(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={confirmReject}
            variant="contained"
            color="error"
            disabled={loading || !rejectReason.trim()}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            {loading ? 'กำลังส่ง...' : 'ปฏิเสธ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SignerPendingPage;
