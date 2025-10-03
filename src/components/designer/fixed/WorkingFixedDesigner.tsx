// 🎯 Phase 1: Working Fixed Designer - Minimal Implementation
// This is a working version without complex TypeScript issues

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  TextFields as TextIcon,
  Image as ImageIcon,
  Crop as ShapeIcon,
  QrCode as QrCodeIcon,
  Save as SaveIcon,
  Folder as FolderIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Stage, Layer, Text, Rect, Circle } from 'react-konva';
import Konva from 'konva';

// Simple interfaces for this working version
interface SimpleElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr-code';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  properties: {
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    shapeType?: string;
    imageUrl?: string;
    qrCodeData?: string;
  };
}

interface SimpleTemplate {
  id: string;
  name: string;
  description?: string;
  canvas: {
    width: number;
    height: number;
    background: string;
  };
  elements: SimpleElement[];
  createdAt?: string;
}

interface WorkingFixedDesignerProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
  onSave?: (template: SimpleTemplate) => void;
  onExport?: (format: 'pdf' | 'png' | 'jpg', template: SimpleTemplate) => void;
  isPreviewMode?: boolean;
}

const WorkingFixedDesigner: React.FC<WorkingFixedDesignerProps> = ({
  currentUser,
  onSave,
  onExport,
  isPreviewMode = false
}) => {
  // Canvas state
  const stageRef = useRef<Konva.Stage>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');

  // Elements state
  const [elements, setElements] = useState<SimpleElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Templates state
  const [savedTemplates, setSavedTemplates] = useState<SimpleTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Dialog states
  const [saveDialog, setSaveDialog] = useState({ open: false, templateName: '' });
  const [loadDialog, setLoadDialog] = useState({ open: false });
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, title: '', message: '', severity: 'info' });

  // Load saved templates on mount
  useEffect(() => {
    loadSavedTemplatesList();
  }, []);

  // Sync elements to canvas when elements change
  useEffect(() => {
    syncElementsToCanvas();
  }, [elements]);

  const loadSavedTemplatesList = async () => {
    setIsLoadingTemplates(true);
    try {
      // Load from localStorage for now
      const templates = JSON.parse(localStorage.getItem('workingFixedTemplates') || '[]');
      setSavedTemplates(templates);
      console.log('✅ Loaded templates:', templates.length);
    } catch (error) {
      console.error('❌ Failed to load templates:', error);
      showAlert('Error', 'Failed to load templates: ' + (error as Error).message, 'error');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const showAlert = (title: string, message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlertDialog({ open: true, title, message, severity });
  };

  const closeAlert = () => {
    setAlertDialog({ open: false, title: '', message: '', severity: 'info' });
  };

  // Sync elements to canvas
  const syncElementsToCanvas = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const layer = stage.children[0] as Konva.Layer;
    if (!layer) return;

    // Clear existing elements
    layer.destroyChildren();

    // Add elements to canvas
    elements.forEach(element => {
      let konvaNode: Konva.Node | null = null;

      switch (element.type) {
        case 'text':
          konvaNode = new Konva.Text({
            id: element.id,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            text: element.properties.text || 'Text',
            fontSize: element.properties.fontSize || 16,
            fontFamily: element.properties.fontFamily || 'Arial',
            fill: element.properties.color || '#000000',
            draggable: !element.locked,
            rotation: element.rotation,
            opacity: element.opacity,
            visible: element.visible
          });
          break;

        case 'shape':
          if (element.properties.shapeType === 'circle') {
            konvaNode = new Konva.Circle({
              id: element.id,
              x: element.x + element.width / 2,
              y: element.y + element.height / 2,
              radius: Math.min(element.width, element.height) / 2,
              fill: element.properties.fillColor || '#ffffff',
              stroke: element.properties.strokeColor || '#000000',
              strokeWidth: element.properties.strokeWidth || 1,
              draggable: !element.locked,
              rotation: element.rotation,
              opacity: element.opacity,
              visible: element.visible
            });
          } else {
            konvaNode = new Konva.Rect({
              id: element.id,
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              fill: element.properties.fillColor || '#ffffff',
              stroke: element.properties.strokeColor || '#000000',
              strokeWidth: element.properties.strokeWidth || 1,
              draggable: !element.locked,
              rotation: element.rotation,
              opacity: element.opacity,
              visible: element.visible
            });
          }
          break;

        default:
          // For other types, create a placeholder rectangle
          konvaNode = new Konva.Rect({
            id: element.id,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            fill: '#f0f0f0',
            stroke: '#cccccc',
            strokeWidth: 1,
            draggable: !element.locked,
            rotation: element.rotation,
            opacity: element.opacity,
            visible: element.visible
          });
          break;
      }

      if (konvaNode) {
        // Add event listeners
        konvaNode.on('click', () => {
          setSelectedElementId(element.id);
        });

        konvaNode.on('dragend', (e) => {
          const node = e.target;
          updateElementPosition(element.id, node.x(), node.y());
        });

        layer.add(konvaNode);
      }
    });

    layer.batchDraw();
  };

  const updateElementPosition = (elementId: string, x: number, y: number) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, x, y } : el
    ));
  };

  // Element creation functions
  const addTextElement = () => {
    const newElement: SimpleElement = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      x: Math.random() * (canvasWidth - 200) + 50,
      y: Math.random() * (canvasHeight - 50) + 50,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      properties: {
        text: 'New Text',
        fontSize: 16,
        fontFamily: 'Sarabun, Arial, sans-serif',
        color: '#000000'
      }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    console.log('➕ Added text element:', newElement.id);
  };

  const addShapeElement = () => {
    const newElement: SimpleElement = {
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape',
      x: Math.random() * (canvasWidth - 150) + 50,
      y: Math.random() * (canvasHeight - 100) + 50,
      width: 150,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      properties: {
        shapeType: 'rectangle',
        fillColor: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2
      }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    console.log('➕ Added shape element:', newElement.id);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;

    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
    console.log('🗑️ Deleted element:', selectedElementId);
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!saveDialog.templateName.trim()) {
      showAlert('Error', 'Please enter a template name', 'error');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const templateData: SimpleTemplate = {
        id: `template-${Date.now()}`,
        name: saveDialog.templateName,
        description: `Template created on ${new Date().toLocaleDateString()}`,
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          background: canvasBackground
        },
        elements: elements,
        createdAt: new Date().toISOString()
      };

      console.log('💾 Saving template:', templateData);
      
      // Save to localStorage
      const existingTemplates = JSON.parse(localStorage.getItem('workingFixedTemplates') || '[]');
      existingTemplates.push(templateData);
      localStorage.setItem('workingFixedTemplates', JSON.stringify(existingTemplates));
      
      // Update templates list
      setSavedTemplates(prev => [...prev, templateData]);
      
      // Close dialog
      setSaveDialog({ open: false, templateName: '' });
      
      showAlert('Success', `Template "${templateData.name}" saved successfully!`, 'success');
      
      // Call onSave prop if provided
      if (onSave) {
        onSave(templateData);
      }
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      showAlert('Error', 'Failed to save template: ' + (error as Error).message, 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Load template
  const handleLoadTemplate = async (template: SimpleTemplate) => {
    try {
      console.log('📂 Loading template:', template.name);
      
      // Apply canvas settings
      setCanvasWidth(template.canvas.width);
      setCanvasHeight(template.canvas.height);
      setCanvasBackground(template.canvas.background);
      
      // Load elements
      setElements(template.elements);
      setSelectedElementId(null);
      
      // Close dialog
      setLoadDialog({ open: false });
      
      showAlert('Success', `Template "${template.name}" loaded successfully!`, 'success');
      
    } catch (error) {
      console.error('❌ Load failed:', error);
      showAlert('Error', 'Failed to load template: ' + (error as Error).message, 'error');
    }
  };

  // Export functions
  const handleExportPDF = () => {
    if (onExport) {
      const templateData: SimpleTemplate = {
        id: 'current',
        name: 'Current Template',
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          background: canvasBackground
        },
        elements: elements
      };
      onExport('pdf', templateData);
    }
    showAlert('Info', 'PDF export initiated', 'info');
  };

  const handleExportPNG = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'certificate-template.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showAlert('Success', 'PNG exported successfully!', 'success');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 2, borderRadius: 0 }} elevation={1}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Add Elements */}
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Add Text">
              <Button onClick={addTextElement} startIcon={<TextIcon />}>
                Text
              </Button>
            </Tooltip>
            <Tooltip title="Add Shape">
              <Button onClick={addShapeElement} startIcon={<ShapeIcon />}>
                Shape
              </Button>
            </Tooltip>
          </ButtonGroup>

          {/* Actions */}
          <ButtonGroup variant="contained" size="small">
            <Tooltip title="Save Template">
              <Button 
                onClick={() => setSaveDialog({ open: true, templateName: '' })}
                startIcon={<SaveIcon />}
                disabled={isSavingTemplate}
              >
                {isSavingTemplate ? <CircularProgress size={16} /> : 'Save'}
              </Button>
            </Tooltip>
            <Tooltip title="Load Template">
              <Button 
                onClick={() => setLoadDialog({ open: true })}
                startIcon={<FolderIcon />}
              >
                Load
              </Button>
            </Tooltip>
            <Tooltip title="Export as PNG">
              <Button 
                onClick={handleExportPNG}
                startIcon={<ExportIcon />}
              >
                Export PNG
              </Button>
            </Tooltip>
            <Tooltip title="Export as PDF">
              <Button 
                onClick={handleExportPDF}
                startIcon={<ExportIcon />}
              >
                Export PDF
              </Button>
            </Tooltip>
          </ButtonGroup>

          {/* Delete */}
          <Tooltip title="Delete Selected">
            <IconButton 
              onClick={deleteSelectedElement} 
              disabled={!selectedElementId}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          {/* Status */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" align="right">
              Elements: {elements.length} | Canvas: {canvasWidth}×{canvasHeight}
              {selectedElementId && ` | Selected: ${selectedElementId}`}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Canvas */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}
      >
        <Paper 
          elevation={4}
          sx={{ 
            display: 'inline-block',
            background: canvasBackground 
          }}
        >
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasHeight}
            onClick={(e) => {
              // Deselect if clicking on empty area
              if (e.target === e.target.getStage()) {
                setSelectedElementId(null);
              }
            }}
          >
            <Layer />
          </Stage>
        </Paper>
      </Box>

      {/* Save Template Dialog */}
      <Dialog open={saveDialog.open} onClose={() => setSaveDialog({ open: false, templateName: '' })}>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            variant="outlined"
            value={saveDialog.templateName}
            onChange={(e) => setSaveDialog(prev => ({ ...prev, templateName: e.target.value }))}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveTemplate();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSaveDialog({ open: false, templateName: '' })}
            disabled={isSavingTemplate}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            variant="contained"
            disabled={isSavingTemplate || !saveDialog.templateName.trim()}
          >
            {isSavingTemplate ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog 
        open={loadDialog.open} 
        onClose={() => setLoadDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Load Template</DialogTitle>
        <DialogContent>
          {isLoadingTemplates ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : savedTemplates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" p={3}>
              No saved templates found. Create and save a template first.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {savedTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent>
                    <Typography variant="h6" component="h3" noWrap>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {template.elements.length} elements • {template.canvas.width}×{template.canvas.height}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown date'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleLoadTemplate(template)}
                      variant="contained"
                    >
                      Load
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialog({ open: false })}>Close</Button>
          <Button onClick={loadSavedTemplatesList} disabled={isLoadingTemplates}>
            Refresh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertDialog.open} onClose={closeAlert}>
        <DialogTitle>{alertDialog.title}</DialogTitle>
        <DialogContent>
          <Alert severity={alertDialog.severity} sx={{ mt: 1 }}>
            {alertDialog.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAlert}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkingFixedDesigner;
