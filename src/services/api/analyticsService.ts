import { get, post } from './axios';
import type {
  ApiResponse,
  DashboardStats,
  VerificationStats,
} from './types';

/**
 * Analytics Service
 * จัดการสถิติและรายงาน
 */
class AnalyticsService {
  private readonly baseUrl = '/analytics';
  private readonly statsUrl = '/statistics';
  private readonly reportsUrl = '/reports';

  /**
   * ดึงสถิติ Dashboard แบบรวม
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard`);
  }

  /**
   * ดึงสถิติ Admin Dashboard
   */
  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>('/admin/dashboard/statistics');
  }

  /**
   * ดึงกิจกรรมล่าสุด
   */
  async getRecentActivities(limit: number = 10): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>('/admin/dashboard/recent-activities', {
      params: { limit },
    });
  }

  /**
   * ดึงงานที่ต้องดำเนินการ
   */
  async getPendingTasks(): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>('/admin/dashboard/pending-tasks');
  }

  /**
   * ดึงจำนวนผู้ใช้ออนไลน์
   */
  async getOnlineUsers(): Promise<ApiResponse<{ count: number; users: any[] }>> {
    return get<ApiResponse<{ count: number; users: any[] }>>('/admin/dashboard/online-users');
  }

  /**
   * ดึงสถิติรายวัน
   */
  async getDailyStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>(`${this.statsUrl}/daily`, { params });
  }

  /**
   * ดึงสถิติการตรวจสอบ
   */
  async getVerificationStats(): Promise<ApiResponse<VerificationStats>> {
    return get<ApiResponse<VerificationStats>>(`${this.statsUrl}/verifications`);
  }

  /**
   * ดึงสถิติกิจกรรม
   */
  async getActivityStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>(`${this.statsUrl}/activities`, { params });
  }

  /**
   * ดึงสถิติเกียรติบัตร
   */
  async getCertificateStats(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
  }): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>(`${this.statsUrl}/certificates`, { params });
  }

  /**
   * ดึงสถิติผู้ใช้
   */
  async getUserStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.statsUrl}/users`, { params });
  }

  /**
   * ดึงสถิติการใช้งานระบบ
   */
  async getSystemUsageStats(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.statsUrl}/system-usage`);
  }

  /**
   * รายงานกิจกรรม
   */
  async getActivityReport(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.reportsUrl}/activities`, { params });
  }

  /**
   * รายงานเกียรติบัตร
   */
  async getCertificateReport(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    activityId?: string;
  }): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.reportsUrl}/certificates`, { params });
  }

  /**
   * รายงานการตรวจสอบ
   */
  async getVerificationReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.reportsUrl}/verifications`, { params });
  }

  /**
   * รายงานการใช้งานระบบ
   */
  async getSystemUsageReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.reportsUrl}/system-usage`, { params });
  }

  /**
   * ส่งออกรายงาน (PDF/Excel)
   */
  async exportReport(reportType: string, format: 'pdf' | 'excel', params?: any): Promise<Blob> {
    const response = await get<Blob>(`${this.reportsUrl}/export`, {
      params: { type: reportType, format, ...params },
      responseType: 'blob',
    });
    return response;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
