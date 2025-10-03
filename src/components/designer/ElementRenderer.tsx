// Element Renderer - Renders different element types on Konva Canvas

import React from 'react';
import { Group, Text, Rect, Circle, Image, Line, Arrow, RegularPolygon, Star } from 'react-konva';
import { 
  DesignerElement, 
  TextElement, 
  ImageElement, 
  ShapeElement, 
  SignatureElement,
  QRCodeElement,
  LineElement,
  ArrowElement 
} from '../../types/designer';
import { TemplateVariableElement, CertificateData } from '../../types/certificate-template';
import TemplateVariableRenderer from './TemplateVariableRenderer';

interface ElementRendererProps {
  element: DesignerElement | TemplateVariableElement;
  isSelected: boolean;
  isPreview?: boolean;
  certificateData?: CertificateData;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

// Text Element Renderer
export const TextElementRenderer: React.FC<{ element: TextElement } & Omit<ElementRendererProps, 'element'>> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e);
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onTransformEnd({
      ...e,
      target: {
        ...e.target,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      }
    });

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {/* Background */}
      {element.properties.backgroundColor && (
        <Rect
          width={element.width}
          height={element.height}
          fill={element.properties.backgroundColor}
          cornerRadius={0}
        />
      )}
      
      {/* Text */}
      <Text
        text={element.properties.text}
        fontSize={element.properties.fontSize}
        fontFamily={element.properties.fontFamily}
        fontStyle={`${element.properties.fontStyle} ${element.properties.fontWeight}`}
        textDecoration={element.properties.textDecoration}
        fill={element.properties.color}
        align={element.properties.textAlign}
        verticalAlign={element.properties.verticalAlign}
        lineHeight={element.properties.lineHeight}
        letterSpacing={element.properties.letterSpacing}
        width={element.width - element.properties.padding.left - element.properties.padding.right}
        height={element.height - element.properties.padding.top - element.properties.padding.bottom}
        x={element.properties.padding.left}
        y={element.properties.padding.top}
        shadowColor={element.properties.shadow?.color}
        shadowBlur={element.properties.shadow?.blur}
        shadowOffsetX={element.properties.shadow?.offsetX}
        shadowOffsetY={element.properties.shadow?.offsetY}
      />
      
      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#0066cc"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  );
};

// Image Element Renderer
export const ImageElementRenderer: React.FC<{ element: ImageElement } & Omit<ElementRendererProps, 'element'>> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (element.properties.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setImage(img);
      img.src = element.properties.src;
    }
  }, [element.properties.src]);

  const handleDragEnd = (e: any) => {
    onDragEnd(e);
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onTransformEnd({
      ...e,
      target: {
        ...e.target,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      }
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {image && (
        <Image
          image={image}
          width={element.width}
          height={element.height}
          crop={{
            x: element.properties.cropX,
            y: element.properties.cropY,
            width: element.properties.cropWidth,
            height: element.properties.cropHeight,
          }}
          cornerRadius={element.properties.borderRadius}
          shadowColor={element.properties.shadow?.color}
          shadowBlur={element.properties.shadow?.blur}
          shadowOffsetX={element.properties.shadow?.offsetX}
          shadowOffsetY={element.properties.shadow?.offsetY}
          filters={[
            // Apply filters based on element.properties.filters
          ]}
        />
      )}
      
      {/* Border */}
      {element.properties.border && (
        <Rect
          width={element.width}
          height={element.height}
          stroke={element.properties.border.color}
          strokeWidth={element.properties.border.width}
          dash={element.properties.border.style === 'dashed' ? [5, 5] : 
                element.properties.border.style === 'dotted' ? [2, 2] : []}
          fill="transparent"
          cornerRadius={element.properties.borderRadius}
        />
      )}
      
      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#0066cc"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  );
};

// Shape Element Renderer
export const ShapeElementRenderer: React.FC<{ element: ShapeElement } & Omit<ElementRendererProps, 'element'>> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e);
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onTransformEnd({
      ...e,
      target: {
        ...e.target,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      }
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  const renderShape = () => {
    const commonProps = {
      fill: element.properties.fill,
      stroke: element.properties.stroke,
      strokeWidth: element.properties.strokeWidth,
      dash: element.properties.strokeDashArray,
      shadowColor: element.properties.shadow?.color,
      shadowBlur: element.properties.shadow?.blur,
      shadowOffsetX: element.properties.shadow?.offsetX,
      shadowOffsetY: element.properties.shadow?.offsetY,
    };

    switch (element.properties.shapeType) {
      case 'rectangle':
        return (
          <Rect
            width={element.width}
            height={element.height}
            cornerRadius={element.properties.borderRadius || 0}
            {...commonProps}
          />
        );
      
      case 'circle':
        return (
          <Circle
            x={element.width / 2}
            y={element.height / 2}
            radius={Math.min(element.width, element.height) / 2}
            {...commonProps}
          />
        );
      
      case 'triangle':
        return (
          <RegularPolygon
            x={element.width / 2}
            y={element.height / 2}
            sides={3}
            radius={Math.min(element.width, element.height) / 2}
            {...commonProps}
          />
        );
      
      case 'polygon':
        return (
          <RegularPolygon
            x={element.width / 2}
            y={element.height / 2}
            sides={element.properties.sides || 6}
            radius={Math.min(element.width, element.height) / 2}
            {...commonProps}
          />
        );
      
      case 'star':
        return (
          <Star
            x={element.width / 2}
            y={element.height / 2}
            numPoints={5}
            innerRadius={Math.min(element.width, element.height) / 4 * (element.properties.innerRadius || 0.5)}
            outerRadius={Math.min(element.width, element.height) / 2}
            {...commonProps}
          />
        );
      
      default:
        return (
          <Rect
            width={element.width}
            height={element.height}
            {...commonProps}
          />
        );
    }
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {renderShape()}
      
      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#0066cc"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  );
};

// Signature Element Renderer
export const SignatureElementRenderer: React.FC<{ element: SignatureElement } & Omit<ElementRendererProps, 'element'>> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
}) => {
  const [signatureImage, setSignatureImage] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (element.properties.signatureData) {
      const img = new window.Image();
      img.onload = () => setSignatureImage(img);
      img.src = element.properties.signatureData;
    }
  }, [element.properties.signatureData]);

  const handleDragEnd = (e: any) => {
    onDragEnd(e);
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={handleDragEnd}
    >
      {/* Background */}
      <Rect
        width={element.width}
        height={element.height}
        fill={element.properties.backgroundColor}
        stroke={element.properties.borderColor}
        strokeWidth={element.properties.borderWidth}
        dash={element.properties.borderStyle === 'dashed' ? [5, 5] : 
              element.properties.borderStyle === 'dotted' ? [2, 2] : []}
      />
      
      {/* Signature Image or Placeholder */}
      {signatureImage ? (
        <Image
          image={signatureImage}
          width={element.width - 10}
          height={element.height - 10}
          x={5}
          y={5}
        />
      ) : (
        <Text
          text={element.properties.placeholder + (element.properties.required ? ' *' : '')}
          fontSize={element.properties.fontSize || 14}
          fontFamily={element.properties.fontFamily || 'Sarabun'}
          fill="#999999"
          align="center"
          verticalAlign="middle"
          width={element.width}
          height={element.height}
        />
      )}
      
      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#0066cc"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  );
};

// Line Element Renderer
export const LineElementRenderer: React.FC<{ element: LineElement } & Omit<ElementRendererProps, 'element'>> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e);
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={handleDragEnd}
    >
      <Line
        points={element.properties.points}
        stroke={element.properties.stroke}
        strokeWidth={element.properties.strokeWidth}
        dash={element.properties.strokeDashArray}
        lineCap={element.properties.lineCap}
        lineJoin={element.properties.lineJoin}
      />
      
      {/* Selection indicators */}
      {isSelected && (
        <>
          {/* Start point */}
          <Circle
            x={element.properties.points[0]}
            y={element.properties.points[1]}
            radius={4}
            fill="#0066cc"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {/* End point */}
          <Circle
            x={element.properties.points[2]}
            y={element.properties.points[3]}
            radius={4}
            fill="#0066cc"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </>
      )}
    </Group>
  );
};

// Arrow Element Renderer
export const ArrowElementRenderer: React.FC<{ element: ArrowElement } & Omit<ElementRendererProps, 'element'>> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e);
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={handleDragEnd}
    >
      <Arrow
        points={[
          element.properties.startX,
          element.properties.startY,
          element.properties.endX,
          element.properties.endY,
        ]}
        stroke={element.properties.stroke}
        strokeWidth={element.properties.strokeWidth}
        pointerLength={element.properties.arrowheadSize}
        pointerWidth={element.properties.arrowheadSize}
      />
      
      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#0066cc"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
    </Group>
  );
};

// Main Element Renderer Component
export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  isPreview = false,
  certificateData,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  switch (element.type) {
    case 'template-variable':
      return (
        <TemplateVariableRenderer
          element={element as TemplateVariableElement}
          isSelected={isSelected}
          isPreview={isPreview}
          certificateData={certificateData}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
      
    case 'text':
      return (
        <TextElementRenderer
          element={element as any}
          isSelected={isSelected}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    
    case 'image':
      return (
        <ImageElementRenderer
          element={element as ImageElement}
          isSelected={isSelected}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    
    case 'shape':
      return (
        <ShapeElementRenderer
          element={element as ShapeElement}
          isSelected={isSelected}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    
    case 'signature':
      return (
        <SignatureElementRenderer
          element={element as SignatureElement}
          isSelected={isSelected}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    
    case 'line':
      return (
        <LineElementRenderer
          element={element as LineElement}
          isSelected={isSelected}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    
    case 'arrow':
      return (
        <ArrowElementRenderer
          element={element as ArrowElement}
          isSelected={isSelected}
          onSelect={onSelect}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
        />
      );
    
    default:
      // Fallback for unsupported element types
      return (
        <Group
          x={element.x}
          y={element.y}
          onClick={() => onSelect()}
          onTap={() => onSelect()}
        >
          <Rect
            width={element.width}
            height={element.height}
            fill="#f0f0f0"
            stroke="#cccccc"
            strokeWidth={1}
          />
          <Text
            text={`Unsupported: ${element.type}`}
            fontSize={12}
            fill="#666666"
            align="center"
            verticalAlign="middle"
            width={element.width}
            height={element.height}
          />
        </Group>
      );
  }
};
