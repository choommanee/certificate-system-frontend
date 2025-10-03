// 🎯 Phase 1: Fixed Simple Designer - Core Save/Load System
// Step 1.2: Canvas State Synchronization ✅
// Step 1.3: Simple Template Data Structure ✅
// Step 1.4: Fixed Save Function ✅
// Step 1.5: Fixed Load Function ✅

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Grid,
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
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

// Import our fixed components
import { SimpleTemplateData, SimpleElement, FixedDesignerProps, CanvasElementCallbacks } from './types';
import SimpleTemplateService from './SimpleTemplateService';
import CanvasStateManager from './CanvasStateManager';

const FixedSimpleDesigner: React.FC<FixedDesignerProps> = ({
  currentUser,
  onSave,
  onExport,
  isPreviewMode = false,
  initialTemplate
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
  const [savedTemplates, setSavedTemplates] = useState<SimpleTemplateData[]>([]);
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

  // Canvas callbacks
  const canvasCallbacks: CanvasElementCallbacks = {
    onElementDrag: useCallback((elementId: string, newPosition: { x: number; y: number }) => {
      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, x: newPosition.x, y: newPosition.y } : el
      ));
    }, []),

    onElementSelect: useCallback((elementId: string) => {
      setSelectedElementId(elementId);
    }, []),

    onElementDoubleClick: useCallback((elementId: string) => {
      // Handle text editing
      console.log('Double clicked element:', elementId);
    }, []),

    onElementTransform: useCallback((elementId: string, newAttrs: any) => {
      setElements(prev => prev.map(el => 
        el.id === elementId 
          ? { 
              ...el, 
              x: newAttrs.x,
              y: newAttrs.y,
              width: newAttrs.width,
              height: newAttrs.height,
              rotation: newAttrs.rotation 
            } 
          : el
      ));
    }, [])
  };

  // Load saved templates on mount
  useEffect(() => {
    loadSavedTemplatesList();
  }, []);

  // Sync elements to canvas when elements change
  useEffect(() => {
    if (elements.length > 0) {
      CanvasStateManager.syncStateToCanvas(stageRef, elements, canvasCallbacks);
    }
  }, [elements, canvasCallbacks]);

  const loadSavedTemplatesList = async () => {
    setIsLoadingTemplates(true);
    try {
      const templates = await SimpleTemplateService.getUserTemplates();
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
        placeholder: 'Click to edit text',
        fontSize: 16,
        fontFamily: 'Sarabun, Arial, sans-serif',
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        verticalAlign: 'top',
        lineHeight: 1.2,
        letterSpacing: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    console.log('➕ Added text element:', newElement.id);
  };

  const addImageElement = () => {
    // This would open an image picker dialog
    const imageUrl = prompt('Enter image URL:');
    if (!imageUrl) return;

    const newElement: SimpleElement = {
      id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      x: Math.random() * (canvasWidth - 200) + 50,
      y: Math.random() * (canvasHeight - 150) + 50,
      width: 200,
      height: 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      properties: {
        imageUrl: imageUrl,
        imageAlt: 'Image'
      }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    console.log('➕ Added image element:', newElement.id);
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

  const addQRCodeElement = () => {
    const newElement: SimpleElement = {
      id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'qr-code',
      x: Math.random() * (canvasWidth - 100) + 50,
      y: Math.random() * (canvasHeight - 100) + 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      properties: {
        qrCodeData: 'https://example.com'
      }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    console.log('➕ Added QR code element:', newElement.id);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;

    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    
    // Remove from canvas
    const stage = stageRef.current;
    if (stage) {
      const layer = stage.children[0];
      const node = layer.findOne(`#${selectedElementId}`);
      if (node) {
        node.destroy();
        layer.batchDraw();
      }
    }

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
      // Sync canvas to ensure we have latest state
      const currentElements = CanvasStateManager.syncCanvasToState(stageRef);
      
      const templateData: SimpleTemplateData = {
        id: '', // Will be generated by service
        name: saveDialog.templateName,
        description: `Certificate template created on ${new Date().toLocaleDateString()}`,
        category: 'certificate',
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          background: canvasBackground
        },
        elements: currentElements.length > 0 ? currentElements : elements
      };

      console.log('💾 Saving template:', templateData);
      
      const savedTemplate = await SimpleTemplateService.saveTemplate(templateData);
      
      // Update templates list
      setSavedTemplates(prev => [...prev, savedTemplate]);
      
      // Close dialog
      setSaveDialog({ open: false, templateName: '' });
      
      showAlert('Success', `Template "${savedTemplate.name}" saved successfully!`, 'success');
      
      // Call onSave prop if provided
      if (onSave) {
        onSave(savedTemplate);
      }
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      showAlert('Error', 'Failed to save template: ' + (error as Error).message, 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Load template
  const handleLoadTemplate = async (template: SimpleTemplateData) => {
    try {
      console.log('📂 Loading template:', template.name);
      
      // Load full template data
      const templateData = await SimpleTemplateService.loadTemplate(template.id);
      if (!templateData) {
        throw new Error('Template not found');
      }

      // Clear current canvas
      CanvasStateManager.clearCanvas(stageRef);
      
      // Apply canvas settings
      setCanvasWidth(templateData.canvas.width);
      setCanvasHeight(templateData.canvas.height);
      setCanvasBackground(templateData.canvas.background);
      
      // Load elements
      setElements(templateData.elements);
      setSelectedElementId(null);
      
      // Close dialog
      setLoadDialog({ open: false });
      
      showAlert('Success', `Template "${templateData.name}" loaded successfully!`, 'success');
      
    } catch (error) {
      console.error('❌ Load failed:', error);
      showAlert('Error', 'Failed to load template: ' + (error as Error).message, 'error');
    }
  };

  // Export functions
  const handleExportPDF = () => {
    if (onExport) {
      const templateData: SimpleTemplateData = {
        id: 'current',
        name: 'Current Template',
        category: 'certificate',
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
        <Grid container spacing={2} alignItems="center">
          {/* Add Elements */}
          <Grid item>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Add Text">
                <Button onClick={addTextElement} startIcon={<TextIcon />}>
                  Text
                </Button>
              </Tooltip>
              <Tooltip title="Add Image">
                <Button onClick={addImageElement} startIcon={<ImageIcon />}>
                  Image
                </Button>
              </Tooltip>
              <Tooltip title="Add Shape">
                <Button onClick={addShapeElement} startIcon={<ShapeIcon />}>
                  Shape
                </Button>
              </Tooltip>
              <Tooltip title="Add QR Code">
                <Button onClick={addQRCodeElement} startIcon={<QrCodeIcon />}>
                  QR Code
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Grid>

          {/* Actions */}
          <Grid item>
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
          </Grid>

          {/* Delete */}
          <Grid item>
            <Tooltip title="Delete Selected">
              <IconButton 
                onClick={deleteSelectedElement} 
                disabled={!selectedElementId}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Preview Mode */}
          <Grid item>
            <FormControlLabel
              control={<Switch checked={isPreviewMode} disabled />}
              label="Preview Mode"
            />
          </Grid>

          {/* Status */}
          <Grid item xs>
            <Typography variant="body2" color="text.secondary" align="right">
              Elements: {elements.length} | Canvas: {canvasWidth}×{canvasHeight}
              {selectedElementId && ` | Selected: ${selectedElementId}`}
            </Typography>
          </Grid>
        </Grid>
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
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {savedTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card>
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
                </Grid>
              ))}
            </Grid>
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

export default FixedSimpleDesigner;