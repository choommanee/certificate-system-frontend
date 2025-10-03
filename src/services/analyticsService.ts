import axios from 'axios';
import { DashboardOverview, SystemMetrics, TrendData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  created_by?: string;
  template_id?: string;
  category?: string;
}

export interface CertificateAnalytics {
  analytics: {
    total_certificates: number;
    generated_count: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
  };
  trends: TrendData[];
  top_templates: Array<{
    template_id: string;
    template_name: string;
    usage_count: number;
    percentage: number;
  }>;
  top_creators: Array<{
    user_id: string;
    user_name: string;
    certificate_count: number;
  }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    timestamp: string;
  }>;
}

export const analyticsService = {
  async getDashboardOverview(filters?: AnalyticsFilters): Promise<DashboardOverview> {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.created_by) params.append('created_by', filters.created_by);

      const url = `/analytics/dashboard?${params.toString()}`;
      console.log('🌐 API Call:', `${API_BASE_URL}${url}`);
      
      const response = await api.get(url);
      console.log('✅ Dashboard API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Dashboard API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get dashboard overview');
    }
  },

  async getSystemMetrics(filters?: AnalyticsFilters): Promise<SystemMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const url = params.toString() ? `/analytics/metrics?${params.toString()}` : '/analytics/metrics';
      console.log('🌐 API Call:', `${API_BASE_URL}${url}`);

      const response = await api.get(url);
      console.log('✅ Metrics API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Metrics API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get system metrics');
    }
  },

  async getCertificateAnalytics(filters?: AnalyticsFilters): Promise<CertificateAnalytics> {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.template_id) params.append('template_id', filters.template_id);

      const response = await api.get(`/analytics/certificates?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get certificate analytics');
    }
  },

  async getCertificateTrends(filters?: AnalyticsFilters): Promise<TrendData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/analytics/certificates/trends?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get certificate trends');
    }
  },

  async getUserAnalytics(filters?: AnalyticsFilters) {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/analytics/users?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ User Analytics API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get user analytics');
    }
  },

  async getUserActivityTrends(filters?: AnalyticsFilters): Promise<TrendData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const url = `/analytics/users/trends?${params.toString()}`;
      console.log('🌐 API Call:', `${API_BASE_URL}${url}`);
      
      const response = await api.get(url);
      console.log('✅ User Activity Trends API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ User Activity Trends API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get user activity trends');
    }
  },

  async getActiveUsers(filters?: AnalyticsFilters) {
    try {
      const params = new URLSearchParams();
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/analytics/users/active?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get active users');
    }
  },

  async exportReport(request: {
    report_type: 'pdf' | 'excel' | 'csv';
    sections: string[];
    filters?: AnalyticsFilters;
  }): Promise<Blob> {
    try {
      const response = await api.post('/analytics/export', request, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export report');
    }
  },

  async generateReport(request: {
    title: string;
    sections: string[];
    filters?: AnalyticsFilters;
  }) {
    try {
      const response = await api.post('/analytics/reports', request);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  },
};
