import apiClient from './apiClient';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resourceType: string; count: number }>;
}

export interface ExportAuditLogRequest {
  filter: AuditLogFilter;
  format: 'csv' | 'pdf' | 'excel';
  includeDetails?: boolean;
}

class AuditLogService {
  // Get Audit Logs
  async getAuditLogs(filter?: AuditLogFilter): Promise<{ logs: AuditLog[]; total: number }> {
    const response = await apiClient.get<{ logs: AuditLog[]; total: number }>('/audit-logs', {
      params: filter,
    });
    return response.data;
  }

  async getAuditLog(id: string): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  }

  async getAuditLogsByUser(userId: string, filter?: AuditLogFilter): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>(`/audit-logs/users/${userId}`, {
      params: filter,
    });
    return response.data;
  }

  async getAuditLogsByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>(`/audit-logs/resources/${resourceType}/${resourceId}`);
    return response.data;
  }

  // Statistics
  async getAuditLogStats(filter?: AuditLogFilter): Promise<AuditLogStats> {
    const response = await apiClient.get<AuditLogStats>('/audit-logs/stats', {
      params: filter,
    });
    return response.data;
  }

  // Export
  async exportAuditLogs(request: ExportAuditLogRequest): Promise<Blob> {
    const response = await apiClient.post('/audit-logs/export', request, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Create Audit Log (usually done by backend automatically, but can be used for manual logging)
  async createAuditLog(log: Partial<AuditLog>): Promise<AuditLog> {
    const response = await apiClient.post<AuditLog>('/audit-logs', log);
    return response.data;
  }

  // Delete Old Logs (Admin only)
  async deleteOldLogs(olderThanDays: number): Promise<{ deletedCount: number }> {
    const response = await apiClient.delete<{ deletedCount: number }>('/audit-logs/cleanup', {
      params: { olderThanDays },
    });
    return response.data;
  }
}

export default new AuditLogService();
