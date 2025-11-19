// =====================================
// Common API Response Types
// =====================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// ✅ ตรงกับ API จริง: {data: [...], pagination: {...}}
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  code?: string;
}

// =====================================
// User & Auth Types
// =====================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'staff' | 'signer' | 'user' | 'guest';
  position?: string;
  department?: string;
  organization?: string;
  phoneNumber?: string;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  organization?: string;
}

// =====================================
// Activity Types
// =====================================

export interface Activity {
  id: string;
  nameTh: string; // API ส่ง nameTh, nameEn แยกกัน
  nameEn?: string;
  description?: string;
  activityType: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizerId?: string; // API ส่ง organizerId แทน organizer
  maxParticipants?: number;
  currentParticipants?: number; // API ส่ง currentParticipants แทน participantCount
  status: 'draft' | 'active' | 'upcoming' | 'completed' | 'cancelled'; // ปรับให้ตรงกับ API จริง
  certificateTemplateId?: string;
  certificateTemplate?: Template;
  certificateCount?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityCreateRequest {
  nameTh: string; // ใช้ nameTh แทน name
  nameEn?: string;
  description?: string;
  activityType: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizerId?: string; // ใช้ organizerId แทน organizer
  maxParticipants?: number;
  certificateTemplateId?: string;
}

// =====================================
// Template Types
// =====================================

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  backgroundImageUrl?: string;
  backgroundColor?: string;
  elements: TemplateElement[];
  isPublic: boolean;
  isActive: boolean;
  createdBy?: string;
  usageCount?: number;
  previewImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr' | 'signature' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  imageUrl?: string;
  variableName?: string;
  [key: string]: any;
}

export interface TemplateCreateRequest {
  name: string;
  description?: string;
  category?: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  backgroundImageUrl?: string;
  backgroundColor?: string;
  elements?: TemplateElement[];
  isPublic?: boolean;
}

// =====================================
// Certificate Types
// =====================================

export interface Certificate {
  id: string;
  certificateNumber: string;
  recipientId: string;
  recipient?: Recipient;
  activityId: string;
  activity?: Activity;
  templateId: string;
  template?: Template;
  status: 'draft' | 'pending_approval' | 'pending_signature' | 'approved' | 'issued' | 'revoked';
  issueDate?: string;
  expiryDate?: string;
  qrCode?: string;
  verificationCode?: string;
  pdfUrl?: string;
  metadata?: Record<string, any>;
  issuedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateCreateRequest {
  recipientId: string;
  activityId: string;
  templateId: string;
  issueDate?: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

export interface BulkCertificateRequest {
  activityId: string;
  templateId: string;
  recipientIds: string[];
  issueDate?: string;
}

// =====================================
// Recipient Types
// =====================================

export interface Recipient {
  id: string;
  userId?: string;
  user?: User;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentId?: string;
  organization?: string;
  department?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipientCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  organization?: string;
  department?: string;
  phoneNumber?: string;
}

// =====================================
// Signature Types
// =====================================

export interface Signature {
  id: string;
  signerId: string;
  signer?: User;
  signatureImageUrl: string;
  position: string;
  department?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureCreateRequest {
  signerId: string;
  signatureImageUrl: string;
  position: string;
  department?: string;
  isDefault?: boolean;
}

// =====================================
// Statistics & Analytics Types
// =====================================

// ✅ Dashboard API Response Types (ตรงกับ API จริง)
export interface DashboardApiResponse {
  activities: {
    active: number;
    completed: number;
    total: number;
    upcoming: number;
  };
  certificates: {
    draft: number;
    generated: number;
    sent: number;
    total: number;
    verified: number;
  };
  pendingTasks: PendingTask[];
  recentActivities: RecentActivity[];
  users: {
    admins: number;
    online: number;
    signers: number;
    staff: number;
    total: number;
  };
}

export interface PendingTask {
  id: string;
  title: string;
  type: 'approval' | 'verification';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

// ✅ Dashboard Stats (สำหรับ internal use ใน component)
export interface DashboardStats {
  totalActivities: number;
  totalCertificates: number;
  totalVerifications: number;
  totalUsers: number;
  activitiesThisMonth: number;
  certificatesThisMonth: number;
  verificationsThisMonth: number;
  usersThisMonth: number;
  pendingApprovals: number;
  pendingSignatures: number;
}

export interface ActivityStats {
  activityId: string;
  activityName: string;
  participantCount: number;
  certificateCount: number;
  issuedCount: number;
  pendingCount: number;
}

export interface VerificationStats {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  verificationsToday: number;
  verificationsThisWeek: number;
  verificationsThisMonth: number;
}

// =====================================
// Email & Distribution Types
// =====================================

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  activityId?: string;
  templateId?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDelivery {
  id: string;
  campaignId?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

// =====================================
// QR Code Types
// =====================================

export interface QRCode {
  id: string;
  certificateId: string;
  certificate?: Certificate;
  qrData: string;
  qrImageUrl: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRScan {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

// =====================================
// Bulk Operation Types
// =====================================

export interface BulkOperation {
  id: string;
  operationType: 'import_recipients' | 'generate_certificates' | 'send_emails';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failedCount: number;
  errorMessage?: string;
  fileUrl?: string;
  resultFileUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

// =====================================
// Audit Log Types
// =====================================

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

// =====================================
// Settings Types
// =====================================

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  description?: string;
  isPublic: boolean;
  updatedBy?: string;
  updatedAt: string;
}

export interface SettingUpdateRequest {
  key: string;
  value: string;
}

// =====================================
// Verification Types
// =====================================

export interface VerificationRequest {
  verificationCode: string;
}

export interface VerificationResponse {
  valid: boolean;
  certificate: Certificate | null;
  message: string;
}

export interface PublicVerificationRequest {
  requesterName: string;
  requesterEmail: string;
  certificateNumber: string;
  purpose: string;
}
