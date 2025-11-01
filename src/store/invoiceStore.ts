import { create } from 'zustand';
import type { Invoice, InvoiceCreate, InvoiceUpdate, InvoiceStatusUpdate } from '../types';
import { invoiceService } from '../services';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  
  fetchInvoices: (params?: any) => Promise<void>;
  fetchInvoiceById: (id: string) => Promise<void>;
  createInvoice: (data: InvoiceCreate) => Promise<Invoice>;
  updateInvoice: (id: string, data: InvoiceUpdate) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, data: InvoiceStatusUpdate) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  exportInvoices: (format: 'csv' | 'json', params?: any) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,

  fetchInvoices: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await invoiceService.getAll(params);
      set({ invoices, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch invoices';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchInvoiceById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceService.getById(id);
      set({ currentInvoice: invoice, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch invoice';
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create invoice';
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update invoice';
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update invoice status';
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete invoice';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  exportInvoices: async (format: 'csv' | 'json', params?: any) => {
    try {
      const blob = await invoiceService.exportInvoices(format, params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoices.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to export invoices';
      set({ error: errorMessage });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
