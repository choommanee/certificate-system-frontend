import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Cancel,
  Comment,
  Info,
  Person,
  CalendarToday,
  Assignment
} from '@mui/icons-material';
import { Certificate } from '../../services/certificateApprovalService';

interface CertificateApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  onApprove: (certificateId: string, comment?: string) => Promise<void>;
  onReject: (certificateId: string, reason: string, comment?: string) => Promise<void>;
}

const REJECTION_REASONS = [
  { value: 'incomplete_data', label: 'ข้อมูลไม่ครบถ้วน' },
  { value: 'incorrect_template', label: 'เทมเพลตไม่ถูกต้อง' },
  { value: 'missing_signatures', label: 'ขาดลายเซ็น' },
  { value: 'policy_violation', label: 'ฝ่าฝืนนโยบาย' },
  { value: 'duplicate', label: 'ซ้ำซ้อน' },
  { value: 'other', label: 'อื่นๆ (ระบุในหมายเหตุ)' }
];

const CertificateApprovalDialog: React.FC<CertificateApprovalDialogProps> = ({
  open,
  onClose,
  certificate,
  onApprove,
  onReject
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setAction('approve');
    setReason('');
    setComment('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!certificate) return;

    setError(null);
    setLoading(true);

    try {
      if (action === 'approve') {
        await onApprove(certificate.id, comment || undefined);
      } else {
        if (!reason) {
          setError('กรุณาเลือกเหตุผลในการปฏิเสธ');
          setLoading(false);
          return;
        }
        await onReject(certificate.id, reason, comment || undefined);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setLoading(false);
    }
  };

  if (!certificate) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            <Typography variant="h6">
              พิจารณาอนุมัติเกียรติบัตร
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Certificate Details */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            รายละเอียดเกียรติบัตร
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assignment fontSize="small" color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">ชื่อเกียรติบัตร</Typography>
                <Typography variant="body1" fontWeight="medium">{certificate.title}</Typography>
              </Box>
            </Box>

            {certificate.description && (
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <Info fontSize="small" color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">รายละเอียด</Typography>
                  <Typography variant="body2">{certificate.description}</Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarToday fontSize="small" color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">วันที่จัดกิจกรรม</Typography>
                <Typography variant="body2">
                  {certificate.event_name} • {new Date(certificate.event_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            {certificate.creator_name && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person fontSize="small" color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">ผู้สร้าง</Typography>
                  <Typography variant="body2">{certificate.creator_name}</Typography>
                </Box>
              </Box>
            )}

            {certificate.recipients_count !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {certificate.recipients_count}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">จำนวนผู้รับ</Typography>
                  <Typography variant="body2">{certificate.recipients_count} คน</Typography>
                </Box>
              </Box>
            )}

            {certificate.template_name && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>เทมเพลต</Typography>
                <Chip label={certificate.template_name} size="small" variant="outlined" />
              </Box>
            )}

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>สถานะ</Typography>
              <Chip
                label="รอการอนุมัติ"
                color="warning"
                size="small"
              />
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            การดำเนินการ
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={action}
              onChange={(e) => setAction(e.target.value as 'approve' | 'reject')}
            >
              <FormControlLabel
                value="approve"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography>อนุมัติเกียรติบัตร</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="reject"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cancel color="error" fontSize="small" />
                    <Typography>ปฏิเสธเกียรติบัตร</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Rejection Reason (only show when reject is selected) */}
        {action === 'reject' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              เหตุผลในการปฏิเสธ *
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REJECTION_REASONS.map((r) => (
                  <FormControlLabel
                    key={r.value}
                    value={r.value}
                    control={<Radio />}
                    label={r.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Comment/Note */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
            <Comment fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            หมายเหตุ {action === 'reject' && reason === 'other' && '(ระบุเหตุผลเพิ่มเติม) *'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={
              action === 'approve'
                ? 'เพิ่มหมายเหตุเกี่ยวกับการอนุมัติ (ถ้ามี)'
                : 'ระบุรายละเอียดเพิ่มเติมเกี่ยวกับการปฏิเสธ'
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Info Alert */}
        {action === 'approve' ? (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
            การอนุมัติจะทำให้เกียรติบัตรนี้สามารถเผยแพร่ได้ทันที หรือรอการเผยแพร่ตามที่กำหนด
          </Alert>
        ) : (
          <Alert severity="warning" icon={<Cancel />} sx={{ mt: 2 }}>
            การปฏิเสธจะส่งเกียรติบัตรกลับไปให้ผู้สร้างแก้ไข พร้อมเหตุผลที่ระบุ
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || (action === 'reject' && (!reason || (reason === 'other' && !comment)))}
          color={action === 'approve' ? 'success' : 'error'}
          startIcon={action === 'approve' ? <CheckCircle /> : <Cancel />}
        >
          {loading ? 'กำลังดำเนินการ...' : action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificateApprovalDialog;
