import { get, put, post } from './axios';
import type {
  ApiResponse,
  SystemSetting,
  SettingUpdateRequest,
} from './types';

/**
 * Settings Service
 * จัดการการตั้งค่าระบบ
 */
class SettingsService {
  private readonly baseUrl = '/settings';
  private readonly systemUrl = '/system';

  /**
   * ดึงการตั้งค่าทั้งหมด
   */
  async getSettings(category?: string): Promise<ApiResponse<SystemSetting[]>> {
    return get<ApiResponse<SystemSetting[]>>(this.baseUrl, {
      params: category ? { category } : undefined,
    });
  }

  /**
   * ดึงการตั้งค่าตาม key
   */
  async getSetting(key: string): Promise<ApiResponse<SystemSetting>> {
    return get<ApiResponse<SystemSetting>>(`${this.baseUrl}/${key}`);
  }

  /**
   * อัปเดตการตั้งค่า
   */
  async updateSetting(key: string, value: string): Promise<ApiResponse<SystemSetting>> {
    return put<ApiResponse<SystemSetting>>(`${this.baseUrl}/${key}`, { value });
  }

  /**
   * อัปเดตหลายการตั้งค่าพร้อมกัน
   */
  async updateSettings(settings: SettingUpdateRequest[]): Promise<ApiResponse<SystemSetting[]>> {
    return put<ApiResponse<SystemSetting[]>>(this.baseUrl, { settings });
  }

  /**
   * ดึงการตั้งค่าทั่วไป
   */
  async getGeneralSettings(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/general`);
  }

  /**
   * อัปเดตการตั้งค่าทั่วไป
   */
  async updateGeneralSettings(data: any): Promise<ApiResponse<any>> {
    return put<ApiResponse<any>>(`${this.baseUrl}/general`, data);
  }

  /**
   * ดึงการตั้งค่าอีเมล
   */
  async getEmailSettings(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/email`);
  }

  /**
   * อัปเดตการตั้งค่าอีเมล
   */
  async updateEmailSettings(data: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    smtpSecure?: boolean;
    fromEmail?: string;
    fromName?: string;
  }): Promise<ApiResponse<any>> {
    return put<ApiResponse<any>>(`${this.baseUrl}/email`, data);
  }

  /**
   * ทดสอบการตั้งค่าอีเมล
   */
  async testEmailSettings(testEmail: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return post<ApiResponse<any>>(`${this.baseUrl}/email/test`, { test_email: testEmail });
  }

  /**
   * ดึงการตั้งค่า QR Code
   */
  async getQRSettings(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/qr`);
  }

  /**
   * อัปเดตการตั้งค่า QR Code
   */
  async updateQRSettings(data: {
    defaultSize?: number;
    defaultFormat?: string;
    errorCorrectionLevel?: string;
  }): Promise<ApiResponse<any>> {
    return put<ApiResponse<any>>(`${this.baseUrl}/qr`, data);
  }

  /**
   * ดึงการตั้งค่าความปลอดภัย
   */
  async getSecuritySettings(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/security`);
  }

  /**
   * อัปเดตการตั้งค่าความปลอดภัย
   */
  async updateSecuritySettings(data: {
    passwordMinLength?: number;
    passwordRequireUppercase?: boolean;
    passwordRequireNumbers?: boolean;
    passwordRequireSpecialChars?: boolean;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
  }): Promise<ApiResponse<any>> {
    return put<ApiResponse<any>>(`${this.baseUrl}/security`, data);
  }

  /**
   * สำรองข้อมูล
   */
  async createBackup(): Promise<ApiResponse<{ backupId: string; fileUrl: string }>> {
    return post<ApiResponse<any>>(`${this.systemUrl}/backup`);
  }

  /**
   * ดึงรายการไฟล์สำรอง
   */
  async getBackupLogs(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>('/backup-logs', { params });
  }

  /**
   * ดาวน์โหลดไฟล์สำรอง
   */
  async downloadBackup(backupId: string): Promise<Blob> {
    return get<Blob>(`${this.systemUrl}/backup/${backupId}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * ลบไฟล์สำรอง
   */
  async deleteBackup(backupId: string): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.systemUrl}/backup/${backupId}/delete`);
  }

  /**
   * ตรวจสอบสุขภาพระบบ
   */
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>('/health');
  }

  /**
   * ดึงข้อมูลระบบ
   */
  async getSystemInfo(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.systemUrl}/info`);
  }
}

export const settingsService = new SettingsService();
export default settingsService;
