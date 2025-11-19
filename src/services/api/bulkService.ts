import { get, post, upload } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  BulkOperation,
  ImportError,
} from './types';

/**
 * Bulk Operations Service
 * จัดการการนำเข้าข้อมูลและการทำงานแบบกลุ่ม
 */
class BulkService {
  private readonly baseUrl = '/bulk-operations';

  /**
   * ดึงรายการ bulk operations
   */
  async getOperations(params?: {
    page?: number;
    limit?: number;
    operationType?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<BulkOperation>>> {
    return get<ApiResponse<PaginatedResponse<BulkOperation>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูล operation ตาม ID
   */
  async getOperation(id: string): Promise<ApiResponse<BulkOperation>> {
    return get<ApiResponse<BulkOperation>>(`${this.baseUrl}/${id}`);
  }

  /**
   * อัปโหลดไฟล์สำหรับนำเข้า
   */
  async uploadFile(
    file: File,
    operationType: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ fileUrl: string; operationId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('operation_type', operationType);

    return upload<ApiResponse<{ fileUrl: string; operationId: string }>>(
      `${this.baseUrl}/upload`,
      formData,
      onProgress ? (e) => onProgress(Math.round((e.loaded * 100) / e.total)) : undefined
    );
  }

  /**
   * ตรวจสอบข้อมูลก่อนนำเข้า
   */
  async validateImport(operationId: string): Promise<ApiResponse<{
    isValid: boolean;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: ImportError[];
  }>> {
    return post<ApiResponse<any>>(`${this.baseUrl}/${operationId}/validate`);
  }

  /**
   * ยืนยันการนำเข้าข้อมูล
   */
  async confirmImport(operationId: string, options?: {
    skipInvalid?: boolean;
    sendNotifications?: boolean;
  }): Promise<ApiResponse<BulkOperation>> {
    return post<ApiResponse<BulkOperation>>(`${this.baseUrl}/${operationId}/import`, options);
  }

  /**
   * ยกเลิก operation
   */
  async cancelOperation(operationId: string): Promise<ApiResponse<BulkOperation>> {
    return post<ApiResponse<BulkOperation>>(`${this.baseUrl}/${operationId}/cancel`);
  }

  /**
   * ลองทำ operation ใหม่
   */
  async retryOperation(operationId: string): Promise<ApiResponse<BulkOperation>> {
    return post<ApiResponse<BulkOperation>>(`${this.baseUrl}/${operationId}/retry`);
  }

  /**
   * ดึงสถานะของ operation
   */
  async getOperationStatus(operationId: string): Promise<ApiResponse<{
    status: string;
    progress: number;
    totalRecords: number;
    processedRecords: number;
    successCount: number;
    failedCount: number;
  }>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/${operationId}/status`);
  }

  /**
   * ดึง errors ของ operation
   */
  async getOperationErrors(operationId: string): Promise<ApiResponse<ImportError[]>> {
    return get<ApiResponse<ImportError[]>>(`/import-errors/${operationId}`);
  }

  /**
   * ดาวน์โหลดไฟล์ผลลัพธ์
   */
  async downloadResultFile(operationId: string): Promise<Blob> {
    return get<Blob>(`${this.baseUrl}/${operationId}/download-result`, {
      responseType: 'blob',
    });
  }

  /**
   * ดาวน์โหลดไฟล์ template สำหรับนำเข้า
   */
  async downloadTemplate(operationType: string): Promise<Blob> {
    return get<Blob>(`${this.baseUrl}/templates/${operationType}`, {
      responseType: 'blob',
    });
  }

  /**
   * นำเข้าผู้เข้าร่วม (Recipients) จาก CSV
   */
  async importRecipients(
    file: File,
    activityId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<BulkOperation>> {
    const formData = new FormData();
    formData.append('file', file);
    if (activityId) {
      formData.append('activity_id', activityId);
    }

    return upload<ApiResponse<BulkOperation>>(
      `${this.baseUrl}/import-recipients`,
      formData,
      onProgress ? (e) => onProgress(Math.round((e.loaded * 100) / e.total)) : undefined
    );
  }

  /**
   * สร้างเกียรติบัตรหลายใบพร้อมกัน
   */
  async generateBulkCertificates(data: {
    activityId: string;
    templateId: string;
    recipientIds: string[];
    issueDate?: string;
  }): Promise<ApiResponse<BulkOperation>> {
    return post<ApiResponse<BulkOperation>>(`${this.baseUrl}/generate-certificates`, data);
  }

  /**
   * ส่งอีเมลหลายคนพร้อมกัน
   */
  async sendBulkEmails(data: {
    campaignId?: string;
    certificateIds?: string[];
    recipientEmails?: string[];
  }): Promise<ApiResponse<BulkOperation>> {
    return post<ApiResponse<BulkOperation>>(`${this.baseUrl}/send-emails`, data);
  }
}

export const bulkService = new BulkService();
export default bulkService;
