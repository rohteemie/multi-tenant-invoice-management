import { apiClient } from './api';
import type { InvoiceSummary, RevenueByStatus } from '../types';

export const analyticsService = {
  async getInvoiceSummary(): Promise<InvoiceSummary> {
    const response = await apiClient.get<InvoiceSummary>('/analytics/invoice-summary');
    return response.data;
  },

  async getRevenueByStatus(): Promise<RevenueByStatus[]> {
    const response = await apiClient.get<RevenueByStatus[]>('/analytics/revenue-by-status');
    return response.data;
  },
};
