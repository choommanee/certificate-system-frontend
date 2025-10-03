import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  Draw as SignIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Schedule as ClockIcon,
  CalendarToday as CalendarIcon,
  Assignment as DocumentIcon,
  PriorityHigh as UrgentIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { DocumentToSign, Recipient } from '../../types/signer';

interface DocumentViewerProps {
  document: DocumentToSign;
  onSign: () => void;
  onReject: (reason: string, comments?: string) => void;
  onClose?: () => void;
  loading?: boolean;
  error?: string | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onSign,
  onReject,
  onClose,
  loading = false,
  error = null
}) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComments, setRejectComments] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [expandedSections, setExpandedSections] = useState<string[]>(['details']);

  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason, rejectComments.trim() || undefined);
      setRejectDialogOpen(false);
      setRejectReason('');
      setRejectComments('');
    }
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
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
      month: 'long',
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

  const isOverdue = getDaysOverdue(document.dueDate) > 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DocumentIcon color="primary" />
            {document.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={getPriorityText(document.priority)}
              color={getPriorityColor(document.priority) as any}
              icon={document.priority === 'high' ? <UrgentIcon /> : undefined}
            />
            
            {isOverdue && (
              <Chip
                label={`เกินกำหนด ${getDaysOverdue(document.dueDate)} วัน`}
                color="error"
                variant="outlined"
              />
            )}
            
            <Chip
              label={document.activityDetails.type}
              variant="outlined"
            />
          </Box>
        </Box>

        {onClose && (
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Document Details */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Certificate Preview */}
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                  >
                    ตัวอย่างเกียรติบัตร
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="ขยาย">
                      <IconButton onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}>
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ย่อ">
                      <IconButton onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}>
                        <ZoomOutIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ดูแบบเต็มจอ">
                      <IconButton onClick={() => setPreviewDialogOpen(true)}>
                        <FullscreenIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box
                  sx={{
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    overflow: 'auto'
                  }}
                >
                  <img
                    src={document.certificatePreview}
                    alt="Certificate preview"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  />
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                >
                  ตัวอย่างเกียรติบัตรที่จะได้รับการลงนาม
                </Typography>
              </CardContent>
            </Card>

            {/* Document Details Accordion */}
            <Accordion 
              expanded={expandedSections.includes('details')}
              onChange={() => handleSectionToggle('details')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                  📋 รายละเอียดเอกสาร
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      ชื่อกิจกรรม:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {document.activityDetails.name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      ประเภทกิจกรรม:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {document.activityDetails.type}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      คำอธิบาย:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {document.description || document.activityDetails.description}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      วันที่จัดกิจกรรม:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {formatDate(document.activityDetails.date)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      สถานที่:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {document.activityDetails.location || 'ไม่ระบุ'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      ผู้จัด:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {document.activityDetails.organizer}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      จำนวนผู้รับเกียรติบัตร:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                      {document.recipients.length} คน
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Recipients List Accordion */}
            <Accordion 
              expanded={expandedSections.includes('recipients')}
              onChange={() => handleSectionToggle('recipients')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                  👥 รายชื่อผู้รับเกียรติบัตร ({document.recipients.length} คน)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                          รหัสนักศึกษา
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                          ชื่อ-นามสกุล
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                          อีเมล
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                          คณะ/ชั้นปี
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {document.recipients.slice(0, 10).map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {recipient.student_id}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {recipient.first_name} {recipient.last_name}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {recipient.email}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                            {recipient.department} {recipient.year && `ปี ${recipient.year}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {document.recipients.length > 10 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                  >
                    แสดง 10 รายการแรก จากทั้งหมด {document.recipients.length} คน
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Grid>

        {/* Right Column - Actions and Info */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Action Buttons */}
            <Card elevation={3}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  การดำเนินการ
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SignIcon />}
                    onClick={onSign}
                    disabled={loading}
                    fullWidth
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      py: 1.5,
                      bgcolor: document.priority === 'high' ? 'error.main' : 'primary.main',
                      '&:hover': {
                        bgcolor: document.priority === 'high' ? 'error.dark' : 'primary.dark'
                      }
                    }}
                  >
                    {loading ? 'กำลังดำเนินการ...' : 'ลงนามเอกสาร'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<RejectIcon />}
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={loading}
                    fullWidth
                    color="error"
                    sx={{ fontFamily: 'Sarabun, sans-serif', py: 1.5 }}
                  >
                    ปฏิเสธเอกสาร
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Request Information */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  ข้อมูลคำขอ
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ผู้ขอลงนาม:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        {document.requestedBy.first_name} {document.requestedBy.last_name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClockIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        วันที่ส่งคำขอ:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        {formatDate(document.requestDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {document.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color={isOverdue ? 'error' : 'action'} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          กำหนดส่ง:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontFamily: 'Sarabun, sans-serif',
                            color: isOverdue ? 'error.main' : 'text.primary'
                          }}
                        >
                          {formatDate(document.dueDate)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        จำนวนผู้รับ:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        {document.recipients.length} คน
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* File Information */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  ข้อมูลไฟล์
                </Typography>
                
                <Stack spacing={1}>
                  <Typography variant="body2">
                    📄 รูปแบบ: {document.metadata.format}
                  </Typography>
                  <Typography variant="body2">
                    📏 ขนาด: {(document.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Typography variant="body2">
                    📑 จำนวนหน้า: {document.metadata.totalPages}
                  </Typography>
                  <Typography variant="body2">
                    👤 สร้างโดย: {document.metadata.createdBy}
                  </Typography>
                  <Typography variant="body2">
                    ⏰ แก้ไขล่าสุด: {formatDate(document.metadata.lastModified)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Certificate Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตัวอย่างเกียรติบัตร - {document.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <img
              src={document.certificatePreview}
              alt="Certificate preview"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ปฏิเสธเอกสาร
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
            กรุณาระบุเหตุผลในการปฏิเสธเอกสารนี้
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="เหตุผลในการปฏิเสธ *"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            margin="dense"
            label="หมายเหตุเพิ่มเติม"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectComments}
            onChange={(e) => setRejectComments(e.target.value)}
            placeholder="ข้อเสนอแนะหรือคำแนะนำ (ไม่บังคับ)"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleRejectSubmit}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ปฏิเสธเอกสาร
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentViewer;