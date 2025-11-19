import { get } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  AuditLog,
} from './types';

/**
 * Audit Service
 * จัดการ audit logs และการติดตามการใช้งาน
 */
class AuditService {
  private readonly baseUrl = '/audit-logs';

  /**
   * ดึงรายการ audit logs
   */
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    return get<ApiResponse<PaginatedResponse<AuditLog>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูล audit log ตาม ID
   */
  async getAuditLog(id: string): Promise<ApiResponse<AuditLog>> {
    return get<ApiResponse<AuditLog>>(`${this.baseUrl}/${id}`);
  }

  /**
   * ดึง audit logs ของผู้ใช้
   */
  async getUserAuditLogs(userId: string, params?: {
    page?: number;
    limit?: number;
    action?: string;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    return get<ApiResponse<PaginatedResponse<AuditLog>>>(`${this.baseUrl}/user/${userId}`, { params });
  }

  /**
   * ดึง audit logs ของ resource
   */
  async getResourceAuditLogs(resourceType: string, resourceId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    return get<ApiResponse<PaginatedResponse<AuditLog>>>(`${this.baseUrl}/resource/${resourceType}/${resourceId}`, { params });
  }

  /**
   * ดึงสถิติ audit
   */
  async getAuditStatistics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'action' | 'user' | 'resource';
  }): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/statistics`, { params });
  }

  /**
   * ค้นหา audit logs
   */
  async searchAuditLogs(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    return get<ApiResponse<PaginatedResponse<AuditLog>>>(`${this.baseUrl}/search`, {
      params: { q: query, ...params },
    });
  }

  /**
   * ดึงประวัติการเข้าสู่ระบบ
   */
  async getLoginHistory(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return get<ApiResponse<PaginatedResponse<any>>>('/security-logs', { params });
  }

  /**
   * ดึงประวัติการเข้าสู่ระบบของตัวเอง
   */
  async getMyLoginHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return get<ApiResponse<PaginatedResponse<any>>>('/security-logs/my', { params });
  }
}

export const auditService = new AuditService();
export default auditService;
