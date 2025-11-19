import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { InvoiceDetailPage } from '../pages/InvoiceDetailPage';
import { useInvoiceStore } from '../store';
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';

// Type for the invoice store
type InvoiceStoreType = ReturnType<typeof useInvoiceStore>;

// Mock the store
vi.mock('../store', () => ({
  useInvoiceStore: vi.fn(),
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => vi.fn(),
  };
});

describe('Invoice PDF Workflow E2E Tests', () => {
  const mockInvoice: Invoice = {
    id: '123',
    invoice_number: 'INV-001',
    tenant_id: 'tenant-1',
    creator_id: 'user-1',
    customer_name: 'Test Customer',
    customer_email: 'customer@example.com',
    customer_phone: '123-456-7890',
    customer_address: '123 Test St, Test City, TS 12345',
    currency: 'NGN',
    status: InvoiceStatus.DRAFT,
    issue_date: '2024-01-01',
    due_date: '2024-02-01',
    subtotal: 100,
    tax_amount: 10,
    discount_amount: 5,
    total_amount: 105,
    items: [
      {
        id: 'item-1',
        description: 'Test Item',
        quantity: 2,
        unit_price: 50,
        total_price: 100,
      },
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const createMockStore = (overrides?: Partial<InvoiceStoreType>): InvoiceStoreType => ({
    currentInvoice: mockInvoice,
    invoices: [],
    isLoading: false,
    error: null,
    fetchInvoices: vi.fn(),
    fetchInvoiceById: vi.fn(),
    createInvoice: vi.fn(),
    updateInvoice: vi.fn(),
    updateInvoiceStatus: vi.fn(),
    deleteInvoice: vi.fn(),
    exportInvoices: vi.fn(),
    sendInvoiceEmail: vi.fn(),
    downloadInvoicePDF: vi.fn(),
    setError: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useInvoiceStore).mockReturnValue(createMockStore());
  });

  it('should render invoice detail page with PDF download button', async () => {
    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });

  it('should call backend PDF download when download button is clicked', async () => {
    const user = userEvent.setup();
    const mockDownloadPDF = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        downloadInvoicePDF: mockDownloadPDF,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    // Click download button
    const downloadButton = screen.getByRole('button', { name: /download pdf/i });
    await user.click(downloadButton);

    // Verify backend PDF download was called
    await waitFor(() => {
      expect(mockDownloadPDF).toHaveBeenCalledWith('123');
    });

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/Invoice PDF downloaded successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle PDF download error gracefully', async () => {
    const user = userEvent.setup();
    const mockDownloadPDF = vi.fn().mockRejectedValue(new Error('Download failed'));
    const mockSetError = vi.fn();

    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        downloadInvoicePDF: mockDownloadPDF,
        setError: mockSetError,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download pdf/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Download failed');
    });
  });

  it('should show "Send to Customer" button for draft invoices with email', async () => {
    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /send to customer/i })).toBeInTheDocument();
  });

  it('should not show "Send to Customer" button for non-draft invoices', async () => {
    const sentInvoice = { ...mockInvoice, status: InvoiceStatus.SENT };
    
    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        currentInvoice: sentInvoice,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /send to customer/i })).not.toBeInTheDocument();
  });

  it('should not show "Send to Customer" button for invoices without email', async () => {
    const invoiceWithoutEmail = { ...mockInvoice, customer_email: '' };
    
    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        currentInvoice: invoiceWithoutEmail,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /send to customer/i })).not.toBeInTheDocument();
  });

  it('should show confirmation modal when send to customer is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send to customer/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirm Send Invoice/i)).toBeInTheDocument();
      expect(screen.getByText(/Generate PDF and send invoice to/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /send invoice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should send invoice email when confirmed', async () => {
    const user = userEvent.setup();
    const mockSendEmail = vi.fn().mockResolvedValue({ ...mockInvoice, status: InvoiceStatus.SENT });

    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        sendInvoiceEmail: mockSendEmail,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    // Click send button
    const sendButton = screen.getByRole('button', { name: /send to customer/i });
    await user.click(sendButton);

    // Wait for confirmation modal
    await waitFor(() => {
      expect(screen.getByText(/Generate PDF and send invoice to/i)).toBeInTheDocument();
    });

    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /send invoice/i });
    await user.click(confirmButton);

    // Verify email was sent via backend
    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledWith('123');
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Invoice sent successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle send email error gracefully', async () => {
    const user = userEvent.setup();
    const mockSendEmail = vi.fn().mockRejectedValue(new Error('Send failed'));
    const mockSetError = vi.fn();

    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        sendInvoiceEmail: mockSendEmail,
        setError: mockSetError,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    // Click send button
    const sendButton = screen.getByRole('button', { name: /send to customer/i });
    await user.click(sendButton);

    // Confirm
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send invoice/i })).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /send invoice/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Send failed');
    });
  });

  it('should cancel send when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockSendEmail = vi.fn();

    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({
        sendInvoiceEmail: mockSendEmail,
      })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    // Click send button
    const sendButton = screen.getByRole('button', { name: /send to customer/i });
    await user.click(sendButton);

    // Wait for confirmation modal
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Verify email was not sent
    expect(mockSendEmail).not.toHaveBeenCalled();

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText(/Generate PDF and send invoice to/i)).not.toBeInTheDocument();
    });
  });
});
