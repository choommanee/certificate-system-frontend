import { authService } from '../services/authService';
import { userService, roleService } from '../services/userService';

// API Connection Test Utility
export class ApiConnectionTest {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  }

  // Test basic API connectivity
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'API connection successful',
          details: data
        };
      } else {
        return {
          success: false,
          message: 'API connection failed',
          details: data
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Test authentication endpoints
  async testAuth(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Test with default admin credentials
      const result = await authService.login({
        email: 'admin@econ.tu.ac.th',
        password: 'admin123'
      });

      if (result.access_token) {
        // Test getting current user
        const user = await authService.getCurrentUser();
        
        // Logout
        await authService.logout();
        
        return {
          success: true,
          message: 'Authentication test successful',
          details: { user: user.email, role: user.role?.name }
        };
      } else {
        return {
          success: false,
          message: 'Authentication failed - no token received'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Test user management endpoints
  async testUserManagement(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Login first
      await authService.login({
        email: 'admin@econ.tu.ac.th',
        password: 'admin123'
      });

      // Test getting users
      const users = await userService.getUsers({
        page: 1,
        limit: 5,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      // Test getting roles
      const roles = await roleService.getRoles();

      // Test getting user statistics
      const stats = await userService.getUserStatistics();

      // Logout
      await authService.logout();

      return {
        success: true,
        message: 'User management test successful',
        details: {
          totalUsers: users.total,
          totalRoles: roles.length,
          activeUsers: stats.active_users
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `User management test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Run all tests
  async runAllTests(): Promise<{
    connection: { success: boolean; message: string; details?: any };
    auth: { success: boolean; message: string; details?: any };
    userManagement: { success: boolean; message: string; details?: any };
    overall: { success: boolean; message: string };
  }> {
    console.log('🧪 Starting API Connection Tests...');
    
    const connection = await this.testConnection();
    console.log('📡 Connection Test:', connection.success ? '✅' : '❌', connection.message);
    
    const auth = await this.testAuth();
    console.log('🔐 Authentication Test:', auth.success ? '✅' : '❌', auth.message);
    
    const userManagement = await this.testUserManagement();
    console.log('👥 User Management Test:', userManagement.success ? '✅' : '❌', userManagement.message);
    
    const allPassed = connection.success && auth.success && userManagement.success;
    const overall = {
      success: allPassed,
      message: allPassed 
        ? 'All API tests passed! Frontend is ready to connect to the API.' 
        : 'Some API tests failed. Please check the API server and configuration.'
    };
    
    console.log('🎯 Overall Result:', overall.success ? '✅' : '❌', overall.message);
    
    return {
      connection,
      auth,
      userManagement,
      overall
    };
  }
}

// Export singleton instance
export const apiTest = new ApiConnectionTest();