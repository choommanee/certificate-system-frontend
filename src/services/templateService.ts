// Template API Service for Certificate Designer

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: string;
  design: {
    canvas: {
      width: number;
      height: number;
      background_color: string;
    };
    elements: any[];
    variables?: any;
  };
  created_by: string;
  usage_count: number;
  is_default: boolean;
  canvas_config?: any;
  canvas_width: number;
  canvas_height: number;
  canvas_background_color: string;
  variables?: any;
  created_at: string;
  updated_at: string;
  thumbnailUrl?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: string;
  design: {
    canvas: {
      width: number;
      height: number;
      background_color: string;
    };
    elements: any[];
    variables?: any[];
  };
  is_default?: boolean;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string;
}

class TemplateService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1';
  }

  // Get authorization headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle wrapped response format: { success: true, data: actualData }
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data as T;
    }
    
    // Return direct response if not wrapped
    return result as T;
  }

  // Save template to database
  async saveTemplate(templateData: CreateTemplateRequest): Promise<CertificateTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      return this.handleResponse<CertificateTemplate>(response);
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Update existing template
  async updateTemplate(templateData: UpdateTemplateRequest): Promise<CertificateTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateData.id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(templateData)
      });

      return this.handleResponse<CertificateTemplate>(response);
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  // Get user's templates
  async getUserTemplates(): Promise<CertificateTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<any>(response);
      
      // Handle the API response structure: { templates: [...], total: count }
      if (result && typeof result === 'object' && 'templates' in result) {
        return result.templates as CertificateTemplate[];
      }
      
      // If it's already an array, return it directly
      if (Array.isArray(result)) {
        return result as CertificateTemplate[];
      }
      
      // Fallback to empty array if structure is unexpected
      console.warn('Unexpected API response structure for getUserTemplates:', result);
      return [];
    } catch (error) {
      console.error('Error fetching user templates:', error);
      throw error;
    }
  }

  // Get template by ID
  async getTemplate(templateId: string): Promise<CertificateTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<CertificateTemplate>(response);
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  // Get public templates
  async getPublicTemplates(): Promise<CertificateTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/public`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<CertificateTemplate[]>(response);
    } catch (error) {
      console.error('Error fetching public templates:', error);
      throw error;
    }
  }

  // Search templates
  async searchTemplates(query: string, tags?: string[]): Promise<CertificateTemplate[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (tags && tags.length > 0) {
        tags.forEach(tag => params.append('tags', tag));
      }

      const response = await fetch(`${this.baseUrl}/templates/search?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<CertificateTemplate[]>(response);
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  }

  // Generate template thumbnail
  async generateThumbnail(templateId: string, canvasDataUrl: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}/thumbnail`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ thumbnailData: canvasDataUrl })
      });

      const result = await this.handleResponse<{ thumbnailUrl: string }>(response);
      return result.thumbnailUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  // Sync with localStorage (fallback mechanism)
  async syncWithLocalStorage(): Promise<void> {
    try {
      // Get templates from localStorage
      const localTemplates = JSON.parse(localStorage.getItem('savedCertificateTemplates') || '[]');
      
      // Skip sync if no local templates
      if (!localTemplates || localTemplates.length === 0) {
        console.log('No local templates to sync');
        return;
      }
      
      // Get templates from API
      const apiTemplates = await this.getUserTemplates();
      
      // Debug: Log the API response to understand the structure
      console.log('API Templates Response:', apiTemplates);
      console.log('Is API Templates an array?', Array.isArray(apiTemplates));
      
      // Skip sync if API is not available or returns null
      if (apiTemplates === null || apiTemplates === undefined) {
        console.log('API not available or returned null, skipping sync');
        return;
      }
      
      // Ensure apiTemplates is always an array
      const templatesArray = Array.isArray(apiTemplates) ? apiTemplates : [];
      
      // Find templates that exist in localStorage but not in API
      const localOnlyTemplates = localTemplates.filter((localTemplate: any) => 
        !templatesArray.some(apiTemplate => apiTemplate.id === localTemplate.id)
      );

      // Skip if no templates to sync
      if (localOnlyTemplates.length === 0) {
        console.log('No new templates to sync');
        return;
      }

      console.log(`Syncing ${localOnlyTemplates.length} templates to API...`);
      
      // Upload local-only templates to API (but don't do it for now to avoid errors)
      // TODO: Fix API template creation format before enabling this
      /*
      for (const localTemplate of localOnlyTemplates) {
        try {
          await this.saveTemplate({
            name: localTemplate.name,
            description: `Synced from local storage`,
            category: 'certificate',
            design: {
              width: localTemplate.canvasWidth || 800,
              height: localTemplate.canvasHeight || 600,
              background_color: localTemplate.backgroundColor || '#ffffff',
              elements: localTemplate.elements || []
            },
            is_default: false
          });
        } catch (error) {
          console.warn('Failed to sync template:', localTemplate.name, error);
        }
      }
      */
    } catch (error) {
      console.error('Error syncing with localStorage:', error);
    }
  }
}

export default new TemplateService();
