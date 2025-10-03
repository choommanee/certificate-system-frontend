import React, { useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface TemplateAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'logo' | 'background' | 'signature' | 'other';
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  width?: number;
  height?: number;
  usageCount: number;
}

interface TemplateAssetManagerProps {
  templateId?: string;
  onAssetSelect?: (asset: TemplateAsset) => void;
  onAssetDelete?: (assetId: string) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  selectionMode?: boolean;
}

const TemplateAssetManager: React.FC<TemplateAssetManagerProps> = ({
  templateId,
  onAssetSelect,
  onAssetDelete,
  allowUpload = true,
  allowDelete = true,
  selectionMode = false,
}) => {
  const [assets, setAssets] = useState<TemplateAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<TemplateAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<TemplateAsset | null>(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  // Load assets on mount
  React.useEffect(() => {
    loadAssets();
  }, [templateId]);

  // Filter assets when search or type filter changes
  React.useEffect(() => {
    filterAssets();
  }, [searchTerm, typeFilter, assets]);

  const loadAssets = async () => {
    try {
      // TODO: Replace with actual API call
      const mockAssets: TemplateAsset[] = [
        {
          id: '1',
          name: 'university-logo.png',
          url: '/assets/university-logo.png',
          type: 'logo',
          mimeType: 'image/png',
          size: 45000,
          uploadedAt: '2024-01-10T10:00:00Z',
          uploadedBy: 'Admin User',
          width: 500,
          height: 500,
          usageCount: 15,
        },
        {
          id: '2',
          name: 'certificate-background.jpg',
          url: '/assets/certificate-background.jpg',
          type: 'background',
          mimeType: 'image/jpeg',
          size: 250000,
          uploadedAt: '2024-01-11T14:30:00Z',
          uploadedBy: 'Staff User',
          width: 2480,
          height: 3508,
          usageCount: 8,
        },
        {
          id: '3',
          name: 'dean-signature.png',
          url: '/assets/dean-signature.png',
          type: 'signature',
          mimeType: 'image/png',
          size: 15000,
          uploadedAt: '2024-01-12T09:15:00Z',
          uploadedBy: 'Admin User',
          width: 600,
          height: 200,
          usageCount: 25,
        },
      ];

      setAssets(mockAssets);
      setFilteredAssets(mockAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const filterAssets = () => {
    let filtered = assets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((asset) => asset.type === typeFilter);
    }

    setFilteredAssets(filtered);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
    },
    multiple: true,
  });

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // TODO: Replace with actual API call
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Create mock asset
        const newAsset: TemplateAsset = {
          id: `asset-${Date.now()}-${i}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: 'image',
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Current User',
          usageCount: 0,
        };

        setAssets((prev) => [...prev, newAsset]);
      }

      setOpenUploadDialog(false);
    } catch (error) {
      console.error('Failed to upload assets:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAssetClick = (asset: TemplateAsset) => {
    if (selectionMode && onAssetSelect) {
      onAssetSelect(asset);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, asset: TemplateAsset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;

    try {
      // TODO: Replace with actual API call
      setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));

      if (onAssetDelete) {
        onAssetDelete(selectedAsset.id);
      }

      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleInsertAsset = () => {
    if (selectedAsset && onAssetSelect) {
      onAssetSelect(selectedAsset);
      handleMenuClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getAssetTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      image: 'primary',
      logo: 'secondary',
      background: 'info',
      signature: 'success',
      other: 'default',
    };
    return colorMap[type] || 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          🖼️ Asset Manager
        </Typography>
        {allowUpload && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Upload Asset
          </Button>
        )}
      </Box>

      {/* Search and Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          label="Type"
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="image">Image</MenuItem>
          <MenuItem value="logo">Logo</MenuItem>
          <MenuItem value="background">Background</MenuItem>
          <MenuItem value="signature">Signature</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
      </Stack>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No assets found. {allowUpload && 'Upload some assets to get started.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredAssets.map((asset) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: selectionMode ? 'pointer' : 'default',
                  '&:hover': selectionMode
                    ? {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s',
                      }
                    : {},
                }}
                onClick={() => handleAssetClick(asset)}
              >
                {/* Image Preview */}
                <Box
                  sx={{
                    height: 150,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {asset.mimeType.startsWith('image/') ? (
                    <CardMedia
                      component="img"
                      image={asset.url}
                      alt={asset.name}
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <FileIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ mb: 1 }}>
                    {asset.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={asset.type} size="small" color={getAssetTypeColor(asset.type)} />
                    <Chip label={formatFileSize(asset.size)} size="small" variant="outlined" />
                  </Box>
                  {asset.width && asset.height && (
                    <Typography variant="caption" color="text.secondary">
                      {asset.width} × {asset.height}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    Used {asset.usageCount} times
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(asset.uploadedAt).toLocaleDateString('th-TH')}
                  </Typography>
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, asset)}>
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectionMode && onAssetSelect && (
          <MenuItem onClick={handleInsertAsset}>
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            Insert Asset
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ImageIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        {allowDelete && (
          <MenuItem onClick={handleDeleteAsset} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Assets</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Dropzone */}
            <Box
              {...getRootProps()}
              sx={{
                border: 2,
                borderStyle: 'dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                Supported formats: PNG, JPG, JPEG, SVG, WebP
              </Typography>
            </Box>

            {/* Upload Progress */}
            {uploading && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            {/* Upload Guidelines */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Guidelines:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <Typography variant="caption">Maximum file size: 5MB</Typography>
                </li>
                <li>
                  <Typography variant="caption">Recommended: PNG with transparent background</Typography>
                </li>
                <li>
                  <Typography variant="caption">High resolution (300 DPI) for best quality</Typography>
                </li>
              </ul>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateAssetManager;
