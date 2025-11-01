import { apiClient } from './api';
import type { TenantRegister, TenantWithOwner, Tenant, TenantCreate } from '../types';

export const tenantService = {
  async register(data: TenantRegister): Promise<TenantWithOwner> {
    const response = await apiClient.post<TenantWithOwner>('/tenants/register', data);
    return response.data;
  },

  async getAll(): Promise<Tenant[]> {
    const response = await apiClient.get<Tenant[]>('/tenants');
    return response.data;
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
};
