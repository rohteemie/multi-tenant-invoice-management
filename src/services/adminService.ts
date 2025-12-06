import { apiClient } from './api';
import type { Tenant, User } from '../types';
import type { AuditLog } from '../types/auditLog';

/**
 * Platform Statistics Interface
 */
export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  active_users: number;
  inactive_users: number;
  superadmins_count: number;
}

/**
 * Admin Service for Super Admin operations
 * All endpoints require is_superadmin=true
 */
export const adminService = {
  /**
   * List all tenants in the platform
   */
  async listTenants(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<Tenant[]> {
    const response = await apiClient.get<Tenant[]>('/admin/tenants', { params });
    return response.data;
  },

  /**
   * Get details of a specific tenant
   */
  async getTenant(tenantId: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`/admin/tenants/${tenantId}`);
    return response.data;
  },

  /**
   * Suspend a tenant (set is_active to false)
   */
  async suspendTenant(tenantId: string): Promise<{ message: string; tenant: Tenant }> {
    const response = await apiClient.put<{ message: string; tenant: Tenant }>(
      `/admin/tenants/${tenantId}/suspend`
    );
    return response.data;
  },

  /**
   * Reactivate a suspended tenant (set is_active to true)
   */
  async reactivateTenant(tenantId: string): Promise<{ message: string; tenant: Tenant }> {
    const response = await apiClient.put<{ message: string; tenant: Tenant }>(
      `/admin/tenants/${tenantId}/reactivate`
    );
    return response.data;
  },

  /**
   * List all users across all tenants
   */
  async listUsers(params?: {
    skip?: number;
    limit?: number;
    tenant_id?: string;
    is_active?: boolean;
    is_superadmin?: boolean;
  }): Promise<User[]> {
    const response = await apiClient.get<User[]>('/admin/users', { params });
    return response.data;
  },

  /**
   * List platform-wide audit logs
   */
  async listAuditLogs(params?: {
    skip?: number;
    limit?: number;
    tenant_id?: string;
    user_id?: string;
    action?: string;
  }): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>('/admin/audit-logs', { params });
    return response.data;
  },

  /**
   * Get platform-wide statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await apiClient.get<PlatformStats>('/admin/stats');
    return response.data;
  },
};
