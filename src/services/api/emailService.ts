import { get, post, put, del } from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
  EmailCampaign,
  EmailDelivery,
} from './types';

/**
 * Email Service
 * จัดการการส่งอีเมลและ campaigns
 */
class EmailService {
  private readonly campaignUrl = '/email-campaigns';
  private readonly deliveryUrl = '/email-deliveries';

  /**
   * ดึงรายการ email campaigns
   */
  async getCampaigns(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<EmailCampaign>>> {
    return get<ApiResponse<PaginatedResponse<EmailCampaign>>>(this.campaignUrl, { params });
  }

  /**
   * ดึงข้อมูล campaign ตาม ID
   */
  async getCampaign(id: string): Promise<ApiResponse<EmailCampaign>> {
    return get<ApiResponse<EmailCampaign>>(`${this.campaignUrl}/${id}`);
  }

  /**
   * สร้าง email campaign
   */
  async createCampaign(data: {
    name: string;
    subject: string;
    content: string;
    activityId?: string;
    templateId?: string;
    recipientEmails?: string[];
    scheduledAt?: string;
  }): Promise<ApiResponse<EmailCampaign>> {
    return post<ApiResponse<EmailCampaign>>(this.campaignUrl, data);
  }

  /**
   * แก้ไข campaign
   */
  async updateCampaign(id: string, data: Partial<EmailCampaign>): Promise<ApiResponse<EmailCampaign>> {
    return put<ApiResponse<EmailCampaign>>(`${this.campaignUrl}/${id}`, data);
  }

  /**
   * ลบ campaign
   */
  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`${this.campaignUrl}/${id}`);
  }

  /**
   * ส่ง campaign ทันที
   */
  async sendCampaign(id: string): Promise<ApiResponse<EmailCampaign>> {
    return post<ApiResponse<EmailCampaign>>(`${this.campaignUrl}/${id}/send`);
  }

  /**
   * กำหนดเวลาส่ง campaign
   */
  async scheduleCampaign(id: string, scheduledAt: string): Promise<ApiResponse<EmailCampaign>> {
    return post<ApiResponse<EmailCampaign>>(`${this.campaignUrl}/${id}/schedule`, {
      scheduled_at: scheduledAt,
    });
  }

  /**
   * ยกเลิก campaign
   */
  async cancelCampaign(id: string): Promise<ApiResponse<EmailCampaign>> {
    return post<ApiResponse<EmailCampaign>>(`${this.campaignUrl}/${id}/cancel`);
  }

  /**
   * ดึงสถิติ campaign
   */
  async getCampaignAnalytics(id: string): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.campaignUrl}/${id}/analytics`);
  }

  /**
   * ดึงรายการ email deliveries
   */
  async getDeliveries(params?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<EmailDelivery>>> {
    return get<ApiResponse<PaginatedResponse<EmailDelivery>>>(this.deliveryUrl, { params });
  }

  /**
   * ดึงข้อมูล delivery ตาม ID
   */
  async getDelivery(id: string): Promise<ApiResponse<EmailDelivery>> {
    return get<ApiResponse<EmailDelivery>>(`${this.deliveryUrl}/${id}`);
  }

  /**
   * ส่งอีเมลรายบุคคล
   */
  async sendEmail(data: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    content: string;
    certificateId?: string;
  }): Promise<ApiResponse<EmailDelivery>> {
    return post<ApiResponse<EmailDelivery>>(this.deliveryUrl, data);
  }

  /**
   * ส่งอีเมลซ้ำ
   */
  async resendEmail(id: string): Promise<ApiResponse<EmailDelivery>> {
    return post<ApiResponse<EmailDelivery>>(`${this.deliveryUrl}/${id}/resend`);
  }

  /**
   * ดึงสถานะการส่งอีเมล
   */
  async getDeliveryStatus(id: string): Promise<ApiResponse<any>> {
    return get<ApiResponse<any>>(`${this.deliveryUrl}/${id}/status`);
  }

  /**
   * ส่งอีเมลทดสอบ
   */
  async sendTestEmail(data: {
    recipientEmail: string;
    subject: string;
    content: string;
  }): Promise<ApiResponse<void>> {
    return post<ApiResponse<void>>(`${this.deliveryUrl}/test`, data);
  }
}

export const emailService = new EmailService();
export default emailService;
