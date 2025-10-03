import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  CloudUpload,
  Folder,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  VideoFile,
  AudioFile,
  Archive,
  MoreVert,
  Download,
  Delete,
  Edit,
  Share,
  Visibility,
  FolderOpen,
  Add,
  Search,
  GridView,
  ViewList,
  Sort,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  tags: string[];
  thumbnail?: string;
  path: string;
  parentId?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    fileId: string;
  } | null>(null);

  // Mock data
  React.useEffect(() => {
    const mockFiles: FileItem[] = [
      {
        id: '1',
        name: 'Templates',
        type: 'folder',
        createdAt: '2024-01-10T10:00:00Z',
        modifiedAt: '2024-01-15T14:30:00Z',
        createdBy: 'Admin',
        tags: ['templates'],
        path: '/Templates',
      },
      {
        id: '2',
        name: 'Certificates',
        type: 'folder',
        createdAt: '2024-01-12T09:00:00Z',
        modifiedAt: '2024-01-16T11:20:00Z',
        createdBy: 'Admin',
        tags: ['certificates'],
        path: '/Certificates',
      },
      {
        id: '3',
        name: 'company-logo.png',
        type: 'file',
        size: 245760,
        mimeType: 'image/png',
        createdAt: '2024-01-14T15:30:00Z',
        modifiedAt: '2024-01-14T15:30:00Z',
        createdBy: 'John Doe',
        tags: ['logo', 'branding'],
        path: '/company-logo.png',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+',
      },
      {
        id: '4',
        name: 'certificate-template.pdf',
        type: 'file',
        size: 1024000,
        mimeType: 'application/pdf',
        createdAt: '2024-01-13T11:15:00Z',
        modifiedAt: '2024-01-13T11:15:00Z',
        createdBy: 'Jane Smith',
        tags: ['template', 'pdf'],
        path: '/certificate-template.pdf',
      },
      {
        id: '5',
        name: 'background-pattern.jpg',
        type: 'file',
        size: 512000,
        mimeType: 'image/jpeg',
        createdAt: '2024-01-11T16:45:00Z',
        modifiedAt: '2024-01-11T16:45:00Z',
        createdBy: 'Bob Johnson',
        tags: ['background', 'design'],
        path: '/background-pattern.jpg',
      },
    ];
    setFiles(mockFiles);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    
    setUploadProgress(newUploads);
    setShowUploadDialog(true);

    // Simulate upload progress
    newUploads.forEach((upload, index) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map((item, i) => {
            if (i === index && item.progress < 100) {
              const newProgress = Math.min(item.progress + Math.random() * 30, 100);
              return {
                ...item,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' : 'uploading',
              };
            }
            return item;
          })
        );
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        // Add file to the file list
        const newFile: FileItem = {
          id: Date.now().toString() + index,
          name: upload.file.name,
          type: 'file',
          size: upload.file.size,
          mimeType: upload.file.type,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          createdBy: 'Current User',
          tags: [],
          path: `${currentPath}${upload.file.name}`,
        };
        setFiles(prev => [...prev, newFile]);
      }, 3000);
    });
  }, [currentPath]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder sx={{ fontSize: 48, color: 'primary.main' }} />;
    }

    const mimeType = file.mimeType || '';
    if (mimeType.startsWith('image/')) {
      return <Image sx={{ fontSize: 48, color: 'success.main' }} />;
    } else if (mimeType === 'application/pdf') {
      return <PictureAsPdf sx={{ fontSize: 48, color: 'error.main' }} />;
    } else if (mimeType.startsWith('video/')) {
      return <VideoFile sx={{ fontSize: 48, color: 'info.main' }} />;
    } else if (mimeType.startsWith('audio/')) {
      return <AudioFile sx={{ fontSize: 48, color: 'warning.main' }} />;
    } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <Archive sx={{ fontSize: 48, color: 'secondary.main' }} />;
    } else {
      return <InsertDriveFile sx={{ fontSize: 48, color: 'text.secondary' }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path + '/');
    } else {
      // Handle file preview/download
      console.log('Opening file:', file.name);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, fileId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      fileId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: newFolderName,
        type: 'folder',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        createdBy: 'Current User',
        tags: [],
        path: `${currentPath}${newFolderName}`,
      };
      setFiles(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    handleCloseContextMenu();
  };

  const pathSegments = currentPath.split('/').filter(Boolean);

  const sortedFiles = [...files].sort((a, b) => {
    // Folders first
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }

    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
      case 'size':
        return (b.size || 0) - (a.size || 0);
      default:
        return 0;
    }
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          จัดการไฟล์
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Add />}
            onClick={() => setShowNewFolderDialog(true)}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            {...getRootProps()}
          >
            Upload Files
          </Button>
          <input {...getInputProps()} />
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Breadcrumbs>
            <Link
              component="button"
              variant="body2"
              onClick={() => setCurrentPath('/')}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <FolderOpen sx={{ mr: 0.5, fontSize: 16 }} />
              Root
            </Link>
            {pathSegments.map((segment, index) => (
              <Link
                key={index}
                component="button"
                variant="body2"
                onClick={() => setCurrentPath('/' + pathSegments.slice(0, index + 1).join('/') + '/')}
              >
                {segment}
              </Link>
            ))}
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <ViewList /> : <GridView />}
            </IconButton>
            <IconButton size="small">
              <Sort />
            </IconButton>
            <IconButton size="small">
              <Search />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Drop Zone */}
      {isDragActive && (
        <Paper
          sx={{
            p: 4,
            mb: 3,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          }}
        >
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="primary.main">
            Drop files here to upload
          </Typography>
        </Paper>
      )}

      {/* File Grid/List */}
      {viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {sortedFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { elevation: 4 },
                  ...(selectedFiles.includes(file.id) && {
                    bgcolor: 'primary.50',
                    borderColor: 'primary.main',
                  }),
                }}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  {file.thumbnail ? (
                    <CardMedia
                      component="img"
                      height="80"
                      image={file.thumbnail}
                      alt={file.name}
                      sx={{ objectFit: 'contain', mb: 1 }}
                    />
                  ) : (
                    <Box sx={{ mb: 1 }}>
                      {getFileIcon(file)}
                    </Box>
                  )}
                  <Typography variant="body2" noWrap title={file.name}>
                    {file.name}
                  </Typography>
                  {file.size && (
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    {file.tags.slice(0, 2).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <List>
            {sortedFiles.map((file, index) => (
              <React.Fragment key={file.id}>
                <ListItem
                  button
                  onClick={() => handleFileClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  selected={selectedFiles.includes(file.id)}
                >
                  <ListItemIcon>
                    {getFileIcon(file)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Modified: {formatDate(file.modifiedAt)} by {file.createdBy}
                        </Typography>
                        {file.size && (
                          <Typography variant="caption" display="block">
                            Size: {formatFileSize(file.size)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={(e) => handleContextMenu(e, file.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < sortedFiles.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {files.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderOpen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            This folder is empty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload files or create folders to get started
          </Typography>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon><Visibility /></ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon><Download /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon><Share /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => contextMenu && handleDeleteFile(contextMenu.fileId)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Upload Progress Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Progress</DialogTitle>
        <DialogContent>
          <List>
            {uploadProgress.map((upload, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={upload.file.name}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={upload.progress}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption">
                        {upload.status === 'completed' ? 'Completed' : `${Math.round(upload.progress)}%`}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog
        open={showNewFolderDialog}
        onClose={() => setShowNewFolderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManager;