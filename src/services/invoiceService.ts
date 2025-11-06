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

  async sendInvoiceEmail(id: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/send`);
    return response.data;
  },

  async downloadPDF(id: string): Promise<Blob> {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Upload a client-generated PDF and optionally send via email
   * @param id - Invoice ID
   * @param pdfBlob - PDF file as a Blob
   * @param sendEmail - Whether to send the PDF via email after upload
   * @returns Updated invoice
   */
  async uploadPDFAndSend(id: string, pdfBlob: Blob, sendEmail: boolean = false): Promise<Invoice> {
    const formData = new FormData();
    formData.append('file', pdfBlob, `invoice-${id}.pdf`);
    formData.append('send_email', sendEmail.toString());

    const response = await apiClient.post<Invoice>(
      `/invoices/${id}/send`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
