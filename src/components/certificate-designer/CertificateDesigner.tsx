import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  Button,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import {
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  GridOn,
  GridOff,
  TextFields,
  Image,
  Crop,
  Delete,
} from '@mui/icons-material';
import { Stage, Layer, Text, Rect, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { CertificateElement, DesignerState } from '../../types';

interface CertificateDesignerProps {
  templateId?: number;
  onSave?: (designData: any) => void;
}

const CertificateDesigner: React.FC<CertificateDesignerProps> = ({
  templateId,
  onSave,
}) => {
  const stageRef = useRef<any>(null);
  const [designerState, setDesignerState] = useState<DesignerState>({
    selectedElement: null,
    zoom: 1,
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    canvasSize: {
      width: 800,
      height: 600,
    },
  });

  const [elements, setElements] = useState<CertificateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CertificateElement | null>(null);

  // Element creation functions
  const addTextElement = useCallback(() => {
    const newElement: CertificateElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      rotation: 0,
      zIndex: elements.length,
      properties: {
        text: 'ข้อความใหม่',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
      },
    };
    setElements(prev => [...prev, newElement]);
  }, [elements.length]);

  const addImageElement = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newElement: CertificateElement = {
            id: `image_${Date.now()}`,
            type: 'image',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            rotation: 0,
            zIndex: elements.length,
            properties: {
              src: event.target?.result as string,
              opacity: 1,
            },
          };
          setElements(prev => [...prev, newElement]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [elements.length]);

  const addShapeElement = useCallback((shapeType: 'rectangle' | 'circle') => {
    const newElement: CertificateElement = {
      id: `${shapeType}_${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: shapeType === 'circle' ? 100 : 200,
      height: shapeType === 'circle' ? 100 : 150,
      rotation: 0,
      zIndex: elements.length,
      properties: {
        fill: '#3f51b5',
        stroke: '#000000',
        strokeWidth: 2,
      },
    };
    setElements(prev => [...prev, newElement]);
  }, [elements.length]);

  // Element manipulation functions
  const handleElementSelect = useCallback((element: CertificateElement) => {
    setSelectedElement(element);
    setDesignerState(prev => ({
      ...prev,
      selectedElement: element.id,
    }));
  }, []);

  const handleElementUpdate = useCallback((id: string, updates: Partial<CertificateElement>) => {
    setElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedElement]);

  const handleElementDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(element => element.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
      setDesignerState(prev => ({ ...prev, selectedElement: null }));
    }
  }, [selectedElement]);

  // Canvas functions
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedElement(null);
      setDesignerState(prev => ({ ...prev, selectedElement: null }));
    }
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setDesignerState(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(prev.zoom * 1.2, 3) 
        : Math.max(prev.zoom / 1.2, 0.3),
    }));
  }, []);

  const handleSave = useCallback(() => {
    const designData = {
      width: designerState.canvasSize.width,
      height: designerState.canvasSize.height,
      elements,
    };
    onSave?.(designData);
  }, [designerState.canvasSize, elements, onSave]);

  const handleExport = useCallback(() => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'certificate.png';
      link.href = dataURL;
      link.click();
    }
  }, []);

  // Render element on canvas
  const renderElement = useCallback((element: CertificateElement) => {
    const isSelected = selectedElement?.id === element.id;
    const commonProps = {
      key: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation || 0,
      draggable: true,
      onClick: () => handleElementSelect(element),
      onDragEnd: (e: any) => {
        handleElementUpdate(element.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      },
      stroke: isSelected ? '#0066cc' : undefined,
      strokeWidth: isSelected ? 2 : undefined,
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={element.properties.text || ''}
            fontSize={element.properties.fontSize || 24}
            fontFamily={element.properties.fontFamily || 'Arial'}
            fontStyle={element.properties.fontWeight || 'normal'}
            fill={element.properties.color || '#000000'}
            align={element.properties.textAlign || 'left'}
            width={element.width}
          />
        );

      case 'shape':
        if (element.width === element.height) {
          return (
            <Circle
              {...commonProps}
              radius={element.width / 2}
              fill={element.properties.fill || '#3f51b5'}
              stroke={element.properties.stroke || '#000000'}
              strokeWidth={element.properties.strokeWidth || 2}
            />
          );
        } else {
          return (
            <Rect
              {...commonProps}
              width={element.width}
              height={element.height}
              fill={element.properties.fill || '#3f51b5'}
              stroke={element.properties.stroke || '#000000'}
              strokeWidth={element.properties.strokeWidth || 2}
            />
          );
        }

      default:
        return null;
    }
  }, [selectedElement, handleElementSelect, handleElementUpdate]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Toolbar */}
      <Paper elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ออกแบบเกียรติบัตร
          </Typography>
          
          <IconButton onClick={() => handleZoom('out')}>
            <ZoomOut />
          </IconButton>
          <Typography variant="body2" sx={{ mx: 1 }}>
            {Math.round(designerState.zoom * 100)}%
          </Typography>
          <IconButton onClick={() => handleZoom('in')}>
            <ZoomIn />
          </IconButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <IconButton 
            color={designerState.showGrid ? 'primary' : 'default'}
            onClick={() => setDesignerState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
          >
            {designerState.showGrid ? <GridOn /> : <GridOff />}
          </IconButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          
          <Button startIcon={<Save />} onClick={handleSave}>
            บันทึก
          </Button>
          <Button startIcon={<Download />} onClick={handleExport}>
            ส่งออก
          </Button>
        </Toolbar>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Left Panel - Tools */}
        <Paper sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            เครื่องมือ
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<TextFields />}
              onClick={addTextElement}
              sx={{ flex: '1 1 45%' }}
            >
              ข้อความ
            </Button>
            <Button
              variant="outlined"
              startIcon={<Image />}
              onClick={addImageElement}
              sx={{ flex: '1 1 45%' }}
            >
              รูปภาพ
            </Button>
            <Button
              variant="outlined"
              startIcon={<Crop />}
              onClick={() => addShapeElement('rectangle')}
              sx={{ flex: '1 1 45%' }}
            >
              สี่เหลี่ยม
            </Button>
            <Button
              variant="outlined"
              startIcon={<Crop />}
              onClick={() => addShapeElement('circle')}
              sx={{ flex: '1 1 45%' }}
            >
              วงกลม
            </Button>
          </Box>

          {/* Element Properties */}
          {selectedElement && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  คุณสมบัติ
                </Typography>
                
                <TextField
                  fullWidth
                  label="X"
                  type="number"
                  value={selectedElement.x}
                  onChange={(e) => handleElementUpdate(selectedElement.id, { x: Number(e.target.value) })}
                  size="small"
                  sx={{ mb: 1 }}
                />
                
                <TextField
                  fullWidth
                  label="Y"
                  type="number"
                  value={selectedElement.y}
                  onChange={(e) => handleElementUpdate(selectedElement.id, { y: Number(e.target.value) })}
                  size="small"
                  sx={{ mb: 1 }}
                />

                {selectedElement.type === 'text' && (
                  <>
                    <TextField
                      fullWidth
                      label="ข้อความ"
                      value={selectedElement.properties.text || ''}
                      onChange={(e) => handleElementUpdate(selectedElement.id, {
                        properties: { ...selectedElement.properties, text: e.target.value }
                      })}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="ขนาดตัวอักษร"
                      type="number"
                      value={selectedElement.properties.fontSize || 24}
                      onChange={(e) => handleElementUpdate(selectedElement.id, {
                        properties: { ...selectedElement.properties, fontSize: Number(e.target.value) }
                      })}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleElementDelete(selectedElement.id)}
                  sx={{ mt: 2 }}
                >
                  ลบ
                </Button>
              </CardContent>
            </Card>
          )}
        </Paper>

        {/* Main Canvas Area */}
        <Box sx={{ flex: 1, p: 2, backgroundColor: '#f5f5f5' }}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Stage
              ref={stageRef}
              width={designerState.canvasSize.width * designerState.zoom}
              height={designerState.canvasSize.height * designerState.zoom}
              scaleX={designerState.zoom}
              scaleY={designerState.zoom}
              onClick={handleStageClick}
            >
              <Layer>
                {/* Background */}
                <Rect
                  x={0}
                  y={0}
                  width={designerState.canvasSize.width}
                  height={designerState.canvasSize.height}
                  fill="white"
                  stroke="#ddd"
                  strokeWidth={1}
                />
                
                {/* Grid */}
                {designerState.showGrid && (
                  <>
                    {Array.from({ length: Math.ceil(designerState.canvasSize.width / designerState.gridSize) }, (_, i) => (
                      <Rect
                        key={`grid-v-${i}`}
                        x={i * designerState.gridSize}
                        y={0}
                        width={1}
                        height={designerState.canvasSize.height}
                        fill="#eee"
                      />
                    ))}
                    {Array.from({ length: Math.ceil(designerState.canvasSize.height / designerState.gridSize) }, (_, i) => (
                      <Rect
                        key={`grid-h-${i}`}
                        x={0}
                        y={i * designerState.gridSize}
                        width={designerState.canvasSize.width}
                        height={1}
                        fill="#eee"
                      />
                    ))}
                  </>
                )}
                
                {/* Elements */}
                {elements.map(renderElement)}
              </Layer>
            </Stage>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CertificateDesigner;
