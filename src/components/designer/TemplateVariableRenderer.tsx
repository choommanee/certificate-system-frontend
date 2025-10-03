// Template Variable Element Renderer

import React from 'react';
import { Text, Rect, Group } from 'react-konva';
import { TemplateVariableElement, CertificateData } from '../../types/certificate-template';
import DataBindingService from '../../services/dataBindingService';

interface TemplateVariableRendererProps {
  element: TemplateVariableElement;
  isSelected: boolean;
  isPreview?: boolean;
  certificateData?: CertificateData;
  onSelect?: () => void;
  onDragEnd?: (e: any) => void;
  onTransformEnd?: (e: any) => void;
}

const TemplateVariableRenderer: React.FC<TemplateVariableRendererProps> = ({
  element,
  isSelected,
  isPreview = false,
  certificateData,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  // Resolve the display text
  const displayText = React.useMemo(() => {
    if (isPreview && certificateData) {
      return DataBindingService.resolveTemplateVariable(element, certificateData);
    } else {
      // Show placeholder in design mode
      const { placeholder, dataBinding } = element.properties;
      return placeholder || `[${dataBinding.label}]`;
    }
  }, [element, isPreview, certificateData]);

  // Calculate text styling
  const textProps = {
    x: 0,
    y: 0,
    width: element.width,
    height: element.height,
    text: displayText,
    fontSize: element.properties.fontSize,
    fontFamily: element.properties.fontFamily,
    fontStyle: element.properties.fontStyle === 'italic' ? 'italic' : 'normal',
    fontVariant: element.properties.fontWeight === 'bold' ? 'bold' : 'normal',
    fill: element.properties.color,
    align: element.properties.textAlign,
    verticalAlign: element.properties.verticalAlign,
    lineHeight: element.properties.lineHeight,
    letterSpacing: element.properties.letterSpacing,
    padding: element.properties.padding.left,
    textDecoration: element.properties.textDecoration,
  };

  // Background styling
  const backgroundProps = {
    x: 0,
    y: 0,
    width: element.width,
    height: element.height,
    fill: element.properties.backgroundColor || 'transparent',
    stroke: isSelected && !isPreview ? '#1976d2' : (isPreview ? 'transparent' : '#ddd'),
    strokeWidth: isSelected && !isPreview ? 2 : (isPreview ? 0 : 1),
    strokeDashArray: isPreview ? [] : [5, 5],
    opacity: element.opacity,
  };

  // Shadow effect
  const shadowFilter = element.properties.shadow ? {
    shadowColor: element.properties.shadow.color,
    shadowBlur: element.properties.shadow.blur,
    shadowOffsetX: element.properties.shadow.offsetX,
    shadowOffsetY: element.properties.shadow.offsetY,
  } : {};

  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      visible={element.visible}
      draggable={!element.locked && !isPreview}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      {...shadowFilter}
    >
      {/* Background */}
      <Rect {...backgroundProps} />
      
      {/* Text Content */}
      <Text {...textProps} />
      
      {/* Data Binding Indicator (only in design mode) */}
      {!isPreview && (
        <Rect
          x={element.width - 20}
          y={0}
          width={20}
          height={20}
          fill="#2196f3"
          cornerRadius={3}
        />
      )}
      
      {!isPreview && (
        <Text
          x={element.width - 18}
          y={2}
          width={16}
          height={16}
          text="🔗"
          fontSize={12}
          fill="white"
          align="center"
          verticalAlign="middle"
        />
      )}
    </Group>
  );
};

export default TemplateVariableRenderer;
