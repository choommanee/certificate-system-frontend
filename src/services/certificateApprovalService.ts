import apiClient from './apiClient';

export interface Certificate {
  id: string;
  title: string;
  description?: string;
  event_name: string;
  event_date: string;
  template_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  recipients_count?: number;
  template_name?: string;
  creator_name?: string;
  approver_name?: string;
}

export interface ApprovalAction {
  certificateId: string;
  action: 'approve' | 'reject';
  reason?: string;
  comment?: string;
}

export interface ApprovalHistory {
  id: string;
  certificate_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'published';
  performed_by: string;
  performed_by_name?: string;
  reason?: string;
  comment?: string;
  created_at: string;
}

export interface PendingApprovalsResponse {
  data: Certificate[];
  total: number;
  pending_count: number;
}

class CertificateApprovalService {
  /**
   * Get list of certificates pending approval
   */
  async getPendingApprovals(): Promise<PendingApprovalsResponse> {
    try {
      const response = await apiClient.get<PendingApprovalsResponse>('/certificates/pending-approvals');
      return response;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  /**
   * Submit certificate for approval
   */
  async submitForApproval(certificateId: string): Promise<void> {
    try {
      await apiClient.post(`/certificates/${certificateId}/submit`);
    } catch (error) {
      console.error('Error submitting certificate for approval:', error);
      throw error;
    }
  }

  /**
   * Approve certificate
   */
  async approveCertificate(certificateId: string, comment?: string): Promise<void> {
    try {
      await apiClient.post(`/certificates/${certificateId}/approve`, { comment });
    } catch (error) {
      console.error('Error approving certificate:', error);
      throw error;
    }
  }

  /**
   * Reject certificate
   */
  async rejectCertificate(certificateId: string, reason: string, comment?: string): Promise<void> {
    try {
      await apiClient.post(`/certificates/${certificateId}/reject`, { reason, comment });
    } catch (error) {
      console.error('Error rejecting certificate:', error);
      throw error;
    }
  }

  /**
   * Publish approved certificate
   */
  async publishCertificate(certificateId: string): Promise<void> {
    try {
      await apiClient.post(`/certificates/${certificateId}/publish`);
    } catch (error) {
      console.error('Error publishing certificate:', error);
      throw error;
    }
  }

  /**
   * Batch approve multiple certificates
   */
  async batchApprove(certificateIds: string[], comment?: string): Promise<{
    success: number;
    failed: number;
    errors?: Array<{ certificateId: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ certificateId: string; error: string }>
    };

    for (const certificateId of certificateIds) {
      try {
        await this.approveCertificate(certificateId, comment);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          certificateId,
          error: error.message || 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Batch reject multiple certificates
   */
  async batchReject(certificateIds: string[], reason: string, comment?: string): Promise<{
    success: number;
    failed: number;
    errors?: Array<{ certificateId: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ certificateId: string; error: string }>
    };

    for (const certificateId of certificateIds) {
      try {
        await this.rejectCertificate(certificateId, reason, comment);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          certificateId,
          error: error.message || 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Get approval history for a certificate
   */
  async getApprovalHistory(certificateId: string): Promise<ApprovalHistory[]> {
    try {
      const response = await apiClient.get<ApprovalHistory[]>(`/certificates/${certificateId}/approval-history`);
      return response;
    } catch (error) {
      console.error('Error fetching approval history:', error);
      return [];
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStatistics(): Promise<{
    total_pending: number;
    total_approved: number;
    total_rejected: number;
    avg_approval_time: number;
    pending_by_template: Array<{ template_name: string; count: number }>;
  }> {
    try {
      const response = await apiClient.get('/certificates/approval-statistics');
      return response;
    } catch (error) {
      console.error('Error fetching approval statistics:', error);
      return {
        total_pending: 0,
        total_approved: 0,
        total_rejected: 0,
        avg_approval_time: 0,
        pending_by_template: []
      };
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'published': return 'primary';
      default: return 'default';
    }
  }

  /**
   * Get status label in Thai
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'ฉบับร่าง';
      case 'pending': return 'รอการอนุมัติ';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      case 'published': return 'เผยแพร่แล้ว';
      default: return status;
    }
  }

  /**
   * Check if user can approve (based on role)
   */
  canApprove(userRole: string): boolean {
    return ['admin', 'super_admin', 'staff'].includes(userRole);
  }

  /**
   * Check if certificate can be approved
   */
  canBeApproved(certificate: Certificate): boolean {
    return certificate.status === 'pending';
  }

  /**
   * Check if certificate can be submitted
   */
  canBeSubmitted(certificate: Certificate): boolean {
    return certificate.status === 'draft';
  }

  /**
   * Check if certificate can be published
   */
  canBePublished(certificate: Certificate): boolean {
    return certificate.status === 'approved';
  }
}

export default new CertificateApprovalService();
