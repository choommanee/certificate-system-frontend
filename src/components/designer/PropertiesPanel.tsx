// Properties Panel - Edit selected element properties

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,

  IconButton,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Palette,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Delete,
  FileCopy,
} from '@mui/icons-material';
import { 
  DesignerElement, 
  TextElement, 
  ImageElement, 
  ShapeElement, 
  SignatureElement 
} from '../../types/designer';

interface PropertiesPanelProps {
  selectedElements: DesignerElement[];
  onUpdateElement: (elementId: string, updates: Partial<DesignerElement>) => void;
  onDeleteElements: (elementIds: string[]) => void;
  onDuplicateElements: (elementIds: string[]) => void;
}

const FONT_FAMILIES = [
  'Sarabun',
  'Inter',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Tahoma',
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'ปกติ' },
  { value: 'bold', label: 'หนา' },
  { value: '100', label: 'บาง' },
  { value: '300', label: 'เบา' },
  { value: '500', label: 'กลาง' },
  { value: '700', label: 'หนา' },
  { value: '900', label: 'หนามาก' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  onUpdateElement,
  onDeleteElements,
  onDuplicateElements,
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [activeColorProperty, setActiveColorProperty] = useState<string>('');

  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const multipleSelected = selectedElements.length > 1;

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedElement) {
      if (property.startsWith('properties.')) {
        const propertyPath = property.replace('properties.', '');
        onUpdateElement(selectedElement.id, {
          properties: {
            ...selectedElement.properties,
            [propertyPath]: value,
          },
        });
      } else {
        onUpdateElement(selectedElement.id, { [property]: value });
      }
    }
  };

  const handleNestedPropertyChange = (parentProperty: string, childProperty: string, value: any) => {
    if (selectedElement && selectedElement.properties) {
      const currentParent = (selectedElement.properties as any)[parentProperty] || {};
      onUpdateElement(selectedElement.id, {
        properties: {
          ...selectedElement.properties,
          [parentProperty]: {
            ...currentParent,
            [childProperty]: value,
          },
        },
      });
    }
  };

  const renderBasicProperties = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          คุณสมบัติทั่วไป
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="ชื่อ"
              size="small"
              value={selectedElement?.name || ''}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 6' }}>
            <TextField
              fullWidth
              label="X"
              type="number"
              size="small"
              value={selectedElement?.x || 0}
              onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 6' }}>
            <TextField
              fullWidth
              label="Y"
              type="number"
              size="small"
              value={selectedElement?.y || 0}
              onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 6' }}>
            <TextField
              fullWidth
              label="ความกว้าง"
              type="number"
              size="small"
              value={selectedElement?.width || 0}
              onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 6' }}>
            <TextField
              fullWidth
              label="ความสูง"
              type="number"
              size="small"
              value={selectedElement?.height || 0}
              onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 12' }}>
            <Typography variant="body2" gutterBottom>
              การหมุน: {selectedElement?.rotation || 0}°
            </Typography>
            <Slider
              value={selectedElement?.rotation || 0}
              onChange={(_, value) => handlePropertyChange('rotation', value)}
              min={-180}
              max={180}
              step={1}
              marks={[
                { value: -180, label: '-180°' },
                { value: 0, label: '0°' },
                { value: 180, label: '180°' },
              ]}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 12' }}>
            <Typography variant="body2" gutterBottom>
              ความโปร่งใส: {Math.round((selectedElement?.opacity || 1) * 100)}%
            </Typography>
            <Slider
              value={selectedElement?.opacity || 1}
              onChange={(_, value) => handlePropertyChange('opacity', value)}
              min={0}
              max={1}
              step={0.01}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
              ]}
            />
          </Box>
          
          <Box sx={{ gridColumn: 'span 12' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement?.visible !== false}
                  onChange={(e) => handlePropertyChange('visible', e.target.checked)}
                />
              }
              label="แสดง"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement?.locked === true}
                  onChange={(e) => handlePropertyChange('locked', e.target.checked)}
                />
              }
              label="ล็อค"
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  const renderTextProperties = () => {
    const textElement = selectedElement as TextElement;
    if (!textElement || textElement.type !== 'text') return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            คุณสมบัติข้อความ
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="ข้อความ"
                multiline
                rows={3}
                size="small"
                value={textElement.properties.text}
                onChange={(e) => handlePropertyChange('properties.text', e.target.value)}
              />
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormControl fullWidth size="small">
                <InputLabel>แบบอักษร</InputLabel>
                <Select
                  value={textElement.properties.fontFamily}
                  onChange={(e) => handlePropertyChange('properties.fontFamily', e.target.value)}
                  label="แบบอักษร"
                >
                  {FONT_FAMILIES.map((font) => (
                    <MenuItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: 'span 6' }}>
              <TextField
                fullWidth
                label="ขนาดอักษร"
                type="number"
                size="small"
                value={textElement.properties.fontSize}
                onChange={(e) => handlePropertyChange('properties.fontSize', Number(e.target.value))}
                inputProps={{ min: 8, max: 200 }}
              />
            </Box>
            
            <Box sx={{ gridColumn: 'span 6' }}>
              <FormControl fullWidth size="small">
                <InputLabel>น้ำหนัก</InputLabel>
                <Select
                  value={textElement.properties.fontWeight}
                  onChange={(e) => handlePropertyChange('properties.fontWeight', e.target.value)}
                  label="น้ำหนัก"
                >
                  {FONT_WEIGHTS.map((weight) => (
                    <MenuItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <IconButton
                  size="small"
                  color={textElement.properties.fontStyle === 'italic' ? 'primary' : 'default'}
                  onClick={() => handlePropertyChange('properties.fontStyle', 
                    textElement.properties.fontStyle === 'italic' ? 'normal' : 'italic'
                  )}
                >
                  <FormatItalic />
                </IconButton>
                
                <IconButton
                  size="small"
                  color={textElement.properties.textDecoration === 'underline' ? 'primary' : 'default'}
                  onClick={() => handlePropertyChange('properties.textDecoration', 
                    textElement.properties.textDecoration === 'underline' ? 'none' : 'underline'
                  )}
                >
                  <FormatUnderlined />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  color={textElement.properties.textAlign === 'left' ? 'primary' : 'default'}
                  onClick={() => handlePropertyChange('properties.textAlign', 'left')}
                >
                  <FormatAlignLeft />
                </IconButton>
                
                <IconButton
                  size="small"
                  color={textElement.properties.textAlign === 'center' ? 'primary' : 'default'}
                  onClick={() => handlePropertyChange('properties.textAlign', 'center')}
                >
                  <FormatAlignCenter />
                </IconButton>
                
                <IconButton
                  size="small"
                  color={textElement.properties.textAlign === 'right' ? 'primary' : 'default'}
                  onClick={() => handlePropertyChange('properties.textAlign', 'right')}
                >
                  <FormatAlignRight />
                </IconButton>
                
                <IconButton
                  size="small"
                  color={textElement.properties.textAlign === 'justify' ? 'primary' : 'default'}
                  onClick={() => handlePropertyChange('properties.textAlign', 'justify')}
                >
                  <FormatAlignJustify />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">สีข้อความ:</Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: textElement.properties.color,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setActiveColorProperty('properties.color');
                    setColorPickerOpen(true);
                  }}
                />
                <TextField
                  size="small"
                  value={textElement.properties.color}
                  onChange={(e) => handlePropertyChange('properties.color', e.target.value)}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="body2" gutterBottom>
                ระยะห่างบรรทัด: {textElement.properties.lineHeight}
              </Typography>
              <Slider
                value={textElement.properties.lineHeight}
                onChange={(_, value) => handlePropertyChange('properties.lineHeight', value)}
                min={0.5}
                max={3}
                step={0.1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 1.5, label: '1.5' },
                  { value: 2, label: '2' },
                ]}
              />
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="body2" gutterBottom>
                ระยะห่างตัวอักษร: {textElement.properties.letterSpacing}px
              </Typography>
              <Slider
                value={textElement.properties.letterSpacing}
                onChange={(_, value) => handlePropertyChange('properties.letterSpacing', value)}
                min={-5}
                max={20}
                step={0.5}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                ]}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderImageProperties = () => {
    const imageElement = selectedElement as ImageElement;
    if (!imageElement || imageElement.type !== 'image') return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            คุณสมบัติรูปภาพ
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="URL รูปภาพ"
                size="small"
                value={imageElement.properties.src}
                onChange={(e) => handlePropertyChange('properties.src', e.target.value)}
              />
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="body2" gutterBottom>
                มุมโค้ง: {imageElement.properties.borderRadius}px
              </Typography>
              <Slider
                value={imageElement.properties.borderRadius}
                onChange={(_, value) => handlePropertyChange('properties.borderRadius', value)}
                min={0}
                max={50}
                step={1}
              />
            </Box>
            
            {imageElement.properties.filters && (
              <>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="body2" gutterBottom>
                    ความสว่าง: {imageElement.properties.filters.brightness}%
                  </Typography>
                  <Slider
                    value={imageElement.properties.filters.brightness}
                    onChange={(_, value) => handleNestedPropertyChange('filters', 'brightness', value)}
                    min={0}
                    max={200}
                    step={5}
                  />
                </Box>
                
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="body2" gutterBottom>
                    ความคมชัด: {imageElement.properties.filters.contrast}%
                  </Typography>
                  <Slider
                    value={imageElement.properties.filters.contrast}
                    onChange={(_, value) => handleNestedPropertyChange('filters', 'contrast', value)}
                    min={0}
                    max={200}
                    step={5}
                  />
                </Box>
                
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="body2" gutterBottom>
                    ความอิ่มตัวสี: {imageElement.properties.filters.saturation}%
                  </Typography>
                  <Slider
                    value={imageElement.properties.filters.saturation}
                    onChange={(_, value) => handleNestedPropertyChange('filters', 'saturation', value)}
                    min={0}
                    max={200}
                    step={5}
                  />
                </Box>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderShapeProperties = () => {
    const shapeElement = selectedElement as ShapeElement;
    if (!shapeElement || shapeElement.type !== 'shape') return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            คุณสมบัติรูปทรง
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">สีเติม:</Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: shapeElement.properties.fill,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setActiveColorProperty('properties.fill');
                    setColorPickerOpen(true);
                  }}
                />
                <TextField
                  size="small"
                  value={shapeElement.properties.fill}
                  onChange={(e) => handlePropertyChange('properties.fill', e.target.value)}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
            
            {shapeElement.properties.stroke && (
              <>
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">สีเส้นขอบ:</Typography>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: shapeElement.properties.stroke,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setActiveColorProperty('properties.stroke');
                        setColorPickerOpen(true);
                      }}
                    />
                    <TextField
                      size="small"
                      value={shapeElement.properties.stroke}
                      onChange={(e) => handlePropertyChange('properties.stroke', e.target.value)}
                      sx={{ width: 100 }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="body2" gutterBottom>
                    ความหนาเส้นขอบ: {shapeElement.properties.strokeWidth}px
                  </Typography>
                  <Slider
                    value={shapeElement.properties.strokeWidth}
                    onChange={(_, value) => handlePropertyChange('properties.strokeWidth', value)}
                    min={0}
                    max={20}
                    step={1}
                  />
                </Box>
              </>
            )}
            
            {shapeElement.properties.borderRadius !== undefined && (
              <Box sx={{ gridColumn: 'span 12' }}>
                <Typography variant="body2" gutterBottom>
                  มุมโค้ง: {shapeElement.properties.borderRadius}px
                </Typography>
                <Slider
                  value={shapeElement.properties.borderRadius}
                  onChange={(_, value) => handlePropertyChange('properties.borderRadius', value)}
                  min={0}
                  max={50}
                  step={1}
                />
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSignatureProperties = () => {
    const signatureElement = selectedElement as SignatureElement;
    if (!signatureElement || signatureElement.type !== 'signature') return null;

    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            คุณสมบัติลายเซ็น
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="ข้อความแสดง"
                size="small"
                value={signatureElement.properties.placeholder}
                onChange={(e) => handlePropertyChange('properties.placeholder', e.target.value)}
              />
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={signatureElement.properties.required}
                    onChange={(e) => handlePropertyChange('properties.required', e.target.checked)}
                  />
                }
                label="จำเป็นต้องลงลายเซ็น"
              />
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormControl fullWidth size="small">
                <InputLabel>รูปแบบเส้นขอบ</InputLabel>
                <Select
                  value={signatureElement.properties.borderStyle}
                  onChange={(e) => handlePropertyChange('properties.borderStyle', e.target.value)}
                  label="รูปแบบเส้นขอบ"
                >
                  <MenuItem value="solid">เส้นทึบ</MenuItem>
                  <MenuItem value="dashed">เส้นประ</MenuItem>
                  <MenuItem value="dotted">เส้นจุด</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">สีเส้นขอบ:</Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: signatureElement.properties.borderColor,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setActiveColorProperty('properties.borderColor');
                    setColorPickerOpen(true);
                  }}
                />
                <TextField
                  size="small"
                  value={signatureElement.properties.borderColor}
                  onChange={(e) => handlePropertyChange('properties.borderColor', e.target.value)}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
            
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="body2" gutterBottom>
                ความหนาเส้นขอบ: {signatureElement.properties.borderWidth}px
              </Typography>
              <Slider
                value={signatureElement.properties.borderWidth}
                onChange={(_, value) => handlePropertyChange('properties.borderWidth', value)}
                min={1}
                max={10}
                step={1}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderActions = () => (
    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FileCopy />}
          onClick={() => onDuplicateElements(selectedElements.map(el => el.id))}
          disabled={selectedElements.length === 0}
          size="small"
        >
          คัดลอก
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => onDeleteElements(selectedElements.map(el => el.id))}
          disabled={selectedElements.length === 0}
          size="small"
        >
          ลบ
        </Button>
      </Box>
    </Box>
  );

  if (selectedElements.length === 0) {
    return (
      <Paper
        sx={{
          width: 320,
          height: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', color: '#666' }}>
          <Typography variant="body2">
            เลือก element เพื่อแก้ไขคุณสมบัติ
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        width: 320,
        height: '100vh',
        borderRadius: 0,
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          คุณสมบัติ
        </Typography>
        {multipleSelected && (
          <Chip
            label={`เลือก ${selectedElements.length} รายการ`}
            size="small"
            color="primary"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Properties */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {multipleSelected ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              เลือกหลาย element - แสดงเฉพาะคุณสมบัติทั่วไป
            </Alert>
          </Box>
        ) : (
          <>
            {renderBasicProperties()}
            {selectedElement?.type === 'text' && renderTextProperties()}
            {selectedElement?.type === 'image' && renderImageProperties()}
            {selectedElement?.type === 'shape' && renderShapeProperties()}
            {selectedElement?.type === 'signature' && renderSignatureProperties()}
          </>
        )}
      </Box>

      {/* Actions */}
      {renderActions()}
    </Paper>
  );
};
