import apiClient from './apiClient';
import {
  PendingDocument,
  DocumentToSign,
  Signature,
  SigningRecord,
  SigningStats,
  SigningActivity,
  ApiResponse,
  PaginatedResponse,
  SignatureUploadForm,
  DocumentRejectForm,
  SigningForm,
  DocumentFilter,
  DateRange,
  Notification
} from '../types/signer';

export class SignerApiService {
  // Document Management
  static async getPendingDocuments(
    filter?: DocumentFilter,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<PendingDocument>> {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params[key] = value.toISOString();
          } else {
            params[key] = value.toString();
          }
        }
      });
    }

    return await apiClient.get<PaginatedResponse<PendingDocument>>(
      '/signer/documents/pending',
      { params }
    );
  }

  static async getDocumentDetails(documentId: string): Promise<DocumentToSign> {
    const response = await apiClient.get<ApiResponse<DocumentToSign>>(
      `/signer/documents/${documentId}`
    );
    return response.data;
  }

  static async signDocument(signingData: SigningForm): Promise<void> {
    await apiClient.post('/signer/documents/sign', signingData);
  }

  static async rejectDocument(rejectData: DocumentRejectForm): Promise<void> {
    await apiClient.post('/signer/documents/reject', rejectData);
  }

  // Signature Management
  static async getSignatures(): Promise<Signature[]> {
    const response = await apiClient.get<ApiResponse<Signature[]>>('/signer/signatures');
    return response.data;
  }

  static async uploadSignature(
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<Signature> {
    const response = await apiClient.upload<ApiResponse<Signature>>(
      '/signer/signatures/upload', 
      formData,
      onProgress
    );
    return response.data;
  }

  static async setActiveSignature(signatureId: string): Promise<void> {
    await apiClient.put(`/signer/signatures/${signatureId}/activate`);
  }

  static async deleteSignature(signatureId: string): Promise<void> {
    await apiClient.delete(`/signer/signatures/${signatureId}`);
  }

  // Statistics and Analytics
  static async getSigningStats(): Promise<SigningStats> {
    const response = await apiClient.get<ApiResponse<SigningStats>>('/signer/stats');
    return response.data;
  }

  static async getSigningHistory(
    dateRange?: DateRange,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<SigningRecord>> {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (dateRange) {
      params.startDate = dateRange.startDate.toISOString();
      params.endDate = dateRange.endDate.toISOString();
    }

    return await apiClient.get<PaginatedResponse<SigningRecord>>(
      '/signer/history',
      { params }
    );
  }

  static async getRecentActivity(limit = 10): Promise<SigningActivity[]> {
    const response = await apiClient.get<ApiResponse<SigningActivity[]>>(
      '/signer/activity',
      { params: { limit } }
    );
    return response.data;
  }

  // Notifications
  static async getNotifications(
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Notification>> {
    return await apiClient.get<PaginatedResponse<Notification>>(
      '/signer/notifications',
      { params: { page: page.toString(), limit: limit.toString() } }
    );
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/signer/notifications/${notificationId}/read`);
  }

  static async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.put('/signer/notifications/read-all');
  }

  // Reports
  static async exportSigningReport(
    dateRange: DateRange,
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<Blob> {
    const filename = `signing-report-${dateRange.startDate.toISOString().split('T')[0]}-${dateRange.endDate.toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    
    return await apiClient.download(
      `/signer/reports/export?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}&format=${format}`,
      filename
    );
  }

  // Utility methods
  static async validateSignatureFile(file: File): Promise<boolean> {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG, JPG, and SVG files are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    return true;
  }

  static async previewCertificate(
    documentId: string,
    signatureId: string,
    position: { x: number; y: number }
  ): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ previewUrl: string }>>(
      '/signer/documents/preview',
      { documentId, signatureId, position }
    );
    return response.data.previewUrl;
  }
}

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};