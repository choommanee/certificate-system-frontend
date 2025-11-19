import { get, post, put, del, upload } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Template,
  TemplateCreateRequest,
} from './types';

/**
 * Template Service
 * จัดการเทมเพลตเกียรติบัตร
 */
class TemplateService {
  private readonly baseUrl = '/templates';

  /**
   * ดึงรายการเทมเพลตทั้งหมด
   */
  async getTemplates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isPublic?: boolean;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Template>>> {
    return get<ApiResponse<PaginatedResponse<Template>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูลเทมเพลตตาม ID
   */
  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return get<ApiResponse<Template>>(`${this.baseUrl}/${id}`);
  }

  /**
   * สร้างเทมเพลตใหม่
   */
  async createTemplate(data: TemplateCreateRequest): Promise<ApiResponse<Template>> {
    return post<ApiResponse<Template>>(this.baseUrl, data);
  }

  /**
   * แก้ไขข้อมูลเทมเพลต
   */
  async updateTemplate(id: string, data: Partial<TemplateCreateRequest>): Promise<ApiResponse<Template>> {
    return put<ApiResponse<Template>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * ลบเทมเพลต
   */
  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * คัดลอกเทมเพลต
   */
  async cloneTemplate(id: string, name?: string): Promise<ApiResponse<Template>> {
    return post<ApiResponse<Template>>(`${this.baseUrl}/${id}/clone`, { name });
  }

  /**
   * อัปโหลดรูปพื้นหลัง
   */
  async uploadBackground(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return upload<ApiResponse<{ url: string }>>(
      '/template-assets/upload',
      formData,
      onProgress ? (e) => onProgress(Math.round((e.loaded * 100) / e.total)) : undefined
    );
  }

  /**
   * ดึงรายการ assets ของเทมเพลต
   */
  async getAssets(params?: {
    type?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    return get<ApiResponse<any[]>>('/template-assets', { params });
  }

  /**
   * ลบ asset
   */
  async deleteAsset(assetId: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`/template-assets/${assetId}`);
  }

  /**
   * สร้างตัวอย่างเทมเพลต
   */
  async generatePreview(id: string, data?: any): Promise<ApiResponse<{ previewUrl: string }>> {
    return post<ApiResponse<{ previewUrl: string }>>(`${this.baseUrl}/${id}/preview`, data);
  }

  /**
   * ดึงสถิติการใช้งานเทมเพลต
   */
  async getTemplateStats(id: string): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/${id}/statistics`);
  }

  /**
   * เปลี่ยนสถานะเทมเพลต
   */
  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<Template>> {
    return put<ApiResponse<Template>>(`${this.baseUrl}/${id}/status`, { is_active: isActive });
  }

  /**
   * เปลี่ยนสถานะการเผยแพร่
   */
  async togglePublic(id: string, isPublic: boolean): Promise<ApiResponse<Template>> {
    return put<ApiResponse<Template>>(`${this.baseUrl}/${id}/visibility`, { is_public: isPublic });
  }
}

export const templateService = new TemplateService();
export default templateService;
