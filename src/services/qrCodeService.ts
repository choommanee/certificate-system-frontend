import apiClient from './apiClient';

export interface QRCodeData {
  id: string;
  certificateId: string;
  recipientName: string;
  activityName: string;
  verificationCode: string;
  qrCodeUrl: string;
  createdAt: string;
  lastVerifiedAt?: string;
  verificationCount: number;
  status: 'active' | 'inactive' | 'expired';
}

export interface QRCodeFilter {
  status?: 'active' | 'inactive' | 'expired';
  activityId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface QRCodeStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  totalVerifications: number;
}

export interface GenerateQRCodeRequest {
  certificateId: string;
  expiresAt?: string;
}

export interface BulkQRCodeRequest {
  certificateIds: string[];
  format?: 'png' | 'svg' | 'pdf';
  size?: number;
}

class QRCodeService {
  // Generate QR Code
  async generateQRCode(certificateId: string): Promise<QRCodeData> {
    const response = await apiClient.post<QRCodeData>('/qr-codes/generate', {
      certificateId,
    });
    return response.data;
  }

  async regenerateQRCode(certificateId: string): Promise<QRCodeData> {
    const response = await apiClient.post<QRCodeData>(`/qr-codes/${certificateId}/regenerate`);
    return response.data;
  }

  // Get QR Codes
  async getQRCodes(filter?: QRCodeFilter): Promise<QRCodeData[]> {
    const response = await apiClient.get<QRCodeData[]>('/qr-codes', {
      params: filter,
    });
    return response.data;
  }

  async getQRCode(id: string): Promise<QRCodeData> {
    const response = await apiClient.get<QRCodeData>(`/qr-codes/${id}`);
    return response.data;
  }

  async getQRCodeByCertificate(certificateId: string): Promise<QRCodeData> {
    const response = await apiClient.get<QRCodeData>(`/certificates/${certificateId}/qr-code`);
    return response.data;
  }

  // Download QR Code
  async downloadQRCode(id: string, format: 'png' | 'svg' | 'pdf' = 'png'): Promise<Blob> {
    const response = await apiClient.get(`/qr-codes/${id}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async downloadQRCodeBulk(request: BulkQRCodeRequest): Promise<Blob> {
    const response = await apiClient.post('/qr-codes/download-bulk', request, {
      responseType: 'blob',
    });
    return response.data;
  }

  // QR Code Statistics
  async getQRCodeStats(): Promise<QRCodeStats> {
    const response = await apiClient.get<QRCodeStats>('/qr-codes/stats');
    return response.data;
  }

  // Update QR Code Status
  async updateQRCodeStatus(id: string, status: 'active' | 'inactive'): Promise<QRCodeData> {
    const response = await apiClient.patch<QRCodeData>(`/qr-codes/${id}/status`, { status });
    return response.data;
  }

  // Delete QR Code
  async deleteQRCode(id: string): Promise<void> {
    await apiClient.delete(`/qr-codes/${id}`);
  }

  // Verification History
  async getVerificationHistory(qrCodeId: string): Promise<any[]> {
    const response = await apiClient.get(`/qr-codes/${qrCodeId}/verifications`);
    return response.data;
  }
}

export default new QRCodeService();
