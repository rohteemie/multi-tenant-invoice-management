import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tenantService } from '../services/tenantService';
import { apiClient } from '../services/api';

// Mock the apiClient
vi.mock('../services/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TenantService - Logo Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadLogo', () => {
    it('should upload logo with FormData', async () => {
      const mockFile = new File(['content'], 'logo.png', { type: 'image/png' });
      const mockResponse = { data: { logo_url: 'https://example.com/logo.png' } };
      
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await tenantService.uploadLogo('tenant-1', mockFile);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/tenants/tenant-1/logo',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual({ logo_url: 'https://example.com/logo.png' });
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['content'], 'logo.png', { type: 'image/png' });
      const mockError = new Error('Upload failed');
      
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(tenantService.uploadLogo('tenant-1', mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('getLogo', () => {
    it('should fetch logo URL', async () => {
      const mockResponse = { data: { logo_url: 'https://example.com/logo.png' } };
      
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await tenantService.getLogo('tenant-1');

      expect(apiClient.get).toHaveBeenCalledWith('/tenants/tenant-1/logo');
      expect(result).toBe('https://example.com/logo.png');
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Not found');
      
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(tenantService.getLogo('tenant-1')).rejects.toThrow('Not found');
    });
  });

  describe('deleteLogo', () => {
    it('should delete logo', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await tenantService.deleteLogo('tenant-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/tenants/tenant-1/logo');
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Delete failed');
      
      vi.mocked(apiClient.delete).mockRejectedValue(mockError);

      await expect(tenantService.deleteLogo('tenant-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('update', () => {
    it('should update tenant with branding fields', async () => {
      const updateData = {
        name: 'Updated Company',
        address: '123 Main St',
        phone: '+1234567890',
        email: 'contact@company.com',
        tax_label: 'VAT',
        tax_rate: 15,
      };
      
      const mockResponse = {
        data: {
          id: 'tenant-1',
          ...updateData,
          plan_type: 'basic',
          is_active: true,
          default_currency: 'USD',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      };
      
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const result = await tenantService.update('tenant-1', updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/tenants/tenant-1', updateData);
      expect(result.address).toBe('123 Main St');
      expect(result.phone).toBe('+1234567890');
      expect(result.email).toBe('contact@company.com');
    });
  });
});
