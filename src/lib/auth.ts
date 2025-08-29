import { LoginResponse, DemoUsersResponse, DemoUser, User } from '@/types/auth';

// Client-side authentication utilities
export const authAPI = {
  // Login user
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  },

  // Get demo users
  async getDemoUsers(): Promise<DemoUsersResponse> {
    try {
      const response = await fetch('/api/auth/demo-users');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch demo users:', error);
      return {
        success: false,
        users: [],
        error: 'Failed to fetch demo users'
      };
    }
  },

  // Logout user (client-side only)
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Call logout API to clear server-side cookie
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Failed to call logout API:', error);
      }
      
      // Clear local storage
      localStorage.removeItem('scims_auth_token');
      localStorage.removeItem('scims_user');
      localStorage.removeItem('scims_business');
      localStorage.removeItem('scims_store');
      
      // Also clear the cookie
      document.cookie = 'scims_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  // Get stored user data
  getStoredUser() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('scims_user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Store user data
  storeUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('scims_user', JSON.stringify(user));
      localStorage.setItem('scims_auth_token', user.id);
      
      // Also set a cookie for server-side middleware
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days
      document.cookie = `scims_auth_token=${user.id}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('scims_auth_token');
      const user = localStorage.getItem('scims_user');
      return !!(token && user);
    }
    return false;
  }
};
