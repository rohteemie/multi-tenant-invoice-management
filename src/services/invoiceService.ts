import { apiClient } from './api';
import type {
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceStatusUpdate,
} from '../types';

export const invoiceService = {
  async getAll(params?: {
    status?: string;
    customer_name?: string;
    branch_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>('/invoices/', { params });
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async create(data: InvoiceCreate): Promise<Invoice> {
    const response = await apiClient.post<Invoice>('/invoices/', data);
    return response.data;
  },

  async update(id: string, data: InvoiceUpdate): Promise<Invoice> {
    const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, data: InvoiceStatusUpdate): Promise<Invoice> {
    const response = await apiClient.patch<Invoice>(`/invoices/${id}/status`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  async exportInvoices(format: 'csv' | 'json', params?: {
    status?: string;
    customer_name?: string;
    branch_id?: string;
  }): Promise<Blob> {
    const response = await apiClient.get(`/invoices/export/invoices`, {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  },
};
