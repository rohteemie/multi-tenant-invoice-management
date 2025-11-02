import { create } from 'zustand';
import type { Tenant, TenantCreate } from '../types';
import { getErrorMessage } from '../types/error';
import { tenantService } from '../services';

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTenants: () => Promise<void>;
  fetchTenantById: (id: string) => Promise<void>;
  updateTenant: (id: string, data: Partial<TenantCreate>) => Promise<Tenant>;
  deleteTenant: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: [],
  currentTenant: null,
  isLoading: false,
  error: null,

  fetchTenants: async () => {
    set({ isLoading: true, error: null });
    try {
      const tenants = await tenantService.getAll();
      set({ tenants, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchTenantById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const tenant = await tenantService.getById(id);
      set({ currentTenant: tenant, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTenant: async (id: string, data: Partial<TenantCreate>) => {
    set({ isLoading: true, error: null });
    try {
      const tenant = await tenantService.update(id, data);
      set((state) => ({
        tenants: state.tenants.map((t) => (t.id === id ? tenant : t)),
        currentTenant: tenant,
        isLoading: false,
      }));
      return tenant;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteTenant: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await tenantService.delete(id);
      set((state) => ({
        tenants: state.tenants.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
