import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,

  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Fab,
  Tooltip,
  Alert,
  Skeleton,
  Badge,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Visibility as PreviewIcon,
  CheckCircle as ActiveIcon,
  RadioButtonUnchecked as InactiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Category as CategoryIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Description as TemplateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { templateDesignerService, Template } from '../services/templateDesignerService';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onPreview: (template: Template) => void;
  onToggleActive: (template: Template) => void;
  onSetDefault: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  onToggleActive,
  onSetDefault,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Generate thumbnail from template design
  useEffect(() => {
    if (template.design) {
      // Create a simple SVG thumbnail based on template design
      const svg = `
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" fill="${template.design.background_color || '#ffffff'}" stroke="#e0e0e0" stroke-width="1"/>
          ${template.design.elements.slice(0, 3).map((element, index) => {
            if (element.type === 'text') {
              return `<text x="${(element.position?.x || 0) * 0.25}" y="${(element.position?.y || 20) * 0.25 + 15}" 
                      font-family="${element.style?.font_family || 'Arial'}" 
                      font-size="${Math.min((element.style?.font_size || 16) * 0.25, 12)}" 
                      fill="${element.style?.color || '#000000'}">${element.content.substring(0, 20)}</text>`;
            } else if (element.type === 'shape') {
              return `<rect x="${(element.position?.x || 0) * 0.25}" y="${(element.position?.y || 0) * 0.25}" 
                      width="${(element.size?.width || 50) * 0.25}" height="${(element.size?.height || 50) * 0.25}" 
                      fill="${element.style?.background_color || '#cccccc'}"/>`;
            }
            return '';
          }).join('')}
          <text x="10" y="140" font-family="Arial" font-size="10" fill="#666">Template Preview</text>
        </svg>
      `;
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      setThumbnailUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [template.design]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        },
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Status Badges */}
      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
        {template.is_default && (
          <Chip
            icon={<StarIcon />}
            label="ค่าเริ่มต้น"
            size="small"
            color="warning"
            sx={{ mb: 0.5, fontSize: '0.7rem' }}
          />
        )}
        {template.is_active ? (
          <Chip
            icon={<ActiveIcon />}
            label="ใช้งาน"
            size="small"
            color="success"
            sx={{ fontSize: '0.7rem' }}
          />
        ) : (
          <Chip
            icon={<InactiveIcon />}
            label="ไม่ใช้งาน"
            size="small"
            color="default"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>

      {/* Menu Button */}
      <IconButton
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        onClick={handleMenuClick}
      >
        <MoreVertIcon />
      </IconButton>

      {/* Thumbnail */}
      <Box
        sx={{
          height: 200,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={template.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '16px',
            }}
          />
        ) : (
          <TemplateIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.3)' }} />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {template.name}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CategoryIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Chip
            label={template.category}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DateIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            สร้างเมื่อ {formatDate(template.created_at)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            โดย {template.created_by}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<PreviewIcon />}
          onClick={() => onPreview(template)}
        >
          ดูตัวอย่าง
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => onEdit(template)}
        >
          แก้ไข
        </Button>
      </CardActions>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onEdit(template); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} /> แก้ไข
        </MenuItem>
        <MenuItem onClick={() => { onDuplicate(template); handleMenuClose(); }}>
          <DuplicateIcon sx={{ mr: 1 }} /> ทำสำเนา
        </MenuItem>
        <MenuItem onClick={() => { onPreview(template); handleMenuClose(); }}>
          <PreviewIcon sx={{ mr: 1 }} /> ดูตัวอย่าง
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onToggleActive(template); handleMenuClose(); }}>
          {template.is_active ? (
            <>
              <InactiveIcon sx={{ mr: 1 }} /> ปิดใช้งาน
            </>
          ) : (
            <>
              <ActiveIcon sx={{ mr: 1 }} /> เปิดใช้งาน
            </>
          )}
        </MenuItem>
        {!template.is_default && (
          <MenuItem onClick={() => { onSetDefault(template); handleMenuClose(); }}>
            <StarIcon sx={{ mr: 1 }} /> ตั้งเป็นค่าเริ่มต้น
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          onClick={() => { onDelete(template); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> ลบ
        </MenuItem>
      </Menu>
    </Card>
  );
};

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; template: Template | null }>({
    open: false,
    template: null,
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateDesignerService.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await templateDesignerService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleEdit = (template: Template) => {
    navigate(`/designer?template=${template.id}`);
  };

  const handleDelete = (template: Template) => {
    setDeleteDialog({ open: true, template });
  };

  const confirmDelete = async () => {
    if (deleteDialog.template) {
      try {
        await templateDesignerService.deleteTemplate(deleteDialog.template.id);
        setTemplates(templates.filter(t => t.id !== deleteDialog.template!.id));
        setDeleteDialog({ open: false, template: null });
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const newTemplate = await templateDesignerService.duplicateTemplate(
        template.id,
        `${template.name} (สำเนา)`
      );
      setTemplates([newTemplate, ...templates]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePreview = async (template: Template) => {
    try {
      const blob = await templateDesignerService.previewTemplate(template.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (template: Template) => {
    try {
      if (template.is_active) {
        await templateDesignerService.deactivateTemplate(template.id);
      } else {
        await templateDesignerService.activateTemplate(template.id);
      }
      loadTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (template: Template) => {
    try {
      await templateDesignerService.setAsDefault(template.id);
      loadTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateNew = () => {
    navigate('/designer');
  };

  // Ensure templates is always an array and add comprehensive checks
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const filteredTemplates = selectedCategory === 'all' 
    ? safeTemplates 
    : safeTemplates.filter(t => t && t.category === selectedCategory);

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          จัดการเทมเพลต
        </Typography>
        <Typography variant="body1" color="text.secondary">
          สร้าง แก้ไข และจัดการเทมเพลตเกียรติบัตรของคุณ
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>หมวดหมู่</InputLabel>
          <Select
            value={selectedCategory}
            label="หมวดหมู่"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredTemplates.length} เทมเพลต
          </Typography>
          <Tooltip title="สร้างเทมเพลตใหม่">
            <Fab
              color="primary"
              size="medium"
              onClick={handleCreateNew}
              sx={{ ml: 2 }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>

      {/* Templates Grid */}
      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Card key={index} sx={{ height: 400 }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={32} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : filteredTemplates.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <TemplateIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            ไม่พบเทมเพลต
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {selectedCategory === 'all' 
              ? 'ยังไม่มีเทมเพลตในระบบ เริ่มสร้างเทมเพลตแรกของคุณ'
              : `ไม่พบเทมเพลตในหมวดหมู่ "${selectedCategory}"`
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            สร้างเทมเพลตใหม่
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onPreview={handlePreview}
              onToggleActive={handleToggleActive}
              onSetDefault={handleSetDefault}
            />
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, template: null })}
      >
        <DialogTitle>ยืนยันการลบเทมเพลต</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่จะลบเทมเพลต "{deleteDialog.template?.name}"?
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, template: null })}>
            ยกเลิก
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default TemplatesPage;
