import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Draw as SignIcon,
  Cancel as CancelIcon,
  Visibility as PreviewIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon,
  Save as SaveIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DocumentToSign, Signature, SignaturePosition, SigningForm } from '../../types/signer';
import { useSignatures } from '../../hooks/useSigner';

interface DocumentSigningInterfaceProps {
  document: DocumentToSign;
  onSign: (signingData: SigningForm) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

interface DraggableSignature {
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
}

const DocumentSigningInterface: React.FC<DocumentSigningInterfaceProps> = ({
  document,
  onSign,
  onCancel,
  loading = false,
  error = null
}) => {
  const { signatures, getActiveSignature } = useSignatures();
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>('');
  const [signaturePosition, setSignaturePosition] = useState<DraggableSignature>({
    x: document.signaturePosition?.x || 50,
    y: document.signaturePosition?.y || 80,
    width: document.signaturePosition?.width || 200,
    height: document.signaturePosition?.height || 80,
    isDragging: false
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const activeSignature = getActiveSignature();

  // Initialize selected signature
  useEffect(() => {
    if (activeSignature && !selectedSignatureId) {
      setSelectedSignatureId(activeSignature.id);
    }
  }, [activeSignature, selectedSignatureId]);

  const selectedSignature = signatures.find(sig => sig.id === selectedSignatureId);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!signatureRef.current) return;
    
    const rect = signatureRef.current.getBoundingClientRect();
    const parentRect = certificateRef.current?.getBoundingClientRect();
    
    if (!parentRect) return;

    dragStartPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setSignaturePosition(prev => ({ ...prev, isDragging: true }));

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartPos.current || !parentRect) return;

      let newX = ((e.clientX - parentRect.left - dragStartPos.current.x) / parentRect.width) * 100;
      let newY = ((e.clientY - parentRect.top - dragStartPos.current.y) / parentRect.height) * 100;

      // Snap to grid if enabled
      if (snapToGrid) {
        newX = Math.round(newX / 5) * 5;
        newY = Math.round(newY / 5) * 5;
      }

      // Constrain within bounds
      newX = Math.max(0, Math.min(100 - (signaturePosition.width / parentRect.width) * 100, newX));
      newY = Math.max(0, Math.min(100 - (signaturePosition.height / parentRect.height) * 100, newY));

      setSignaturePosition(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    };

    const handleMouseUp = () => {
      setSignaturePosition(prev => ({ ...prev, isDragging: false }));
      dragStartPos.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [signaturePosition.width, signaturePosition.height, snapToGrid]);

  const handleSignatureResize = (dimension: 'width' | 'height', value: number) => {
    setSignaturePosition(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  const centerSignature = () => {
    setSignaturePosition(prev => ({
      ...prev,
      x: 50 - (prev.width / 2),
      y: 80 - (prev.height / 2)
    }));
  };

  const resetPosition = () => {
    setSignaturePosition({
      x: document.signaturePosition?.x || 50,
      y: document.signaturePosition?.y || 80,
      width: document.signaturePosition?.width || 200,
      height: document.signaturePosition?.height || 80,
      isDragging: false
    });
  };

  const generatePreview = async () => {
    if (!selectedSignature) return;

    setPreviewMode(true);
    try {
      // In a real implementation, this would call the API to generate a preview
      // For now, we'll simulate the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx && certificateRef.current) {
        const rect = certificateRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Draw certificate background
        const certImg = new Image();
        certImg.crossOrigin = 'anonymous';
        certImg.onload = () => {
          ctx.drawImage(certImg, 0, 0, canvas.width, canvas.height);
          
          // Draw signature
          const sigImg = new Image();
          sigImg.crossOrigin = 'anonymous';
          sigImg.onload = () => {
            const sigX = (signaturePosition.x / 100) * canvas.width;
            const sigY = (signaturePosition.y / 100) * canvas.height;
            const sigWidth = signaturePosition.width;
            const sigHeight = signaturePosition.height;
            
            ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight);
            setPreviewImage(canvas.toDataURL());
          };
          sigImg.src = selectedSignature.imageUrl || `data:${selectedSignature.mimeType};base64,${selectedSignature.imageData}`;
        };
        certImg.src = document.certificatePreview;
      }
    } catch (err) {
      console.error('Failed to generate preview:', err);
    } finally {
      setPreviewMode(false);
    }
  };

  const handleSign = async () => {
    if (!selectedSignature) return;

    const signingData: SigningForm = {
      documentId: document.id,
      signatureId: selectedSignature.id,
      position: {
        x: signaturePosition.x,
        y: signaturePosition.y,
        width: signaturePosition.width,
        height: signaturePosition.height
      }
    };

    const success = await onSign(signingData);
    if (success) {
      setConfirmDialogOpen(false);
    }
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
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
          ✍️ ลงนามเอกสาร
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={document.title}
            variant="outlined"
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          />
          <Chip
            label={getPriorityText(document.priority)}
            color={getPriorityColor(document.priority) as any}
          />
          <Chip
            label={`${document.recipients.length} คน`}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, fontFamily: 'Sarabun, sans-serif' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Certificate Preview */}
        <Grid item xs={12} lg={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                >
                  ตัวอย่างเกียรติบัตรพร้อมลายเซ็น
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
                  <Tooltip title="จัดกึ่งกลาง">
                    <IconButton onClick={centerSignature}>
                      <CenterIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="รีเซ็ตตำแหน่ง">
                    <IconButton onClick={resetPosition}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Certificate with Signature Overlay */}
              <Box
                sx={{
                  position: 'relative',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.50'
                }}
              >
                {/* Grid Overlay */}
                {showGrid && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                )}

                {/* Certificate Image */}
                <Box
                  ref={certificateRef}
                  sx={{
                    position: 'relative',
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.2s ease-in-out'
                  }}
                >
                  <img
                    src={document.certificatePreview}
                    alt="Certificate"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />

                  {/* Signature Overlay */}
                  {selectedSignature && (
                    <Box
                      ref={signatureRef}
                      onMouseDown={handleMouseDown}
                      sx={{
                        position: 'absolute',
                        left: `${signaturePosition.x}%`,
                        top: `${signaturePosition.y}%`,
                        width: `${signaturePosition.width}px`,
                        height: `${signaturePosition.height}px`,
                        cursor: signaturePosition.isDragging ? 'grabbing' : 'grab',
                        border: '2px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        '&:hover': {
                          borderColor: 'primary.dark',
                          bgcolor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    >
                      <img
                        src={selectedSignature.imageUrl || 
                          `data:${selectedSignature.mimeType};base64,${selectedSignature.imageData}`}
                        alt="Signature"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          pointerEvents: 'none'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                ลากลายเซ็นเพื่อปรับตำแหน่ง • ใช้เครื่องมือด้านขวาเพื่อปรับขนาด
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Controls */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Signature Selection */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  เลือกลายเซ็น
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>ลายเซ็น</InputLabel>
                  <Select
                    value={selectedSignatureId}
                    onChange={(e) => setSelectedSignatureId(e.target.value)}
                    label="ลายเซ็น"
                  >
                    {signatures.map((signature) => (
                      <MenuItem key={signature.id} value={signature.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img
                            src={signature.imageUrl || 
                              `data:${signature.mimeType};base64,${signature.imageData}`}
                            alt={signature.fileName}
                            style={{ width: 40, height: 20, objectFit: 'contain' }}
                          />
                          {signature.fileName}
                          {signature.isActive && (
                            <Chip label="หลัก" size="small" color="primary" />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedSignature && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📁 {selectedSignature.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📏 {(selectedSignature.fileSize / 1024).toFixed(1)} KB
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>

            {/* Position Controls */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  ปรับตำแหน่งและขนาด
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ความกว้าง: {signaturePosition.width}px
                    </Typography>
                    <Slider
                      value={signaturePosition.width}
                      onChange={(_, value) => handleSignatureResize('width', value as number)}
                      min={100}
                      max={400}
                      step={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ความสูง: {signaturePosition.height}px
                    </Typography>
                    <Slider
                      value={signaturePosition.height}
                      onChange={(_, value) => handleSignatureResize('height', value as number)}
                      min={40}
                      max={200}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                    }
                    label="แสดงเส้นตาราง"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={snapToGrid}
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                      />
                    }
                    label="จับตำแหน่งตามเส้นตาราง"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Preview and Actions */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  การดำเนินการ
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={generatePreview}
                    disabled={!selectedSignature || previewMode}
                    fullWidth
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  >
                    {previewMode ? 'กำลังสร้างตัวอย่าง...' : 'ดูตัวอย่างผลลัพธ์'}
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={16} /> : <SignIcon />}
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={!selectedSignature || loading}
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
                    {loading ? 'กำลังลงนาม...' : 'ลงนามเอกสาร'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={onCancel}
                    disabled={loading}
                    fullWidth
                    sx={{ fontFamily: 'Sarabun, sans-serif' }}
                  >
                    ยกเลิก
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Document Info */}
            <Card elevation={1}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
                >
                  ข้อมูลเอกสาร
                </Typography>
                
                <Stack spacing={1}>
                  <Typography variant="body2">
                    📋 {document.activityDetails.name}
                  </Typography>
                  <Typography variant="body2">
                    👥 {document.recipients.length} คน
                  </Typography>
                  <Typography variant="body2">
                    📅 {new Date(document.requestDate).toLocaleDateString('th-TH')}
                  </Typography>
                  <Typography variant="body2">
                    👤 ขอโดย: {document.requestedBy.first_name} {document.requestedBy.last_name}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตัวอย่างผลลัพธ์การลงนาม
        </DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img
                src={previewImage}
                alt="Signing preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewImage(null)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ยืนยันการลงนาม
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, fontFamily: 'Sarabun, sans-serif' }}>
            คุณกำลังจะลงนามเอกสารนี้ การดำเนินการนี้ไม่สามารถยกเลิกได้
          </Alert>
          
          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            <strong>เอกสาร:</strong> {document.title}
          </Typography>
          
          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            <strong>จำนวนผู้รับ:</strong> {document.recipients.length} คน
          </Typography>
          
          {selectedSignature && (
            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
              <strong>ลายเซ็นที่ใช้:</strong> {selectedSignature.fileName}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSign}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            {loading ? 'กำลังลงนาม...' : 'ยืนยันลงนาม'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentSigningInterface;