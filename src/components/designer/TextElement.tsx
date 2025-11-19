import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import Konva from 'konva';

// Use generic any type to accept TemplateVariableElement
interface TextElementProps {
  element: any; // Accept TemplateVariableElement
  isSelected: boolean;
  isPreviewMode: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onContextMenu: (id: string, x: number, y: number) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  element,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete,
  onDoubleClick,
  onContextMenu,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer to selected element
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: any) => {
    onUpdate(element.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransform = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Update immediately during transform to prevent visual lag
    onUpdate(element.id, {
      width: Math.max(50, element.width * scaleX),
      height: Math.max(20, element.height * scaleY),
    });

    // Reset scale to 1
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    onUpdate(element.id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    });
  };

  const displayText = element.displayText || element.content || element.properties?.placeholder || 'Text';

  return (
    <>
      <Group
        ref={groupRef}
        id={element.id}
        x={element.x}
        y={element.y}
        rotation={element.rotation || 0}
        opacity={element.opacity || 1}
        draggable={!isPreviewMode && !element.locked}
        onClick={() => !isPreviewMode && onSelect(element.id)}
        onTap={() => !isPreviewMode && onSelect(element.id)}
        onDblClick={() => !isPreviewMode && onDoubleClick(element.id)}
        onDblTap={() => !isPreviewMode && onDoubleClick(element.id)}
        onDragEnd={handleDragEnd}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
        onContextMenu={(e) => {
          if (!isPreviewMode) {
            e.evt.preventDefault();
            e.evt.stopPropagation();

            onSelect(element.id);

            const stage = e.target.getStage();
            if (!stage) return;

            const pointerPosition = stage.getPointerPosition();
            if (!pointerPosition) return;

            const stageBox = stage.container().getBoundingClientRect();
            const menuX = stageBox.left + pointerPosition.x;
            const menuY = stageBox.top + pointerPosition.y;

            onContextMenu(element.id, menuX, menuY);
          }
        }}
      >
        {/* Background */}
        <Rect
          width={element.width}
          height={element.height}
          fill={element.properties?.backgroundColor || 'transparent'}
          stroke={isPreviewMode ? 'transparent' : '#ddd'}
          strokeWidth={1}
          dash={isPreviewMode ? [] : [5, 5]}
        />

        {/* Text */}
        <Text
          ref={textRef}
          text={displayText}
          fontSize={element.properties?.fontSize || 16}
          fontFamily={element.properties?.fontFamily || 'Arial'}
          fill={element.properties?.color || '#000000'}
          align={element.properties?.textAlign || 'left'}
          verticalAlign={element.properties?.verticalAlign || 'top'}
          width={element.width}
          height={element.height}
          padding={element.properties?.padding?.left || 0}
          fontStyle={element.properties?.fontStyle || 'normal'}
          fontVariant={element.properties?.fontWeight || 'normal'}
          textDecoration={element.properties?.textDecoration || ''}
          shadowColor={element.properties?.shadow?.color}
          shadowBlur={element.properties?.shadow?.blur}
          shadowOffsetX={element.properties?.shadow?.offsetX}
          shadowOffsetY={element.properties?.shadow?.offsetY}
          shadowOpacity={element.properties?.shadow ? 1 : 0}
        />
      </Group>

      {/* Transformer for resize/rotate */}
      {isSelected && !isPreviewMode && (
        <Transformer
          ref={transformerRef}
          flipEnabled={false}
          rotateEnabled={true}
          borderEnabled={true}
          borderStroke="#1976d2"
          borderStrokeWidth={2}
          anchorFill="#1976d2"
          anchorStroke="#ffffff"
          anchorStrokeWidth={2}
          anchorSize={10}
          anchorCornerRadius={5}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};
