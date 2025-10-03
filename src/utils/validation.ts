import React from 'react';
import DOMPurify from 'dompurify';

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class Validator {
  private rules: ValidationRule[] = [];
  private warnings: ValidationRule[] = [];

  addRule(rule: ValidationRule): Validator {
    this.rules.push(rule);
    return this;
  }

  addWarning(rule: ValidationRule): Validator {
    this.warnings.push(rule);
    return this;
  }

  validate(value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check validation rules
    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    // Check warning rules
    for (const rule of this.warnings) {
      if (!rule.validate(value)) {
        warnings.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static create(): Validator {
    return new Validator();
  }
}

// Common validation rules
export const ValidationRules = {
  required: (message = 'ฟิลด์นี้จำเป็นต้องกรอก'): ValidationRule => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && value.length >= min,
    message: message || `ต้องมีความยาวอย่างน้อย ${min} ตัวอักษร`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && value.length <= max,
    message: message || `ต้องมีความยาวไม่เกิน ${max} ตัวอักษร`
  }),

  email: (message = 'รูปแบบอีเมลไม่ถูกต้อง'): ValidationRule => ({
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return typeof value === 'string' && emailRegex.test(value);
    },
    message
  }),

  numeric: (message = 'ต้องเป็นตัวเลขเท่านั้น'): ValidationRule => ({
    validate: (value) => !isNaN(Number(value)) && isFinite(Number(value)),
    message
  }),

  positiveNumber: (message = 'ต้องเป็นตัวเลขบวก'): ValidationRule => ({
    validate: (value) => !isNaN(Number(value)) && Number(value) > 0,
    message
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `ต้องอยู่ระหว่าง ${min} ถึง ${max}`
  }),

  fileSize: (maxSizeBytes: number, message?: string): ValidationRule => ({
    validate: (file: File) => file && file.size <= maxSizeBytes,
    message: message || `ขนาดไฟล์ต้องไม่เกิน ${(maxSizeBytes / 1024 / 1024).toFixed(1)} MB`
  }),

  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    validate: (file: File) => file && allowedTypes.includes(file.type),
    message: message || `ประเภทไฟล์ที่อนุญาต: ${allowedTypes.join(', ')}`
  }),

  imageFile: (message = 'ต้องเป็นไฟล์รูปภาพ (PNG, JPG, JPEG, SVG)'): ValidationRule => ({
    validate: (file: File) => {
      const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      return file && imageTypes.includes(file.type);
    },
    message
  }),

  noXSS: (message = 'พบเนื้อหาที่ไม่ปลอดภัย'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      const cleaned = DOMPurify.sanitize(value);
      return cleaned === value;
    },
    message
  }),

  noSQLInjection: (message = 'พบรูปแบบที่ไม่ปลอดภัย'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(--|\/\*|\*\/|;|'|"|`)/,
        /(\bOR\b|\bAND\b).*[=<>]/i
      ];
      return !sqlPatterns.some(pattern => pattern.test(value));
    },
    message
  }),

  thaiText: (message = 'ต้องเป็นข้อความภาษาไทย'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      const thaiRegex = /^[\u0E00-\u0E7F\s\d\.,!?()-]+$/;
      return thaiRegex.test(value);
    },
    message
  }),

  strongPassword: (message = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return strongRegex.test(value);
    },
    message
  })
};

// Specific validators for signer workflow
export const SignerValidators = {
  signatureFile: (): Validator => {
    return Validator.create()
      .addRule(ValidationRules.required('กรุณาเลือกไฟล์ลายเซ็น'))
      .addRule(ValidationRules.imageFile())
      .addRule(ValidationRules.fileSize(5 * 1024 * 1024, 'ขนาดไฟล์ต้องไม่เกิน 5 MB'))
      .addWarning({
        validate: (file: File) => file && file.type === 'image/png',
        message: 'แนะนำให้ใช้ไฟล์ PNG สำหรับความคมชัดที่ดีที่สุด'
      });
  },

  signaturePosition: (): Validator => {
    return Validator.create()
      .addRule({
        validate: (pos: { x: number; y: number; width: number; height: number }) => 
          pos && typeof pos.x === 'number' && pos.x >= 0 && pos.x <= 100,
        message: 'ตำแหน่งแนวนอนต้องอยู่ระหว่าง 0-100%'
      })
      .addRule({
        validate: (pos: { x: number; y: number; width: number; height: number }) => 
          pos && typeof pos.y === 'number' && pos.y >= 0 && pos.y <= 100,
        message: 'ตำแหน่งแนวตั้งต้องอยู่ระหว่าง 0-100%'
      })
      .addRule({
        validate: (pos: { x: number; y: number; width: number; height: number }) => 
          pos && typeof pos.width === 'number' && pos.width >= 50 && pos.width <= 500,
        message: 'ความกว้างต้องอยู่ระหว่าง 50-500 พิกเซล'
      })
      .addRule({
        validate: (pos: { x: number; y: number; width: number; height: number }) => 
          pos && typeof pos.height === 'number' && pos.height >= 20 && pos.height <= 250,
        message: 'ความสูงต้องอยู่ระหว่าง 20-250 พิกเซล'
      });
  },

  documentTitle: (): Validator => {
    return Validator.create()
      .addRule(ValidationRules.required('กรุณาระบุชื่อเอกสาร'))
      .addRule(ValidationRules.minLength(5, 'ชื่อเอกสารต้องมีความยาวอย่างน้อย 5 ตัวอักษร'))
      .addRule(ValidationRules.maxLength(200, 'ชื่อเอกสารต้องมีความยาวไม่เกิน 200 ตัวอักษร'))
      .addRule(ValidationRules.noXSS())
      .addRule(ValidationRules.noSQLInjection());
  },

  rejectReason: (): Validator => {
    return Validator.create()
      .addRule(ValidationRules.required('กรุณาระบุเหตุผลในการปฏิเสธ'))
      .addRule(ValidationRules.minLength(10, 'เหตุผลต้องมีความยาวอย่างน้อย 10 ตัวอักษร'))
      .addRule(ValidationRules.maxLength(500, 'เหตุผลต้องมีความยาวไม่เกิน 500 ตัวอักษร'))
      .addRule(ValidationRules.noXSS())
      .addRule(ValidationRules.noSQLInjection());
  },

  comments: (): Validator => {
    return Validator.create()
      .addRule(ValidationRules.maxLength(1000, 'หมายเหตุต้องมีความยาวไม่เกิน 1000 ตัวอักษร'))
      .addRule(ValidationRules.noXSS())
      .addRule(ValidationRules.noSQLInjection());
  },

  attachmentFile: (): Validator => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ];

    return Validator.create()
      .addRule(ValidationRules.fileType(allowedTypes, 'ประเภทไฟล์ที่อนุญาต: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG'))
      .addRule(ValidationRules.fileSize(10 * 1024 * 1024, 'ขนาดไฟล์ต้องไม่เกิน 10 MB'));
  }
};

// Form validation helper
export class FormValidator {
  private fields: Map<string, Validator> = new Map();
  private values: Map<string, any> = new Map();

  addField(name: string, validator: Validator): FormValidator {
    this.fields.set(name, validator);
    return this;
  }

  setValue(name: string, value: any): FormValidator {
    this.values.set(name, value);
    return this;
  }

  setValues(values: Record<string, any>): FormValidator {
    Object.entries(values).forEach(([name, value]) => {
      this.values.set(name, value);
    });
    return this;
  }

  validateField(name: string): ValidationResult {
    const validator = this.fields.get(name);
    const value = this.values.get(name);

    if (!validator) {
      return { isValid: true, errors: [], warnings: [] };
    }

    return validator.validate(value);
  }

  validateAll(): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [name] of this.fields) {
      results[name] = this.validateField(name);
    }

    return results;
  }

  isValid(): boolean {
    const results = this.validateAll();
    return Object.values(results).every(result => result.isValid);
  }

  getErrors(): Record<string, string[]> {
    const results = this.validateAll();
    const errors: Record<string, string[]> = {};

    Object.entries(results).forEach(([name, result]) => {
      if (result.errors.length > 0) {
        errors[name] = result.errors;
      }
    });

    return errors;
  }

  getWarnings(): Record<string, string[]> {
    const results = this.validateAll();
    const warnings: Record<string, string[]> = {};

    Object.entries(results).forEach(([name, result]) => {
      if (result.warnings.length > 0) {
        warnings[name] = result.warnings;
      }
    });

    return warnings;
  }
}

// Sanitization utilities
export const Sanitizer = {
  text: (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  },

  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  filename: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
  },

  sqlString: (input: string): string => {
    return input.replace(/'/g, "''").replace(/;/g, '');
  }
};

// Real-time validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: Record<keyof T, Validator>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<keyof T, string[]>>({} as any);
  const [warnings, setWarnings] = React.useState<Record<keyof T, string[]>>({} as any);
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as any);

  const validateField = React.useCallback((name: keyof T, value: any) => {
    const validator = validators[name];
    if (!validator) return { isValid: true, errors: [], warnings: [] };

    return validator.validate(value);
  }, [validators]);

  const setValue = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    const result = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: result.errors }));
    setWarnings(prev => ({ ...prev, [name]: result.warnings }));
  }, [validateField]);

  const setTouched = React.useCallback((name: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateAll = React.useCallback(() => {
    const newErrors: Record<keyof T, string[]> = {} as any;
    const newWarnings: Record<keyof T, string[]> = {} as any;

    Object.entries(values).forEach(([name, value]) => {
      const result = validateField(name as keyof T, value);
      if (result.errors.length > 0) {
        newErrors[name as keyof T] = result.errors;
      }
      if (result.warnings.length > 0) {
        newWarnings[name as keyof T] = result.warnings;
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);

    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({} as any);
    setWarnings({} as any);
    setTouched({} as any);
  }, [initialValues]);

  return {
    values,
    errors,
    warnings,
    touched,
    setValue,
    setTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}