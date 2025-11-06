import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvoiceStore } from '../store/invoiceStore';

// Mock the services
vi.mock('../services', () => ({
  invoiceService: {
    sendInvoiceEmail: vi.fn(),
    downloadPDF: vi.fn(),
  },
}));

describe('Invoice Store - Email and PDF Features', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    const { result } = renderHook(() => useInvoiceStore());
    act(() => {
      result.current.setError(null);
    });

    // Setup URL mocks
    createObjectURLMock = vi.fn(() => 'blob:mock-url');
    revokeObjectURLMock = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.createObjectURL = createObjectURLMock as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.URL.revokeObjectURL = revokeObjectURLMock as any;
  });

  afterEach(() => {
    if (createElementSpy) {
      createElementSpy.mockRestore();
    }
  });

  it('should send invoice email successfully', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoice = {
      id: '1',
      invoice_number: 'INV-001',
      customer_name: 'Test Customer',
      customer_email: 'customer@example.com',
      tenant_id: 'tenant-1',
      creator_id: 'user-1',
      status: 'sent' as const,
      issue_date: '2024-01-01',
      subtotal: 100,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 100,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    vi.mocked(invoiceService.sendInvoiceEmail).mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.sendInvoiceEmail('1');
    });

    expect(invoiceService.sendInvoiceEmail).toHaveBeenCalledWith('1');
    expect(result.current.currentInvoice).toEqual(mockInvoice);
    expect(result.current.currentInvoice?.status).toBe('sent');
  });

  it('should handle send email error', async () => {
    const { invoiceService } = await import('../services');
    vi.mocked(invoiceService.sendInvoiceEmail).mockRejectedValue(new Error('Send failed'));

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      try {
        await result.current.sendInvoiceEmail('1');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should download PDF successfully', async () => {
    const { invoiceService } = await import('../services');
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    
    vi.mocked(invoiceService.downloadPDF).mockResolvedValue(mockBlob);

    // Mock document.createElement for the download link
    const clickMock = vi.fn();
    const linkElement = document.createElement('a');
    linkElement.click = clickMock;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElementSpy = vi.spyOn(document, 'createElement') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElementSpy.mockReturnValue(linkElement as any);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.downloadInvoicePDF('invoice-123');
    });

    expect(invoiceService.downloadPDF).toHaveBeenCalledWith('invoice-123');
    expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    expect(linkElement.download).toBe('invoice-invoice-123.pdf');
  });

  it('should handle PDF download error', async () => {
    const { invoiceService } = await import('../services');
    vi.mocked(invoiceService.downloadPDF).mockRejectedValue(new Error('Download failed'));

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      try {
        await result.current.downloadInvoicePDF('1');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should update invoice status to sent after sending email', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoiceDraft = {
      id: '1',
      invoice_number: 'INV-001',
      customer_name: 'Test Customer',
      customer_email: 'customer@example.com',
      tenant_id: 'tenant-1',
      creator_id: 'user-1',
      status: 'draft' as const,
      issue_date: '2024-01-01',
      subtotal: 100,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 100,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const mockInvoiceSent = {
      ...mockInvoiceDraft,
      status: 'sent' as const,
      updated_at: '2024-01-02',
    };

    vi.mocked(invoiceService.sendInvoiceEmail).mockResolvedValue(mockInvoiceSent);

    const { result } = renderHook(() => useInvoiceStore());

    // Set initial state
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.current.currentInvoice = mockInvoiceDraft as any;
    });

    await act(async () => {
      await result.current.sendInvoiceEmail('1');
    });

    expect(result.current.currentInvoice?.status).toBe('sent');
  });
});
