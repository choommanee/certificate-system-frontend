import axios from 'axios';
import { LoginCredentials, AuthResponse, User } from '../types';

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
      localStorage.removeItem('refresh_token');
      // Don't auto-redirect, let components handle it
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data.data;
      
      // Store tokens
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      return {
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token: data.access_token, // for backward compatibility
        refreshToken: data.refresh_token // for backward compatibility
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name_th: string;
    last_name_th: string;
    first_name_en?: string;
    last_name_en?: string;
    role_id: number;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get user info');
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      const data = response.data.data;
      
      // Update stored tokens
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      return {
        user: data.user || null,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token: data.access_token,
        refreshToken: data.refresh_token
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token refresh failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/request', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password reset request failed');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/confirm', { 
        token, 
        new_password: newPassword 
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password reset failed');
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', { 
        old_password: oldPassword,
        new_password: newPassword 
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Password change failed');
    }
  },
};
