// Canvas State Synchronization Utilities
// This module provides functions to keep canvas state in sync with React state

import Konva from 'konva';
import { SimpleElement, SimpleTemplateData } from './types';

export interface CanvasStateManager {
  syncCanvasToState: (stageRef: React.RefObject<Konva.Stage | null>) => SimpleElement[];
  syncStateToCanvas: (
    stageRef: React.RefObject<Konva.Stage | null>, 
    elements: SimpleElement[],
    callbacks?: CanvasElementCallbacks
  ) => void;
  clearCanvas: (stageRef: React.RefObject<Konva.Stage | null>) => void;
  addElementToCanvas: (
    stageRef: React.RefObject<Konva.Stage | null>,
    element: SimpleElement,
    callbacks?: CanvasElementCallbacks
  ) => void;
}

export interface CanvasElementCallbacks {
  onElementDrag?: (elementId: string, newPosition: { x: number; y: number }) => void;
  onElementSelect?: (elementId: string) => void;
  onElementDoubleClick?: (elementId: string) => void;
  onElementTransform?: (elementId: string, newAttrs: any) => void;
}

class CanvasStateManagerImpl implements CanvasStateManager {
  
  /**
   * Synchronize canvas elements to state array
   * This ensures the state reflects what's actually on the canvas
   */
  syncCanvasToState(stageRef: React.RefObject<Konva.Stage>): SimpleElement[] {
    const stage = stageRef.current;
    if (!stage) {
      console.warn('Stage ref is null, cannot sync canvas to state');
      return [];
    }

    const layer = stage.children[0] as Konva.Layer;
    if (!layer) {
      console.warn('No layer found in stage');
      return [];
    }

    const elements: SimpleElement[] = [];
    
    layer.children.forEach((child: Konva.Node) => {
      // Skip transformer and other non-element nodes
      if (child.name() === 'transformer' || !child.name().includes('element')) {
        return;
      }

      const element = this.konvaNodeToSimpleElement(child);
      if (element) {
        elements.push(element);
      }
    });

    console.log(`🔄 Synced ${elements.length} elements from canvas to state`);
    return elements;
  }

  /**
   * Synchronize state array to canvas elements
   * This rebuilds the canvas from state data
   */
  syncStateToCanvas(
    stageRef: React.RefObject<Konva.Stage>, 
    elements: SimpleElement[],
    callbacks?: CanvasElementCallbacks
  ): void {
    const stage = stageRef.current;
    if (!stage) {
      console.warn('Stage ref is null, cannot sync state to canvas');
      return;
    }

    // Clear existing elements
    this.clearCanvas(stageRef);

    // Add each element to canvas
    elements.forEach(element => {
      this.addElementToCanvas(stageRef, element, callbacks);
    });

    console.log(`🔄 Synced ${elements.length} elements from state to canvas`);
  }

  /**
   * Clear all elements from canvas
   */
  clearCanvas(stageRef: React.RefObject<Konva.Stage>): void {
    const stage = stageRef.current;
    if (!stage) return;

    const layer = stage.children[0] as Konva.Layer;
    if (!layer) return;

    // Remove all elements except transformer
    layer.children.forEach((child: Konva.Node) => {
      if (child.name() !== 'transformer') {
        child.destroy();
      }
    });

    layer.batchDraw();
    console.log('🧹 Canvas cleared');
  }

  /**
   * Add a single element to canvas
   */
  addElementToCanvas(
    stageRef: React.RefObject<Konva.Stage>,
    element: SimpleElement,
    callbacks?: CanvasElementCallbacks
  ): void {
    const stage = stageRef.current;
    if (!stage) return;

    const layer = stage.children[0] as Konva.Layer;
    if (!layer) return;

    let konvaNode: Konva.Node | null = null;

    switch (element.type) {
      case 'text':
        konvaNode = this.createTextNode(element, callbacks);
        break;
      case 'image':
        konvaNode = this.createImageNode(element, callbacks);
        break;
      case 'shape':
        konvaNode = this.createShapeNode(element, callbacks);
        break;
      case 'qr-code':
        konvaNode = this.createQRCodeNode(element, callbacks);
        break;
      default:
        console.warn(`Unknown element type: ${element.type}`);
        return;
    }

    if (konvaNode) {
      layer.add(konvaNode);
      layer.batchDraw();
    }
  }

  /**
   * Convert Konva node to SimpleElement
   */
  private konvaNodeToSimpleElement(node: Konva.Node): SimpleElement | null {
    const attrs = node.attrs;
    const elementData = attrs.elementData as any;
    
    if (!elementData) {
      console.warn('Node missing elementData:', node.name());
      return null;
    }

    const element: SimpleElement = {
      id: node.id(),
      type: elementData.type || 'text',
      x: node.x(),
      y: node.y(),
      width: node.width(),
      height: node.height(),
      rotation: node.rotation(),
      opacity: node.opacity(),
      visible: node.visible(),
      locked: elementData.locked || false,
      zIndex: node.zIndex(),
      properties: elementData.properties || {}
    };

    // Update properties based on current node state
    if (node instanceof Konva.Text) {
      element.properties.text = node.text();
      element.properties.fontSize = node.fontSize();
      element.properties.fontFamily = node.fontFamily();
      element.properties.color = node.fill();
      element.properties.textAlign = node.align();
    }

    return element;
  }

  /**
   * Create text node from element
   */
  private createTextNode(element: SimpleElement, callbacks?: CanvasElementCallbacks): Konva.Text {
    const textNode = new Konva.Text({
      id: element.id,
      name: 'text-element',
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      text: element.properties.text || element.properties.placeholder || 'Text',
      fontSize: element.properties.fontSize || 16,
      fontFamily: element.properties.fontFamily || 'Arial',
      fill: element.properties.color || '#000000',
      align: element.properties.textAlign || 'left',
      verticalAlign: element.properties.verticalAlign || 'top',
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible,
      draggable: !element.locked,
      // Store element data for synchronization
      elementData: element
    });

    // Add event listeners
    this.addElementEventListeners(textNode, callbacks);

    return textNode;
  }

  /**
   * Create image node from element
   */
  private createImageNode(element: SimpleElement, callbacks?: CanvasElementCallbacks): Konva.Image {
    const imageNode = new Konva.Image({
      id: element.id,
      name: 'image-element',
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible,
      draggable: !element.locked,
      elementData: element
    });

    // Load image
    if (element.properties.imageUrl) {
      const imageObj = new Image();
      imageObj.onload = () => {
        imageNode.image(imageObj);
        imageNode.getLayer()?.batchDraw();
      };
      imageObj.src = element.properties.imageUrl;
    }

    this.addElementEventListeners(imageNode, callbacks);
    return imageNode;
  }

  /**
   * Create shape node from element
   */
  private createShapeNode(element: SimpleElement, callbacks?: CanvasElementCallbacks): Konva.Shape {
    let shapeNode: Konva.Shape;

    switch (element.properties.shapeType) {
      case 'circle':
        shapeNode = new Konva.Circle({
          id: element.id,
          name: 'shape-element',
          x: element.x + element.width / 2,
          y: element.y + element.height / 2,
          radius: Math.min(element.width, element.height) / 2,
          fill: element.properties.fillColor || '#ffffff',
          stroke: element.properties.strokeColor || '#000000',
          strokeWidth: element.properties.strokeWidth || 1,
          rotation: element.rotation,
          opacity: element.opacity,
          visible: element.visible,
          draggable: !element.locked,
          elementData: element
        });
        break;
      
      default: // rectangle
        shapeNode = new Konva.Rect({
          id: element.id,
          name: 'shape-element',
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          fill: element.properties.fillColor || '#ffffff',
          stroke: element.properties.strokeColor || '#000000',
          strokeWidth: element.properties.strokeWidth || 1,
          rotation: element.rotation,
          opacity: element.opacity,
          visible: element.visible,
          draggable: !element.locked,
          elementData: element
        });
        break;
    }

    this.addElementEventListeners(shapeNode, callbacks);
    return shapeNode;
  }

  /**
   * Create QR code node from element
   */
  private createQRCodeNode(element: SimpleElement, callbacks?: CanvasElementCallbacks): Konva.Group {
    const group = new Konva.Group({
      id: element.id,
      name: 'qr-element',
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      opacity: element.opacity,
      visible: element.visible,
      draggable: !element.locked,
      elementData: element
    });

    // Add placeholder rectangle for QR code
    const rect = new Konva.Rect({
      width: element.width,
      height: element.height,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1
    });

    const text = new Konva.Text({
      width: element.width,
      height: element.height,
      text: 'QR Code',
      fontSize: Math.min(element.width, element.height) / 6,
      fontFamily: 'Arial',
      fill: '#666666',
      align: 'center',
      verticalAlign: 'middle'
    });

    group.add(rect, text);
    this.addElementEventListeners(group, callbacks);
    
    return group;
  }

  /**
   * Add common event listeners to elements
   */
  private addElementEventListeners(node: Konva.Node, callbacks?: CanvasElementCallbacks): void {
    if (!callbacks) return;

    // Drag events
    if (callbacks.onElementDrag) {
      node.on('dragend', (e) => {
        const target = e.target;
        callbacks.onElementDrag!(target.id(), { x: target.x(), y: target.y() });
      });
    }

    // Selection events
    if (callbacks.onElementSelect) {
      node.on('click tap', (e) => {
        callbacks.onElementSelect!(e.target.id());
      });
    }

    // Double click events
    if (callbacks.onElementDoubleClick) {
      node.on('dblclick', (e) => {
        callbacks.onElementDoubleClick!(e.target.id());
      });
    }

    // Transform events
    if (callbacks.onElementTransform) {
      node.on('transform', (e) => {
        const target = e.target;
        callbacks.onElementTransform!(target.id(), {
          x: target.x(),
          y: target.y(),
          width: target.width() * target.scaleX(),
          height: target.height() * target.scaleY(),
          rotation: target.rotation()
        });
      });
    }
  }

  /**
   * Update element on canvas
   */
  updateElementOnCanvas(
    stageRef: React.RefObject<Konva.Stage>,
    elementId: string,
    updates: Partial<SimpleElement>
  ): void {
    const stage = stageRef.current;
    if (!stage) return;

    const layer = stage.children[0] as Konva.Layer;
    if (!layer) return;

    const node = layer.findOne(`#${elementId}`);
    if (!node) return;

    // Update basic properties
    if (updates.x !== undefined) node.x(updates.x);
    if (updates.y !== undefined) node.y(updates.y);
    if (updates.width !== undefined) node.width(updates.width);
    if (updates.height !== undefined) node.height(updates.height);
    if (updates.rotation !== undefined) node.rotation(updates.rotation);
    if (updates.opacity !== undefined) node.opacity(updates.opacity);
    if (updates.visible !== undefined) node.visible(updates.visible);

    // Update element-specific properties
    if (node instanceof Konva.Text && updates.properties) {
      const props = updates.properties;
      if (props.text !== undefined) node.text(props.text);
      if (props.fontSize !== undefined) node.fontSize(props.fontSize);
      if (props.fontFamily !== undefined) node.fontFamily(props.fontFamily);
      if (props.color !== undefined) node.fill(props.color);
      if (props.textAlign !== undefined) node.align(props.textAlign);
    }

    // Update stored element data
    const currentElementData = node.attrs.elementData || {};
    node.attrs.elementData = { ...currentElementData, ...updates };

    layer.batchDraw();
  }

  /**
   * Get element from canvas by ID
   */
  getElementFromCanvas(stageRef: React.RefObject<Konva.Stage>, elementId: string): SimpleElement | null {
    const stage = stageRef.current;
    if (!stage) return null;

    const layer = stage.children[0] as Konva.Layer;
    if (!layer) return null;

    const node = layer.findOne(`#${elementId}`);
    if (!node) return null;

    return this.konvaNodeToSimpleElement(node);
  }
}

export const CanvasStateManager = new CanvasStateManagerImpl();
export default CanvasStateManager;
