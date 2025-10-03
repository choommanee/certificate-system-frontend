import apiClient from './apiClient';

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  templateId: string;
  certificateIds: string[];
  scheduledAt?: string;
}

export interface BulkEmailRequest {
  templateId: string;
  recipients: EmailRecipient[];
  certificateIds?: string[];
  subject?: string;
  batchSize?: number;
  delayBetweenBatch?: number;
}

export interface EmailRecipient {
  email: string;
  name: string;
  certificateId?: string;
  variables?: Record<string, string>;
}

export interface CampaignStatus {
  campaignId: string;
  status: string;
  progress: number;
  sent: number;
  delivered: number;
  failed: number;
  errors: string[];
}

export interface DeliveryStatus {
  certificateId: string;
  recipientEmail: string;
  recipientName: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  error?: string;
}

export interface EmailAnalytics {
  totalCampaigns: number;
  totalEmails: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

class DistributionService {
  // Email Campaigns
  async createCampaign(data: CreateCampaignRequest): Promise<EmailCampaign> {
    const response = await apiClient.post<EmailCampaign>('/distribution/campaigns', data);
    return response.data;
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    const response = await apiClient.get<EmailCampaign[]>('/distribution/campaigns');
    return response.data;
  }

  async getCampaign(id: string): Promise<EmailCampaign> {
    const response = await apiClient.get<EmailCampaign>(`/distribution/campaigns/${id}`);
    return response.data;
  }

  async getCampaignStatus(id: string): Promise<CampaignStatus> {
    const response = await apiClient.get<CampaignStatus>(`/distribution/campaigns/${id}/status`);
    return response.data;
  }

  async startCampaign(id: string): Promise<void> {
    await apiClient.post(`/distribution/campaigns/${id}/start`);
  }

  async pauseCampaign(id: string): Promise<void> {
    await apiClient.post(`/distribution/campaigns/${id}/pause`);
  }

  async stopCampaign(id: string): Promise<void> {
    await apiClient.post(`/distribution/campaigns/${id}/stop`);
  }

  async retryCampaign(id: string): Promise<void> {
    await apiClient.post(`/distribution/campaigns/${id}/retry`);
  }

  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(`/distribution/campaigns/${id}`);
  }

  // Bulk Email Sending
  async sendBulkEmails(data: BulkEmailRequest): Promise<{ jobId: string }> {
    const response = await apiClient.post<{ jobId: string }>('/bulk/emails/send', data);
    return response.data;
  }

  async retryFailedEmails(campaignId: string): Promise<void> {
    await apiClient.post(`/distribution/campaigns/${campaignId}/retry-failed`);
  }

  // Delivery Status Tracking
  async getDeliveryStatus(certificateId: string): Promise<DeliveryStatus> {
    const response = await apiClient.get<DeliveryStatus>(`/distribution/delivery-status/${certificateId}`);
    return response.data;
  }

  async getDeliveryStatuses(campaignId: string): Promise<DeliveryStatus[]> {
    const response = await apiClient.get<DeliveryStatus[]>(`/distribution/campaigns/${campaignId}/delivery-statuses`);
    return response.data;
  }

  // Analytics
  async getEmailAnalytics(): Promise<EmailAnalytics> {
    const response = await apiClient.get<EmailAnalytics>('/distribution/analytics');
    return response.data;
  }

  async exportCampaignReport(campaignId: string, format: 'csv' | 'pdf' | 'excel'): Promise<Blob> {
    const response = await apiClient.get(`/distribution/campaigns/${campaignId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new DistributionService();
