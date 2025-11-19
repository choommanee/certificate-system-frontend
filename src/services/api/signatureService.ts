import { get, post, put, del, upload } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Signature,
  SignatureCreateRequest,
} from './types';

/**
 * Signature Service
 * จัดการลายเซ็นและผู้มีอำนาจลงนาม
 */
class SignatureService {
  private readonly baseUrl = '/signatures';

  /**
   * ดึงรายการลายเซ็นทั้งหมด
   */
  async getSignatures(params?: {
    page?: number;
    limit?: number;
    signerId?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Signature>>> {
    return get<ApiResponse<PaginatedResponse<Signature>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูลลายเซ็นตาม ID
   */
  async getSignature(id: string): Promise<ApiResponse<Signature>> {
    return get<ApiResponse<Signature>>(`${this.baseUrl}/${id}`);
  }

  /**
   * สร้างลายเซ็นใหม่
   */
  async createSignature(data: SignatureCreateRequest): Promise<ApiResponse<Signature>> {
    return post<ApiResponse<Signature>>(this.baseUrl, data);
  }

  /**
   * แก้ไขข้อมูลลายเซ็น
   */
  async updateSignature(id: string, data: Partial<SignatureCreateRequest>): Promise<ApiResponse<Signature>> {
    return put<ApiResponse<Signature>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * ลบลายเซ็น
   */
  async deleteSignature(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * อัปโหลดรูปลายเซ็น
   */
  async uploadSignature(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return upload<ApiResponse<{ url: string }>>(
      `${this.baseUrl}/upload`,
      formData,
      onProgress ? (e) => onProgress(Math.round((e.loaded * 100) / e.total)) : undefined
    );
  }

  /**
   * ตั้งเป็นลายเซ็นเริ่มต้น
   */
  async setDefaultSignature(id: string): Promise<ApiResponse<Signature>> {
    return post<ApiResponse<Signature>>(`${this.baseUrl}/${id}/set-default`);
  }

  /**
   * เปลี่ยนสถานะลายเซ็น
   */
  async toggleSignatureStatus(id: string, isActive: boolean): Promise<ApiResponse<Signature>> {
    return put<ApiResponse<Signature>>(`${this.baseUrl}/${id}/status`, { is_active: isActive });
  }

  /**
   * ดึงประวัติการใช้ลายเซ็น
   */
  async getSignatureHistory(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    return get<ApiResponse<PaginatedResponse<any>>>(`${this.baseUrl}/${id}/history`, { params });
  }

  /**
   * ดึงลายเซ็นของผู้ลงนาม (Signer)
   */
  async getSignerSignatures(signerId: string): Promise<ApiResponse<Signature[]>> {
    return get<ApiResponse<Signature[]>>(`${this.baseUrl}/signer/${signerId}`);
  }

  /**
   * ดึงลายเซ็นของตัวเอง
   */
  async getMySignatures(): Promise<ApiResponse<Signature[]>> {
    return get<ApiResponse<Signature[]>>(`${this.baseUrl}/my`);
  }

  /**
   * ดึงสถิติการใช้ลายเซ็น
   */
  async getSignatureStatistics(id?: string): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/statistics`, {
      params: id ? { signature_id: id } : undefined,
    });
  }
}

export const signatureService = new SignatureService();
export default signatureService;
