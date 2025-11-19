import { get, post } from './axios';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from './types';

/**
 * Authentication Service
 * จัดการการ login, register, logout และ token management
 */
class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * เข้าสู่ระบบ
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, credentials);

    // บันทึก token และ user ใน localStorage
    if (response.success && response.data) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * ลงทะเบียนผู้ใช้ใหม่
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return post<ApiResponse<User>>(`${this.baseUrl}/register`, userData);
  }

  /**
   * ออกจากระบบ
   */
  async logout(): Promise<void> {
    try {
      await post(`${this.baseUrl}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ลบข้อมูลทั้งหมดใน localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * รีเฟรช access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return post<ApiResponse<LoginResponse>>(`${this.baseUrl}/refresh`, {
      refresh_token: refreshToken,
    });
  }

  /**
   * ขอรีเซ็ตรหัสผ่าน
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.baseUrl}/forgot-password`, { email });
  }

  /**
   * รีเซ็ตรหัสผ่าน
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.baseUrl}/reset-password`, {
      token,
      new_password: newPassword,
    });
  }

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบัน
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return get<ApiResponse<User>>(`${this.baseUrl}/me`);
  }

  /**
   * ตรวจสอบว่า user login อยู่หรือไม่
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * ดึงข้อมูล user จาก localStorage
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Parse user error:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * ตรวจสอบสิทธิ์ตาม role
   */
  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }

  /**
   * ตรวจสอบว่าเป็น Admin หรือไม่
   */
  isAdmin(): boolean {
    return this.hasRole(['super_admin', 'admin']);
  }

  /**
   * ตรวจสอบว่าเป็น Staff หรือไม่
   */
  isStaff(): boolean {
    return this.hasRole(['super_admin', 'admin', 'staff']);
  }

  /**
   * ตรวจสอบว่าเป็น Signer หรือไม่
   */
  isSigner(): boolean {
    return this.hasRole('signer');
  }
}

export const authService = new AuthService();
export default authService;
