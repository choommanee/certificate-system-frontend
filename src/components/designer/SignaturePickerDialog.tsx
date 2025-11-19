import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { signatureService } from '../../services/api/signatureService';
import type { Signature } from '../../services/api/types';

interface SignaturePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (signature: Signature) => void;
  currentUserId?: string;
}

const SignaturePickerDialog: React.FC<SignaturePickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  currentUserId
}) => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);

  useEffect(() => {
    if (open) {
      loadSignatures();
    }
  }, [open]);

  const loadSignatures = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all active signatures for staff/teachers
      const response = await signatureService.getSignatures({
        isActive: true,
        limit: 100
      });

      if (response.success && response.data) {
        setSignatures(response.data.data || []);
      } else {
        throw new Error(response.message || 'Failed to load signatures');
      }
    } catch (err: any) {
      console.error('Error loading signatures:', err);
      setError(err.message || 'Failed to load signatures');
      setSignatures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedSignature) {
      onSelect(selectedSignature);
      onClose();
    }
  };

  const handleDelete = async (signatureId: string) => {
    if (!window.confirm('Are you sure you want to delete this signature?')) {
      return;
    }

    try {
      await signatureService.deleteSignature(signatureId);
      setSignatures(signatures.filter(sig => sig.id !== signatureId));
      if (selectedSignature?.id === signatureId) {
        setSelectedSignature(null);
      }
    } catch (err: any) {
      console.error('Error deleting signature:', err);
      alert('Failed to delete signature: ' + err.message);
    }
  };

  const filteredSignatures = signatures.filter(sig => {
    const searchLower = searchTerm.toLowerCase();
    const signerName = sig.signer
      ? `${sig.signer.first_name_th} ${sig.signer.last_name_th}`.toLowerCase()
      : '';
    const position = sig.position?.toLowerCase() || '';
    const department = sig.department?.toLowerCase() || '';

    return (
      signerName.includes(searchLower) ||
      position.includes(searchLower) ||
      department.includes(searchLower)
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">เลือกลายเซ็น</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="ค้นหาตามชื่อ, ตำแหน่ง, หน่วยงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSignatures.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'ไม่พบลายเซ็นที่ค้นหา' : 'ยังไม่มีลายเซ็นในระบบ'}
            </Typography>
          </Box>
        )}

        {/* Signatures Grid */}
        {!loading && !error && filteredSignatures.length > 0 && (
          <Grid container spacing={2}>
            {filteredSignatures.map((signature) => (
              <Grid item xs={12} sm={6} md={4} key={signature.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedSignature?.id === signature.id ? 2 : 1,
                    borderColor: selectedSignature?.id === signature.id ? 'primary.main' : 'divider',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 3,
                      borderColor: 'primary.light'
                    }
                  }}
                  onClick={() => setSelectedSignature(signature)}
                >
                  {/* Selection Indicator */}
                  {selectedSignature?.id === signature.id && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                    >
                      <CheckCircleIcon color="primary" />
                    </Box>
                  )}

                  {/* Default Badge */}
                  {signature.isDefault && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1
                      }}
                    >
                      <Chip label="Default" size="small" color="success" />
                    </Box>
                  )}

                  {/* Signature Image */}
                  <CardMedia
                    component="img"
                    height="120"
                    image={signature.signatureImageUrl}
                    alt={signature.position}
                    sx={{
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5',
                      p: 1
                    }}
                  />

                  <CardContent sx={{ pt: 1 }}>
                    {/* Signer Name */}
                    {signature.signer && (
                      <Typography variant="subtitle2" gutterBottom noWrap>
                        {signature.signer.first_name_th} {signature.signer.last_name_th}
                      </Typography>
                    )}

                    {/* Position */}
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {signature.position}
                    </Typography>

                    {/* Department */}
                    {signature.department && (
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {signature.department}
                      </Typography>
                    )}

                    {/* Actions */}
                    {currentUserId && signature.signerId === currentUserId && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(signature.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSelect}
          disabled={!selectedSignature}
        >
          Select Signature
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignaturePickerDialog;
