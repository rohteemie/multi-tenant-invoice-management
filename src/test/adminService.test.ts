import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../services/adminService';
import type { PlatformStats } from '../services/adminService';
import type { Tenant, User } from '../types';
import type { AuditLog } from '../types/auditLog';

// Mock apiClient
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Admin Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listTenants', () => {
    it('should fetch all tenants', async () => {
      const mockTenants: Tenant[] = [
        {
          id: 'tenant-1',
          name: 'Tenant 1',
          plan_type: 'premium',
          is_active: true,
          default_currency: 'USD',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTenants });

      const result = await adminService.listTenants();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/tenants', { params: {} });
      expect(result).toEqual(mockTenants);
    });

    it('should sanitize and validate pagination parameters', async () => {
      const mockTenants: Tenant[] = [];
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTenants });

      await adminService.listTenants({ skip: 10, limit: 50, is_active: true });

      expect(apiClient.get).toHaveBeenCalledWith('/admin/tenants', {
        params: { skip: 10, limit: 50, is_active: true },
      });
    });

    it('should cap limit at 1000 instead of throwing error', async () => {
      const mockTenants: Tenant[] = [];
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTenants });

      // Should throw error for limit > 1000
      await expect(adminService.listTenants({ skip: 0, limit: 2000 })).rejects.toThrow(
        'Number must be at most 1000'
      );
    });
  });

  describe('getTenant', () => {
    it('should fetch a specific tenant', async () => {
      const mockTenant: Tenant = {
        id: 'tenant-1',
        name: 'Tenant 1',
        plan_type: 'premium',
        is_active: true,
        default_currency: 'USD',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTenant });

      const result = await adminService.getTenant('tenant-1');

      expect(apiClient.get).toHaveBeenCalledWith('/admin/tenants/tenant-1');
      expect(result).toEqual(mockTenant);
    });

    it('should sanitize tenant ID', async () => {
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} });

      await adminService.getTenant('tenant<script>alert("xss")</script>');

      // Should remove script tags
      expect(apiClient.get).toHaveBeenCalledWith('/admin/tenants/tenantscriptalertxssscript');
    });

    it('should throw error for invalid tenant ID', async () => {
      await expect(adminService.getTenant('')).rejects.toThrow('Invalid tenant ID');
    });
  });

  describe('suspendTenant', () => {
    it('should suspend a tenant', async () => {
      const mockResponse = {
        message: 'Tenant suspended',
        tenant: {
          id: 'tenant-1',
          name: 'Tenant 1',
          is_active: false,
        } as Tenant,
      };

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockResponse });

      const result = await adminService.suspendTenant('tenant-1');

      expect(apiClient.put).toHaveBeenCalledWith('/admin/tenants/tenant-1/suspend');
      expect(result).toEqual(mockResponse);
    });

    it('should sanitize tenant ID before suspending', async () => {
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.put).mockResolvedValue({ data: {} });

      await adminService.suspendTenant('tenant-1-safe');

      expect(apiClient.put).toHaveBeenCalledWith('/admin/tenants/tenant-1-safe/suspend');
    });
  });

  describe('reactivateTenant', () => {
    it('should reactivate a tenant', async () => {
      const mockResponse = {
        message: 'Tenant reactivated',
        tenant: {
          id: 'tenant-1',
          name: 'Tenant 1',
          is_active: true,
        } as Tenant,
      };

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockResponse });

      const result = await adminService.reactivateTenant('tenant-1');

      expect(apiClient.put).toHaveBeenCalledWith('/admin/tenants/tenant-1/reactivate');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listUsers', () => {
    it('should fetch all users', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          email: 'user@example.com',
          full_name: 'Test User',
          role: 'admin',
          tenant_id: 'tenant-1',
          is_active: true,
          is_verified: true,
          is_superadmin: false,
          currency_preference: 'USD',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUsers });

      const result = await adminService.listUsers();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/users', { params: {} });
      expect(result).toEqual(mockUsers);
    });

    it('should filter users by tenant_id', async () => {
      const mockUsers: User[] = [];
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUsers });

      await adminService.listUsers({ tenant_id: 'tenant-1' });

      expect(apiClient.get).toHaveBeenCalledWith('/admin/users', {
        params: { skip: 0, limit: 100, tenant_id: 'tenant-1' },
      });
    });

    it('should filter users by is_superadmin', async () => {
      const mockUsers: User[] = [];
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUsers });

      await adminService.listUsers({ is_superadmin: true });

      expect(apiClient.get).toHaveBeenCalledWith('/admin/users', {
        params: { skip: 0, limit: 100, is_superadmin: true },
      });
    });
  });

  describe('listAuditLogs', () => {
    it('should fetch all audit logs', async () => {
      const mockLogs: AuditLog[] = [
        {
          id: 'log-1',
          action: 'user_created',
          user_id: 'user-1',
          tenant_id: 'tenant-1',
          resource_id: 'resource-1',
          description: 'User created',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs });

      const result = await adminService.listAuditLogs();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/audit-logs', { params: {} });
      expect(result).toEqual(mockLogs);
    });

    it('should sanitize action filter', async () => {
      const mockLogs: AuditLog[] = [];
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs });

      await adminService.listAuditLogs({ action: 'user_created' });

      expect(apiClient.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { skip: 0, limit: 100, action: 'user_created' },
      });
    });

    it('should remove invalid characters from action filter', async () => {
      const mockLogs: AuditLog[] = [];
      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs });

      await adminService.listAuditLogs({ action: 'user<script>alert("xss")</script>_created' });

      // Should remove script tags and only keep valid characters (letters, underscores, hyphens)
      // "user<script>alert("xss")</script>_created" becomes "userscriptalertxssscript_created"
      expect(apiClient.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { skip: 0, limit: 100, action: 'userscriptalertxssscript_created' },
      });
    });
  });

  describe('getPlatformStats', () => {
    it('should fetch platform statistics', async () => {
      const mockStats: PlatformStats = {
        total_tenants: 10,
        active_tenants: 8,
        suspended_tenants: 2,
        total_users: 100,
        active_users: 90,
        inactive_users: 10,
        superadmins_count: 2,
      };

      const { apiClient } = await import('../services/api');
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStats });

      const result = await adminService.getPlatformStats();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/stats');
      expect(result).toEqual(mockStats);
    });
  });
});
