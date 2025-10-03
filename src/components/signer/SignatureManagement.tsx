import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import {
  Star as ActiveIcon,
  StarBorder as InactiveIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import { Signature } from '../../types/signer';
import { useSignatures } from '../../hooks/useSigner';
import SignatureUpload from './SignatureUpload';

interface SignatureManagementProps {
  onSignatureChange?: (signatures: Signature[]) => void;
}

const SignatureManagement: React.FC<SignatureManagementProps> = ({
  onSignatureChange
}) => {
  const {
    signatures,
    loading,
    error,
    uploading,
    uploadSignature,
    setActiveSignature,
    deleteSignature,
    getActiveSignature
  } = useSignatures();

  const [showUpload, setShowUpload] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    signature: Signature | null;
  }>({ open: false, signature: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    signature: Signature | null;
  }>({ open: false, signature: null });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const activeSignature = getActiveSignature();

  const handleUpload = async (file: File, name?: string) => {
    const result = await uploadSignature(file);
    if (result && onSignatureChange) {
      onSignatureChange([...signatures, result]);
    }
    return result;
  };

  const handleSetActive = async (signatureId: string) => {
    setActionLoading(signatureId);
    const success = await setActiveSignature(signatureId);
    if (success && onSignatureChange) {
      const updatedSignatures = signatures.map(sig => ({
        ...sig,
        isActive: sig.id === signatureId
      }));
      onSignatureChange(updatedSignatures);
    }
    setActionLoading(null);
  };

  const handleDelete = async (signature: Signature) => {
    setActionLoading(signature.id);
    const success = await deleteSignature(signature.id);
    if (success && onSignatureChange) {
      const updatedSignatures = signatures.filter(sig => sig.id !== signature.id);
      onSignatureChange(updatedSignatures);
    }
    setActionLoading(null);
    setDeleteDialog({ open: false, signature: null });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
          ✍️ จัดการลายเซ็น
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowUpload(true)}
          sx={{ fontFamily: 'Sarabun, sans-serif' }}
        >
          เพิ่มลายเซ็นใหม่
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
          {error}
        </Alert>
      )}

      {/* Active Signature Summary */}
      {activeSignature && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CheckIcon color="success" />
            ลายเซ็นที่ใช้งานอยู่
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box
                sx={{
                  border: '2px solid',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  p: 1,
                  bgcolor: 'background.paper',
                  textAlign: 'center'
                }}
              >
                <img
                  src={activeSignature.imageUrl || `data:${activeSignature.mimeType};base64,${activeSignature.imageData}`}
                  alt="Active signature"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Stack spacing={1}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  📁 {activeSignature.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📏 {formatFileSize(activeSignature.fileSize)} • 🎨 {activeSignature.mimeType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ⏰ อัปโหลดเมื่อ: {formatDate(activeSignature.createdAt)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Upload Section */}
      {showUpload && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
              อัปโหลดลายเซ็นใหม่
            </Typography>
            <Button
              variant="text"
              onClick={() => setShowUpload(false)}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ยกเลิก
            </Button>
          </Box>
          <SignatureUpload
            onUpload={handleUpload}
            uploading={uploading}
            error={error}
          />
        </Paper>
      )}

      {/* Signatures Grid */}
      {signatures.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}
          >
            ยังไม่มีลายเซ็น
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: 'Sarabun, sans-serif', mb: 3 }}
          >
            เริ่มต้นด้วยการอัปโหลดลายเซ็นแรกของคุณ
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowUpload(true)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            อัปโหลดลายเซ็น
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {signatures.map((signature) => (
            <Grid item xs={12} sm={6} md={4} key={signature.id}>
              <Card
                elevation={signature.isActive ? 4 : 2}
                sx={{
                  position: 'relative',
                  border: signature.isActive ? '2px solid' : '1px solid',
                  borderColor: signature.isActive ? 'success.main' : 'divider',
                  '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                {/* Active Badge */}
                {signature.isActive && (
                  <Chip
                    label="ใช้งานอยู่"
                    color="success"
                    size="small"
                    icon={<CheckIcon />}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      fontFamily: 'Sarabun, sans-serif'
                    }}
                  />
                )}

                <CardMedia
                  sx={{
                    height: 120,
                    bgcolor: 'grey.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                  }}
                >
                  <img
                    src={signature.imageUrl || `data:${signature.mimeType};base64,${signature.imageData}`}
                    alt={signature.fileName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </CardMedia>

                <CardContent sx={{ pb: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: 'Sarabun, sans-serif',
                      fontWeight: 'bold',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {signature.fileName}
                  </Typography>
                  
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      📏 {formatFileSize(signature.fileSize)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      🎨 {signature.mimeType.split('/')[1].toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 12 }} />
                      {formatDate(signature.createdAt)}
                    </Typography>
                  </Stack>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="ดูตัวอย่าง">
                      <IconButton
                        size="small"
                        onClick={() => setPreviewDialog({ open: true, signature })}
                      >
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="ลบลายเซ็น">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, signature })}
                        disabled={actionLoading === signature.id}
                      >
                        {actionLoading === signature.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {!signature.isActive && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ActiveIcon />}
                      onClick={() => handleSetActive(signature.id)}
                      disabled={actionLoading === signature.id}
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      ใช้งาน
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, signature: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตัวอย่างลายเซ็น
        </DialogTitle>
        <DialogContent>
          {previewDialog.signature && (
            <Box>
              <Box sx={{ textAlign: 'center', p: 2, mb: 2 }}>
                <img
                  src={previewDialog.signature.imageUrl || 
                    `data:${previewDialog.signature.mimeType};base64,${previewDialog.signature.imageData}`}
                  alt={previewDialog.signature.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                  ข้อมูลไฟล์
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ชื่อไฟล์:
                    </Typography>
                    <Typography variant="body1">
                      {previewDialog.signature.fileName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ขนาดไฟล์:
                    </Typography>
                    <Typography variant="body1">
                      {formatFileSize(previewDialog.signature.fileSize)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ประเภทไฟล์:
                    </Typography>
                    <Typography variant="body1">
                      {previewDialog.signature.mimeType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      สถานะ:
                    </Typography>
                    <Chip
                      label={previewDialog.signature.isActive ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}
                      color={previewDialog.signature.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewDialog({ open: false, signature: null })}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, signature: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ยืนยันการลบลายเซ็น
        </DialogTitle>
        <DialogContent>
          {deleteDialog.signature && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
                คุณแน่ใจหรือไม่ที่จะลบลายเซ็นนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
              </Alert>
              
              <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                ลายเซ็นที่จะลบ: <strong>{deleteDialog.signature.fileName}</strong>
              </Typography>

              {deleteDialog.signature.isActive && (
                <Alert severity="error" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  ลายเซ็นนี้กำลังใช้งานอยู่ กรุณาเลือกลายเซ็นอื่นเป็นหลักก่อนลบ
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, signature: null })}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={() => deleteDialog.signature && handleDelete(deleteDialog.signature)}
            color="error"
            variant="contained"
            disabled={deleteDialog.signature?.isActive || actionLoading === deleteDialog.signature?.id}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            {actionLoading === deleteDialog.signature?.id ? 'กำลังลบ...' : 'ลบลายเซ็น'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignatureManagement;