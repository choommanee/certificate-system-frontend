// Image Upload Dialog Component
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Tab,
  Tabs,
  Paper,
  Grid,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  open,
  onClose,
  onImageSelect
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample stock images for demo
  const stockImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=300&fit=crop'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setIsLoading(true);
        setError(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onImageSelect(result);
            onClose();
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setIsLoading(true);
      setError(null);
      
      // Test if URL is valid by creating an image
      const img = new Image();
      img.onload = () => {
        onImageSelect(imageUrl.trim());
        onClose();
        setIsLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load image from URL. Please check the URL and try again.');
        setIsLoading(false);
      };
      img.src = imageUrl.trim();
    }
  };

  const handleStockImageSelect = (url: string) => {
    onImageSelect(url);
    onClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon />
            <Typography variant="h6">Add Image</Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Upload File" />
          <Tab label="From URL" />
          <Tab label="Stock Images" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Upload Tab */}
        {activeTab === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Paper
              sx={{
                p: 4,
                border: '2px dashed #ccc',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f0f0f0'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click to upload image
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports: JPG, PNG, GIF, WebP
              </Typography>
            </Paper>
          </Box>
        )}

        {/* URL Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 2 }}>
            <TextField
              fullWidth
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              InputProps={{
                startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Enter a direct link to an image file. Make sure the URL is publicly accessible.
            </Typography>
          </Box>
        )}

        {/* Stock Images Tab */}
        {activeTab === 2 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click on any image to add it to your certificate:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              {stockImages.map((url, index) => (
                <Paper
                  key={index}
                  sx={{
                    aspectRatio: '4/3',
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                  onClick={() => handleStockImageSelect(url)}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {activeTab === 1 && (
          <Button
            onClick={handleUrlSubmit}
            variant="contained"
            disabled={!imageUrl.trim() || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {isLoading ? 'Loading...' : 'Add Image'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
