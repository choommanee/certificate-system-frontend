import { get, post, del } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  QRCode,
  QRScan,
} from './types';

/**
 * QR Code Service
 * จัดการ QR Code และการสแกน
 */
class QRService {
  private readonly qrUrl = '/qr-codes';
  private readonly scanUrl = '/qr-code-scans';

  /**
   * ดึงรายการ QR codes
   */
  async getQRCodes(params?: {
    page?: number;
    limit?: number;
    certificateId?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<QRCode>>> {
    return get<ApiResponse<PaginatedResponse<QRCode>>>(this.qrUrl, { params });
  }

  /**
   * ดึงข้อมูล QR code ตาม ID
   */
  async getQRCode(id: string): Promise<ApiResponse<QRCode>> {
    return get<ApiResponse<QRCode>>(`${this.qrUrl}/${id}`);
  }

  /**
   * สร้าง QR code สำหรับเกียรติบัตร
   */
  async generateQRCode(certificateId: string, options?: {
    size?: number;
    format?: 'png' | 'svg';
  }): Promise<ApiResponse<QRCode>> {
    return post<ApiResponse<QRCode>>(`${this.qrUrl}/generate`, {
      certificate_id: certificateId,
      ...options,
    });
  }

  /**
   * ลบ QR code
   */
  async deleteQRCode(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.qrUrl}/${id}`);
  }

  /**
   * เปลี่ยนสถานะ QR code
   */
  async toggleQRCodeStatus(id: string, isActive: boolean): Promise<ApiResponse<QRCode>> {
    return post<ApiResponse<QRCode>>(`${this.qrUrl}/${id}/toggle`, { is_active: isActive });
  }

  /**
   * ดึงรายการการสแกน QR
   */
  async getQRScans(params?: {
    page?: number;
    limit?: number;
    qrCodeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<QRScan>>> {
    return get<ApiResponse<PaginatedResponse<QRScan>>>(this.scanUrl, { params });
  }

  /**
   * บันทึกการสแกน QR
   */
  async recordScan(qrCodeId: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<ApiResponse<QRScan>> {
    return post<ApiResponse<QRScan>>(this.scanUrl, {
      qr_code_id: qrCodeId,
      ...metadata,
    });
  }

  /**
   * ดึงสถิติการสแกน
   */
  async getScanStatistics(qrCodeId?: string): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.scanUrl}/statistics`, {
      params: { qr_code_id: qrCodeId },
    });
  }

  /**
   * ตรวจสอบ QR code (Public)
   */
  async verifyQRCode(qrData: string): Promise<ApiResponse<{
    valid: boolean;
    certificate: any;
    message: string;
  }>> {
    return post<ApiResponse<any>>('/public/verify-qr', { qr_data: qrData });
  }
}

export const qrService = new QRService();
export default qrService;
