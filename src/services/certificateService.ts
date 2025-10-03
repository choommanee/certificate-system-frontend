import axios from 'axios';
import { Certificate, Template, CertificateForm, TemplateForm, PaginatedResponse } from '../types';

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

export const certificateService = {
  // Certificate CRUD operations
  async getCertificates(page = 1, limit = 10, status?: string): Promise<PaginatedResponse<Certificate>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });
      const response = await api.get(`/certificates?${params}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch certificates');
    }
  },

  async getCertificateById(id: number): Promise<Certificate> {
    try {
      const response = await api.get(`/certificates/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch certificate');
    }
  },

  async createCertificate(certificateData: CertificateForm): Promise<Certificate> {
    try {
      const response = await api.post('/certificates', certificateData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create certificate');
    }
  },

  async updateCertificate(id: number, certificateData: Partial<CertificateForm>): Promise<Certificate> {
    try {
      const response = await api.put(`/certificates/${id}`, certificateData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update certificate');
    }
  },

  async deleteCertificate(id: number): Promise<void> {
    try {
      await api.delete(`/certificates/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete certificate');
    }
  },

  async approveCertificate(id: number): Promise<Certificate> {
    try {
      const response = await api.post(`/certificates/${id}/approve`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve certificate');
    }
  },

  async rejectCertificate(id: number, reason?: string): Promise<Certificate> {
    try {
      const response = await api.post(`/certificates/${id}/reject`, { reason });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject certificate');
    }
  },

  async generatePDF(id: number): Promise<Blob> {
    try {
      const response = await api.get(`/certificates/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate PDF');
    }
  },

  // Template CRUD operations
  async getTemplates(page = 1, limit = 10): Promise<PaginatedResponse<Template>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await api.get(`/templates?${params}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch templates');
    }
  },

  async getTemplateById(id: number): Promise<Template> {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch template');
    }
  },

  async createTemplate(templateData: TemplateForm): Promise<Template> {
    try {
      const response = await api.post('/templates', templateData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create template');
    }
  },

  async updateTemplate(id: number, templateData: Partial<TemplateForm>): Promise<Template> {
    try {
      const response = await api.put(`/templates/${id}`, templateData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update template');
    }
  },

  async deleteTemplate(id: number): Promise<void> {
    try {
      await api.delete(`/templates/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete template');
    }
  },

  // File upload
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  },

  // Bulk operations
  async bulkImportStudents(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/certificates/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to import students');
    }
  },

  async bulkGenerateCertificates(templateId: number, studentIds: number[]): Promise<void> {
    try {
      await api.post('/certificates/bulk-generate', {
        templateId,
        studentIds,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate certificates');
    }
  },
};
