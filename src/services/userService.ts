import axios from 'axios';
import { User, Role } from '../types';

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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface UserFilters {
  search?: string;
  role_id?: number;
  faculty?: string;
  is_active?: boolean;
  page: number;
  limit: number;
  sort_by?: 'created_at' | 'updated_at' | 'last_login' | 'username' | 'email';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en?: string;
  last_name_en?: string;
  student_id?: string;
  faculty?: string;
  phone?: string;
  role_id: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name_th?: string;
  last_name_th?: string;
  first_name_en?: string;
  last_name_en?: string;
  student_id?: string;
  faculty?: string;
  phone?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  users_by_role: Record<string, number>;
  recent_logins_7_days: number;
}

export const userService = {
  async getUsers(filters: UserFilters): Promise<PaginatedUsers> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role_id) params.append('role_id', filters.role_id.toString());
      if (filters.faculty) params.append('faculty', filters.faculty);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const response = await api.get(`/users?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  },

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  },

  async toggleUserActive(id: number): Promise<void> {
    try {
      await api.patch(`/users/${id}/toggle-active`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to toggle user status');
    }
  },

  async bulkDeleteUsers(ids: number[]): Promise<void> {
    try {
      await api.delete('/users/bulk', { data: { ids } });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete users');
    }
  },

  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const response = await api.get('/users/statistics');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user statistics');
    }
  },

  async getUsersByRole(roleId: number): Promise<User[]> {
    try {
      const response = await api.get(`/users/by-role/${roleId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users by role');
    }
  },

  async getFaculties(): Promise<string[]> {
    try {
      const response = await api.get('/users/faculties');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch faculties');
    }
  },

  async exportUsers(filters: Omit<UserFilters, 'page' | 'limit'>): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role_id) params.append('role_id', filters.role_id.toString());
      if (filters.faculty) params.append('faculty', filters.faculty);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const response = await api.get(`/users/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to export users');
    }
  },
};

// Role Service
export const roleService = {
  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get('/roles');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch roles');
    }
  },

  async getRoleById(id: number): Promise<Role> {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch role');
    }
  },
};