import apiClient from './apiClient';

export interface PublicStatistics {
  totalCertificates: number;
  totalActivities: number;
  totalVerifications: number;
  totalUsers: number;
}

export interface DashboardStatistics {
  certificates: {
    total: number;
    draft: number;
    generated: number;
    sent: number;
    verified: number;
  };
  activities: {
    total: number;
    active: number;
    completed: number;
    upcoming: number;
  };
  users: {
    total: number;
    online: number;
    admins: number;
    staff: number;
    signers: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
    dueDate: string;
  }>;
}

export interface CertificateStatistics {
  date: string;
  totalCertificates: number;
  sentCertificates: number;
  downloadedCertificates: number;
  verifiedCertificates: number;
  participationCertificates: number;
  completionCertificates: number;
  achievementCertificates: number;
  awardCertificates: number;
}

export interface ActivityStatistics {
  activityId: string;
  activityName: string;
  totalParticipants: number;
  certificatesIssued: number;
  emailsSent: number;
  emailsOpened: number;
  qrScans: number;
  verifications: number;
}

class StatisticsService {
  /**
   * Get public statistics for landing page
   */
  async getPublicStatistics(): Promise<PublicStatistics> {
    try {
      const response = await apiClient.get<PublicStatistics>('/v1/public/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching public statistics:', error);
      // Return mock data if API fails
      return {
        totalCertificates: 0,
        totalActivities: 0,
        totalVerifications: 0,
        totalUsers: 0
      };
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      const response = await apiClient.get<DashboardStatistics>('/v1/admin/dashboard/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get staff dashboard statistics
   */
  async getStaffDashboardStatistics(): Promise<any> {
    try {
      const response = await apiClient.get('/v1/staff/dashboard/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching staff dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get signer dashboard statistics
   */
  async getSignerDashboardStatistics(): Promise<any> {
    try {
      const response = await apiClient.get('/v1/signer/dashboard/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching signer dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get certificate statistics by date range
   */
  async getCertificateStatistics(startDate: string, endDate: string): Promise<CertificateStatistics[]> {
    try {
      const response = await apiClient.get<CertificateStatistics[]>(
        '/v1/statistics/certificates',
        {
          params: { startDate, endDate }
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching certificate statistics:', error);
      throw error;
    }
  }

  /**
   * Get daily statistics summary
   */
  async getDailyStatistics(date?: string): Promise<CertificateStatistics> {
    try {
      const response = await apiClient.get<CertificateStatistics>(
        '/v1/statistics/daily',
        {
          params: { date: date || new Date().toISOString().split('T')[0] }
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching daily statistics:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(activityId: string): Promise<ActivityStatistics> {
    try {
      const response = await apiClient.get<ActivityStatistics>(
        `/v1/activities/${activityId}/statistics`
      );
      return response;
    } catch (error) {
      console.error('Error fetching activity statistics:', error);
      throw error;
    }
  }

  /**
   * Get real-time statistics (for live dashboards)
   */
  async getRealtimeStatistics(): Promise<any> {
    try {
      const response = await apiClient.get('/v1/statistics/realtime');
      return response;
    } catch (error) {
      console.error('Error fetching realtime statistics:', error);
      throw error;
    }
  }

  /**
   * Get online users count
   */
  async getOnlineUsersCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/v1/statistics/online-users');
      return response.count;
    } catch (error) {
      console.error('Error fetching online users count:', error);
      return 0;
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<any> {
    try {
      const response = await apiClient.get('/v1/system/health');
      return response;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  /**
   * Export statistics report
   */
  async exportStatisticsReport(
    type: 'pdf' | 'excel',
    startDate: string,
    endDate: string
  ): Promise<Blob> {
    try {
      const response = await apiClient.download(
        `/v1/reports/statistics/export?type=${type}&startDate=${startDate}&endDate=${endDate}`,
        `statistics-report-${startDate}-to-${endDate}.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      );
      return response;
    } catch (error) {
      console.error('Error exporting statistics report:', error);
      throw error;
    }
  }

  /**
   * Get verification statistics
   */
  async getVerificationStatistics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await apiClient.get('/v1/statistics/verifications', {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('Error fetching verification statistics:', error);
      throw error;
    }
  }

  /**
   * Get QR code scan statistics
   */
  async getQRScanStatistics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await apiClient.get('/v1/statistics/qr-scans', {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('Error fetching QR scan statistics:', error);
      throw error;
    }
  }

  /**
   * Get email campaign statistics
   */
  async getEmailCampaignStatistics(campaignId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/v1/email-campaigns/${campaignId}/statistics`);
      return response;
    } catch (error) {
      console.error('Error fetching email campaign statistics:', error);
      throw error;
    }
  }
}

export default new StatisticsService();
