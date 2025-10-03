import axios from 'axios';

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

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qr_code';
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style: {
    font_family?: string;
    font_size?: number;
    color?: string;
    font_weight?: 'normal' | 'bold';
    text_align?: 'left' | 'center' | 'right';
    text_decoration?: 'none' | 'underline';
    background_color?: string;
    border_radius?: number;
    opacity?: number;
    foreground_color?: string;
  };
  z_index?: number;
  rotation?: number;
  locked?: boolean;
}

export interface TemplateDesign {
  id: string;
  template_id: string;
  name: string;
  width: number;
  height: number;
  background_color: string;
  background_image?: string;
  elements: TemplateElement[];
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  design?: TemplateDesign;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  design: {
    width: number;
    height: number;
    background_color: string;
    background_image?: string;
    elements: Omit<TemplateElement, 'id'>[];
  };
}

export interface TemplateValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateUsageStats {
  template_id: string;
  usage_count: number;
  last_used: string;
  popular_elements: Array<{
    type: string;
    count: number;
  }>;
  performance_metrics: {
    average_generation_time: number;
    success_rate: number;
  };
}

export const templateDesignerService = {
  // Template Management
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await api.get('/templates');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get templates');
    }
  },

  async getTemplate(id: string): Promise<Template> {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get template');
    }
  },

  async createTemplateWithDesign(request: CreateTemplateRequest): Promise<Template> {
    try {
      const response = await api.post('/templates/design', request);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create template');
    }
  },

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    try {
      const response = await api.put(`/templates/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update template');
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      await api.delete(`/templates/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete template');
    }
  },

  async duplicateTemplate(id: string, name: string): Promise<Template> {
    try {
      const response = await api.post(`/templates/${id}/duplicate`, { name });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate template');
    }
  },

  // Template Design Management
  async getTemplateDesign(id: string): Promise<TemplateDesign> {
    try {
      const response = await api.get(`/templates/${id}/design`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get template design');
    }
  },

  async updateTemplateDesign(id: string, design: Partial<TemplateDesign>): Promise<void> {
    try {
      await api.put(`/templates/${id}/design`, design);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update template design');
    }
  },

  // Element Management
  async addElement(templateId: string, element: Omit<TemplateElement, 'id'>): Promise<TemplateElement> {
    try {
      const response = await api.post(`/templates/${templateId}/elements`, element);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add element');
    }
  },

  async updateElement(elementId: string, element: Partial<TemplateElement>): Promise<TemplateElement> {
    try {
      const response = await api.put(`/templates/elements/${elementId}`, element);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update element');
    }
  },

  async deleteElement(elementId: string): Promise<void> {
    try {
      await api.delete(`/templates/elements/${elementId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete element');
    }
  },

  async duplicateElement(elementId: string): Promise<TemplateElement> {
    try {
      const response = await api.post(`/templates/elements/${elementId}/duplicate`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate element');
    }
  },

  async moveElement(elementId: string, position: { x: number; y: number }): Promise<void> {
    try {
      await api.put(`/templates/elements/${elementId}/move`, { position });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to move element');
    }
  },

  // Template Operations
  async previewTemplate(id: string, sampleData?: Record<string, any>): Promise<Blob> {
    try {
      const response = await api.post(`/templates/${id}/preview`, { sample_data: sampleData }, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to preview template');
    }
  },

  async validateTemplate(id: string): Promise<TemplateValidationResult> {
    try {
      const response = await api.post(`/templates/${id}/validate`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to validate template');
    }
  },

  async getTemplateUsageStats(id: string): Promise<TemplateUsageStats> {
    try {
      const response = await api.get(`/templates/${id}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get template usage stats');
    }
  },

  // Template Categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get('/templates/categories');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get categories');
    }
  },

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    try {
      const response = await api.get(`/templates/category/${category}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get templates by category');
    }
  },

  // Template Status Management
  async activateTemplate(id: string): Promise<void> {
    try {
      await api.post(`/templates/${id}/activate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to activate template');
    }
  },

  async deactivateTemplate(id: string): Promise<void> {
    try {
      await api.post(`/templates/${id}/deactivate`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to deactivate template');
    }
  },

  async setAsDefault(id: string): Promise<void> {
    try {
      await api.post(`/templates/${id}/default`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set as default template');
    }
  },

  // Element Locking (for collaborative editing)
  async lockElement(elementId: string): Promise<void> {
    try {
      await api.post(`/templates/elements/${elementId}/lock`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to lock element');
    }
  },

  async unlockElement(elementId: string): Promise<void> {
    try {
      await api.post(`/templates/elements/${elementId}/unlock`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unlock element');
    }
  },
};
