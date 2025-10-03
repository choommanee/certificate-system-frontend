import {
  ValidationRules,
  Validator,
  validateForm,
  CertificateValidation,
  SignerValidation,
  FileValidation,
  Sanitization
} from '../validation';

describe('ValidationRules', () => {
  describe('required', () => {
    test('should pass for valid values', () => {
      expect(ValidationRules.required('test')).toEqual({
        isValid: true,
        errors: []
      });
      expect(ValidationRules.required(0)).toEqual({
        isValid: true,
        errors: []
      });
      expect(ValidationRules.required(false)).toEqual({
        isValid: true,
        errors: []
      });
    });

    test('should fail for empty values', () => {
      expect(ValidationRules.required('')).toEqual({
        isValid: false,
        errors: ['This field is required']
      });
      expect(ValidationRules.required(null)).toEqual({
        isValid: false,
        errors: ['This field is required']
      });
      expect(ValidationRules.required(undefined)).toEqual({
        isValid: false,
        errors: ['This field is required']
      });
    });
  });

  describe('email', () => {
    test('should pass for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.th',
        'admin+tag@company.org'
      ];

      validEmails.forEach(email => {
        expect(ValidationRules.email(email)).toEqual({
          isValid: true,
          errors: []
        });
      });
    });

    test('should fail for invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user name@domain.com'
      ];

      invalidEmails.forEach(email => {
        expect(ValidationRules.email(email)).toEqual({
          isValid: false,
          errors: ['Please enter a valid email address']
        });
      });
    });
  });

  describe('minLength', () => {
    test('should pass for strings meeting minimum length', () => {
      const rule = ValidationRules.minLength(5);
      expect(rule('hello')).toEqual({
        isValid: true,
        errors: []
      });
      expect(rule('hello world')).toEqual({
        isValid: true,
        errors: []
      });
    });

    test('should fail for strings below minimum length', () => {
      const rule = ValidationRules.minLength(5);
      expect(rule('hi')).toEqual({
        isValid: false,
        errors: ['Minimum length is 5 characters']
      });
    });
  });

  describe('maxLength', () => {
    test('should pass for strings within maximum length', () => {
      const rule = ValidationRules.maxLength(10);
      expect(rule('hello')).toEqual({
        isValid: true,
        errors: []
      });
    });

    test('should fail for strings exceeding maximum length', () => {
      const rule = ValidationRules.maxLength(5);
      expect(rule('hello world')).toEqual({
        isValid: false,
        errors: ['Maximum length is 5 characters']
      });
    });
  });

  describe('pattern', () => {
    test('should pass for matching patterns', () => {
      const rule = ValidationRules.pattern(/^\d+$/, 'Must be numbers only');
      expect(rule('12345')).toEqual({
        isValid: true,
        errors: []
      });
    });

    test('should fail for non-matching patterns', () => {
      const rule = ValidationRules.pattern(/^\d+$/, 'Must be numbers only');
      expect(rule('abc123')).toEqual({
        isValid: false,
        errors: ['Must be numbers only']
      });
    });
  });

  describe('numeric', () => {
    test('should pass for numeric strings', () => {
      expect(ValidationRules.numeric('12345')).toEqual({
        isValid: true,
        errors: []
      });
    });

    test('should fail for non-numeric strings', () => {
      expect(ValidationRules.numeric('abc123')).toEqual({
        isValid: false,
        errors: ['Please enter numbers only']
      });
    });
  });

  describe('range', () => {
    test('should pass for values within range', () => {
      const rule = ValidationRules.range(1, 10);
      expect(rule(5)).toEqual({
        isValid: true,
        errors: []
      });
      expect(rule(1)).toEqual({
        isValid: true,
        errors: []
      });
      expect(rule(10)).toEqual({
        isValid: true,
        errors: []
      });
    });

    test('should fail for values outside range', () => {
      const rule = ValidationRules.range(1, 10);
      expect(rule(0)).toEqual({
        isValid: false,
        errors: ['Value must be between 1 and 10']
      });
      expect(rule(11)).toEqual({
        isValid: false,
        errors: ['Value must be between 1 and 10']
      });
    });
  });
});

describe('Validator', () => {
  test('should validate with single rule', () => {
    const validator = new Validator<string>()
      .addRule(ValidationRules.required);

    expect(validator.validate('test')).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    expect(validator.validate('')).toEqual({
      isValid: false,
      errors: ['This field is required'],
      warnings: []
    });
  });

  test('should validate with multiple rules', () => {
    const validator = new Validator<string>()
      .addRule(ValidationRules.required)
      .addRule(ValidationRules.minLength(5))
      .addRule(ValidationRules.maxLength(10));

    expect(validator.validate('hello')).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    expect(validator.validate('hi')).toEqual({
      isValid: false,
      errors: ['Minimum length is 5 characters'],
      warnings: []
    });

    expect(validator.validate('hello world!')).toEqual({
      isValid: false,
      errors: ['Maximum length is 10 characters'],
      warnings: []
    });
  });

  test('should collect all errors', () => {
    const validator = new Validator<string>()
      .addRule(ValidationRules.required)
      .addRule(ValidationRules.minLength(10));

    expect(validator.validate('')).toEqual({
      isValid: false,
      errors: [
        'This field is required',
        'Minimum length is 10 characters'
      ],
      warnings: []
    });
  });
});

describe('validateForm', () => {
  test('should validate form with all valid fields', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };

    const rules = {
      name: [ValidationRules.required, ValidationRules.minLength(2)],
      email: [ValidationRules.required, ValidationRules.email],
      age: [ValidationRules.range(18, 100)]
    };

    const result = validateForm(data, rules);
    
    expect(result.isValid).toBe(true);
    expect(result.name.isValid).toBe(true);
    expect(result.email.isValid).toBe(true);
    expect(result.age.isValid).toBe(true);
  });

  test('should validate form with invalid fields', () => {
    const data = {
      name: '',
      email: 'invalid-email',
      age: 15
    };

    const rules = {
      name: [ValidationRules.required],
      email: [ValidationRules.email],
      age: [ValidationRules.range(18, 100)]
    };

    const result = validateForm(data, rules);
    
    expect(result.isValid).toBe(false);
    expect(result.name.isValid).toBe(false);
    expect(result.email.isValid).toBe(false);
    expect(result.age.isValid).toBe(false);
  });
});

describe('CertificateValidation', () => {
  describe('studentId', () => {
    test('should validate correct student IDs', () => {
      const validIds = ['12345678', '123456789012'];
      
      validIds.forEach(id => {
        const result = CertificateValidation.studentId(id);
        expect(result.isValid).toBe(true);
      });
    });

    test('should reject invalid student IDs', () => {
      const invalidIds = ['1234567', '1234567890123', 'abc12345', ''];
      
      invalidIds.forEach(id => {
        const result = CertificateValidation.studentId(id);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('certificateTitle', () => {
    test('should validate correct titles', () => {
      const result = CertificateValidation.certificateTitle('Certificate of Achievement');
      expect(result.isValid).toBe(true);
    });

    test('should reject titles that are too short', () => {
      const result = CertificateValidation.certificateTitle('Cert');
      expect(result.isValid).toBe(false);
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      const result = CertificateValidation.certificateTitle(longTitle);
      expect(result.isValid).toBe(false);
    });
  });

  describe('activityDate', () => {
    test('should validate dates within acceptable range', () => {
      const today = new Date();
      const result = CertificateValidation.activityDate(today);
      expect(result.isValid).toBe(true);
    });

    test('should reject dates too far in the past', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);
      
      const result = CertificateValidation.activityDate(oldDate);
      expect(result.isValid).toBe(false);
    });

    test('should reject dates too far in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      
      const result = CertificateValidation.activityDate(futureDate);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('SignerValidation', () => {
  describe('signatureFile', () => {
    test('should validate correct image files', () => {
      const validFile = new File(['content'], 'signature.png', { type: 'image/png' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = SignerValidation.signatureFile(validFile);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid file types', () => {
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      const result = SignerValidation.signatureFile(invalidFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ไฟล์ประเภทไม่ถูกต้อง'));
    });

    test('should reject oversized files', () => {
      const largeFile = new File(['content'], 'signature.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      
      const result = SignerValidation.signatureFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ไฟล์มีขนาดใหญ่เกินไป'));
    });

    test('should reject undersized files', () => {
      const tinyFile = new File(['x'], 'signature.png', { type: 'image/png' });
      Object.defineProperty(tinyFile, 'size', { value: 500 }); // 500 bytes
      
      const result = SignerValidation.signatureFile(tinyFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ไฟล์มีขนาดเล็กเกินไป'));
    });

    test('should warn for large but acceptable files', () => {
      const largeFile = new File(['content'], 'signature.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 }); // 3MB
      
      const result = SignerValidation.signatureFile(largeFile);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('ไฟล์มีขนาดใหญ่'));
    });
  });

  describe('signaturePosition', () => {
    test('should validate correct position', () => {
      const position = { x: 50, y: 50, width: 200, height: 80 };
      const result = SignerValidation.signaturePosition(position);
      expect(result.isValid).toBe(true);
    });

    test('should reject position outside bounds', () => {
      const position = { x: 150, y: 50, width: 200, height: 80 };
      const result = SignerValidation.signaturePosition(position);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ตำแหน่งลายเซ็นแนวนอน'));
    });

    test('should reject invalid dimensions', () => {
      const position = { x: 50, y: 50, width: 30, height: 10 };
      const result = SignerValidation.signaturePosition(position);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid aspect ratio', () => {
      const position = { x: 50, y: 50, width: 100, height: 100 }; // 1:1 ratio
      const result = SignerValidation.signaturePosition(position);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('อัตราส่วนลายเซ็น'));
    });
  });

  describe('rejectReason', () => {
    test('should validate sufficient reason', () => {
      const reason = 'The document contains errors that need to be corrected.';
      const result = SignerValidation.rejectReason(reason);
      expect(result.isValid).toBe(true);
    });

    test('should reject empty reason', () => {
      const result = SignerValidation.rejectReason('');
      expect(result.isValid).toBe(false);
    });

    test('should reject too short reason', () => {
      const result = SignerValidation.rejectReason('Error');
      expect(result.isValid).toBe(false);
    });

    test('should reject too long reason', () => {
      const longReason = 'A'.repeat(501);
      const result = SignerValidation.rejectReason(longReason);
      expect(result.isValid).toBe(false);
    });
  });

  describe('signingNotes', () => {
    test('should validate empty notes (optional)', () => {
      const result = SignerValidation.signingNotes('');
      expect(result.isValid).toBe(true);
    });

    test('should validate normal notes', () => {
      const result = SignerValidation.signingNotes('Signed with approval');
      expect(result.isValid).toBe(true);
    });

    test('should reject overly long notes', () => {
      const longNotes = 'A'.repeat(1001);
      const result = SignerValidation.signingNotes(longNotes);
      expect(result.isValid).toBe(false);
    });

    test('should warn for very long notes', () => {
      const longNotes = 'A'.repeat(600);
      const result = SignerValidation.signingNotes(longNotes);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('หมายเหตุยาวมาก'));
    });
  });

  describe('documentFilter', () => {
    test('should validate correct filter', () => {
      const filter = {
        dateFrom: '2023-01-01',
        dateTo: '2023-12-31',
        priority: 'high',
        status: 'pending'
      };
      
      const result = SignerValidation.documentFilter(filter);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid date range', () => {
      const filter = {
        dateFrom: '2023-12-31',
        dateTo: '2023-01-01'
      };
      
      const result = SignerValidation.documentFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('วันที่เริ่มต้น'));
    });

    test('should reject too large date range', () => {
      const filter = {
        dateFrom: '2022-01-01',
        dateTo: '2024-01-01'
      };
      
      const result = SignerValidation.documentFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ช่วงวันที่ต้องไม่เกิน 1 ปี'));
    });

    test('should reject invalid priority', () => {
      const filter = { priority: 'invalid' };
      const result = SignerValidation.documentFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ระดับความสำคัญไม่ถูกต้อง'));
    });

    test('should reject invalid status', () => {
      const filter = { status: 'invalid' };
      const result = SignerValidation.documentFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('สถานะไม่ถูกต้อง'));
    });
  });
});

describe('FileValidation', () => {
  describe('isValidImageType', () => {
    test('should validate image types', () => {
      const imageFile = new File(['content'], 'image.png', { type: 'image/png' });
      expect(FileValidation.isValidImageType(imageFile)).toBe(true);
    });

    test('should reject non-image types', () => {
      const textFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      expect(FileValidation.isValidImageType(textFile)).toBe(false);
    });
  });

  describe('isValidDocumentType', () => {
    test('should validate document types', () => {
      const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      expect(FileValidation.isValidDocumentType(pdfFile)).toBe(true);
    });

    test('should reject non-document types', () => {
      const imageFile = new File(['content'], 'image.png', { type: 'image/png' });
      expect(FileValidation.isValidDocumentType(imageFile)).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    test('should extract file extension', () => {
      expect(FileValidation.getFileExtension('document.pdf')).toBe('pdf');
      expect(FileValidation.getFileExtension('image.PNG')).toBe('png');
      expect(FileValidation.getFileExtension('file.tar.gz')).toBe('gz');
    });

    test('should handle files without extension', () => {
      expect(FileValidation.getFileExtension('filename')).toBe('');
    });
  });

  describe('formatFileSize', () => {
    test('should format file sizes correctly', () => {
      expect(FileValidation.formatFileSize(0)).toBe('0 Bytes');
      expect(FileValidation.formatFileSize(1024)).toBe('1 KB');
      expect(FileValidation.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(FileValidation.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('should handle decimal values', () => {
      expect(FileValidation.formatFileSize(1536)).toBe('1.5 KB');
      expect(FileValidation.formatFileSize(1572864)).toBe('1.5 MB');
    });
  });
});

describe('Sanitization', () => {
  describe('sanitizeString', () => {
    test('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = Sanitization.sanitizeString(input);
      expect(result).toBe('scriptalert(xss)/script');
    });

    test('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = Sanitization.sanitizeString(input);
      expect(result).toBe('hello world');
    });
  });

  describe('sanitizeFilename', () => {
    test('should replace invalid characters', () => {
      const input = 'file<name>with|invalid:chars';
      const result = Sanitization.sanitizeFilename(input);
      expect(result).toBe('file_name_with_invalid_chars');
    });

    test('should limit length', () => {
      const longName = 'a'.repeat(300);
      const result = Sanitization.sanitizeFilename(longName);
      expect(result.length).toBe(255);
    });

    test('should replace multiple underscores', () => {
      const input = 'file___name';
      const result = Sanitization.sanitizeFilename(input);
      expect(result).toBe('file_name');
    });
  });

  describe('sanitizeEmail', () => {
    test('should convert to lowercase and trim', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      const result = Sanitization.sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });
  });
});