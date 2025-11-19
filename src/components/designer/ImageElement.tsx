// Image Element Component with Konva Transformer
import React, { useState, useRef, useEffect } from 'react';
import { Group, Image, Rect, Transformer } from 'react-konva';
import Konva from 'konva';

export interface ImageElementData {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  src: string;
  name?: string;
}

interface ImageElementProps {
  element: ImageElementData;
  isSelected: boolean;
  isPreviewMode: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ImageElementData>) => void;
  onDelete: (id: string) => void;
  onLayerChange: (id: string, action: 'front' | 'back' | 'forward' | 'backward') => void;
  onContextMenu: (elementId: string, x: number, y: number) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

const ImageElement: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete,
  onLayerChange,
  onContextMenu,
  canvasWidth = 800,
  canvasHeight = 600
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Load image
  useEffect(() => {
    if (element.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImage(img);
      };
      img.onerror = () => {
        console.error('Failed to load image:', element.src);
      };
      img.src = element.src;
    }
  }, [element.src]);

  // Attach transformer to selected element
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();

    if (!isPreviewMode) {
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
  };

  const handleDragEnd = (e: any) => {
    onUpdate(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  const handleTransform = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Update immediately during transform to prevent visual lag
    onUpdate(element.id, {
      width: Math.max(5, element.width * scaleX),
      height: Math.max(5, element.height * scaleY),
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
      rotation: node.rotation()
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        id={element.id}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible}
        draggable={!isPreviewMode && !element.locked}
        onClick={() => !isPreviewMode && onSelect(element.id)}
        onTap={() => !isPreviewMode && onSelect(element.id)}
        onContextMenu={handleContextMenu}
        onDragEnd={handleDragEnd}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
      >
        {/* Image */}
        {image && (
          <Image
            image={image}
            width={element.width}
            height={element.height}
            listening={!isPreviewMode}
          />
        )}

        {/* Placeholder if no image */}
        {!image && (
          <Rect
            width={element.width}
            height={element.height}
            fill="#f0f0f0"
            stroke="#ccc"
            strokeWidth={1}
            dash={[5, 5]}
          />
        )}

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
            'top-center',
            'bottom-center',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }

            // Limit maximum size to prevent going too far off canvas
            const maxWidth = canvasWidth * 2;
            const maxHeight = canvasHeight * 2;
            if (Math.abs(newBox.width) > maxWidth || Math.abs(newBox.height) > maxHeight) {
              return oldBox;
            }

            return newBox;
          }}
        />
      )}
    </>
  );
};

export default ImageElement;
