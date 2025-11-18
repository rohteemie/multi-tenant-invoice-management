import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services';
import { apiClient } from '../services/api';
import type { PasswordResetRequest, PasswordResetConfirm } from '../types';

vi.mock('../services/api');

describe('Password Reset Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      const mockData: PasswordResetRequest = {
        email: 'test@example.com',
      };

      const mockResponse = {
        data: { message: 'Password reset email sent successfully' },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.requestPasswordReset(mockData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', mockData);
      expect(result.message).toBe('Password reset email sent successfully');
    });

    it('should handle errors when requesting password reset', async () => {
      const mockData: PasswordResetRequest = {
        email: 'test@example.com',
      };

      const mockError = new Error('Network error');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(authService.requestPasswordReset(mockData)).rejects.toThrow('Network error');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const mockData: PasswordResetConfirm = {
        token: 'valid-reset-token',
        new_password: 'newSecurePassword123',
      };

      const mockResponse = {
        data: { message: 'Password reset successfully' },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await authService.resetPassword(mockData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', mockData);
      expect(result.message).toBe('Password reset successfully');
    });

    it('should handle errors when resetting password with invalid token', async () => {
      const mockData: PasswordResetConfirm = {
        token: 'invalid-token',
        new_password: 'newPassword123',
      };

      const mockError = new Error('Invalid or expired token');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(authService.resetPassword(mockData)).rejects.toThrow('Invalid or expired token');
    });
  });
});
