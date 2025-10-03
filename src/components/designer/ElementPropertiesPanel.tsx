// Element Properties Panel for Certificate Designer
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Grid,
  IconButton,
  Chip,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TextFields as TextIcon,
  Palette as PaletteIcon,
  AspectRatio as SizeIcon,
  RotateRight as RotateIcon,
  Opacity as OpacityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Layers as LayersIcon,
  Image as ImageIcon,
  BlurOn as ShadowIcon
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { TemplateVariableElement } from '../../types/certificate-template';
import { ImageElementData } from './ImageElement';
import FontPicker from './FontPicker';

interface ElementPropertiesPanelProps {
  element: TemplateVariableElement | ImageElementData;
  onUpdate: (updatedElement: TemplateVariableElement | ImageElementData) => void;
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  element,
  onUpdate
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);

  // Check if element is an image
  const isImageElement = (el: any): el is ImageElementData => {
    return el.type === 'image';
  };

  // Check if element is a text element
  const isTextElement = (el: any): el is TemplateVariableElement => {
    return el.type === 'template-variable';
  };

  const updateElement = (updates: any) => {
    onUpdate({ ...element, ...updates });
  };

  const updateProperties = (updates: Partial<TemplateVariableElement['properties']>) => {
    if ('properties' in element && isTextElement(element) && element.properties) {
      const updatedElement: TemplateVariableElement = {
        ...element,
        properties: { ...element.properties, ...updates }
      };
      onUpdate(updatedElement);
    }
  };

  // Early return if element or properties are undefined
  if (!element) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No element selected
        </Typography>
      </Box>
    );
  }

  // For text elements, ensure properties exist
  if (isTextElement(element) && !element.properties) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          Element properties are missing
        </Typography>
      </Box>
    );
  }

  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Extra Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' }
  ];

  return (
    <Box>
      {/* Element Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {isImageElement(element) ? (element.name || 'Image') : 
           (element.properties?.dataBinding?.label || 'Text Element')}
        </Typography>
        <Chip 
          label={isImageElement(element) ? 'image' : 
                 (element.properties?.dataBinding?.type || 'text')}
          size="small"
          color={isImageElement(element) ? 'warning' : 'primary'}
          variant="outlined"
        />
      </Box>

      {/* Content - Only for text elements */}
      {isTextElement(element) && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextIcon />
              <Typography variant="subtitle2">Content</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Placeholder Text"
                value={element.properties.placeholder}
                onChange={(e) => updateProperties({ placeholder: e.target.value })}
                size="small"
                fullWidth
              />
              
              {element.properties.prefix !== undefined && (
                <TextField
                  label="Prefix"
                  value={element.properties.prefix || ''}
                  onChange={(e) => updateProperties({ prefix: e.target.value })}
                  size="small"
                  fullWidth
                />
              )}
              
              {element.properties.suffix !== undefined && (
                <TextField
                  label="Suffix"
                  value={element.properties.suffix || ''}
                  onChange={(e) => updateProperties({ suffix: e.target.value })}
                  size="small"
                  fullWidth
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Image Properties - Only for image elements */}
      {isImageElement(element) && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon />
              <Typography variant="subtitle2">Image Properties</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={element.name || ''}
                onChange={(e) => updateElement({ name: e.target.value })}
                size="small"
                fullWidth
              />
              
              <TextField
                label="Image URL"
                value={element.src}
                onChange={(e) => updateElement({ src: e.target.value })}
                size="small"
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Appearance */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OpacityIcon />
            <Typography variant="subtitle2">Appearance</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Opacity */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Opacity: {Math.round(element.opacity * 100)}%
              </Typography>
              <Slider
                value={element.opacity}
                onChange={(e, value) => updateElement({ opacity: value as number })}
                min={0}
                max={1}
                step={0.01}
                size="small"
              />
            </Box>

            {/* Rotation */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Rotation: {element.rotation}°
              </Typography>
              <Slider
                value={element.rotation}
                onChange={(e, value) => updateElement({ rotation: value as number })}
                min={-180}
                max={180}
                size="small"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Layer Visibility */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LayersIcon />
            <Typography variant="subtitle2">Layer</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Visibility */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">Visible</Typography>
              <Switch
                checked={element.visible}
                onChange={(e) => updateElement({ visible: e.target.checked })}
                size="small"
              />
            </Box>

            {/* Z-Index */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Layer Order: {element.zIndex}
              </Typography>
              <Slider
                value={element.zIndex}
                onChange={(e, value) => updateElement({ zIndex: value as number })}
                min={0}
                max={100}
                size="small"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Typography - Only for text elements */}
      {isTextElement(element) && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextIcon />
              <Typography variant="subtitle2">Typography</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Font Family */}
              <Box>
                <Typography variant="body2" gutterBottom>Font Family</Typography>
                <FontPicker
                  selectedFont={element.properties.fontFamily}
                  onFontSelect={(fontFamily) => updateProperties({ fontFamily })}
                  maxHeight={200}
                />
              </Box>

              {/* Font Size */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Font Size: {element.properties.fontSize}px
                </Typography>
                <Slider
                  value={element.properties.fontSize}
                  onChange={(e, value) => updateProperties({ fontSize: value as number })}
                  min={8}
                  max={120}
                  size="small"
                />
              </Box>

              {/* Font Weight */}
              <FormControl size="small" fullWidth>
                <InputLabel>Font Weight</InputLabel>
                <Select
                  value={element.properties.fontWeight}
                  onChange={(e) => updateProperties({ fontWeight: e.target.value as any })}
                  label="Font Weight"
                >
                  {fontWeightOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Text Align */}
              <FormControl size="small" fullWidth>
                <InputLabel>Text Align</InputLabel>
                <Select
                  value={element.properties.textAlign}
                  onChange={(e) => updateProperties({ textAlign: e.target.value as any })}
                  label="Text Align"
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="justify">Justify</MenuItem>
                </Select>
              </FormControl>

              {/* Line Height */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Line Height: {element.properties.lineHeight}
                </Typography>
                <Slider
                  value={element.properties.lineHeight}
                  onChange={(e, value) => updateProperties({ lineHeight: value as number })}
                  min={0.8}
                  max={3}
                  step={0.1}
                  size="small"
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Colors - Only for text elements */}
      {isTextElement(element) && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon />
              <Typography variant="subtitle2">Colors</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Text Color */}
              <Box>
                <Typography variant="body2" gutterBottom>Text Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Paper
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: element.properties.color,
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <TextField
                    value={element.properties.color}
                    onChange={(e) => updateProperties({ color: e.target.value })}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
                {showColorPicker && (
                  <Box sx={{ mt: 1 }}>
                    <SketchPicker
                      color={element.properties.color}
                      onChange={(color) => updateProperties({ color: color.hex })}
                      width="100%"
                    />
                  </Box>
                )}
              </Box>

              {/* Background Color */}
              <Box>
                <Typography variant="body2" gutterBottom>Background Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Paper
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: element.properties.backgroundColor || 'transparent',
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
                  />
                  <TextField
                    value={element.properties.backgroundColor || ''}
                    onChange={(e) => updateProperties({ backgroundColor: e.target.value })}
                    size="small"
                    placeholder="transparent"
                    sx={{ flex: 1 }}
                  />
                </Box>
                {showBackgroundColorPicker && (
                  <Box sx={{ mt: 1 }}>
                    <SketchPicker
                      color={element.properties.backgroundColor || '#ffffff'}
                      onChange={(color) => updateProperties({ backgroundColor: color.hex })}
                      width="100%"
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Text Shadow - Only for text elements */}
      {isTextElement(element) && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>              <ShadowIcon />
              <Typography variant="subtitle2">Text Shadow</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Enable/Disable Shadow */}
              <FormControlLabel
                control={
                  <Switch
                    checked={!!element.properties.shadow}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateProperties({
                          shadow: {
                            color: '#000000',
                            blur: 2,
                            offsetX: 2,
                            offsetY: 2
                          }
                        });
                      } else {
                        updateProperties({ shadow: undefined });
                      }
                    }}
                  />
                }
                label="Enable Text Shadow"
              />

              {/* Shadow Controls */}
              {element.properties.shadow && (
                <>
                  {/* Shadow Color */}
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Shadow Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: element.properties.shadow.color,
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowShadowColorPicker(!showShadowColorPicker)}
                      />
                      <TextField
                        value={element.properties.shadow.color}
                        onChange={(e) => updateProperties({
                          shadow: { ...element.properties.shadow!, color: e.target.value }
                        })}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                    {showShadowColorPicker && (
                      <Box sx={{ mt: 1 }}>
                        <SketchPicker
                          color={element.properties.shadow.color}
                          onChange={(color) => updateProperties({
                            shadow: { ...element.properties.shadow!, color: color.hex }
                          })}
                          width="100%"
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Shadow Offset X */}
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Horizontal Offset: {element.properties.shadow.offsetX}px
                    </Typography>
                    <Slider
                      value={element.properties.shadow.offsetX}
                      onChange={(e, value) => updateProperties({
                        shadow: { ...element.properties.shadow!, offsetX: value as number }
                      })}
                      min={-20}
                      max={20}
                      size="small"
                    />
                  </Box>

                  {/* Shadow Offset Y */}
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Vertical Offset: {element.properties.shadow.offsetY}px
                    </Typography>
                    <Slider
                      value={element.properties.shadow.offsetY}
                      onChange={(e, value) => updateProperties({
                        shadow: { ...element.properties.shadow!, offsetY: value as number }
                      })}
                      min={-20}
                      max={20}
                      size="small"
                    />
                  </Box>

                  {/* Shadow Blur */}
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Blur Radius: {element.properties.shadow.blur}px
                    </Typography>
                    <Slider
                      value={element.properties.shadow.blur}
                      onChange={(e, value) => updateProperties({
                        shadow: { ...element.properties.shadow!, blur: value as number }
                      })}
                      min={0}
                      max={20}
                      size="small"
                    />
                  </Box>

                  {/* Shadow Presets */}
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Shadow Presets
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateProperties({
                          shadow: { color: '#000000', blur: 2, offsetX: 2, offsetY: 2 }
                        })}
                      >
                        Subtle
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateProperties({
                          shadow: { color: '#000000', blur: 4, offsetX: 4, offsetY: 4 }
                        })}
                      >
                        Medium
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateProperties({
                          shadow: { color: '#000000', blur: 8, offsetX: 6, offsetY: 6 }
                        })}
                      >
                        Strong
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateProperties({
                          shadow: { color: '#ffffff', blur: 2, offsetX: 1, offsetY: 1 }
                        })}
                      >
                        Glow
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Position & Size */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SizeIcon />
            <Typography variant="subtitle2">Position & Size</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Position */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <TextField
                label="X Position"
                type="number"
                value={Math.round(element.x || 0)}
                onChange={(e) => updateElement({ x: parseInt(e.target.value) || 0 })}
                size="small"
              />
              <TextField
                label="Y Position"
                type="number"
                value={Math.round(element.y || 0)}
                onChange={(e) => updateElement({ y: parseInt(e.target.value) || 0 })}
                size="small"
              />
            </Box>

            {/* Size */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <TextField
                label="Width"
                type="number"
                value={Math.round(element.width || 100)}
                onChange={(e) => updateElement({ width: parseInt(e.target.value) || 0 })}
                size="small"
              />
              <TextField
                label="Height"
                type="number"
                value={Math.round(element.height || 50)}
                onChange={(e) => updateElement({ height: parseInt(e.target.value) || 0 })}
                size="small"
              />
            </Box>

            {/* Rotation */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Rotation: {Math.round(element.rotation)}°
              </Typography>
              <Slider
                value={element.rotation}
                onChange={(e, value) => updateElement({ rotation: value as number })}
                min={-180}
                max={180}
                size="small"
              />
            </Box>

            {/* Opacity */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Opacity: {Math.round(element.opacity * 100)}%
              </Typography>
              <Slider
                value={element.opacity}
                onChange={(e, value) => updateElement({ opacity: value as number })}
                min={0}
                max={1}
                step={0.01}
                size="small"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Layer Controls */}
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Layer Controls</Typography>
          <IconButton
            onClick={() => updateElement({ visible: !element.visible })}
            color={element.visible ? 'primary' : 'default'}
          >
            {element.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ElementPropertiesPanel;
