import apiClient from './apiClient';

export interface Activity {
  id: string;
  nameTh: string;
  nameEn: string;
  description: string;
  activityType: string;
  startDate: string;
  endDate: string;
  location: string;
  organizerId: string;
  maxParticipants: number;
  currentParticipants?: number;
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface Participant {
  id: string;
  nameTh: string;
  nameEn: string;
  email: string;
  studentId: string;
  faculty?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CreateActivityRequest {
  nameTh: string;
  nameEn: string;
  description: string;
  activityType: string;
  startDate: string;
  endDate: string;
  location: string;
  organizerId: string;
  maxParticipants: number;
  status: string;
}

export interface UpdateActivityRequest {
  nameTh?: string;
  nameEn?: string;
  description?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  maxParticipants?: number;
  status?: string;
}

export interface AddParticipantRequest {
  nameTh: string;
  nameEn: string;
  email: string;
  studentId: string;
  faculty?: string;
}

export interface ListActivitiesParams {
  page?: number;
  limit?: number;
  status?: string;
  activityType?: string;
}

export interface ListActivitiesResponse {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ParticipantsResponse {
  data: Participant[];
  total: number;
}

export interface ImportParticipantsResponse {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  filename: string;
}

class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    try {
      const response = await apiClient.post<Activity>('/activities', data);
      return response;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Get list of activities with optional filters
   */
  async listActivities(params?: ListActivitiesParams): Promise<ListActivitiesResponse> {
    try {
      const response = await apiClient.get<ListActivitiesResponse>('/activities', {
        params
      });
      return response;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Get activity by ID
   */
  async getActivity(id: string): Promise<Activity> {
    try {
      const response = await apiClient.get<Activity>(`/activities/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  /**
   * Update activity
   */
  async updateActivity(id: string, data: UpdateActivityRequest): Promise<Activity> {
    try {
      const response = await apiClient.put<Activity>(`/activities/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  /**
   * Delete activity
   */
  async deleteActivity(id: string): Promise<void> {
    try {
      await apiClient.delete(`/activities/${id}`);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  /**
   * Get participants for an activity
   */
  async getParticipants(activityId: string): Promise<ParticipantsResponse> {
    try {
      const response = await apiClient.get<ParticipantsResponse>(
        `/activities/${activityId}/participants`
      );
      return response;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  }

  /**
   * Add participant to activity
   */
  async addParticipant(activityId: string, data: AddParticipantRequest): Promise<Participant> {
    try {
      const response = await apiClient.post<Participant>(
        `/activities/${activityId}/participants`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  /**
   * Remove participant from activity
   */
  async removeParticipant(activityId: string, participantId: string): Promise<void> {
    try {
      await apiClient.delete(`/activities/${activityId}/participants/${participantId}`);
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  /**
   * Import participants from CSV file
   */
  async importParticipants(
    activityId: string,
    file: File
  ): Promise<ImportParticipantsResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.upload<ImportParticipantsResponse>(
        `/activities/${activityId}/participants/import`,
        formData
      );
      return response;
    } catch (error) {
      console.error('Error importing participants:', error);
      throw error;
    }
  }

  /**
   * Download participant template CSV
   */
  downloadParticipantTemplate(): void {
    const csvContent = `studentId,nameTh,nameEn,email,faculty
650610001,นายสมชาย ใจดี,Somchai Jaidee,somchai@example.com,คณะเศรษฐศาสตร์
650610002,นางสาวสมหญิง รักดี,Somying Rakdee,somying@example.com,คณะเศรษฐศาสตร์`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'participant_template.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export participants to CSV
   */
  async exportParticipants(activityId: string): Promise<void> {
    try {
      const { data: participants } = await this.getParticipants(activityId);

      // Create CSV content
      const headers = ['studentId', 'nameTh', 'nameEn', 'email', 'faculty', 'status'];
      const csvRows = [
        headers.join(','),
        ...participants.map(p =>
          [p.studentId, p.nameTh, p.nameEn, p.email, p.faculty || '', p.status].join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `participants_${activityId}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting participants:', error);
      throw error;
    }
  }

  /**
   * Get activity types for dropdown
   */
  getActivityTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'seminar', label: 'สัมมนา' },
      { value: 'workshop', label: 'workshop' },
      { value: 'training', label: 'อบรม' },
      { value: 'competition', label: 'การแข่งขัน' },
      { value: 'conference', label: 'ประชุม' },
      { value: 'other', label: 'อื่นๆ' }
    ];
  }

  /**
   * Get activity status options
   */
  getStatusOptions(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'draft', label: 'ฉบับร่าง', color: 'default' },
      { value: 'upcoming', label: 'กำลังจะมาถึง', color: 'info' },
      { value: 'active', label: 'กำลังดำเนินการ', color: 'success' },
      { value: 'completed', label: 'เสร็จสิ้น', color: 'primary' },
      { value: 'cancelled', label: 'ยกเลิก', color: 'error' }
    ];
  }
}

export default new ActivityService();
