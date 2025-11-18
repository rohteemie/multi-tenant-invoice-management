import { apiClient } from './api';
import type { Token, LoginCredentials, TenantRegister, TenantWithOwner, PasswordResetRequest, PasswordResetConfirm } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    return response.data;
  },

  async register(userData: TenantRegister): Promise<TenantWithOwner> {
    const response = await apiClient.post<TenantWithOwner>('/auth/register', userData);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<Token> {
    const response = await apiClient.post<Token>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset/request', data);
    return response.data;
  },

  async resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset/confirm', data);
    return response.data;
  },
};
