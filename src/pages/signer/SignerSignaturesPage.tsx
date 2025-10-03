import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Add,
  Delete,
  CheckCircle,
  Upload,
  Visibility,
  Star,
  StarBorder,
  Image,
  CloudUpload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import { useSigner } from '../../hooks/useSigner';
import SignatureManagement from '../../components/signer/SignatureManagement';
import SignatureUpload from '../../components/signer/SignatureUpload';

const SignerSignaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { signatures, loading, refreshData } = useSigner();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<any>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    refreshData();
  };

  const handleSetActive = async (signatureId: string) => {
    try {
      // Implementation for setting active signature
      console.log('Setting active signature:', signatureId);
      refreshData();
    } catch (error) {
      console.error('Error setting active signature:', error);
    }
  };

  const handleDeleteSignature = async (signatureId: string) => {
    try {
      // Implementation for deleting signature
      console.log('Deleting signature:', signatureId);
      setDeleteDialogOpen(false);
      setSelectedSignature(null);
      refreshData();
    } catch (error) {
      console.error('Error deleting signature:', error);
    }
  };

  const handlePreviewSignature = (signature: any) => {
    setSelectedSignature(signature);
    setPreviewDialogOpen(true);
  };

  const handleDeleteClick = (signature: any) => {
    setSelectedSignature(signature);
    setDeleteDialogOpen(true);
  };

  return (
    <SignerDashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48
                }}
              >
                <Edit />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}
                >
                  จัดการลายเซ็น
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  อัปโหลดและจัดการลายเซ็นดิจิทัลของคุณ
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{ 
                fontFamily: 'Sarabun, sans-serif',
                borderRadius: 2,
                px: 3
              }}
            >
              เพิ่มลายเซ็นใหม่
            </Button>
          </Box>

          {/* Quick Info */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {signatures?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontFamily: 'Sarabun, sans-serif' }}>
                        ลายเซ็นทั้งหมด
                      </Typography>
                    </Box>
                    <Edit sx={{ color: 'primary.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {signatures?.filter(s => s.isActive).length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontFamily: 'Sarabun, sans-serif' }}>
                        ลายเซ็นที่ใช้งาน
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        PNG
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'info.main', fontFamily: 'Sarabun, sans-serif' }}>
                        รูปแบบที่รองรับ
                      </Typography>
                    </Box>
                    <Image sx={{ color: 'info.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        5MB
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'warning.main', fontFamily: 'Sarabun, sans-serif' }}>
                        ขนาดสูงสุด
                      </Typography>
                    </Box>
                    <CloudUpload sx={{ color: 'warning.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Signatures List */}
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Edit />
            ลายเซ็นของฉัน
          </Typography>

          {signatures && signatures.length > 0 ? (
            <Grid container spacing={3}>
              {signatures.map((signature) => (
                <Grid item xs={12} sm={6} md={4} key={signature.id}>
                  <Card 
                    sx={{ 
                      position: 'relative',
                      border: signature.isActive ? '2px solid' : '1px solid',
                      borderColor: signature.isActive ? 'success.main' : 'grey.300',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    {signature.isActive && (
                      <Chip
                        label="ใช้งานอยู่"
                        color="success"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          fontFamily: 'Sarabun, sans-serif'
                        }}
                      />
                    )}
                    
                    <CardContent>
                      <Box
                        sx={{
                          height: 120,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: '1px dashed',
                          borderColor: 'grey.300',
                          backgroundImage: signature.imageUrl ? `url(${signature.imageUrl})` : 'none',
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => handlePreviewSignature(signature)}
                      >
                        {!signature.imageUrl && (
                          <Typography variant="body2" color="text.secondary">
                            คลิกเพื่อดูตัวอย่าง
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: 'Sarabun, sans-serif',
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {signature.name || `ลายเซ็น ${signature.id}`}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ขนาด: {Math.round(signature.fileSize / 1024)} KB<br/>
                        อัปโหลดเมื่อ: {new Date(signature.createdAt).toLocaleDateString('th-TH')}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="ดูตัวอย่าง">
                            <IconButton
                              size="small"
                              onClick={() => handlePreviewSignature(signature)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {!signature.isActive && (
                            <Tooltip title="ตั้งเป็นลายเซ็นหลัก">
                              <IconButton
                                size="small"
                                onClick={() => handleSetActive(signature.id)}
                                sx={{ color: 'warning.main' }}
                              >
                                <StarBorder />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {signature.isActive && (
                            <Tooltip title="ลายเซ็นหลัก">
                              <IconButton
                                size="small"
                                disabled
                                sx={{ color: 'success.main' }}
                              >
                                <Star />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                        
                        <Tooltip title="ลบลายเซ็น">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(signature)}
                            sx={{ color: 'error.main' }}
                            disabled={signature.isActive}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert 
              severity="info" 
              sx={{ 
                fontFamily: 'Sarabun, sans-serif',
                textAlign: 'center',
                py: 4
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                ยังไม่มีลายเซ็น
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                เริ่มต้นด้วยการอัปโหลดลายเซ็นดิจิทัลของคุณ
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                เพิ่มลายเซ็นแรก
              </Button>
            </Alert>
          )}
        </Paper>

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            อัปโหลดลายเซ็นใหม่
          </DialogTitle>
          <DialogContent>
            <SignatureUpload
              onUploadSuccess={handleUploadSuccess}
              onCancel={() => setUploadDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            ตัวอย่างลายเซ็น
          </DialogTitle>
          <DialogContent>
            {selectedSignature && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    height: 200,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    backgroundImage: selectedSignature.imageUrl ? `url(${selectedSignature.imageUrl})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
                <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}>
                  {selectedSignature.name || `ลายเซ็น ${selectedSignature.id}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ขนาดไฟล์: {Math.round(selectedSignature.fileSize / 1024)} KB<br/>
                  รูปแบบ: {selectedSignature.mimeType}<br/>
                  สถานะ: {selectedSignature.isActive ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>
              ปิด
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            ยืนยันการลบลายเซ็น
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              คุณแน่ใจหรือไม่ที่จะลบลายเซ็นนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={() => selectedSignature && handleDeleteSignature(selectedSignature.id)}
              color="error"
              variant="contained"
            >
              ลบ
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add signature"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => setUploadDialogOpen(true)}
        >
          <Add />
        </Fab>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerSignaturesPage;