import { get, post, put, del } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Activity,
  ActivityCreateRequest,
} from './types';

/**
 * Activity Service
 * จัดการข้อมูลกิจกรรม
 */
class ActivityService {
  private readonly baseUrl = '/activities';

  /**
   * ดึงรายการกิจกรรมทั้งหมด (แบบแบ่งหน้า)
   */
  async getActivities(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Activity>>> {
    return get<ApiResponse<PaginatedResponse<Activity>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูลกิจกรรมตาม ID
   */
  async getActivity(id: string): Promise<ApiResponse<Activity>> {
    return get<ApiResponse<Activity>>(`${this.baseUrl}/${id}`);
  }

  /**
   * สร้างกิจกรรมใหม่
   */
  async createActivity(data: ActivityCreateRequest): Promise<ApiResponse<Activity>> {
    return post<ApiResponse<Activity>>(this.baseUrl, data);
  }

  /**
   * แก้ไขข้อมูลกิจกรรม
   */
  async updateActivity(id: string, data: Partial<ActivityCreateRequest>): Promise<ApiResponse<Activity>> {
    return put<ApiResponse<Activity>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * ลบกิจกรรม
   */
  async deleteActivity(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * กำหนดเทมเพลตให้กับกิจกรรม
   */
  async assignTemplate(activityId: string, templateId: string): Promise<ApiResponse<Activity>> {
    return post<ApiResponse<Activity>>(`${this.baseUrl}/${activityId}/assign-template`, {
      template_id: templateId,
    });
  }

  /**
   * อนุมัติกิจกรรม
   */
  async approveActivity(activityId: string): Promise<ApiResponse<Activity>> {
    return post<ApiResponse<Activity>>(`${this.baseUrl}/${activityId}/approve`);
  }

  /**
   * เปลี่ยนสถานะกิจกรรม
   */
  async updateStatus(activityId: string, status: string): Promise<ApiResponse<Activity>> {
    return put<ApiResponse<Activity>>(`${this.baseUrl}/${activityId}/status`, { status });
  }

  /**
   * ดึงสถิติของกิจกรรม
   */
  async getActivityStats(activityId: string): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/${activityId}/statistics`);
  }

  /**
   * ดึงรายการผู้เข้าร่วมกิจกรรม
   */
  async getParticipants(activityId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return get<ApiResponse<PaginatedResponse<any>>>(`${this.baseUrl}/${activityId}/participants`, { params });
  }

  /**
   * ดึงรายการเกียรติบัตรของกิจกรรม
   */
  async getCertificates(activityId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return get<ApiResponse<PaginatedResponse<any>>>(`${this.baseUrl}/${activityId}/certificates`, { params });
  }
}

export const activityService = new ActivityService();
export default activityService;
