// Enhanced Designer - Polotno-style Canvas Designer

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Save,
  Download,
  Print,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  GridOn,
  GridOff,
  Visibility,
  VisibilityOff,
  Layers,
  Settings,
  MoreVert,
  Add,
  Remove,
  FileCopy,
  Delete,
} from '@mui/icons-material';
import { Stage, Layer, Transformer } from 'react-konva';
import Konva from 'konva';

import { DesignerSidebar } from './DesignerSidebar';
import { ElementRenderer } from './ElementRenderer';
import { ElementFactory } from './ElementFactory';
import { PropertiesPanel } from './PropertiesPanel';
import { LayerPanel } from './LayerPanel';
import { 
  DesignerElement, 
  DesignerDocument, 
  DesignerPage, 
  DesignerState, 
  ElementType 
} from '../../types/designer';
import { CertificateData, TemplateVariableElement } from '../../types/certificate-template';

interface EnhancedDesignerProps {
  documentId?: string;
  onSave?: (document: DesignerDocument) => void;
  onExport?: (format: 'pdf' | 'png' | 'jpg', document: DesignerDocument) => void;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  // Certificate template support
  isPreviewMode?: boolean;
  certificateData?: CertificateData;
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

export const EnhancedDesigner: React.FC<EnhancedDesignerProps> = ({
  documentId,
  onSave,
  onExport,
  currentUser,
  isPreviewMode = false,
  certificateData,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  // State Management
  const [document, setDocument] = useState<DesignerDocument>(createDefaultDocument);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [designerState, setDesignerState] = useState<DesignerState>({
    selectedElementIds: [],
    currentPageId: document.pages[0].id,
    zoom: 1,
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    showRulers: false,
    showGuides: false,
    guides: [],
    clipboard: [],
    history: {
      past: [],
      present: document,
      future: [],
    },
    tool: 'select',
    isDrawing: false,
    previewMode: false,
  });

  // UI State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const currentPage = document.pages[currentPageIndex];
  const selectedElements = currentPage.elements.filter(el => selectedElementIds.includes(el.id));

  // History Management
  const saveToHistory = useCallback((newDocument: DesignerDocument) => {
    setDesignerState(prev => ({
      ...prev,
      history: {
        past: [...prev.history.past, prev.history.present],
        present: newDocument,
        future: [],
      },
    }));
  }, []);

  const undo = useCallback(() => {
    if (designerState.history.past.length === 0) return;
    
    const previous = designerState.history.past[designerState.history.past.length - 1];
    const newPast = designerState.history.past.slice(0, -1);
    
    setDocument(previous);
    setDesignerState(prev => ({
      ...prev,
      history: {
        past: newPast,
        present: previous,
        future: [prev.history.present, ...prev.history.future],
      },
    }));
  }, [designerState.history]);

  const redo = useCallback(() => {
    if (designerState.history.future.length === 0) return;
    
    const next = designerState.history.future[0];
    const newFuture = designerState.history.future.slice(1);
    
    setDocument(next);
    setDesignerState(prev => ({
      ...prev,
      history: {
        past: [...prev.history.past, prev.history.present],
        present: next,
        future: newFuture,
      },
    }));
  }, [designerState.history]);

  // Element Management
  const addElement = useCallback((type: ElementType, options?: any) => {
    const newElement = ElementFactory.createElement(
      type,
      100 + Math.random() * 100,
      100 + Math.random() * 100,
      options
    );

    const newDocument = {
      ...document,
      pages: document.pages.map((page, index) =>
        index === currentPageIndex
          ? { ...page, elements: [...page.elements, newElement] }
          : page
      ),
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
    setSelectedElementIds([newElement.id]);
    
    setNotification({
      message: `เพิ่ม ${newElement.name} แล้ว`,
      type: 'success',
    });
  }, [document, currentPageIndex, saveToHistory]);

  const updateElement = useCallback((elementId: string, updates: Partial<DesignerElement>) => {
    const newDocument = {
      ...document,
      pages: document.pages.map((page, index) =>
        index === currentPageIndex
          ? {
              ...page,
              elements: page.elements.map(el =>
                el.id === elementId ? { ...el, ...updates } : el
              ),
            }
          : page
      ),
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
  }, [document, currentPageIndex, saveToHistory]);

  const deleteSelectedElements = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    const newDocument = {
      ...document,
      pages: document.pages.map((page, index) =>
        index === currentPageIndex
          ? {
              ...page,
              elements: page.elements.filter(el => !selectedElementIds.includes(el.id)),
            }
          : page
      ),
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
    setSelectedElementIds([]);
    
    setNotification({
      message: `ลบ ${selectedElementIds.length} รายการแล้ว`,
      type: 'success',
    });
  }, [document, currentPageIndex, selectedElementIds, saveToHistory]);

  const duplicateSelectedElements = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    const elementsToDuplicate = currentPage.elements.filter(el => selectedElementIds.includes(el.id));
    const duplicatedElements = elementsToDuplicate.map(el => ElementFactory.duplicateElement(el));

    const newDocument = {
      ...document,
      pages: document.pages.map((page, index) =>
        index === currentPageIndex
          ? { ...page, elements: [...page.elements, ...duplicatedElements] }
          : page
      ),
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
    setSelectedElementIds(duplicatedElements.map(el => el.id));
    
    setNotification({
      message: `คัดลอก ${duplicatedElements.length} รายการแล้ว`,
      type: 'success',
    });
  }, [document, currentPageIndex, currentPage.elements, selectedElementIds, saveToHistory]);

  // Canvas Event Handlers
  const handleElementClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedElementIds([]);
      return;
    }

    const clickedElement = currentPage.elements.find(el => 
      e.target.name() === el.id || e.target.parent?.name() === el.id
    );

    if (clickedElement) {
      if (e.evt.ctrlKey || e.evt.metaKey) {
        // Multi-select
        setSelectedElementIds(prev => 
          prev.includes(clickedElement.id)
            ? prev.filter(id => id !== clickedElement.id)
            : [...prev, clickedElement.id]
        );
      } else {
        setSelectedElementIds([clickedElement.id]);
      }
    }
  }, [currentPage.elements]);

  const handleSelectElement = useCallback((elementId: string, multiSelect?: boolean) => {
    if (multiSelect) {
      setSelectedElementIds(prev => 
        prev.includes(elementId)
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      );
    } else {
      setSelectedElementIds([elementId]);
    }
  }, []);

  const handleReorderElements = useCallback((startIndex: number, endIndex: number) => {
    const sortedElements = [...currentPage.elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    const [movedElement] = sortedElements.splice(startIndex, 1);
    sortedElements.splice(endIndex, 0, movedElement);
    
    // Update z-index based on new order
    const updatedElements = sortedElements.map((el, index) => ({
      ...el,
      zIndex: sortedElements.length - index,
    }));
    
    const newDocument = {
      ...document,
      pages: document.pages.map((page, index) =>
        index === currentPageIndex
          ? { ...page, elements: updatedElements }
          : page
      ),
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
  }, [document, currentPageIndex, currentPage.elements, saveToHistory]);

  const handleElementTransform = useCallback((element: DesignerElement, newAttrs: any) => {
    updateElement(element.id, newAttrs);
  }, [updateElement]);

  // Page Management
  const addPage = useCallback(() => {
    const newPage = createDefaultPage();
    newPage.name = `หน้า ${document.pages.length + 1}`;

    const newDocument = {
      ...document,
      pages: [...document.pages, newPage],
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
    setCurrentPageIndex(document.pages.length);
    
    setNotification({
      message: 'เพิ่มหน้าใหม่แล้ว',
      type: 'success',
    });
  }, [document, saveToHistory]);

  const deletePage = useCallback((pageIndex: number) => {
    if (document.pages.length <= 1) {
      setNotification({
        message: 'ไม่สามารถลบหน้าสุดท้ายได้',
        type: 'error',
      });
      return;
    }

    const newDocument = {
      ...document,
      pages: document.pages.filter((_, index) => index !== pageIndex),
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocument(newDocument);
    saveToHistory(newDocument);
    
    if (currentPageIndex >= newDocument.pages.length) {
      setCurrentPageIndex(newDocument.pages.length - 1);
    }
    
    setNotification({
      message: 'ลบหน้าแล้ว',
      type: 'success',
    });
  }, [document, currentPageIndex, saveToHistory]);

  // Zoom and View Controls
  const handleZoomChange = useCallback((newZoom: number) => {
    setDesignerState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(5, newZoom)) }));
  }, []);

  const zoomToFit = useCallback(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const container = stage.container();
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const scaleX = containerWidth / currentPage.width;
    const scaleY = containerHeight / currentPage.height;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    
    handleZoomChange(scale);
  }, [currentPage.width, currentPage.height, handleZoomChange]);

  // Template Selection
  const handleSelectTemplate = useCallback((templateId: string) => {
    // TODO: Load template from API
    setNotification({
      message: `กำลังโหลดเทมเพลต: ${templateId}`,
      type: 'info',
    });
  }, []);

  // Save and Export
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(document);
      setNotification({
        message: 'บันทึกเอกสารแล้ว',
        type: 'success',
      });
    }
  }, [document, onSave]);

  const handleExport = useCallback((format: 'pdf' | 'png' | 'jpg') => {
    if (onExport) {
      onExport(format, document);
      setNotification({
        message: `กำลังส่งออกเป็น ${format.toUpperCase()}`,
        type: 'info',
      });
    }
  }, [document, onExport]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'd':
            e.preventDefault();
            duplicateSelectedElements();
            break;
          case 'a':
            e.preventDefault();
            setSelectedElementIds(currentPage.elements.map(el => el.id));
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave, duplicateSelectedElements, deleteSelectedElements, currentPage.elements]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Left Sidebar - Tools */}
      <DesignerSidebar
        onAddElement={addElement}
        onSelectTemplate={handleSelectTemplate}
        currentUser={currentUser}
      />

      {/* Layer Panel */}
      <LayerPanel
        elements={currentPage.elements}
        selectedElementIds={selectedElementIds}
        onSelectElement={handleSelectElement}
        onUpdateElement={updateElement}
        onReorderElements={handleReorderElements}
        onDeleteElements={deleteSelectedElements}
        onDuplicateElements={duplicateSelectedElements}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Toolbar */}
        <Paper sx={{ borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar sx={{ gap: 1, minHeight: '56px !important' }}>
            {/* File Operations */}
            <Button
              startIcon={<Save />}
              onClick={handleSave}
              size="small"
              variant="outlined"
            >
              บันทึก
            </Button>
            
            <Button
              startIcon={<Download />}
              onClick={() => handleExport('pdf')}
              size="small"
              variant="outlined"
            >
              ส่งออก
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* History */}
            <Tooltip title="ยกเลิก (Ctrl+Z)">
              <IconButton
                onClick={undo}
                disabled={designerState.history.past.length === 0}
                size="small"
              >
                <Undo />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="ทำซ้ำ (Ctrl+Shift+Z)">
              <IconButton
                onClick={redo}
                disabled={designerState.history.future.length === 0}
                size="small"
              >
                <Redo />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Zoom Controls */}
            <Tooltip title="ซูมออก">
              <IconButton
                onClick={() => handleZoomChange(designerState.zoom - 0.1)}
                disabled={designerState.zoom <= 0.1}
                size="small"
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>
            
            <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
              {Math.round(designerState.zoom * 100)}%
            </Typography>
            
            <Tooltip title="ซูมเข้า">
              <IconButton
                onClick={() => handleZoomChange(designerState.zoom + 0.1)}
                disabled={designerState.zoom >= 5}
                size="small"
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="ซูมให้พอดี">
              <IconButton onClick={zoomToFit} size="small">
                <ZoomOutMap />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* View Options */}
            <Tooltip title="แสดง/ซ่อนกริด">
              <IconButton
                onClick={() => setDesignerState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                color={designerState.showGrid ? 'primary' : 'default'}
                size="small"
              >
                {designerState.showGrid ? <GridOn /> : <GridOff />}
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1 }} />

            {/* Page Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                หน้า {currentPageIndex + 1} จาก {document.pages.length}
              </Typography>
              
              <Tooltip title="เพิ่มหน้า">
                <IconButton onClick={addPage} size="small">
                  <Add />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="ลบหน้า">
                <IconButton
                  onClick={() => deletePage(currentPageIndex)}
                  disabled={document.pages.length <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
              </Tooltip>
            </Box>

            {/* More Options */}
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              size="small"
            >
              <MoreVert />
            </IconButton>
          </Toolbar>
        </Paper>

        {/* Canvas Area */}
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Paper
              sx={{
                boxShadow: 3,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Stage
                ref={stageRef}
                width={currentPage.width * designerState.zoom}
                height={currentPage.height * designerState.zoom}
                scaleX={designerState.zoom}
                scaleY={designerState.zoom}
                onClick={handleElementClick}
                onTap={handleElementClick}
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
                  {designerState.showGrid && (
                    <>
                      {Array.from(
                        { length: Math.ceil(currentPage.width / designerState.gridSize) },
                        (_, i) => (
                          <line
                            key={`grid-v-${i}`}
                            x1={i * designerState.gridSize}
                            y1={0}
                            x2={i * designerState.gridSize}
                            y2={currentPage.height}
                            stroke="#f0f0f0"
                            strokeWidth={1}
                          />
                        )
                      )}
                      {Array.from(
                        { length: Math.ceil(currentPage.height / designerState.gridSize) },
                        (_, i) => (
                          <line
                            key={`grid-h-${i}`}
                            x1={0}
                            y1={i * designerState.gridSize}
                            x2={currentPage.width}
                            y2={i * designerState.gridSize}
                            stroke="#f0f0f0"
                            strokeWidth={1}
                          />
                        )
                      )}
                    </>
                  )}

                  {/* Elements */}
                  {currentPage.elements.map((element) => (
                    <ElementRenderer
                      key={element.id}
                      element={element}
                      isSelected={selectedElementIds.includes(element.id)}
                      onSelect={(el) => setSelectedElementIds([el.id])}
                      onTransform={handleElementTransform}
                    />
                  ))}
                </Layer>

                {/* Transformer for selected elements */}
                {selectedElementIds.length > 0 && (
                  <Layer>
                    <Transformer
                      ref={transformerRef}
                      nodes={selectedElementIds.map(id => 
                        stageRef.current?.findOne(`#${id}`)
                      ).filter(Boolean)}
                      boundBoxFunc={(oldBox, newBox) => {
                        // Limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  </Layer>
                )}
              </Stage>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Properties Panel */}
      <PropertiesPanel
        selectedElements={selectedElements}
        onUpdateElement={updateElement}
        onDeleteElements={deleteSelectedElements}
        onDuplicateElements={duplicateSelectedElements}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={duplicateSelectedElements} disabled={selectedElementIds.length === 0}>
          <FileCopy sx={{ mr: 1 }} /> คัดลอก
        </MenuItem>
        <MenuItem onClick={deleteSelectedElements} disabled={selectedElementIds.length === 0}>
          <Delete sx={{ mr: 1 }} /> ลบ
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleExport('pdf')}>
          <Download sx={{ mr: 1 }} /> ส่งออก PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('png')}>
          <Download sx={{ mr: 1 }} /> ส่งออก PNG
        </MenuItem>
      </Menu>

      {/* Notifications */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};
