import { create } from 'zustand';
import type { Invoice, InvoiceCreate, InvoiceUpdate, InvoiceStatusUpdate } from '../types';
import { getErrorMessage } from '../types/error';
import { invoiceService } from '../services';

interface InvoiceQueryParams {
  status?: string;
  customer_name?: string;
  invoice_number?: string;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  skip?: number;
  limit?: number;
}

interface InvoiceExportParams {
  status?: string;
  customer_name?: string;
  invoice_number?: string;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  
  fetchInvoices: (params?: InvoiceQueryParams) => Promise<void>;
  fetchInvoiceById: (id: string) => Promise<void>;
  createInvoice: (data: InvoiceCreate) => Promise<Invoice>;
  updateInvoice: (id: string, data: InvoiceUpdate) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, data: InvoiceStatusUpdate) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  exportInvoices: (format: 'csv' | 'json', params?: InvoiceExportParams) => Promise<void>;
  sendInvoiceEmail: (id: string) => Promise<Invoice>;
  downloadInvoicePDF: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,

  fetchInvoices: async (params?: InvoiceQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await invoiceService.getAll(params);
      set({ invoices, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchInvoiceById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceService.getById(id);
      set({ currentInvoice: invoice, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createInvoice: async (data: InvoiceCreate) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceService.create(data);
      set((state) => ({ 
        invoices: [invoice, ...state.invoices], 
        isLoading: false 
      }));
      return invoice;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateInvoice: async (id: string, data: InvoiceUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceService.update(id, data);
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? invoice : inv)),
        currentInvoice: invoice,
        isLoading: false,
      }));
      return invoice;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateInvoiceStatus: async (id: string, data: InvoiceStatusUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceService.updateStatus(id, data);
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? invoice : inv)),
        currentInvoice: invoice,
        isLoading: false,
      }));
      return invoice;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await invoiceService.delete(id);
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  exportInvoices: async (format: 'csv' | 'json', params?: InvoiceExportParams) => {
    try {
      const blob = await invoiceService.exportInvoices(format, params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  sendInvoiceEmail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceService.sendInvoiceEmail(id);
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? invoice : inv)),
        currentInvoice: invoice,
        isLoading: false,
      }));
      return invoice;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  downloadInvoicePDF: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const blob = await invoiceService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      set({ isLoading: false });
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
