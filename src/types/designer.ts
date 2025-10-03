// Enhanced Designer Types - Polotno-like Element System

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  name?: string;
}

export type ElementType = 
  | 'text' 
  | 'image' 
  | 'shape' 
  | 'signature'
  | 'qr-code'
  | 'barcode'
  | 'line'
  | 'arrow'
  | 'icon'
  | 'chart'
  | 'table';

export interface TextElement extends BaseElement {
  type: 'text';
  properties: {
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    verticalAlign: 'top' | 'middle' | 'bottom';
    lineHeight: number;
    letterSpacing: number;
    backgroundColor?: string;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  properties: {
    src: string;
    originalWidth: number;
    originalHeight: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    borderRadius: number;
    border?: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted';
    };
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    filters?: {
      brightness: number;
      contrast: number;
      saturation: number;
      blur: number;
      grayscale: number;
      sepia: number;
    };
  };
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  properties: {
    shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'star' | 'heart';
    fill: string;
    stroke?: string;
    strokeWidth: number;
    strokeDashArray?: number[];
    borderRadius?: number; // for rectangle
    sides?: number; // for polygon
    innerRadius?: number; // for star
    gradient?: {
      type: 'linear' | 'radial';
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
      angle?: number; // for linear gradient
    };
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
  };
}

export interface SignatureElement extends BaseElement {
  type: 'signature';
  properties: {
    userId?: string;
    signatureData?: string; // base64 image data
    placeholder: string;
    required: boolean;
    borderStyle: 'solid' | 'dashed' | 'dotted';
    borderColor: string;
    borderWidth: number;
    backgroundColor: string;
    signatureType: 'draw' | 'type' | 'upload' | 'saved';
    fontFamily?: string; // for typed signatures
    fontSize?: number; // for typed signatures
    signedAt?: string; // timestamp when signed
    signerInfo?: {
      name: string;
      email: string;
      ip?: string;
    };
  };
}

export interface QRCodeElement extends BaseElement {
  type: 'qr-code';
  properties: {
    data: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    foregroundColor: string;
    backgroundColor: string;
    margin: number;
    logoSrc?: string;
    logoSize?: number;
  };
}

export interface BarcodeElement extends BaseElement {
  type: 'barcode';
  properties: {
    data: string;
    format: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
    displayValue: boolean;
    fontSize: number;
    textAlign: 'left' | 'center' | 'right';
    textPosition: 'bottom' | 'top';
    textMargin: number;
    backgroundColor: string;
    lineColor: string;
  };
}

export interface LineElement extends BaseElement {
  type: 'line';
  properties: {
    points: number[]; // [x1, y1, x2, y2, ...]
    stroke: string;
    strokeWidth: number;
    strokeDashArray?: number[];
    lineCap: 'butt' | 'round' | 'square';
    lineJoin: 'miter' | 'round' | 'bevel';
  };
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  properties: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    stroke: string;
    strokeWidth: number;
    arrowheadSize: number;
    arrowheadType: 'triangle' | 'circle' | 'diamond';
    startArrow: boolean;
    endArrow: boolean;
  };
}

export interface IconElement extends BaseElement {
  type: 'icon';
  properties: {
    iconName: string;
    iconFamily: 'material' | 'fontawesome' | 'feather' | 'custom';
    color: string;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
  };
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  properties: {
    chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
    data: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
      }>;
    };
    options: {
      responsive: boolean;
      maintainAspectRatio: boolean;
      legend: {
        display: boolean;
        position: 'top' | 'bottom' | 'left' | 'right';
      };
      title: {
        display: boolean;
        text: string;
      };
    };
  };
}

export interface TableElement extends BaseElement {
  type: 'table';
  properties: {
    rows: number;
    columns: number;
    data: string[][];
    headerRow: boolean;
    headerColumn: boolean;
    cellPadding: number;
    borderWidth: number;
    borderColor: string;
    headerBackgroundColor: string;
    alternateRowColor?: string;
    fontSize: number;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'middle' | 'bottom';
  };
}

export type DesignerElement = 
  | TextElement 
  | ImageElement 
  | ShapeElement 
  | SignatureElement
  | QRCodeElement
  | BarcodeElement
  | LineElement
  | ArrowElement
  | IconElement
  | ChartElement
  | TableElement;

// Page and Document Types
export interface DesignerPage {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  elements: DesignerElement[];
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface DesignerDocument {
  id: string;
  name: string;
  description?: string;
  pages: DesignerPage[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: string;
    tags: string[];
  };
  settings: {
    unit: 'px' | 'mm' | 'cm' | 'in';
    dpi: number;
    colorProfile: 'RGB' | 'CMYK';
    bleed: number;
  };
}

// Designer State
export interface DesignerState {
  selectedElementIds: string[];
  currentPageId: string;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;
  guides: Array<{
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
  }>;
  clipboard: DesignerElement[];
  history: {
    past: DesignerDocument[];
    present: DesignerDocument;
    future: DesignerDocument[];
  };
  tool: 'select' | 'text' | 'image' | 'shape' | 'signature' | 'line' | 'arrow';
  isDrawing: boolean;
  previewMode: boolean;
}

// Tool Configuration
export interface ToolConfig {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'text' | 'media' | 'shapes' | 'interactive' | 'data';
  description: string;
  defaultProperties: Partial<DesignerElement['properties']>;
  allowedProperties: string[];
  minSize: { width: number; height: number };
  maxSize?: { width: number; height: number };
  maintainAspectRatio: boolean;
}

// Template Types
export interface DesignerTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  document: DesignerDocument;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

// Export Options
export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'svg';
  quality: number; // 0-1 for jpg, png
  dpi: number;
  pages: 'all' | 'current' | number[];
  includeBleed: boolean;
  colorProfile: 'RGB' | 'CMYK';
  compression: boolean;
}
