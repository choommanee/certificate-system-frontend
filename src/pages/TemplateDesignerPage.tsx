import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Save,
  Preview,
  Delete,
  Edit,
  TextFields,
  Image,
  QrCode,
  Category,
  Palette,
  Settings,
  ExpandMore,
  Visibility,
  Download,
  Upload,
  ContentCopy,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { templateDesignerService } from '../services/templateDesignerService';
import { 
  TemplateInfo, 
  TemplateElement, 
  CreateTemplateRequest, 
  TemplateValidationResult 
} from '../types';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const TemplateDesignerPage: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateInfo | null>(null);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // UI State
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);
  
  // Template properties
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('academic');
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (currentTemplate?.design) {
      setElements(currentTemplate.design.elements);
      setCanvasBackground(currentTemplate.design.background_color);
      setTemplateName(currentTemplate.name);
      setTemplateDescription(currentTemplate.description);
      setTemplateCategory(currentTemplate.category);
    }
  }, [currentTemplate]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateDesignerService.getTemplates();
      setTemplates(response);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('ไม่สามารถโหลดรายการเทมเพลตได้');
    } finally {
      setLoading(false);
    }
  };

  const createNewTemplate = () => {
    setCurrentTemplate(null);
    setElements([]);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('academic');
    setCanvasBackground('#ffffff');
    setSelectedElement(null);
  };

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const template = await templateDesignerService.getTemplateDesign(templateId);
      setCurrentTemplate(template);
    } catch (err) {
      console.error('Failed to load template:', err);
      setError('ไม่สามารถโหลดเทมเพลตได้');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError('กรุณาใส่ชื่อเทมเพลต');
      return;
    }

    try {
      setLoading(true);
      const templateData: CreateTemplateRequest = {
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        design: {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          background_color: canvasBackground,
          elements: elements.map(({ id, ...element }) => element)
        }
      };

      if (currentTemplate) {
        await templateDesignerService.updateTemplateDesign(currentTemplate.id, templateData.design);
        setSuccess('บันทึกเทมเพลตเรียบร้อยแล้ว');
      } else {
        const newTemplate = await templateDesignerService.createTemplate(templateData);
        setCurrentTemplate(newTemplate);
        setSuccess('สร้างเทมเพลตใหม่เรียบร้อยแล้ว');
      }
      
      await fetchTemplates();
      setSaveDialog(false);
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('ไม่สามารถบันทึกเทมเพลตได้');
    } finally {
      setLoading(false);
    }
  };

  const addElement = (type: 'text' | 'image' | 'shape' | 'qr_code') => {
    const newElement: TemplateElement = {
      id: `element_${Date.now()}`,
      type,
      content: type === 'text' ? 'ข้อความตัวอย่าง' : '',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      style: {
        font_family: 'Sarabun',
        font_size: 16,
        color: '#000000',
        font_weight: 'normal',
        text_align: 'left',
      },
      z_index: elements.length,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (elementId: string, updates: Partial<TemplateElement>) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
    
    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (element: TemplateElement) => {
    const newElement: TemplateElement = {
      ...element,
      id: `element_${Date.now()}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    setElements([...elements, newElement]);
  };

  const validateTemplate = async () => {
    if (!currentTemplate) return;
    
    try {
      const validation = await templateDesignerService.validateTemplate(currentTemplate.id);
      if (validation.is_valid) {
        setSuccess('เทมเพลตถูกต้องและพร้อมใช้งาน');
      } else {
        setError(`เทมเพลตมีข้อผิดพลาด: ${validation.errors.join(', ')}`);
      }
    } catch (err) {
      setError('ไม่สามารถตรวจสอบเทมเพลตได้');
    }
  };

  const previewTemplate = async () => {
    if (!currentTemplate) return;
    
    try {
      const previewData = {
        recipient_name: 'นายตัวอย่าง ทดสอบ',
        course_name: 'หลักสูตรตัวอย่าง',
        date: new Date().toLocaleDateString('th-TH')
      };
      
      const preview = await templateDesignerService.previewTemplate(currentTemplate.id, previewData);
      // Handle preview display
      setPreviewDialog(true);
    } catch (err) {
      setError('ไม่สามารถแสดงตัวอย่างได้');
    }
  };

  const renderElementList = () => (
    <List>
      <ListItem>
        <Typography variant="h6">เครื่องมือ</Typography>
      </ListItem>
      <Divider />
      
      <ListItemButton onClick={() => addElement('text')}>
        <ListItemIcon><TextFields /></ListItemIcon>
        <ListItemText primary="ข้อความ" />
      </ListItemButton>
      
      <ListItemButton onClick={() => addElement('image')}>
        <ListItemIcon><Image /></ListItemIcon>
        <ListItemText primary="รูปภาพ" />
      </ListItemButton>
      
      <ListItemButton onClick={() => addElement('shape')}>
        <ListItemIcon><Category /></ListItemIcon>
        <ListItemText primary="รูปทรง" />
      </ListItemButton>
      
      <ListItemButton onClick={() => addElement('qr_code')}>
        <ListItemIcon><QrCode /></ListItemIcon>
        <ListItemText primary="QR Code" />
      </ListItemButton>
      
      <Divider />
      
      <ListItem>
        <Typography variant="h6">องค์ประกอบ</Typography>
      </ListItem>
      
      {elements.map((element, index) => (
        <ListItem 
          key={element.id}
          button
          selected={selectedElement?.id === element.id}
          onClick={() => setSelectedElement(element)}
        >
          <ListItemIcon>
            {element.type === 'text' && <TextFields />}
            {element.type === 'image' && <Image />}
            {element.type === 'shape' && <Shapes />}
            {element.type === 'qr_code' && <QrCode />}
          </ListItemIcon>
          <ListItemText 
            primary={`${element.type} ${index + 1}`}
            secondary={element.content.substring(0, 20)}
          />
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              duplicateElement(element);
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(element.id);
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );

  const renderElementProperties = () => {
    if (!selectedElement) {
      return (
        <Box p={2}>
          <Typography variant="h6" gutterBottom>คุณสมบัติ</Typography>
          <Typography color="text.secondary">
            เลือกองค์ประกอบเพื่อแก้ไขคุณสมบัติ
          </Typography>
        </Box>
      );
    }

    return (
      <Box p={2}>
        <Typography variant="h6" gutterBottom>คุณสมบัติ</Typography>
        
        {/* Content */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>เนื้อหา</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              label="เนื้อหา"
              value={selectedElement.content}
              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
              margin="normal"
              multiline={selectedElement.type === 'text'}
              rows={selectedElement.type === 'text' ? 3 : 1}
            />
          </AccordionDetails>
        </Accordion>

        {/* Position & Size */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>ตำแหน่งและขนาด</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="X"
                type="number"
                value={selectedElement.position.x}
                onChange={(e) => updateElement(selectedElement.id, {
                  position: { ...selectedElement.position, x: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="Y"
                type="number"
                value={selectedElement.position.y}
                onChange={(e) => updateElement(selectedElement.id, {
                  position: { ...selectedElement.position, y: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="ความกว้าง"
                type="number"
                value={selectedElement.size.width}
                onChange={(e) => updateElement(selectedElement.id, {
                  size: { ...selectedElement.size, width: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="ความสูง"
                type="number"
                value={selectedElement.size.height}
                onChange={(e) => updateElement(selectedElement.id, {
                  size: { ...selectedElement.size, height: Number(e.target.value) }
                })}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Text Style */}
        {selectedElement.type === 'text' && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>รูปแบบข้อความ</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>แบบอักษร</InputLabel>
                  <Select
                    value={selectedElement.style.font_family || 'Sarabun'}
                    onChange={(e) => updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, font_family: e.target.value }
                    })}
                  >
                    <MenuItem value="Sarabun">Sarabun</MenuItem>
                    <MenuItem value="Inter">Inter</MenuItem>
                    <MenuItem value="Arial">Arial</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="ขนาดตัวอักษร"
                    type="number"
                    value={selectedElement.style.font_size || 16}
                    onChange={(e) => updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, font_size: Number(e.target.value) }
                    })}
                  />
                  <TextField
                    fullWidth
                    label="สี"
                    type="color"
                    value={selectedElement.style.color || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, {
                      style: { ...selectedElement.style, color: e.target.value }
                    })}
                  />
                  <FormControl fullWidth>
                    <InputLabel>น้ำหนัก</InputLabel>
                    <Select
                      value={selectedElement.style.font_weight || 'normal'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, font_weight: e.target.value as 'normal' | 'bold' }
                      })}
                    >
                      <MenuItem value="normal">ปกติ</MenuItem>
                      <MenuItem value="bold">หนา</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>การจัดตำแหน่ง</InputLabel>
                    <Select
                      value={selectedElement.style.text_align || 'left'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, text_align: e.target.value as 'left' | 'center' | 'right' }
                      })}
                    >
                      <MenuItem value="left">ซ้าย</MenuItem>
                      <MenuItem value="center">กลาง</MenuItem>
                      <MenuItem value="right">ขวา</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    );
  };

  const renderCanvas = () => (
    <Box 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        overflow: 'auto'
      }}
    >
      {/* Canvas Toolbar */}
      <Paper sx={{ p: 1, mb: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => setSaveDialog(true)}
          disabled={loading}
        >
          บันทึก
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Preview />}
          onClick={previewTemplate}
          disabled={!currentTemplate}
        >
          ดูตัวอย่าง
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={validateTemplate}
          disabled={!currentTemplate}
        >
          ตรวจสอบ
        </Button>
        
        <Divider orientation="vertical" flexItem />
        
        <Typography variant="body2">ซูม:</Typography>
        <Slider
          value={zoom}
          onChange={(_, value) => setZoom(value as number)}
          min={0.5}
          max={2}
          step={0.1}
          sx={{ width: 100 }}
        />
        <Typography variant="body2">{Math.round(zoom * 100)}%</Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
          }
          label="แสดงเส้นตาราง"
        />
      </Paper>

      {/* Canvas */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            width: CANVAS_WIDTH * zoom,
            height: CANVAS_HEIGHT * zoom,
            bgcolor: canvasBackground,
            position: 'relative',
            border: '1px solid #ccc',
            backgroundImage: showGrid ? 
              `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)` : 'none',
            backgroundSize: showGrid ? `${20 * zoom}px ${20 * zoom}px` : 'auto',
          }}
        >
          {elements.map((element) => (
            <Box
              key={element.id}
              onClick={() => setSelectedElement(element)}
              sx={{
                position: 'absolute',
                left: element.position.x * zoom,
                top: element.position.y * zoom,
                width: element.size.width * zoom,
                height: element.size.height * zoom,
                border: selectedElement?.id === element.id ? '2px solid #1976d2' : '1px dashed rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: element.style.text_align === 'center' ? 'center' : 
                               element.style.text_align === 'right' ? 'flex-end' : 'flex-start',
                fontSize: (element.style.font_size || 16) * zoom,
                fontFamily: element.style.font_family || 'Sarabun',
                fontWeight: element.style.font_weight || 'normal',
                color: element.style.color || '#000000',
                backgroundColor: element.type === 'shape' ? element.style.background_color : 'transparent',
                padding: element.type === 'text' ? '4px' : 0,
                overflow: 'hidden',
                wordBreak: 'break-word',
              }}
            >
              {element.type === 'text' && element.content}
              {element.type === 'image' && (
                <Box sx={{ width: '100%', height: '100%', bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image sx={{ fontSize: 24 }} />
                </Box>
              )}
              {element.type === 'qr_code' && (
                <Box sx={{ width: '100%', height: '100%', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              )}
              {element.type === 'shape' && (
                <Box sx={{ width: '100%', height: '100%', bgcolor: element.style.background_color || '#e0e0e0' }} />
              )}
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );

  return (
    <DashboardLayout>
      <Box display="flex" height="calc(100vh - 64px)">
        {/* Left Sidebar - Templates & Tools */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              position: 'relative',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Template Designer</Typography>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<Add />}
              onClick={createNewTemplate}
              sx={{ mb: 2 }}
            >
              เทมเพลตใหม่
            </Button>

            <Typography variant="subtitle2" gutterBottom>เทมเพลตที่มีอยู่</Typography>
            <List dense>
              {templates.map((template) => (
                <ListItem
                  key={template.id}
                  button
                  selected={currentTemplate?.id === template.id}
                  onClick={() => loadTemplate(template.id)}
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.category}
                  />
                  <Chip 
                    label={template.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'} 
                    size="small"
                    color={template.is_active ? 'success' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Divider />
          
          {renderElementList()}
        </Drawer>

        {/* Main Canvas Area */}
        {renderCanvas()}

        {/* Right Sidebar - Properties */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={propertiesOpen}
          sx={{
            width: 320,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 320,
              boxSizing: 'border-box',
              position: 'relative',
            },
          }}
        >
          {renderElementProperties()}
        </Drawer>

        {/* Save Dialog */}
        <Dialog open={saveDialog} onClose={() => setSaveDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>บันทึกเทมเพลต</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="ชื่อเทมเพลต"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="คำอธิบาย"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              >
                <MenuItem value="academic">วิชาการ</MenuItem>
                <MenuItem value="achievement">ความสำเร็จ</MenuItem>
                <MenuItem value="participation">การเข้าร่วม</MenuItem>
                <MenuItem value="completion">การจบหลักสูตร</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="สีพื้นหลัง"
              type="color"
              value={canvasBackground}
              onChange={(e) => setCanvasBackground(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialog(false)}>ยกเลิก</Button>
            <Button onClick={saveTemplate} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'บันทึก'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ position: 'fixed', top: 80, right: 20, zIndex: 1300 }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess(null)}
            sx={{ position: 'fixed', top: 80, right: 20, zIndex: 1300 }}
          >
            {success}
          </Alert>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default TemplateDesignerPage;
