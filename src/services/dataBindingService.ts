// Data Binding Service for Certificate Templates

import { CertificateData, DataBinding, TemplateVariableElement } from '../types/certificate-template';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

export class DataBindingService {
  /**
   * Get value from certificate data using field path
   */
  static getValue(data: CertificateData, fieldPath: string): any {
    const keys = fieldPath.split('.');
    let value: any = data;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      
      // Handle array access (e.g., signatories.0.name)
      if (!isNaN(Number(key))) {
        const index = Number(key);
        if (Array.isArray(value) && index < value.length) {
          value = value[index];
        } else {
          return undefined;
        }
      } else {
        value = value[key];
      }
    }
    
    return value;
  }

  /**
   * Format value based on data binding configuration
   */
  static formatValue(value: any, binding: DataBinding): string {
    if (value === null || value === undefined) {
      return binding.defaultValue || '';
    }

    switch (binding.type) {
      case 'text':
        return String(value);
        
      case 'number':
        if (typeof value === 'number') {
          if (binding.format) {
            // Simple number formatting
            const decimals = binding.format.split('.')[1]?.length || 0;
            return value.toFixed(decimals);
          }
          return value.toString();
        }
        return String(value);
        
      case 'date':
        if (typeof value === 'string') {
          try {
            const date = parseISO(value);
            const formatStr = binding.format || 'dd MMMM yyyy';
            
            // Convert format to date-fns format
            const dateFormat = formatStr
              .replace('DD', 'dd')
              .replace('MMMM', 'MMMM')
              .replace('YYYY', 'yyyy')
              .replace('YY', 'yy');
              
            return format(date, dateFormat, { locale: th });
          } catch (error) {
            console.error('Error formatting date:', error);
            return String(value);
          }
        }
        return String(value);
        
      case 'image':
        // Return image URL/path as is
        return String(value);
        
      case 'qr-code':
        // Return QR code data as is
        return String(value);
        
      default:
        return String(value);
    }
  }

  /**
   * Apply text transformations
   */
  static applyTransform(text: string, transform?: string): string {
    if (!transform || transform === 'none') {
      return text;
    }

    switch (transform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      default:
        return text;
    }
  }

  /**
   * Resolve template variable element to display text
   */
  static resolveTemplateVariable(
    element: TemplateVariableElement, 
    data: CertificateData
  ): string {
    const { dataBinding, placeholder, prefix = '', suffix = '', transform } = element.properties;
    
    // Get raw value from data
    const rawValue = this.getValue(data, dataBinding.fieldPath);
    
    // If no value and not required, show placeholder
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      if (dataBinding.required) {
        return `[ต้องการ: ${dataBinding.label}]`;
      }
      return placeholder || `[${dataBinding.label}]`;
    }
    
    // Format the value
    let formattedValue = this.formatValue(rawValue, dataBinding);
    
    // Apply text transformation
    formattedValue = this.applyTransform(formattedValue, transform);
    
    // Add prefix and suffix
    return `${prefix}${formattedValue}${suffix}`;
  }

  /**
   * Validate that all required fields have values
   */
  static validateRequiredFields(
    data: CertificateData, 
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    for (const fieldPath of requiredFields) {
      const value = this.getValue(data, fieldPath);
      if (value === undefined || value === null || value === '') {
        missingFields.push(fieldPath);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Get all template variables from a document
   */
  static getTemplateVariables(document: any): TemplateVariableElement[] {
    const variables: TemplateVariableElement[] = [];
    
    for (const page of document.pages) {
      for (const element of page.elements) {
        if (element.type === 'template-variable') {
          variables.push(element as TemplateVariableElement);
        }
      }
    }
    
    return variables;
  }

  /**
   * Preview template with sample data
   */
  static previewTemplate(document: any, data: CertificateData): any {
    const previewDocument = JSON.parse(JSON.stringify(document));
    
    for (const page of previewDocument.pages) {
      for (const element of page.elements) {
        if (element.type === 'template-variable') {
          const templateVar = element as TemplateVariableElement;
          const resolvedText = this.resolveTemplateVariable(templateVar, data);
          
          // Convert template variable to text element for preview
          element.type = 'text';
          element.properties = {
            ...element.properties,
            text: resolvedText
          };
          delete element.properties.dataBinding;
          delete element.properties.placeholder;
          delete element.properties.prefix;
          delete element.properties.suffix;
          delete element.properties.transform;
        }
      }
    }
    
    return previewDocument;
  }

  /**
   * Generate certificate document from template and data
   */
  static generateCertificate(template: any, data: CertificateData): any {
    // Validate required fields
    const requiredFields = template.requiredFields || [];
    const validation = this.validateRequiredFields(data, requiredFields);
    
    if (!validation.isValid) {
      throw new Error(`ข้อมูลไม่ครบถ้วน: ${validation.missingFields.join(', ')}`);
    }
    
    // Generate the certificate document
    const certificateDocument = this.previewTemplate(template.document, data);
    
    // Add metadata
    certificateDocument.metadata = {
      ...certificateDocument.metadata,
      generatedAt: new Date().toISOString(),
      templateId: template.id,
      templateVersion: template.document.metadata.version,
      certificateId: data.certificate.id,
      userId: data.user.id
    };
    
    return certificateDocument;
  }

  /**
   * Get available fields for a specific category
   */
  static getFieldsByCategory(category: 'user' | 'course' | 'certificate' | 'institution' | 'signatories'): DataBinding[] {
    const { AVAILABLE_DATA_FIELDS } = require('../types/certificate-template');
    return AVAILABLE_DATA_FIELDS.filter((field: DataBinding) => 
      field.fieldPath.startsWith(category + '.')
    );
  }

  /**
   * Create a new template variable element
   */
  static createTemplateVariable(
    dataBinding: DataBinding,
    x: number = 100,
    y: number = 100,
    width: number = 200,
    height: number = 40
  ): TemplateVariableElement {
    return {
      id: `template-var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'template-variable',
      x,
      y,
      width,
      height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 1,
      name: dataBinding.label,
      properties: {
        dataBinding,
        fontSize: 16,
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
          left: 8
        },
        placeholder: `[${dataBinding.label}]`,
        transform: 'none'
      }
    };
  }
}

export default DataBindingService;
