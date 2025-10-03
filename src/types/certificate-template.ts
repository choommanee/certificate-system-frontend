// Certificate Template with Data Binding Types

export interface CertificateData {
  // User Information
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    studentId?: string;
    department?: string;
    faculty?: string;
    year?: number;
    gpa?: number;
    profileImage?: string;
  };
  
  // Course/Program Information
  course: {
    id: string;
    name: string;
    code: string;
    description?: string;
    instructor?: string;
    duration?: string;
    credits?: number;
    category?: string;
  };
  
  // Certificate Information
  certificate: {
    id: string;
    title: string;
    type: 'completion' | 'achievement' | 'participation' | 'honor' | 'graduation';
    issueDate: string;
    expiryDate?: string;
    grade?: string;
    score?: number;
    rank?: number;
    totalParticipants?: number;
    qrCode?: string;
    verificationCode: string;
  };
  
  // Institution Information
  institution: {
    name: string;
    nameEn?: string;
    logo?: string;
    address?: string;
    website?: string;
    phone?: string;
    email?: string;
  };
  
  // Signatories
  signatories: Array<{
    id: string;
    name: string;
    title: string;
    department?: string;
    signature?: string; // base64 image
    signedAt?: string;
  }>;
  
  // Additional Custom Fields
  customFields?: Record<string, any>;
}

// Data Binding Configuration
export interface DataBinding {
  fieldPath: string; // e.g., "user.fullName", "certificate.title"
  label: string; // Display name for the field
  type: 'text' | 'date' | 'number' | 'image' | 'qr-code';
  format?: string; // For dates, numbers, etc.
  defaultValue?: any;
  required?: boolean;
}

// Template Variable Element (extends TextElement)
export interface TemplateVariableElement {
  id: string;
  type: 'template-variable';
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
  properties: {
    // Data binding
    dataBinding: DataBinding;
    
    // Text styling (same as TextElement)
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
    
    // Template-specific properties
    placeholder: string; // Text to show when no data
    prefix?: string; // Text before the data value
    suffix?: string; // Text after the data value
    transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  };
}

// Certificate Template (extends DesignerDocument)
export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  
  // Template-specific properties
  certificateType: 'completion' | 'achievement' | 'participation' | 'honor' | 'graduation';
  isPublic: boolean;
  isActive: boolean;
  
  // Design document
  document: {
    id: string;
    name: string;
    description?: string;
    pages: Array<{
      id: string;
      name: string;
      width: number;
      height: number;
      backgroundColor: string;
      backgroundImage?: string;
      elements: Array<any>; // Mix of DesignerElement and TemplateVariableElement
      margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
    }>;
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
  };
  
  // Data binding configuration
  dataBindings: DataBinding[];
  requiredFields: string[]; // Array of fieldPath that are required
  
  // Usage statistics
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Available Data Fields for Template Creation
export const AVAILABLE_DATA_FIELDS: DataBinding[] = [
  // User fields
  { fieldPath: 'user.fullName', label: 'ชื่อ-นามสกุล', type: 'text', required: true },
  { fieldPath: 'user.firstName', label: 'ชื่อ', type: 'text' },
  { fieldPath: 'user.lastName', label: 'นามสกุล', type: 'text' },
  { fieldPath: 'user.email', label: 'อีเมล', type: 'text' },
  { fieldPath: 'user.studentId', label: 'รหัสนักศึกษา', type: 'text' },
  { fieldPath: 'user.department', label: 'ภาควิชา', type: 'text' },
  { fieldPath: 'user.faculty', label: 'คณะ', type: 'text' },
  { fieldPath: 'user.year', label: 'ปีการศึกษา', type: 'number' },
  { fieldPath: 'user.gpa', label: 'เกรดเฉลี่ย', type: 'number', format: '0.00' },
  { fieldPath: 'user.profileImage', label: 'รูปโปรไฟล์', type: 'image' },
  
  // Course fields
  { fieldPath: 'course.name', label: 'ชื่อหลักสูตร', type: 'text' },
  { fieldPath: 'course.code', label: 'รหัสหลักสูตร', type: 'text' },
  { fieldPath: 'course.instructor', label: 'อาจารย์ผู้สอน', type: 'text' },
  { fieldPath: 'course.duration', label: 'ระยะเวลาเรียน', type: 'text' },
  { fieldPath: 'course.credits', label: 'หน่วยกิต', type: 'number' },
  
  // Certificate fields
  { fieldPath: 'certificate.title', label: 'ชื่อเกียรติบัตร', type: 'text', required: true },
  { fieldPath: 'certificate.issueDate', label: 'วันที่ออกเกียรติบัตร', type: 'date', format: 'DD MMMM YYYY' },
  { fieldPath: 'certificate.expiryDate', label: 'วันที่หมดอายุ', type: 'date', format: 'DD MMMM YYYY' },
  { fieldPath: 'certificate.grade', label: 'เกรด', type: 'text' },
  { fieldPath: 'certificate.score', label: 'คะแนน', type: 'number' },
  { fieldPath: 'certificate.rank', label: 'อันดับ', type: 'number' },
  { fieldPath: 'certificate.totalParticipants', label: 'จำนวนผู้เข้าร่วมทั้งหมด', type: 'number' },
  { fieldPath: 'certificate.verificationCode', label: 'รหัสยืนยัน', type: 'text', required: true },
  { fieldPath: 'certificate.qrCode', label: 'QR Code สำหรับตรวจสอบ', type: 'qr-code' },
  
  // Institution fields
  { fieldPath: 'institution.name', label: 'ชื่อสถาบัน', type: 'text', required: true },
  { fieldPath: 'institution.nameEn', label: 'ชื่อสถาบัน (ภาษาอังกฤษ)', type: 'text' },
  { fieldPath: 'institution.logo', label: 'โลโก้สถาบัน', type: 'image' },
  { fieldPath: 'institution.address', label: 'ที่อยู่สถาบัน', type: 'text' },
  
  // Signatory fields
  { fieldPath: 'signatories.0.name', label: 'ชื่อผู้ลงนาม 1', type: 'text' },
  { fieldPath: 'signatories.0.title', label: 'ตำแหน่งผู้ลงนาม 1', type: 'text' },
  { fieldPath: 'signatories.0.signature', label: 'ลายเซ็นผู้ลงนาม 1', type: 'image' },
  { fieldPath: 'signatories.1.name', label: 'ชื่อผู้ลงนาม 2', type: 'text' },
  { fieldPath: 'signatories.1.title', label: 'ตำแหน่งผู้ลงนาม 2', type: 'text' },
  { fieldPath: 'signatories.1.signature', label: 'ลายเซ็นผู้ลงนาม 2', type: 'image' },
];

// Sample Certificate Data for Testing
export const SAMPLE_CERTIFICATE_DATA: CertificateData = {
  user: {
    id: 'user-001',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    fullName: 'นายสมชาย ใจดี',
    email: 'somchai.jaidee@university.ac.th',
    studentId: '65010001',
    department: 'วิทยาการคอมพิวเตอร์',
    faculty: 'คณะวิทยาศาสตร์',
    year: 2024,
    gpa: 3.75,
    profileImage: 'https://via.placeholder.com/150x200/0066cc/ffffff?text=Photo'
  },
  
  course: {
    id: 'course-001',
    name: 'การพัฒนาเว็บแอปพลิเคชันขั้นสูง',
    code: 'CS-401',
    description: 'หลักสูตรการพัฒนาเว็บแอปพลิเคชันด้วยเทคโนโลยีสมัยใหม่',
    instructor: 'อาจารย์ ดร.สมหญิง เก่งมาก',
    duration: '16 สัปดาห์',
    credits: 3,
    category: 'วิทยาการคอมพิวเตอร์'
  },
  
  certificate: {
    id: 'cert-001',
    title: 'เกียรติบัตรแสดงการสำเร็จการศึกษา',
    type: 'completion',
    issueDate: '2024-12-15',
    grade: 'A',
    score: 95,
    rank: 1,
    totalParticipants: 45,
    verificationCode: 'CERT-2024-001-VERIFY',
    qrCode: 'https://verify.university.ac.th/cert/cert-001'
  },
  
  institution: {
    name: 'มหาวิทยาลัยเทคโนโลยีแห่งอนาคต',
    nameEn: 'Future Technology University',
    logo: 'https://via.placeholder.com/100x100/0066cc/ffffff?text=LOGO',
    address: '123 ถนนเทคโนโลยี เขตนวัตกรรม กรุงเทพฯ 10400',
    website: 'https://university.ac.th',
    phone: '02-123-4567',
    email: 'info@university.ac.th'
  },
  
  signatories: [
    {
      id: 'sign-001',
      name: 'ศาสตราจารย์ ดร.วิชาการ ใหญ่มาก',
      title: 'อธิการบดี',
      department: 'สำนักงานอธิการบดี',
      signature: 'https://via.placeholder.com/200x80/000000/ffffff?text=Signature1',
      signedAt: '2024-12-15T10:00:00Z'
    },
    {
      id: 'sign-002',
      name: 'รองศาสตราจารย์ ดร.คณบดี เก่งดี',
      title: 'คณบดีคณะวิทยาศาสตร์',
      department: 'คณะวิทยาศาสตร์',
      signature: 'https://via.placeholder.com/200x80/000000/ffffff?text=Signature2',
      signedAt: '2024-12-15T10:30:00Z'
    }
  ],
  
  customFields: {
    honors: 'เกียรตินิยมอันดับ 1',
    specialNote: 'ผู้ที่มีผลงานดีเด่นประจำปี 2024'
  }
};
