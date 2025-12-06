import { apiClient } from './api';
import type { Tenant, User } from '../types';
import type { AuditLog } from '../types/auditLog';
import { sanitizeId, sanitizeAction, validatePagination, sanitizeBoolean } from '../utils/sanitization';

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
 * All inputs are sanitized to prevent injection attacks
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
    interface SanitizedParams {
      skip: number;
      limit: number;
      is_active?: boolean;
    }
    
    const sanitizedParams: SanitizedParams = {
      skip: 0,
      limit: 100,
    };
    
    if (params) {
      const { skip, limit } = validatePagination(params.skip, params.limit);
      sanitizedParams.skip = skip;
      sanitizedParams.limit = limit;
      
      if (params.is_active !== undefined) {
        sanitizedParams.is_active = sanitizeBoolean(params.is_active);
      }
    }

    const response = await apiClient.get<Tenant[]>('/admin/tenants', { params: sanitizedParams });
    return response.data;
  },

  /**
   * Get details of a specific tenant
   */
  async getTenant(tenantId: string): Promise<Tenant> {
    const sanitizedId = sanitizeId(tenantId);
    if (!sanitizedId) {
      throw new Error('Invalid tenant ID');
    }
    
    const response = await apiClient.get<Tenant>(`/admin/tenants/${sanitizedId}`);
    return response.data;
  },

  /**
   * Suspend a tenant (set is_active to false)
   */
  async suspendTenant(tenantId: string): Promise<{ message: string; tenant: Tenant }> {
    const sanitizedId = sanitizeId(tenantId);
    if (!sanitizedId) {
      throw new Error('Invalid tenant ID');
    }
    
    const response = await apiClient.put<{ message: string; tenant: Tenant }>(
      `/admin/tenants/${sanitizedId}/suspend`
    );
    return response.data;
  },

  /**
   * Reactivate a suspended tenant (set is_active to true)
   */
  async reactivateTenant(tenantId: string): Promise<{ message: string; tenant: Tenant }> {
    const sanitizedId = sanitizeId(tenantId);
    if (!sanitizedId) {
      throw new Error('Invalid tenant ID');
    }
    
    const response = await apiClient.put<{ message: string; tenant: Tenant }>(
      `/admin/tenants/${sanitizedId}/reactivate`
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
    interface SanitizedParams {
      skip: number;
      limit: number;
      tenant_id?: string;
      is_active?: boolean;
      is_superadmin?: boolean;
    }
    
    const sanitizedParams: SanitizedParams = {
      skip: 0,
      limit: 100,
    };
    
    if (params) {
      const { skip, limit } = validatePagination(params.skip, params.limit);
      sanitizedParams.skip = skip;
      sanitizedParams.limit = limit;
      
      if (params.tenant_id) {
        const sanitizedTenantId = sanitizeId(params.tenant_id);
        if (sanitizedTenantId) {
          sanitizedParams.tenant_id = sanitizedTenantId;
        }
      }
      
      if (params.is_active !== undefined) {
        sanitizedParams.is_active = sanitizeBoolean(params.is_active);
      }
      
      if (params.is_superadmin !== undefined) {
        sanitizedParams.is_superadmin = sanitizeBoolean(params.is_superadmin);
      }
    }

    const response = await apiClient.get<User[]>('/admin/users', { params: sanitizedParams });
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
    interface SanitizedParams {
      skip: number;
      limit: number;
      tenant_id?: string;
      user_id?: string;
      action?: string;
    }
    
    const sanitizedParams: SanitizedParams = {
      skip: 0,
      limit: 100,
    };
    
    if (params) {
      const { skip, limit } = validatePagination(params.skip, params.limit);
      sanitizedParams.skip = skip;
      sanitizedParams.limit = limit;
      
      if (params.tenant_id) {
        const sanitizedTenantId = sanitizeId(params.tenant_id);
        if (sanitizedTenantId) {
          sanitizedParams.tenant_id = sanitizedTenantId;
        }
      }
      
      if (params.user_id) {
        const sanitizedUserId = sanitizeId(params.user_id);
        if (sanitizedUserId) {
          sanitizedParams.user_id = sanitizedUserId;
        }
      }
      
      if (params.action) {
        const sanitizedAction = sanitizeAction(params.action);
        if (sanitizedAction) {
          sanitizedParams.action = sanitizedAction;
        }
      }
    }

    const response = await apiClient.get<AuditLog[]>('/admin/audit-logs', { params: sanitizedParams });
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
