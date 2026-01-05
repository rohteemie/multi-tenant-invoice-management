import { apiClient } from './api';
import type { User, UserCreate, UserUpdate } from '../types';

export const userService = {
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[] | { items?: User[]; data?: User[]; users?: User[] }>('/users');
    // Handle both array response and paginated response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Handle paginated response with various field names
    const data = response.data as { items?: User[]; data?: User[]; users?: User[] };
    const users = data.items ?? data.data ?? data.users;
    if (!users) {
      console.error('Unexpected users response format: missing items, data, and users fields', response.data);
      throw new Error('Unexpected users response format: missing items, data, and users fields');
    }
    return users;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: UserCreate): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  async update(id: string, data: UserUpdate): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
