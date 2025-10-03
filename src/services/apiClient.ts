import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private retryAttempts: number;
  private retryDelay: number;
  private enableCaching: boolean;
  private cacheTimeout: number;

  constructor(config: ApiClientConfig) {
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.enableCaching = config.enableCaching || false;
    this.cacheTimeout = config.cacheTimeout || 5 * 60 * 1000; // 5 minutes

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle retry logic
        if (
          originalRequest &&
          !originalRequest._retry &&
          this.shouldRetry(error) &&
          originalRequest.method?.toLowerCase() === 'get'
        ) {
          originalRequest._retry = true;
          
          for (let i = 0; i < this.retryAttempts; i++) {
            try {
              await this.delay(this.retryDelay * Math.pow(2, i)); // Exponential backoff
              return await this.client.request(originalRequest);
            } catch (retryError) {
              if (i === this.retryAttempts - 1) {
                return Promise.reject(retryError);
              }
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}${params ? JSON.stringify(params) : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.enableCaching) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    if (!this.enableCaching) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheTimeout
    };

    this.cache.set(key, entry);
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  public clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const cacheKey = this.getCacheKey(url, config?.params);
    const cachedData = this.getFromCache<T>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      // Clear related cache entries
      this.clearCache(url.split('/')[1]); // Clear cache for the resource
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      // Clear related cache entries
      this.clearCache(url.split('/')[1]);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      // Clear related cache entries
      this.clearCache(url.split('/')[1]);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async upload<T>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async download(url: string, filename?: string): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await this.client.get(url, {
        responseType: 'blob',
      });

      // Auto-download if filename is provided
      if (filename) {
        const downloadUrl = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): Error {
    // Clear expired cache periodically
    this.clearExpiredCache();

    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `HTTP ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } else {
      // Something else happened
      return new Error(error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    }
  }

  public getStats() {
    return {
      cacheSize: this.cache.size,
      cacheEntries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        expired: Date.now() > entry.expiresAt
      }))
    };
  }
}

// Create default instance
const apiClient = new ApiClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
});

export default apiClient;