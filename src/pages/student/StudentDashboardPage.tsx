import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  Assignment,
  Download,
  Verified,
  Schedule,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

interface StudentCertificate {
  id: string;
  name: string;
  course_name: string;
  issue_date: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  template_name: string;
  pdf_url?: string;
}

const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'สวัสดีตอนเช้า' : hour < 18 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
    return `${greeting}, ${user?.first_name || user?.email}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'เผยแพร่แล้ว';
      case 'approved': return 'อนุมัติแล้ว';
      case 'pending': return 'รอการอนุมัติ';
      case 'draft': return 'ร่าง';
      default: return status;
    }
  };

  useEffect(() => {
    // TODO: Fetch student's certificates from API
    // For now, using mock data
    const mockCertificates: StudentCertificate[] = [
      {
        id: '1',
        name: 'เกียรติบัตรการเข้าร่วมสัมมนา',
        course_name: 'การพัฒนาเศรษฐกิจดิจิทัล',
        issue_date: '2024-01-15',
        status: 'published',
        template_name: 'เทมเพลตสัมมนา',
        pdf_url: '/certificates/cert1.pdf'
      },
      {
        id: '2',
        name: 'เกียรติบัตรการฝึกอบรม',
        course_name: 'การวิเคราะห์ข้อมูลทางเศรษฐกิจ',
        issue_date: '2024-02-20',
        status: 'approved',
        template_name: 'เทมเพลตฝึกอบรม',
      },
      {
        id: '3',
        name: 'เกียรติบัตรการแข่งขัน',
        course_name: 'การแข่งขันนำเสนอผลงาน',
        issue_date: '2024-03-10',
        status: 'pending',
        template_name: 'เทมเพลตการแข่งขัน',
      }
    ];
    
    setCertificates(mockCertificates);
    setLoading(false);
  }, []);

  const handleDownloadCertificate = (certificate: StudentCertificate) => {
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, '_blank');
    } else {
      setError('ไฟล์ PDF ยังไม่พร้อมใช้งาน');
    }
  };

  const publishedCertificates = certificates.filter(cert => cert.status === 'published');
  const pendingCertificates = certificates.filter(cert => cert.status === 'pending');

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {getWelcomeMessage()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ยินดีต้อนรับสู่ระบบเกียรติบัตรออนไลน์ คณะเศรษฐศาสตร์
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">เกียรติบัตรที่ได้รับ</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {publishedCertificates.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรที่พร้อมดาวน์โหลด
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">รอการอนุมัติ</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {pendingCertificates.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรที่รอการอนุมัติ
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">ทั้งหมด</Typography>
              </Box>
              <Typography variant="h3" color="primary.main">
                {certificates.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เกียรติบัตรทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Certificates List */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              เกียรติบัตรของฉัน
            </Typography>
            
            {certificates.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  ยังไม่มีเกียรติบัตร
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เกียรติบัตรของคุณจะแสดงที่นี่เมื่อได้รับการอนุมัติ
                </Typography>
              </Box>
              ) : (
                <List>
                  {certificates.map((certificate) => (
                    <ListItem
                      key={certificate.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 2,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Assignment />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {certificate.name}
                            </Typography>
                            <Chip
                              label={getStatusText(certificate.status)}
                              color={getStatusColor(certificate.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              หลักสูตร: {certificate.course_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              วันที่ออก: {new Date(certificate.issue_date).toLocaleDateString('th-TH')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              เทมเพลต: {certificate.template_name}
                            </Typography>
                          </Box>
                        }
                      />
                      {certificate.status === 'published' && (
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleDownloadCertificate(certificate)}
                          sx={{ ml: 2 }}
                        >
                          ดาวน์โหลด
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ข้อมูลส่วนตัว
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label="นักศึกษา"
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                วิธีการใช้งาน
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="1. ตรวจสอบเกียรติบัตร"
                    secondary="ดูสถานะเกียรติบัตรที่ได้รับ"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="2. ดาวน์โหลด PDF"
                    secondary="ดาวน์โหลดเกียรติบัตรที่อนุมัติแล้ว"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="3. ตรวจสอบความถูกต้อง"
                    secondary="ใช้ QR Code เพื่อยืนยันความถูกต้อง"
                  />
                </ListItem>
              </List>
            </Paper>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
