import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import {
  Assignment,
  Person,
  CalendarToday,
  School,
  Visibility,
  Edit,
  Check,
  Close,
  History,
  PriorityHigh,
  AccessTime,
  Notifications,
  FilterList,
  Search,
  Download,
  Print,
} from '@mui/icons-material';

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
  completion_percentage?: number;
}

const PendingDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<PendingDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signDialog, setSignDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, priorityFilter, statusFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Mock data
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
          submitted_by: 'นางสาวจันทร์ เพ็ญ',
          notes: 'เกียรติบัตรสำหรับผู้เข้าร่วมอบรมครบ 40 ชั่วโมง',
          completion_percentage: 95
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
          status: 'in_review',
          submitted_by: 'นายวิชัย สมบูรณ์',
          completion_percentage: 75
        },
        {
          id: '3',
          certificate_id: 'CERT-2024-003',
          recipient_name: 'นายประยุทธ์ เก่งมาก',
          course_name: 'Digital Marketing Strategy',
          template_name: 'เกียรติบัตรการอบรม',
          submitted_date: '2024-01-18T10:15:00Z',
          deadline: '2024-01-23T17:00:00Z',
          priority: 'high',
          status: 'ready_to_sign',
          submitted_by: 'นางสาวมาลี ใสใจ',
          notes: 'ผู้เข้าร่วมอบรมและทำโครงงานผ่าน',
          completion_percentage: 100
        }
      ];
      
      setDocuments(mockData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.certificate_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(doc => doc.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocs(filtered);
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

  const handleSign = async (doc: PendingDocument) => {
    setSelectedDoc(doc);
    setSignDialog(true);
  };

  const confirmSign = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDoc.id));
      setSignDialog(false);
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error signing document:', error);
    } finally {
      setLoading(false);
    }
  };

  const urgentDocs = documents.filter(doc => doc.priority === 'high').length;
  const readyToSign = documents.filter(doc => doc.status === 'ready_to_sign').length;

  return (
    <SignerDashboardLayout>
      <Box sx={{ maxWidth: 'xl', width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 1 }}>
          📝 เอกสารรอลงนาม
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', mb: 3 }}>
          รายการเกียรติบัตรที่รอการลงนามจากท่าน
        </Typography>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: '1 1 200px', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                <PriorityHigh />
              </Avatar>
              <Typography variant="h3" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: 'error.main' }}>
                {urgentDocs}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                เอกสารด่วน
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <Check />
              </Avatar>
              <Typography variant="h3" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: 'success.main' }}>
                {readyToSign}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                พร้อมลงนาม
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                <Assignment />
              </Avatar>
              <Typography variant="h3" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', color: 'info.main' }}>
                {documents.length}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                ทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="ค้นหาชื่อ, หลักสูตร, รหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>ความสำคัญ</InputLabel>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="high">ด่วนมาก</MenuItem>
              <MenuItem value="medium">ปานกลาง</MenuItem>
              <MenuItem value="low">ไม่ด่วน</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>สถานะ</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="ready_to_sign">พร้อมลงนาม</MenuItem>
              <MenuItem value="in_review">กำลังตรวจสอบ</MenuItem>
              <MenuItem value="pending">รอดำเนินการ</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Documents List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>กำลังโหลดข้อมูล...</Typography>
        </Box>
      ) : filteredDocs.length === 0 ? (
        <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif', fontSize: '1.1rem' }}>
          {documents.length === 0 ? '🎉 ยินดีด้วย! ไม่มีเอกสารรอลงนามในขณะนี้' : '🔍 ไม่พบเอกสารที่ตรงกับเงื่อนไขการค้นหา'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredDocs.map((doc) => {
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
                  '&:hover': { boxShadow: 6 },
                }}
              >
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
                          <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 1 }}>
                            {doc.recipient_name}
                          </Typography>
                          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary', mb: 1 }}>
                            {doc.course_name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif', color: 'text.secondary' }}>
                            รหัส: {doc.certificate_id} | เทมเพลต: {doc.template_name}
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

                      {doc.completion_percentage && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                              ความคืบหน้า
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                              {doc.completion_percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={doc.completion_percentage}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {doc.submitted_by}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            ส่งเมื่อ: {new Date(doc.submitted_date).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                      </Box>

                      {doc.notes && (
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif', fontStyle: 'italic' }}>
                            💬 หมายเหตุ: {doc.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ bgcolor: isUrgent ? 'error.50' : 'info.50', p: 2, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}>
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
                          onClick={() => {
                            setSelectedDoc(doc);
                            setPreviewOpen(true);
                          }}
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
                          onClick={() => {
                            setSelectedDoc(doc);
                            setRejectDialog(true);
                          }}
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

      {/* Dialogs */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>ตัวอย่างเกียรติบัตร</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>📄 ตัวอย่างเกียรติบัตรจะแสดงที่นี่</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} sx={{ fontFamily: 'Sarabun, sans-serif' }}>ปิด</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={signDialog} onClose={() => setSignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>ยืนยันการลงนาม</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            คุณต้องการลงนามในเกียรติบัตรของ <strong>{selectedDoc?.recipient_name}</strong> หรือไม่?
          </Typography>
          <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            การลงนามจะไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignDialog(false)} sx={{ fontFamily: 'Sarabun, sans-serif' }}>ยกเลิก</Button>
          <Button onClick={confirmSign} variant="contained" color="success" disabled={loading} sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            {loading ? 'กำลังลงนาม...' : 'ยืนยันลงนาม'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </SignerDashboardLayout>
  );
};

export default PendingDocumentsPage;
