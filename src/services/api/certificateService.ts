import { get, post, put, del, download } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Certificate,
  CertificateCreateRequest,
  BulkCertificateRequest,
} from './types';

/**
 * Certificate Service
 * จัดการเกียรติบัตร
 */
class CertificateService {
  private readonly baseUrl = '/certificates';

  /**
   * ดึงรายการเกียรติบัตรทั้งหมด
   */
  async getCertificates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    activityId?: string;
    recipientId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Certificate>>> {
    return get<ApiResponse<PaginatedResponse<Certificate>>>(this.baseUrl, { params });
  }

  /**
   * ดึงข้อมูลเกียรติบัตรตาม ID
   */
  async getCertificate(id: string): Promise<ApiResponse<Certificate>> {
    return get<ApiResponse<Certificate>>(`${this.baseUrl}/${id}`);
  }

  /**
   * ดึงเกียรติบัตรของฉัน
   */
  async getMyCertificates(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Certificate>>> {
    return get<ApiResponse<PaginatedResponse<Certificate>>>(`${this.baseUrl}/my`, { params });
  }

  /**
   * สร้างเกียรติบัตรรายบุคคล
   */
  async createCertificate(data: CertificateCreateRequest): Promise<ApiResponse<Certificate>> {
    return post<ApiResponse<Certificate>>(this.baseUrl, data);
  }

  /**
   * สร้างเกียรติบัตรหลายใบพร้อมกัน (Bulk)
   */
  async createBulkCertificates(data: BulkCertificateRequest): Promise<ApiResponse<any>> {
    return post<ApiResponse<any>>(`${this.baseUrl}/bulk`, data);
  }

  /**
   * แก้ไขข้อมูลเกียรติบัตร
   */
  async updateCertificate(id: string, data: Partial<CertificateCreateRequest>): Promise<ApiResponse<Certificate>> {
    return put<ApiResponse<Certificate>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * ลบเกียรติบัตร
   */
  async deleteCertificate(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * ดูตัวอย่างเกียรติบัตรก่อนออก
   */
  async previewCertificate(id: string): Promise<ApiResponse<{ previewUrl: string }>> {
    return get<ApiResponse<{ previewUrl: string }>>(`${this.baseUrl}/${id}/preview`);
  }

  /**
   * ออกเกียรติบัตร (Issue)
   */
  async issueCertificate(id: string): Promise<ApiResponse<Certificate>> {
    return post<ApiResponse<Certificate>>(`${this.baseUrl}/${id}/issue`);
  }

  /**
   * เพิกถอนเกียรติบัตร (Revoke)
   */
  async revokeCertificate(id: string, reason: string): Promise<ApiResponse<Certificate>> {
    return post<ApiResponse<Certificate>>(`${this.baseUrl}/${id}/revoke`, { reason });
  }

  /**
   * ดาวน์โหลดเกียรติบัตร (PDF)
   */
  async downloadCertificate(id: string, filename?: string): Promise<void> {
    const cert = await this.getCertificate(id);
    const downloadFilename = filename || `certificate_${cert.data.certificateNumber}.pdf`;
    await download(`${this.baseUrl}/${id}/download`, downloadFilename);
  }

  /**
   * ส่งเกียรติบัตรทางอีเมล
   */
  async sendCertificateEmail(id: string, email?: string): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.baseUrl}/${id}/send-email`, { email });
  }

  /**
   * อนุมัติเกียรติบัตร
   */
  async approveCertificate(id: string, notes?: string): Promise<ApiResponse<Certificate>> {
    return post<ApiResponse<Certificate>>(`${this.baseUrl}/${id}/approve`, { notes });
  }

  /**
   * ปฏิเสธเกียรติบัตร
   */
  async rejectCertificate(id: string, reason: string): Promise<ApiResponse<Certificate>> {
    return post<ApiResponse<Certificate>>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  /**
   * ลงนามเกียรติบัตร
   */
  async signCertificate(id: string, signatureId: string): Promise<ApiResponse<Certificate>> {
    return post<ApiResponse<Certificate>>(`${this.baseUrl}/${id}/sign`, {
      signature_id: signatureId,
    });
  }

  /**
   * ดึงสถิติเกียรติบัตร
   */
  async getCertificateStats(): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.baseUrl}/statistics`);
  }

  /**
   * ตรวจสอบความถูกต้องของเกียรติบัตร (Public)
   */
  async verifyCertificate(verificationCode: string): Promise<ApiResponse<any>> {
    return post<ApiResponse<any>>('/public/verify', { verification_code: verificationCode });
  }

  /**
   * แชร์เกียรติบัตร
   */
  async shareCertificate(id: string, platform: 'facebook' | 'twitter' | 'linkedin' | 'line'): Promise<ApiResponse<{ shareUrl: string }>> {
    return post<ApiResponse<{ shareUrl: string }>>(`${this.baseUrl}/${id}/share`, { platform });
  }
}

export const certificateService = new CertificateService();
export default certificateService;
