// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string | null;  // ✅ API ส่ง null, ไม่ใช่ undefined
  last_name_en: string | null;   // ✅ API ส่ง null, ไม่ใช่ undefined
  student_id: string | null;     // ✅ API ส่ง null, ไม่ใช่ undefined
  faculty: string | null;        // ✅ API ส่ง null, ไม่ใช่ undefined
  phone: string | null;          // ✅ API ส่ง null, ไม่ใช่ undefined
  role_id: number;
  role: Role;                    // ✅ API ส่งมาเสมอ, ไม่ optional
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;     // ✅ API ส่ง null, ไม่ใช่ undefined
  created_at: string;
  updated_at: string;
}

// Role Types
export interface Role {
  id: number;
  name: string;                  // ✅ API ส่ง lowercase: "admin", "staff", "signer", "student"
  description: string;           // ✅ API ส่งมาเสมอ, ไม่ optional
  permissions: string[];
  created_at: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token: string; // for backward compatibility
  refreshToken: string; // for backward compatibility
}

// Certificate Types
export interface Certificate {
  id: number;
  studentId: number;
  templateId: number;
  certificateData: CertificateData;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  pdfPath?: string;
  createdBy: number;
  approvedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateData {
  studentName: string;
  course: string;
  date: string;
  grade?: string;
  elements: CertificateElement[];
}

// Template Types
export interface Template {
  id: number;
  name: string;
  description?: string;
  designData: DesignData;
  previewImage?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignData {
  width: number;
  height: number;
  background?: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
  elements: CertificateElement[];
}

// Certificate Element Types
export interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  properties: ElementProperties;
}

export interface ElementProperties {
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Image properties
  src?: string;
  opacity?: number;
  
  // Shape properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // Common properties
  borderRadius?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
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

// Form Types
export interface CertificateForm {
  templateId: number;
  studentId: number;
  certificateData: Partial<CertificateData>;
}

export interface TemplateForm {
  name: string;
  description?: string;
  designData: DesignData;
}

// UI State Types
export interface DesignerState {
  selectedElement: string | null;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  canvasSize: {
    width: number;
    height: number;
  };
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Analytics Types
export interface MemoryPressure {
  physical_memory: number; // Total physical RAM in GB
  memory_used: number;     // Used memory in GB
  cached_files: number;    // Cached files in GB
  swap_used: number;       // Swap usage in GB
  app_memory: number;      // Application memory in GB
  wired_memory: number;    // Wired memory in GB
  compressed: number;      // Compressed memory in GB
}

export interface StorageInfo {
  total_storage: number;     // Total disk space in GB
  used_storage: number;      // Used disk space in GB
  available_storage: number; // Available disk space in GB
  system_files: number;      // System files in GB
  application_files: number; // Application files in GB
  user_files: number;        // User files in GB
  cache_files: number;       // Cache files in GB
}

export interface DashboardOverview {
  system_overview: {
    total_certificates: number;
    total_users: number;
    total_templates: number;
    total_verifications: number;
    system_uptime: number;
    active_sessions: number;
    storage_used: number;
    bandwidth_used: number;
    memory_pressure: MemoryPressure;
    storage_info: StorageInfo;
  };
  certificate_stats: {
    total_certificates: number;
    total_recipients: number;
    generated_count: number;
    download_count: number;
    status_breakdown: any;
    category_breakdown: any;
    monthly_growth: number;
    average_processing_time: number;
  };
  user_stats: {
    total_users: number;
    active_users: number;
    role_breakdown: any;
    new_users_this_month: number;
    user_growth_rate: number;
    average_session_time: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    user_id: string;
    user_name: string;
    timestamp: string;
  }>;
  quick_metrics: Array<{
    name: string;
    value: string;
    change: number;
    change_type: 'increase' | 'decrease' | 'neutral';
    icon: string;
    color: string;
  }>;
  alerts: any;
}

export interface SystemMetrics {
  performance: {
    response_time: number;
    throughput: number;
    error_rate: number;
  };
  resource_usage: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
  health_checks: Array<{
    service: string;
    status: 'healthy' | 'unhealthy';
    last_check: string;
  }>;
  system_status: string;
  last_updated: string;
}

export interface TrendData {
  date: string;
  value: number;
  label: string;
}

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  created_by?: string;
  template_id?: string;
  category?: string;
}

// Template Designer Types
export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr_code';
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style: {
    font_family?: string;
    font_size?: number;
    color?: string;
    font_weight?: 'normal' | 'bold';
    text_align?: 'left' | 'center' | 'right';
    text_decoration?: 'none' | 'underline';
    background_color?: string;
    border_radius?: number;
    opacity?: number;
    foreground_color?: string;
  };
  z_index?: number;
  rotation?: number;
  locked?: boolean;
}

export interface TemplateDesign {
  id: string;
  template_id: string;
  name: string;
  width: number;
  height: number;
  background_color: string;
  background_image?: string;
  elements: TemplateElement[];
  created_at: string;
  updated_at: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  design?: TemplateDesign;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  design: {
    width: number;
    height: number;
    background_color: string;
    background_image?: string;
    elements: Omit<TemplateElement, 'id'>[];
  };
}

export interface TemplateValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateUsageStats {
  template_id: string;
  usage_count: number;
  last_used: string;
  popular_elements: Array<{
    type: string;
    count: number;
  }>;
  performance_metrics: {
    average_generation_time: number;
    success_rate: number;
  };
}

// Registration Types
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'signer' | 'student';
}
