// Signer Document Workflow Types

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'staff' | 'admin' | 'signer';
  position?: string;
  department?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityDetails {
  id: string;
  name: string;
  type: string;
  description: string;
  date: Date;
  location?: string;
  organizer: string;
}

export interface Recipient {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  year?: number;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  template_data: any;
  preview_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
}

export interface DocumentMetadata {
  totalPages: number;
  fileSize: number;
  format: string;
  createdBy: string;
  lastModified: Date;
}

export interface PendingDocument {
  id: string;
  title: string;
  activityType: string;
  recipientCount: number;
  requestDate: Date;
  priority: 'high' | 'medium' | 'low';
  requestedBy: User;
  dueDate?: Date;
  certificateTemplate: CertificateTemplate;
  status: 'pending' | 'in_progress' | 'signed' | 'rejected';
  description?: string;
}

export interface DocumentToSign {
  id: string;
  title: string;
  description: string;
  activityDetails: ActivityDetails;
  recipients: Recipient[];
  certificatePreview: string; // Base64 image
  signaturePosition: SignaturePosition;
  metadata: DocumentMetadata;
  requestedBy: User;
  requestDate: Date;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface Signature {
  id: string;
  userId: string;
  imageUrl: string;
  imageData: string; // Base64
  fileName: string;
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SigningRecord {
  id: string;
  documentId: string;
  documentTitle: string;
  signatureId: string;
  signedAt: Date;
  recipientCount: number;
  activityType: string;
  status: 'completed' | 'rejected';
  rejectionReason?: string;
  processingTime: number; // seconds
  signedBy: User;
}

export interface SigningStats {
  pendingCount: number;
  completedThisMonth: number;
  totalSigned: number;
  averageProcessingTime: number;
  urgentPending: number;
  rejectedCount: number;
  activeSignatures: number;
}

export interface SigningActivity {
  id: string;
  type: 'signed' | 'rejected' | 'received' | 'uploaded_signature';
  documentTitle?: string;
  timestamp: Date;
  details: string;
  priority?: 'high' | 'medium' | 'low';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Types
export interface SigningError {
  code: string;
  message: string;
  details?: any;
}

export enum SigningErrorCode {
  SIGNATURE_UPLOAD_FAILED = 'SIGNATURE_UPLOAD_FAILED',
  DOCUMENT_LOAD_FAILED = 'DOCUMENT_LOAD_FAILED',
  SIGNING_FAILED = 'SIGNING_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_SIGNATURE_FORMAT = 'INVALID_SIGNATURE_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE'
}

// Form Types
export interface SignatureUploadForm {
  file: File;
  name?: string;
}

export interface DocumentRejectForm {
  documentId: string;
  reason: string;
  comments?: string;
}

export interface SigningForm {
  documentId: string;
  signatureId: string;
  position: SignaturePosition;
  comments?: string;
}

// Filter and Search Types
export interface DocumentFilter {
  status?: 'pending' | 'signed' | 'rejected';
  priority?: 'high' | 'medium' | 'low';
  activityType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'document_received' | 'urgent_document' | 'signing_reminder' | 'system_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  documentId?: string;
  priority?: 'high' | 'medium' | 'low';
}