import { get, post, put, del } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
} from './types';

/**
 * User Service
 * จัดการข้อมูลผู้ใช้
 */
class UserService {
  private readonly baseUrl = '/admin/users';
  private readonly profileUrl = '/profile';

  /**
   * ดึงรายการผู้ใช้ทั้งหมด (Admin only)
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    return get<ApiResponse<PaginatedResponse<User>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูลผู้ใช้ตาม ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }

  /**
   * สร้างผู้ใช้ใหม่
   */
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    position?: string;
    department?: string;
    organization?: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<User>> {
    return post<ApiResponse<User>>(this.baseUrl, data);
  }

  /**
   * แก้ไขข้อมูลผู้ใช้
   */
  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return put<ApiResponse<User>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * ลบผู้ใช้
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * รีเซ็ตรหัสผ่านผู้ใช้
   */
  async resetUserPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.baseUrl}/${id}/reset-password`, {
      new_password: newPassword,
    });
  }

  /**
   * เปลี่ยนสิทธิ์ผู้ใช้
   */
  async updateUserRole(id: string, role: string): Promise<ApiResponse<User>> {
    return put<ApiResponse<User>>(`${this.baseUrl}/${id}/role`, { role });
  }

  /**
   * เปลี่ยนสถานะผู้ใช้ (เปิด/ปิด)
   */
  async toggleUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return put<ApiResponse<User>>(`${this.baseUrl}/${id}/status`, { is_active: isActive });
  }

  /**
   * ดึงประวัติการใช้งานของผู้ใช้
   */
  async getUserActivityLog(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return get<ApiResponse<PaginatedResponse<any>>>(`${this.baseUrl}/${id}/activity-log`, { params });
  }

  /**
   * ดึงข้อมูลโปรไฟล์ของตัวเอง
   */
  async getMyProfile(): Promise<ApiResponse<User>> {
    return get<ApiResponse<User>>(this.profileUrl);
  }

  /**
   * แก้ไขข้อมูลโปรไฟล์ของตัวเอง
   */
  async updateMyProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return put<ApiResponse<User>>(this.profileUrl, data);
  }

  /**
   * เปลี่ยนรหัสผ่านของตัวเอง
   */
  async changeMyPassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.profileUrl}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /**
   * อัปโหลดรูปโปรไฟล์
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return post<ApiResponse<{ url: string }>>(`${this.profileUrl}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * ดึงรายการ roles ทั้งหมด
   */
  async getRoles(): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>('/roles');
  }
}

export const userService = new UserService();
export default userService;
