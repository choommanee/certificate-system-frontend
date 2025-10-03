// 🛠️ Step 1.3: Simple Template Service
// Simplified service for template management with localStorage fallback

import { SimpleTemplateData, SimpleElement } from './types';

class SimpleTemplateService {
  private baseUrl = 'http://localhost:8080/api/v1';
  private isOnline = true;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async saveTemplate(template: SimpleTemplateData): Promise<SimpleTemplateData> {
    // Generate ID if not provided
    if (!template.id) {
      template.id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add timestamps
    template.createdAt = template.createdAt || new Date().toISOString();
    template.updatedAt = new Date().toISOString();

    // Try to save to API first
    if (this.isOnline) {
      try {
        const response = await fetch(`${this.baseUrl}/templates/simple`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            category: template.category,
            design: {
              canvas: template.canvas,
              elements: template.elements
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Template saved to API:', result);
          
          // Also save to localStorage as backup
          this.saveToLocalStorage(template);
          
          return result;
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn('❌ Failed to save to API, using localStorage:', error);
        this.isOnline = false;
      }
    }

    // Fallback to localStorage
    this.saveToLocalStorage(template);
    console.log('💾 Template saved to localStorage:', template);
    
    return template;
  }

  async loadTemplate(templateId: string): Promise<SimpleTemplateData | null> {
    // Try to load from API first
    if (this.isOnline) {
      try {
        const response = await fetch(`${this.baseUrl}/templates/simple/${templateId}`, {
          headers: this.getAuthHeaders()
        });

        if (response.ok) {
          const template = await response.json();
          console.log('✅ Template loaded from API:', template);
          return this.normalizeTemplate(template);
        } else if (response.status === 404) {
          console.log('Template not found in API, checking localStorage');
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn('❌ Failed to load from API, checking localStorage:', error);
        this.isOnline = false;
      }
    }

    // Fallback to localStorage
    return this.loadFromLocalStorage(templateId);
  }

  async getUserTemplates(): Promise<SimpleTemplateData[]> {
    let apiTemplates: SimpleTemplateData[] = [];
    
    // Try to get from API first
    if (this.isOnline) {
      try {
        const response = await fetch(`${this.baseUrl}/templates/simple`, {
          headers: this.getAuthHeaders()
        });

        if (response.ok) {
          const result = await response.json();
          apiTemplates = Array.isArray(result) ? result : (result.templates || []);
          console.log('✅ Templates loaded from API:', apiTemplates.length);
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn('❌ Failed to load templates from API:', error);
        this.isOnline = false;
      }
    }

    // Get localStorage templates
    const localTemplates = this.getAllFromLocalStorage();
    console.log('💾 Templates from localStorage:', localTemplates.length);

    // Merge and deduplicate (API templates take precedence)
    const allTemplates = [...apiTemplates];
    
    localTemplates.forEach(localTemplate => {
      const exists = apiTemplates.some(apiTemplate => apiTemplate.id === localTemplate.id);
      if (!exists) {
        allTemplates.push(localTemplate);
      }
    });

    return allTemplates.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt || 0).getTime() - 
      new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }

  // Private localStorage methods
  private saveToLocalStorage(template: SimpleTemplateData): void {
    try {
      const templates = this.getAllFromLocalStorage();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem('workingFixedTemplates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromLocalStorage(templateId: string): SimpleTemplateData | null {
    try {
      const templates = this.getAllFromLocalStorage();
      const template = templates.find(t => t.id === templateId);
      
      if (template) {
        console.log('💾 Template loaded from localStorage:', template);
        return this.normalizeTemplate(template);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  private getAllFromLocalStorage(): SimpleTemplateData[] {
    try {
      const data = localStorage.getItem('workingFixedTemplates');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse localStorage templates:', error);
      return [];
    }
  }

  private normalizeTemplate(template: any): SimpleTemplateData {
    // Normalize template data to ensure consistent structure
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category || 'certificate',
      canvas: {
        width: template.canvas?.width || template.design?.canvas?.width || 800,
        height: template.canvas?.height || template.design?.canvas?.height || 600,
        background: template.canvas?.background || template.design?.canvas?.background_color || '#ffffff'
      },
      elements: this.normalizeElements(template.elements || template.design?.elements || []),
      createdAt: template.createdAt || template.created_at || new Date().toISOString(),
      updatedAt: template.updatedAt || template.updated_at || new Date().toISOString(),
      createdBy: template.createdBy || template.created_by
    };
  }

  private normalizeElements(elements: any[]): SimpleElement[] {
    return elements.map((element: any, index: number) => ({
      id: element.id || `element-${index}`,
      type: this.normalizeElementType(element.type || element.elementType || 'text'),
      x: element.x || element.position?.x || 0,
      y: element.y || element.position?.y || 0,
      width: element.width || element.size?.width || 100,
      height: element.height || element.size?.height || 50,
      rotation: element.rotation || 0,
      opacity: element.opacity !== undefined ? element.opacity : 1,
      visible: element.visible !== undefined ? element.visible : true,
      locked: element.locked !== undefined ? element.locked : false,
      zIndex: element.zIndex || element.z_index || index,
      properties: this.normalizeElementProperties(element)
    }));
  }

  private normalizeElementType(type: string): 'text' | 'image' | 'shape' | 'qr-code' {
    switch (type.toLowerCase()) {
      case 'image':
        return 'image';
      case 'shape':
      case 'rectangle':
      case 'circle':
        return 'shape';
      case 'qr-code':
      case 'qr_code':
      case 'qrcode':
        return 'qr-code';
      default:
        return 'text';
    }
  }

  private normalizeElementProperties(element: any): SimpleElement['properties'] {
    const props = element.properties || {};
    const style = element.style || {};
    const content = element.content || {};

    return {
      // Text content
      text: content.text || element.text || element.displayText || props.placeholder || '',
      placeholder: props.placeholder || content.placeholder || element.placeholder || '',
      
      // Typography
      fontSize: props.fontSize || style.font_size || element.fontSize || 16,
      fontFamily: props.fontFamily || style.font_family || element.fontFamily || 'Sarabun, Arial, sans-serif',
      color: props.color || style.color || element.fill || element.color || '#000000',
      fontWeight: props.fontWeight || style.font_weight || element.fontWeight || 'normal',
      fontStyle: props.fontStyle || style.font_style || element.fontStyle || 'normal',
      textAlign: props.textAlign || style.text_align || element.align || 'left',
      textDecoration: props.textDecoration || style.text_decoration || 'none',
      verticalAlign: props.verticalAlign || style.vertical_align || element.verticalAlign || 'top',
      lineHeight: props.lineHeight || style.line_height || 1.2,
      letterSpacing: props.letterSpacing || style.letter_spacing || 0,
      
      // Image properties
      imageUrl: content.image_url || element.src || element.imageUrl || props.imageUrl || '',
      imageAlt: content.image_alt || element.alt || props.imageAlt || '',
      
      // Shape properties
      shapeType: content.shape_type || element.shapeType || props.shapeType || 'rectangle',
      fillColor: style.background_color || props.fillColor || element.backgroundColor || '#ffffff',
      strokeColor: style.border_color || props.strokeColor || element.stroke || '#000000',
      strokeWidth: style.border_width || props.strokeWidth || element.strokeWidth || 0,
      
      // QR Code properties
      qrCodeData: content.qr_code_data || element.qrCodeData || props.qrCodeData || '',
      
      // Data binding
      dataBinding: props.dataBinding || {
        fieldPath: content.variable || element.variable || '',
        type: element.type || 'text',
        label: element.label || 'Element'
      },
      
      // Padding
      padding: props.padding || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    };
  }
}

export default new SimpleTemplateService();
