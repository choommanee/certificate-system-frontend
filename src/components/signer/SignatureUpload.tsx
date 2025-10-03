import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Signature } from '../../types/signer';

interface SignatureUploadProps {
  onUpload: (file: File, name?: string) => Promise<Signature | null>;
  uploading?: boolean;
  error?: string | null;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
}

interface FilePreview {
  file: File;
  preview: string;
  name: string;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({
  onUpload,
  uploading = false,
  error = null,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
}) => {
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `ไฟล์ประเภทไม่ถูกต้อง กรุณาเลือกไฟล์ ${acceptedFormats.map(format => 
        format.split('/')[1].toUpperCase()).join(', ')}`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      return `ไฟล์มีขนาดใหญ่เกินไป ขนาดสูงสุด ${maxSizeMB}MB`;
    }

    return null;
  }, [acceptedFormats, maxFileSize]);

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const validationResult = validateFile(file);
    
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setValidationError(null);
    
    try {
      const preview = await createPreview(file);
      setFilePreview({
        file,
        preview,
        name: file.name.split('.')[0] // Remove extension for default name
      });
      setSignatureName(file.name.split('.')[0]);
    } catch (err) {
      setValidationError('ไม่สามารถแสดงตัวอย่างไฟล์ได้');
    }
  }, [validateFile, createPreview]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileSelect(acceptedFiles);
  }, [handleFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats.map(format => `.${format.split('/')[1]}`)
    },
    multiple: false,
    maxSize: maxFileSize
  });

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileSelect(files);
  };

  const handleUpload = async () => {
    if (!filePreview) return;

    const result = await onUpload(filePreview.file, signatureName.trim() || undefined);
    if (result) {
      // Clear preview after successful upload
      setFilePreview(null);
      setSignatureName('');
      setValidationError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearPreview = () => {
    setFilePreview(null);
    setSignatureName('');
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Upload Area */}
      {!filePreview && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h6" sx={{ mb: 1, fontFamily: 'Sarabun, sans-serif' }}>
            {isDragActive ? 'วางไฟล์ลายเซ็นที่นี่' : 'อัปโหลดลายเซ็น'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
            ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            {acceptedFormats.map(format => (
              <Chip
                key={format}
                label={format.split('/')[1].toUpperCase()}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            ขนาดไฟล์สูงสุด: {formatFileSize(maxFileSize)}
          </Typography>
        </Paper>
      )}

      {/* File Preview */}
      {filePreview && (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                ตัวอย่างลายเซ็น
              </Typography>
              <IconButton onClick={handleClearPreview} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: 'grey.50'
                  }}
                >
                  <img
                    src={filePreview.preview}
                    alt="Signature preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                  <IconButton
                    onClick={() => setPreviewDialogOpen(true)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                    size="small"
                  >
                    <PreviewIcon />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="ชื่อลายเซ็น"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="ระบุชื่อลายเซ็น (ไม่บังคับ)"
                    fullWidth
                    size="small"
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ข้อมูลไฟล์:
                    </Typography>
                    <Typography variant="caption" display="block">
                      📁 {filePreview.file.name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      📏 {formatFileSize(filePreview.file.size)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      🎨 {filePreview.file.type}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={16} /> : <CheckIcon />}
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      {uploading ? 'กำลังอัปโหลด...' : 'บันทึกลายเซ็น'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleClearPreview}
                      disabled={uploading}
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    >
                      ยกเลิก
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {(validationError || error) && (
        <Alert severity="error" sx={{ mt: 2, fontFamily: 'Sarabun, sans-serif' }}>
          {validationError || error}
        </Alert>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตัวอย่างลายเซ็น
        </DialogTitle>
        <DialogContent>
          {filePreview && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img
                src={filePreview.preview}
                alt="Signature preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
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
    </Box>
  );
};

export default SignatureUpload;