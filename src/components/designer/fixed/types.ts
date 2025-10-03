// 🛠️ Step 1.3: Simple Template Data Structure
// Simplified data structure for fixed save/load system

export interface SimpleTemplateData {
  id: string;
  name: string;
  description?: string;
  category: string;
  canvas: {
    width: number;
    height: number;
    background: string;
  };
  elements: SimpleElement[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface SimpleElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr-code';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  properties: SimpleElementProperties;
}

export interface SimpleElementProperties {
  // Text properties
  text?: string;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  textDecoration?: string;
  verticalAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  
  // Image properties
  imageUrl?: string;
  imageAlt?: string;
  
  // Shape properties
  shapeType?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // QR Code properties
  qrCodeData?: string;
  
  // Data binding (for template variables)
  dataBinding?: {
    fieldPath: string;
    type: string;
    label: string;
  };
  
  // Layout
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface FixedDesignerProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
  onSave?: (template: SimpleTemplateData) => void;
  onExport?: (format: 'pdf' | 'png' | 'jpg', template: SimpleTemplateData) => void;
  isPreviewMode?: boolean;
  initialTemplate?: SimpleTemplateData;
}

export interface CanvasElementCallbacks {
  onElementDrag?: (elementId: string, newPosition: { x: number; y: number }) => void;
  onElementSelect?: (elementId: string) => void;
  onElementDoubleClick?: (elementId: string) => void;
  onElementTransform?: (elementId: string, newAttrs: any) => void;
}

// Helper functions for element creation
export const createTextElement = (x: number, y: number, text: string = 'New Text'): SimpleElement => {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    x,
    y,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
    properties: {
      text,
      placeholder: 'Click to edit text',
      fontSize: 16,
      fontFamily: 'Sarabun, Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textDecoration: 'none',
      verticalAlign: 'top',
      lineHeight: 1.2,
      letterSpacing: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    }
  };
};

export const createImageElement = (x: number, y: number, imageUrl: string): SimpleElement => {
  return {
    id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    x,
    y,
    width: 200,
    height: 150,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
    properties: {
      imageUrl,
      imageAlt: 'Image'
    }
  };
};

export const createShapeElement = (x: number, y: number, shapeType: string = 'rectangle'): SimpleElement => {
  return {
    id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'shape',
    x,
    y,
    width: 150,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
    properties: {
      shapeType,
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2
    }
  };
};

export const createQRCodeElement = (x: number, y: number, data: string = 'https://example.com'): SimpleElement => {
  return {
    id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'qr-code',
    x,
    y,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
    properties: {
      qrCodeData: data
    }
  };
};
