import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvoiceStore } from '../store/invoiceStore';

// Mock the services
vi.mock('../services', () => ({
  invoiceService: {
    getAll: vi.fn(),
    exportInvoices: vi.fn(),
  },
}));

describe('Invoice Store - Advanced Filter Parameters', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useInvoiceStore());
    act(() => {
      result.current.setError(null);
    });
  });

  it('should fetch invoices with invoice_number filter', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoices = [
      {
        id: '1',
        invoice_number: 'INV-001',
        customer_name: 'Test Customer',
        tenant_id: 'tenant-1',
        creator_id: 'user-1',
        status: 'draft' as const,
        currency: 'NGN' as const,
        issue_date: '2024-01-01',
        subtotal: 100,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 100,
        items: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    vi.mocked(invoiceService.getAll).mockResolvedValue(mockInvoices);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.fetchInvoices({ invoice_number: 'INV-001' });
    });

    expect(invoiceService.getAll).toHaveBeenCalledWith({ invoice_number: 'INV-001' });
    expect(result.current.invoices).toEqual(mockInvoices);
  });

  it('should fetch invoices with start_date and end_date filters', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoices = [
      {
        id: '1',
        invoice_number: 'INV-001',
        customer_name: 'Test Customer',
        tenant_id: 'tenant-1',
        creator_id: 'user-1',
        status: 'paid' as const,
        currency: 'NGN' as const,
        issue_date: '2024-01-15',
        subtotal: 200,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 200,
        items: [],
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      },
    ];

    vi.mocked(invoiceService.getAll).mockResolvedValue(mockInvoices);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.fetchInvoices({
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
      });
    });

    expect(invoiceService.getAll).toHaveBeenCalledWith({
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-01-31T23:59:59Z',
    });
    expect(result.current.invoices).toEqual(mockInvoices);
  });

  it('should fetch invoices with min_amount and max_amount filters', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoices = [
      {
        id: '1',
        invoice_number: 'INV-001',
        customer_name: 'Test Customer',
        tenant_id: 'tenant-1',
        creator_id: 'user-1',
        status: 'sent' as const,
        currency: 'USD' as const,
        issue_date: '2024-01-01',
        subtotal: 150,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 150,
        items: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    vi.mocked(invoiceService.getAll).mockResolvedValue(mockInvoices);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.fetchInvoices({
        min_amount: 100,
        max_amount: 200,
      });
    });

    expect(invoiceService.getAll).toHaveBeenCalledWith({
      min_amount: 100,
      max_amount: 200,
    });
    expect(result.current.invoices).toEqual(mockInvoices);
  });

  it('should fetch invoices with multiple combined filters', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoices = [
      {
        id: '1',
        invoice_number: 'INV-001',
        customer_name: 'Test Customer',
        tenant_id: 'tenant-1',
        creator_id: 'user-1',
        status: 'paid' as const,
        currency: 'EUR' as const,
        issue_date: '2024-01-10',
        subtotal: 150,
        tax_amount: 10,
        discount_amount: 5,
        total_amount: 155,
        items: [],
        created_at: '2024-01-10',
        updated_at: '2024-01-10',
      },
    ];

    vi.mocked(invoiceService.getAll).mockResolvedValue(mockInvoices);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.fetchInvoices({
        status: 'paid',
        customer_name: 'Test',
        invoice_number: 'INV',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
        min_amount: 100,
        max_amount: 200,
      });
    });

    expect(invoiceService.getAll).toHaveBeenCalledWith({
      status: 'paid',
      customer_name: 'Test',
      invoice_number: 'INV',
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-01-31T23:59:59Z',
      min_amount: 100,
      max_amount: 200,
    });
    expect(result.current.invoices).toEqual(mockInvoices);
  });

  it('should export invoices with invoice_number filter', async () => {
    const { invoiceService } = await import('../services');
    const mockBlob = new Blob(['CSV content'], { type: 'text/csv' });
    
    vi.mocked(invoiceService.exportInvoices).mockResolvedValue(mockBlob);

    // Mock window.URL and document.createElement
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.createObjectURL = createObjectURLMock as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.revokeObjectURL = revokeObjectURLMock as any;

    const clickMock = vi.fn();
    const linkElement = document.createElement('a');
    linkElement.click = clickMock;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createElementSpy = vi.spyOn(document, 'createElement') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElementSpy.mockReturnValue(linkElement as any);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.exportInvoices('csv', { invoice_number: 'INV-001' });
    });

    expect(invoiceService.exportInvoices).toHaveBeenCalledWith('csv', { invoice_number: 'INV-001' });
    expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
    expect(clickMock).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('should export invoices with date range filters', async () => {
    const { invoiceService } = await import('../services');
    const mockBlob = new Blob(['JSON content'], { type: 'application/json' });
    
    vi.mocked(invoiceService.exportInvoices).mockResolvedValue(mockBlob);

    // Mock window.URL and document.createElement
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.createObjectURL = createObjectURLMock as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.revokeObjectURL = revokeObjectURLMock as any;

    const clickMock = vi.fn();
    const linkElement = document.createElement('a');
    linkElement.click = clickMock;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createElementSpy = vi.spyOn(document, 'createElement') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElementSpy.mockReturnValue(linkElement as any);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.exportInvoices('json', {
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
      });
    });

    expect(invoiceService.exportInvoices).toHaveBeenCalledWith('json', {
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-01-31T23:59:59Z',
    });

    createElementSpy.mockRestore();
  });

  it('should export invoices with amount range filters', async () => {
    const { invoiceService } = await import('../services');
    const mockBlob = new Blob(['CSV content'], { type: 'text/csv' });
    
    vi.mocked(invoiceService.exportInvoices).mockResolvedValue(mockBlob);

    // Mock window.URL and document.createElement
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.createObjectURL = createObjectURLMock as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.revokeObjectURL = revokeObjectURLMock as any;

    const clickMock = vi.fn();
    const linkElement = document.createElement('a');
    linkElement.click = clickMock;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createElementSpy = vi.spyOn(document, 'createElement') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElementSpy.mockReturnValue(linkElement as any);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.exportInvoices('csv', {
        min_amount: 50,
        max_amount: 500,
      });
    });

    expect(invoiceService.exportInvoices).toHaveBeenCalledWith('csv', {
      min_amount: 50,
      max_amount: 500,
    });

    createElementSpy.mockRestore();
  });

  it('should handle fetch invoices error with advanced filters', async () => {
    const { invoiceService } = await import('../services');
    vi.mocked(invoiceService.getAll).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      try {
        await result.current.fetchInvoices({
          invoice_number: 'INV-001',
          min_amount: 100,
          max_amount: 200,
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
  });
});
