import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Base URL - อ่านจาก environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// สร้าง Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - เพิ่ม JWT token ใน header
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - จัดการ error และ token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // ถ้า token หมดอายุ (401) และยังไม่เคย retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // เรียก API refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data.data;

          // บันทึก token ใหม่
          localStorage.setItem('access_token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          // Retry request เดิม
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // ถ้า refresh ไม่สำเร็จ ให้ logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // จัดการ error อื่นๆ
    if (error.response?.status === 403) {
      // Forbidden - ไม่มีสิทธิ์
      console.error('Access denied:', error.response.data);
    } else if (error.response?.status === 404) {
      // Not Found
      console.error('Resource not found:', error.response.data);
    } else if (error.response?.status === 500) {
      // Server Error
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Helper function สำหรับ GET request
export const get = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.get<T>(url, config);
  return response.data;
};

// Helper function สำหรับ POST request
export const post = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
};

// Helper function สำหรับ PUT request
export const put = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.put<T>(url, data, config);
  return response.data;
};

// Helper function สำหรับ DELETE request
export const del = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.delete<T>(url, config);
  return response.data;
};

// Helper function สำหรับ PATCH request
export const patch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.patch<T>(url, data, config);
  return response.data;
};

// Helper function สำหรับ upload file
export const upload = async <T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<T> => {
  const response = await axiosInstance.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

// Helper function สำหรับ download file
export const download = async (url: string, filename: string): Promise<void> => {
  const response = await axiosInstance.get(url, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(link.href);
};

export default axiosInstance;
