// Element Factory - Creates new elements with default properties

import { 
  DesignerElement, 
  TextElement, 
  ImageElement, 
  ShapeElement, 
  SignatureElement,
  QRCodeElement,
  BarcodeElement,
  LineElement,
  ArrowElement,
  IconElement,
  ChartElement,
  TableElement,
  ElementType 
} from '../../types/designer';

export class ElementFactory {
  private static generateId(): string {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createTextElement(x: number = 100, y: number = 100): TextElement {
    return {
      id: this.generateId(),
      type: 'text',
      x,
      y,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Text Element',
      properties: {
        text: 'ข้อความใหม่',
        fontSize: 24,
        fontFamily: 'Sarabun',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000',
        textAlign: 'left',
        verticalAlign: 'middle',
        lineHeight: 1.2,
        letterSpacing: 0,
        padding: {
          top: 8,
          right: 8,
          bottom: 8,
          left: 8,
        },
      },
    };
  }

  static createImageElement(x: number = 100, y: number = 100, src?: string): ImageElement {
    return {
      id: this.generateId(),
      type: 'image',
      x,
      y,
      width: 200,
      height: 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Image Element',
      properties: {
        src: src || '',
        originalWidth: 200,
        originalHeight: 150,
        cropX: 0,
        cropY: 0,
        cropWidth: 200,
        cropHeight: 150,
        borderRadius: 0,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          grayscale: 0,
          sepia: 0,
        },
      },
    };
  }

  static createShapeElement(
    x: number = 100, 
    y: number = 100, 
    shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'star' | 'heart' = 'rectangle'
  ): ShapeElement {
    const isCircle = shapeType === 'circle';
    return {
      id: this.generateId(),
      type: 'shape',
      x,
      y,
      width: isCircle ? 100 : 200,
      height: isCircle ? 100 : 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      properties: {
        shapeType,
        fill: '#3f51b5',
        stroke: '#000000',
        strokeWidth: 2,
        borderRadius: shapeType === 'rectangle' ? 0 : undefined,
        sides: shapeType === 'polygon' ? 6 : undefined,
        innerRadius: shapeType === 'star' ? 0.5 : undefined,
      },
    };
  }

  static createSignatureElement(x: number = 100, y: number = 100, userId?: string): SignatureElement {
    return {
      id: this.generateId(),
      type: 'signature',
      x,
      y,
      width: 200,
      height: 80,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Signature Field',
      properties: {
        userId,
        placeholder: 'ลายเซ็นที่นี่',
        required: true,
        borderStyle: 'dashed',
        borderColor: '#666666',
        borderWidth: 2,
        backgroundColor: '#f9f9f9',
        signatureType: 'draw',
        fontFamily: 'Sarabun',
        fontSize: 16,
      },
    };
  }

  static createQRCodeElement(x: number = 100, y: number = 100, data: string = 'https://example.com'): QRCodeElement {
    return {
      id: this.generateId(),
      type: 'qr-code',
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'QR Code',
      properties: {
        data,
        errorCorrectionLevel: 'M',
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        margin: 4,
      },
    };
  }

  static createBarcodeElement(x: number = 100, y: number = 100, data: string = '1234567890'): BarcodeElement {
    return {
      id: this.generateId(),
      type: 'barcode',
      x,
      y,
      width: 200,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Barcode',
      properties: {
        data,
        format: 'CODE128',
        displayValue: true,
        fontSize: 12,
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2,
        backgroundColor: '#ffffff',
        lineColor: '#000000',
      },
    };
  }

  static createLineElement(x: number = 100, y: number = 100): LineElement {
    return {
      id: this.generateId(),
      type: 'line',
      x,
      y,
      width: 200,
      height: 2,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Line',
      properties: {
        points: [0, 0, 200, 0],
        stroke: '#000000',
        strokeWidth: 2,
        lineCap: 'butt',
        lineJoin: 'miter',
      },
    };
  }

  static createArrowElement(x: number = 100, y: number = 100): ArrowElement {
    return {
      id: this.generateId(),
      type: 'arrow',
      x,
      y,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Arrow',
      properties: {
        startX: 0,
        startY: 25,
        endX: 200,
        endY: 25,
        stroke: '#000000',
        strokeWidth: 3,
        arrowheadSize: 15,
        arrowheadType: 'triangle',
        startArrow: false,
        endArrow: true,
      },
    };
  }

  static createIconElement(x: number = 100, y: number = 100, iconName: string = 'star'): IconElement {
    return {
      id: this.generateId(),
      type: 'icon',
      x,
      y,
      width: 60,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Icon',
      properties: {
        iconName,
        iconFamily: 'material',
        color: '#3f51b5',
        borderRadius: 0,
        padding: 8,
      },
    };
  }

  static createChartElement(x: number = 100, y: number = 100): ChartElement {
    return {
      id: this.generateId(),
      type: 'chart',
      x,
      y,
      width: 300,
      height: 200,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Chart',
      properties: {
        chartType: 'bar',
        data: {
          labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
          datasets: [{
            label: 'ยอดขาย',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: '#3f51b5',
            borderColor: '#303f9f',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'กราฟตัวอย่าง',
          },
        },
      },
    };
  }

  static createTableElement(x: number = 100, y: number = 100, rows: number = 3, columns: number = 3): TableElement {
    const data: string[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < columns; j++) {
        row.push(i === 0 ? `หัวข้อ ${j + 1}` : `ข้อมูล ${i},${j + 1}`);
      }
      data.push(row);
    }

    return {
      id: this.generateId(),
      type: 'table',
      x,
      y,
      width: columns * 100,
      height: rows * 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      name: 'Table',
      properties: {
        rows,
        columns,
        data,
        headerRow: true,
        headerColumn: false,
        cellPadding: 8,
        borderWidth: 1,
        borderColor: '#cccccc',
        headerBackgroundColor: '#f5f5f5',
        fontSize: 14,
        fontFamily: 'Sarabun',
        textAlign: 'left',
        verticalAlign: 'middle',
      },
    };
  }

  static createElement(type: ElementType, x?: number, y?: number, options?: any): DesignerElement {
    switch (type) {
      case 'text':
        return this.createTextElement(x, y);
      case 'image':
        return this.createImageElement(x, y, options?.src);
      case 'shape':
        return this.createShapeElement(x, y, options?.shapeType);
      case 'signature':
        return this.createSignatureElement(x, y, options?.userId);
      case 'qr-code':
        return this.createQRCodeElement(x, y, options?.data);
      case 'barcode':
        return this.createBarcodeElement(x, y, options?.data);
      case 'line':
        return this.createLineElement(x, y);
      case 'arrow':
        return this.createArrowElement(x, y);
      case 'icon':
        return this.createIconElement(x, y, options?.iconName);
      case 'chart':
        return this.createChartElement(x, y);
      case 'table':
        return this.createTableElement(x, y, options?.rows, options?.columns);
      default:
        throw new Error(`Unknown element type: ${type}`);
    }
  }

  static duplicateElement(element: DesignerElement, offsetX: number = 20, offsetY: number = 20): DesignerElement {
    const duplicated = JSON.parse(JSON.stringify(element)) as DesignerElement;
    duplicated.id = this.generateId();
    duplicated.x += offsetX;
    duplicated.y += offsetY;
    duplicated.name = `${element.name} Copy`;
    return duplicated;
  }

  static getDefaultSize(type: ElementType): { width: number; height: number } {
    switch (type) {
      case 'text':
        return { width: 200, height: 40 };
      case 'image':
        return { width: 200, height: 150 };
      case 'shape':
        return { width: 100, height: 100 };
      case 'signature':
        return { width: 200, height: 80 };
      case 'qr-code':
        return { width: 100, height: 100 };
      case 'barcode':
        return { width: 200, height: 60 };
      case 'line':
        return { width: 200, height: 2 };
      case 'arrow':
        return { width: 200, height: 50 };
      case 'icon':
        return { width: 60, height: 60 };
      case 'chart':
        return { width: 300, height: 200 };
      case 'table':
        return { width: 300, height: 120 };
      default:
        return { width: 100, height: 100 };
    }
  }
}
