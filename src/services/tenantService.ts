import { apiClient } from './api';
import type { TenantRegister, TenantWithOwner, Tenant, TenantCreate } from '../types';

export const tenantService = {
  async register(data: TenantRegister): Promise<TenantWithOwner> {
    const response = await apiClient.post<TenantWithOwner>('/tenants/register', data);
    return response.data;
  },

  async getAll(): Promise<Tenant[]> {
    const response = await apiClient.get<Tenant[] | { items?: Tenant[]; data?: Tenant[]; tenants?: Tenant[] }>('/tenants');
    // Handle both array response and paginated response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Handle paginated response with various field names
    const data = response.data as { items?: Tenant[]; data?: Tenant[]; tenants?: Tenant[] };
    const items = data.items ?? data.data ?? data.tenants;
    if (!items) {
      console.error('Unexpected /tenants response format: none of items, data, or tenants present.', response.data);
      return [];
    }
    return items;
  },

  async getById(id: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  async create(data: TenantCreate): Promise<Tenant> {
    const response = await apiClient.post<Tenant>('/tenants', data);
    return response.data;
  },

  async update(id: string, data: Partial<TenantCreate>): Promise<Tenant> {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`);
  },

  async uploadLogo(tenantId: string, file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{ logo_url: string }>(
      `/tenants/${tenantId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getLogo(tenantId: string): Promise<string> {
    const response = await apiClient.get<{ logo_url: string }>(`/tenants/${tenantId}/logo`);
    return response.data.logo_url;
  },

  async deleteLogo(tenantId: string): Promise<void> {
    await apiClient.delete(`/tenants/${tenantId}/logo`);
  },
};
