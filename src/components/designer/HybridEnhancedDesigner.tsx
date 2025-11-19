// Hybrid Enhanced Designer - Combining Full Designer with Certificate Template Features

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Divider,
  Tooltip,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Fab,
  Badge
} from '@mui/material';
import {
  Save,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  GridOn,
  GridOff,
  Visibility,
  VisibilityOff,
  Add,
  Person,
  Preview,
  Edit,
  DataObject
} from '@mui/icons-material';
import { Stage, Layer, Rect, Line, Text as KonvaText, Image as KonvaImage } from 'react-konva';

import { DesignerSidebar } from './DesignerSidebar';
import { ElementRenderer } from './ElementRenderer';
import { PropertiesPanel } from './PropertiesPanel';
import { LayerPanel } from './LayerPanel';
import UserSelectionDialog from '../dialogs/UserSelectionDialog';
import { 
  DesignerElement, 
  DesignerDocument, 
  DesignerPage 
} from '../../types/designer';
import { 
  CertificateData, 
  TemplateVariableElement,
  AVAILABLE_DATA_FIELDS 
} from '../../types/certificate-template';
import DataBindingService from '../../services/dataBindingService';

interface HybridEnhancedDesignerProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  onSave?: (document: DesignerDocument) => void;
  onExport?: (format: 'pdf' | 'png' | 'jpg', document: DesignerDocument) => void;
}

const createDefaultPage = (): DesignerPage => ({
  id: `page_${Date.now()}`,
  name: 'หน้า 1',
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  elements: [],
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
});

const createDefaultDocument = (): DesignerDocument => ({
  id: `doc_${Date.now()}`,
  name: 'เอกสารใหม่',
  pages: [createDefaultPage()],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current-user',
    version: '1.0.0',
    tags: [],
  },
  settings: {
    unit: 'px',
    dpi: 300,
    colorProfile: 'RGB',
    bleed: 0,
  },
});

const HybridEnhancedDesigner: React.FC<HybridEnhancedDesignerProps> = ({
  currentUser,
  onSave,
  onExport,
}) => {
  const stageRef = useRef<any>(null);
  
  // Document State
  const [document, setDocument] = useState<DesignerDocument>(createDefaultDocument);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  
  // UI State
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  
  // Certificate Template State
  const [userSelectionOpen, setUserSelectionOpen] = useState(false);
  const [selectedCertificateData, setSelectedCertificateData] = useState<CertificateData | null>(null);
  const [templateVariableCount, setTemplateVariableCount] = useState(0);
  
  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const currentPage = document.pages[currentPageIndex];
  const selectedElements = currentPage.elements.filter(el => selectedElementIds.includes(el.id));

  // Count template variables in current page
  React.useEffect(() => {
    const templateVars = currentPage.elements.filter(el => (el as any).type === 'template-variable');
    setTemplateVariableCount(templateVars.length);
  }, [currentPage.elements]);

  // Element Management
  const addElement = useCallback((element: DesignerElement | TemplateVariableElement) => {
    setDocument(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) => 
        index === currentPageIndex 
          ? { ...page, elements: [...page.elements, element as any] }
          : page
      )
    }));
  }, [currentPageIndex]);

  const updateElement = useCallback((elementId: string, updates: Partial<DesignerElement>) => {
    setDocument(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) => 
        index === currentPageIndex 
          ? {
              ...page,
              elements: page.elements.map(el => 
                el.id === elementId ? { ...el, ...updates } : el
              )
            }
          : page
      )
    }));
  }, [currentPageIndex]);

  const deleteElement = useCallback((elementId: string) => {
    setDocument(prev => ({
      ...prev,
      pages: prev.pages.map((page, index) => 
        index === currentPageIndex 
          ? {
              ...page,
              elements: page.elements.filter(el => el.id !== elementId)
            }
          : page
      )
    }));
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
  }, [currentPageIndex]);

  // Template Variable Functions
  const addTemplateVariable = useCallback((fieldPath: string) => {
    const dataBinding = AVAILABLE_DATA_FIELDS.find(field => field.fieldPath === fieldPath);
    if (!dataBinding) return;

    const templateVar = DataBindingService.createTemplateVariable(
      dataBinding,
      100 + Math.random() * 200,
      100 + Math.random() * 200,
      250,
      40
    );

    addElement(templateVar);
    
    setNotification({
      message: `เพิ่ม Template Variable "${dataBinding.label}" แล้ว`,
      type: 'success'
    });
  }, [addElement]);

  // User Selection
  const handleUserSelect = useCallback((userData: CertificateData) => {
    setSelectedCertificateData(userData);
    setIsPreviewMode(true);
    
    setNotification({
      message: `เลือกข้อมูลของ ${userData.user.fullName} แล้ว`,
      type: 'success'
    });
  }, []);

  // Save & Export
  const handleSave = useCallback(() => {
    const updatedDocument = {
      ...document,
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString()
      }
    };
    
    setDocument(updatedDocument);
    
    if (onSave) {
      onSave(updatedDocument);
    }
    
    setNotification({
      message: 'บันทึกเอกสารแล้ว',
      type: 'success'
    });
  }, [document, onSave]);

  const handleExport = useCallback((format: 'pdf' | 'png' | 'jpg') => {
    if (onExport) {
      onExport(format, document);
    }
    
    setNotification({
      message: `ส่งออกเป็น ${format.toUpperCase()} แล้ว`,
      type: 'success'
    });
  }, [document, onExport]);

  // Element Selection
  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementIds([elementId]);
  }, []);

  const handleElementDrag = useCallback((elementId: string, newPos: { x: number; y: number }) => {
    updateElement(elementId, newPos);
  }, [updateElement]);

  const handleElementTransform = useCallback((elementId: string, newAttrs: any) => {
    updateElement(elementId, newAttrs);
  }, [updateElement]);

  // Render element with preview support
  const renderElement = (element: DesignerElement | TemplateVariableElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    
    return (
      <ElementRenderer
        key={element.id}
        element={element}
        isSelected={isSelected}
        isPreviewMode={isPreviewMode}
        certificateData={selectedCertificateData || undefined}
        onSelect={() => handleElementSelect(element.id)}
        onDragEnd={(e) => handleElementDrag(element.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => handleElementTransform(element.id, {
          x: e.target.x(),
          y: e.target.y(),
          width: e.target.width() * e.target.scaleX(),
          height: e.target.height() * e.target.scaleY(),
          rotation: e.target.rotation(),
        })}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Main Toolbar */}
      <Paper sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderRadius: 0
      }}>
        <Toolbar variant="dense">
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              🎨 Enhanced Designer
            </Typography>
            
            <ButtonGroup size="small">
              <Tooltip title="บันทึก">
                <IconButton onClick={handleSave}>
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title="ส่งออก PDF">
                <IconButton onClick={() => handleExport('pdf')}>
                  <Download />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <ButtonGroup size="small">
              <Tooltip title="ย้อนกลับ">
                <IconButton>
                  <Undo />
                </IconButton>
              </Tooltip>
              <Tooltip title="ทำซ้ำ">
                <IconButton>
                  <Redo />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <ButtonGroup size="small">
              <Tooltip title="ซูมเข้า">
                <IconButton onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="ซูมออก">
                <IconButton onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.1))}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Tooltip title="แสดง/ซ่อนตาราง">
                <IconButton onClick={() => setShowGrid(!showGrid)}>
                  {showGrid ? <GridOn /> : <GridOff />}
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Box>

          {/* Center Section */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPreviewMode}
                  onChange={(e) => setIsPreviewMode(e.target.checked)}
                  disabled={!selectedCertificateData}
                />
              }
              label="โหมดแสดงตัวอย่าง"
            />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Certificate Template Controls */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<Person />}
              onClick={() => setUserSelectionOpen(true)}
              sx={{ mr: 1 }}
            >
              เลือกผู้รับเกียรติบัตร
            </Button>

            {templateVariableCount > 0 && (
              <Badge badgeContent={templateVariableCount} color="secondary">
                <DataObject />
              </Badge>
            )}

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Panel Toggles */}
            <ButtonGroup size="small">
              <Tooltip title="แสดง/ซ่อน Sidebar">
                <IconButton onClick={() => setShowSidebar(!showSidebar)}>
                  <Visibility />
                </IconButton>
              </Tooltip>
              <Tooltip title="แสดง/ซ่อน Properties">
                <IconButton onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="แสดง/ซ่อน Layers">
                <IconButton onClick={() => setShowLayerPanel(!showLayerPanel)}>
                  <Preview />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Box>
        </Toolbar>
      </Paper>

      {/* Sidebar */}
      {showSidebar && (
        <Paper sx={{ width: 280, mt: '48px', borderRadius: 0 }}>
          <DesignerSidebar
            onAddElement={addElement}
            onAddTemplateVariable={addTemplateVariable}
            availableDataFields={AVAILABLE_DATA_FIELDS}
          />
        </Paper>
      )}

      {/* Main Canvas Area */}
      <Box sx={{ 
        flex: 1, 
        mt: '48px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Canvas */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          backgroundColor: '#f5f5f5',
          p: 2
        }}>
          {selectedCertificateData && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    setSelectedCertificateData(null);
                    setIsPreviewMode(false);
                  }}
                >
                  ล้างข้อมูล
                </Button>
              }
            >
              กำลังใช้ข้อมูลของ: <strong>{selectedCertificateData.user.fullName}</strong> 
              ({selectedCertificateData.user.studentId})
            </Alert>
          )}

          <Paper elevation={3} sx={{ display: 'inline-block' }}>
            <Stage
              ref={stageRef}
              width={currentPage.width * zoom}
              height={currentPage.height * zoom}
              scaleX={zoom}
              scaleY={zoom}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) {
                  setSelectedElementIds([]);
                }
              }}
            >
              <Layer>
                {/* Background */}
                <rect
                  x={0}
                  y={0}
                  width={currentPage.width}
                  height={currentPage.height}
                  fill={currentPage.backgroundColor}
                />

                {/* Grid */}
                {showGrid && !isPreviewMode && (
                  <>
                    {Array.from({ length: Math.floor(currentPage.width / 20) }, (_, i) => (
                      <line
                        key={`grid-v-${i}`}
                        x1={i * 20}
                        y1={0}
                        x2={i * 20}
                        y2={currentPage.height}
                        stroke="#e0e0e0"
                        strokeWidth={1}
                      />
                    ))}
                    {Array.from({ length: Math.floor(currentPage.height / 20) }, (_, i) => (
                      <line
                        key={`grid-h-${i}`}
                        x1={0}
                        y1={i * 20}
                        x2={currentPage.width}
                        y2={i * 20}
                        stroke="#e0e0e0"
                        strokeWidth={1}
                      />
                    ))}
                  </>
                )}

                {/* Elements */}
                {currentPage.elements.map(renderElement)}
              </Layer>
            </Stage>
          </Paper>
        </Box>
      </Box>

      {/* Right Panels */}
      <Box sx={{ display: 'flex', mt: '48px' }}>
        {/* Properties Panel */}
        {showPropertiesPanel && (
          <Paper sx={{ width: 300, borderRadius: 0 }}>
            <PropertiesPanel
              selectedElements={selectedElements}
              onUpdateElement={updateElement}
            />
          </Paper>
        )}

        {/* Layer Panel */}
        {showLayerPanel && (
          <Paper sx={{ width: 280, borderRadius: 0 }}>
            <LayerPanel
              elements={currentPage.elements}
              selectedElementIds={selectedElementIds}
              onSelectElement={handleElementSelect}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              onReorderElements={(fromIndex, toIndex) => {
                const newElements = [...currentPage.elements];
                const [removed] = newElements.splice(fromIndex, 1);
                newElements.splice(toIndex, 0, removed);
                
                setDocument(prev => ({
                  ...prev,
                  pages: prev.pages.map((page, index) => 
                    index === currentPageIndex 
                      ? { ...page, elements: newElements }
                      : page
                  )
                }));
              }}
              onToggleVisibility={(elementId, visible) => {
                updateElement(elementId, { visible });
              }}
              onToggleLock={(elementId, locked) => {
                updateElement(elementId, { locked });
              }}
            />
          </Paper>
        )}
      </Box>

      {/* User Selection Dialog */}
      <UserSelectionDialog
        open={userSelectionOpen}
        onClose={() => setUserSelectionOpen(false)}
        onSelectUser={handleUserSelect}
      />

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        message={notification?.message}
      />
    </Box>
  );
};

export default HybridEnhancedDesigner;
