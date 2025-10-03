// Image Element Component with Resize Handles and Context Menu
import React, { useState, useRef, useEffect } from 'react';
import { Group, Image, Rect, Circle } from 'react-konva';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<any>(null);

  // Load image
  React.useEffect(() => {
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

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    if (!isPreviewMode) {
      // Ensure the element is selected first
      onSelect(element.id);
      
      // Get mouse position for context menu
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      const stageBox = stage.container().getBoundingClientRect();
      
      // Calculate position relative to viewport
      const menuX = stageBox.left + pointerPosition.x;
      const menuY = stageBox.top + pointerPosition.y;
      
      console.log('Context menu triggered at:', { menuX, menuY, elementId: element.id });
      
      // Pass context menu event to parent
      onContextMenu(element.id, menuX, menuY);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    onUpdate(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  const handleTransformEnd = (e: any) => {
    const node = imageRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      // Reset scale and apply to width/height
      node.scaleX(1);
      node.scaleY(1);
      
      onUpdate(element.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation()
      });
    }
  };

  const resizeHandleSize = 8;
  const resizeHandles = isSelected && !isPreviewMode ? [
    // Corner handles
    { x: -resizeHandleSize/2, y: -resizeHandleSize/2, cursor: 'nw-resize', type: 'corner', position: 'nw' },
    { x: element.width - resizeHandleSize/2, y: -resizeHandleSize/2, cursor: 'ne-resize', type: 'corner', position: 'ne' },
    { x: element.width - resizeHandleSize/2, y: element.height - resizeHandleSize/2, cursor: 'se-resize', type: 'corner', position: 'se' },
    { x: -resizeHandleSize/2, y: element.height - resizeHandleSize/2, cursor: 'sw-resize', type: 'corner', position: 'sw' },
    // Edge handles
    { x: element.width / 2 - resizeHandleSize/2, y: -resizeHandleSize/2, cursor: 'n-resize', type: 'edge', position: 'n' },
    { x: element.width - resizeHandleSize/2, y: element.height / 2 - resizeHandleSize/2, cursor: 'e-resize', type: 'edge', position: 'e' },
    { x: element.width / 2 - resizeHandleSize/2, y: element.height - resizeHandleSize/2, cursor: 's-resize', type: 'edge', position: 's' },
    { x: -resizeHandleSize/2, y: element.height / 2 - resizeHandleSize/2, cursor: 'w-resize', type: 'edge', position: 'w' }
  ] : [];

  return (
    <>
      <Group
        id={element.id} // Add ID to Group for canvas reference
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible}
        draggable={!isPreviewMode && !element.locked}
        onClick={() => !isPreviewMode && onSelect(element.id)}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        ref={imageRef}
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

        {/* Selection border */}
        {isSelected && !isPreviewMode && (
          <Rect
            width={element.width}
            height={element.height}
            stroke="#1976d2"
            strokeWidth={2}
            dash={[5, 5]}
            listening={false}
          />
        )}

        {/* Resize handles */}
        {resizeHandles.map((handle, index) => (
          <Circle
            key={index}
            x={handle.x + resizeHandleSize/2}
            y={handle.y + resizeHandleSize/2}
            radius={resizeHandleSize / 2}
            fill="#1976d2"
            stroke="white"
            strokeWidth={1}
            draggable
            onMouseEnter={(e) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = handle.cursor;
              }
            }}
            onMouseLeave={(e) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = 'default';
              }
            }}
            onDragStart={(e) => {
              setIsResizing(true);
            }}
            onDragMove={(e) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = handle.cursor;
              }
              
              // Get current position relative to the image group
              const pos = e.target.position();
              const originalWidth = element.width;
              const originalHeight = element.height;
              const originalX = element.x;
              const originalY = element.y;
              
              let newWidth = originalWidth;
              let newHeight = originalHeight;
              let newElementX = originalX;
              let newElementY = originalY;
              
              // Calculate new dimensions based on handle position and type
              // Use more robust calculations to prevent negative or invalid values
              switch (handle.position) {
                case 'nw': // Top-left
                  const deltaXNW = pos.x - (handle.x + resizeHandleSize/2);
                  const deltaYNW = pos.y - (handle.y + resizeHandleSize/2);
                  newWidth = Math.max(20, originalWidth - deltaXNW);
                  newHeight = Math.max(20, originalHeight - deltaYNW);
                  newElementX = originalX + (originalWidth - newWidth);
                  newElementY = originalY + (originalHeight - newHeight);
                  break;
                case 'ne': // Top-right
                  const deltaXNE = pos.x - (handle.x + resizeHandleSize/2);
                  const deltaYNE = pos.y - (handle.y + resizeHandleSize/2);
                  newWidth = Math.max(20, originalWidth + deltaXNE);
                  newHeight = Math.max(20, originalHeight - deltaYNE);
                  newElementY = originalY + (originalHeight - newHeight);
                  break;
                case 'se': // Bottom-right
                  const deltaXSE = pos.x - (handle.x + resizeHandleSize/2);
                  const deltaYSE = pos.y - (handle.y + resizeHandleSize/2);
                  newWidth = Math.max(20, originalWidth + deltaXSE);
                  newHeight = Math.max(20, originalHeight + deltaYSE);
                  break;
                case 'sw': // Bottom-left
                  const deltaXSW = pos.x - (handle.x + resizeHandleSize/2);
                  const deltaYSW = pos.y - (handle.y + resizeHandleSize/2);
                  newWidth = Math.max(20, originalWidth - deltaXSW);
                  newHeight = Math.max(20, originalHeight + deltaYSW);
                  newElementX = originalX + (originalWidth - newWidth);
                  break;
                case 'n': // Top
                  const deltaYN = pos.y - (handle.y + resizeHandleSize/2);
                  newHeight = Math.max(20, originalHeight - deltaYN);
                  newElementY = originalY + (originalHeight - newHeight);
                  break;
                case 'e': // Right
                  const deltaXE = pos.x - (handle.x + resizeHandleSize/2);
                  newWidth = Math.max(20, originalWidth + deltaXE);
                  break;
                case 's': // Bottom
                  const deltaYS = pos.y - (handle.y + resizeHandleSize/2);
                  newHeight = Math.max(20, originalHeight + deltaYS);
                  break;
                case 'w': // Left
                  const deltaXW = pos.x - (handle.x + resizeHandleSize/2);
                  newWidth = Math.max(20, originalWidth - deltaXW);
                  newElementX = originalX + (originalWidth - newWidth);
                  break;
              }
              
              // Additional safety checks to prevent invalid values
              if (newWidth <= 0 || newHeight <= 0 || !isFinite(newWidth) || !isFinite(newHeight)) {
                return; // Skip update if dimensions are invalid
              }
              
              // Canvas bounds checking to prevent images from disappearing
              // Ensure image doesn't exceed canvas boundaries significantly
              const maxWidth = Math.max(canvasWidth * 2, 1600); // Allow some overflow but not too much
              const maxHeight = Math.max(canvasHeight * 2, 1200);
              
              // Also ensure the image position + size doesn't go completely off-canvas
              if (newElementX + newWidth < -newWidth * 0.8 || newElementX > canvasWidth + newWidth * 0.8 ||
                  newElementY + newHeight < -newHeight * 0.8 || newElementY > canvasHeight + newHeight * 0.8) {
                return; // Skip update if image would be mostly off-canvas
              }
              
              newWidth = Math.min(newWidth, maxWidth);
              newHeight = Math.min(newHeight, maxHeight);
              
              // Update element immediately for real-time feedback
              onUpdate(element.id, {
                x: newElementX,
                y: newElementY,
                width: newWidth,
                height: newHeight
              });
            }}
            onDragEnd={(e) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = 'default';
              }
              setIsResizing(false);
              
              // Reset handle position to its correct location
              e.target.position({
                x: handle.x + resizeHandleSize/2,
                y: handle.y + resizeHandleSize/2
              });
            }}
          />
        ))}
      </Group>


    </>
  );
};

export default ImageElement;
