import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { InvoiceDetailPage } from '../pages/InvoiceDetailPage';
import { useInvoiceStore } from '../store';
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';
import * as pdfUtils from '../utils/pdfUtils';

// Type for the invoice store
type InvoiceStoreType = ReturnType<typeof useInvoiceStore>;

// Mock the store
vi.mock('../store', () => ({
  useInvoiceStore: vi.fn(),
}));

// Mock the PDF utilities
vi.mock('../utils/pdfUtils', () => ({
  downloadPDF: vi.fn(),
  generateAndUploadPDF: vi.fn(),
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
    uploadPDFAndSend: vi.fn(),
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

  it('should show GDPR consent modal when download PDF is clicked', async () => {
    const user = userEvent.setup();

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
      expect(screen.getByText('Data Processing Consent')).toBeInTheDocument();
    });

    expect(screen.getByText(/This will generate a PDF containing invoice information/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer name and contact information/i)).toBeInTheDocument();
  });

  it('should generate and download PDF when user consents', async () => {
    const user = userEvent.setup();
    const mockDownloadPDF = vi.fn().mockResolvedValue(undefined);
    vi.mocked(pdfUtils.downloadPDF).mockImplementation(mockDownloadPDF);

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

    // Wait for consent modal
    await waitFor(() => {
      expect(screen.getByText('Data Processing Consent')).toBeInTheDocument();
    });

    // Click consent button
    const consentButton = screen.getByRole('button', { name: /i consent/i });
    await user.click(consentButton);

    // Verify PDF download was called
    await waitFor(() => {
      expect(mockDownloadPDF).toHaveBeenCalled();
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Invoice PDF downloaded successfully/i)).toBeInTheDocument();
    });
  });

  it('should cancel PDF download when user cancels consent', async () => {
    const user = userEvent.setup();
    const mockDownloadPDF = vi.fn();
    vi.mocked(pdfUtils.downloadPDF).mockImplementation(mockDownloadPDF);

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

    // Wait for consent modal
    await waitFor(() => {
      expect(screen.getByText('Data Processing Consent')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0];
    await user.click(cancelButton);

    // Verify PDF download was NOT called
    expect(mockDownloadPDF).not.toHaveBeenCalled();

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Data Processing Consent')).not.toBeInTheDocument();
    });
  });

  it('should show generate & send PDF button for draft invoices with email', async () => {
    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /generate & send pdf/i })).toBeInTheDocument();
  });

  it('should upload PDF and send email when user consents and confirms', async () => {
    const user = userEvent.setup();
    const mockGenerateAndUploadPDF = vi.fn().mockResolvedValue(undefined);
    const mockUploadPDFAndSend = vi.fn().mockResolvedValue(mockInvoice);
    
    vi.mocked(pdfUtils.generateAndUploadPDF).mockImplementation(mockGenerateAndUploadPDF);
    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({ uploadPDFAndSend: mockUploadPDFAndSend })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    // Click generate & send button
    const generateButton = screen.getByRole('button', { name: /generate & send pdf/i });
    await user.click(generateButton);

    // Wait for consent modal
    await waitFor(() => {
      expect(screen.getByText('Data Processing Consent')).toBeInTheDocument();
    });

    // Click consent button
    const consentButton = screen.getByRole('button', { name: /i consent/i });
    await user.click(consentButton);

    // Wait for confirmation modal
    await waitFor(() => {
      expect(screen.getByText('Confirm Send Invoice')).toBeInTheDocument();
    });

    // Verify email is in the modal
    const modal = screen.getByText('Confirm Send Invoice').closest('div[class*="inline-block"]');
    expect(modal).toContainHTML('customer@example.com');

    // Click send invoice button
    const sendButton = screen.getByRole('button', { name: /send invoice/i });
    await user.click(sendButton);

    // Verify upload and send was called
    await waitFor(() => {
      expect(mockGenerateAndUploadPDF).toHaveBeenCalled();
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Invoice PDF generated and sent successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle PDF generation errors gracefully', async () => {
    const user = userEvent.setup();
    const mockDownloadPDF = vi.fn().mockRejectedValue(new Error('PDF generation failed'));
    vi.mocked(pdfUtils.downloadPDF).mockImplementation(mockDownloadPDF);

    const mockSetError = vi.fn();
    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({ setError: mockSetError })
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

    // Wait for consent modal and accept
    await waitFor(() => {
      expect(screen.getByText('Data Processing Consent')).toBeInTheDocument();
    });

    const consentButton = screen.getByRole('button', { name: /i consent/i });
    await user.click(consentButton);

    // Verify error was set
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('PDF generation failed');
    });
  });

  it('should not show generate & send button for non-draft invoices', async () => {
    const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID };
    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({ currentInvoice: paidInvoice })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /generate & send pdf/i })).not.toBeInTheDocument();
  });

  it('should not show generate & send button for invoices without email', async () => {
    const invoiceNoEmail = { ...mockInvoice, customer_email: undefined };
    vi.mocked(useInvoiceStore).mockReturnValue(
      createMockStore({ currentInvoice: invoiceNoEmail })
    );

    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /generate & send pdf/i })).not.toBeInTheDocument();
  });

  it('should render print template in hidden div', async () => {
    render(
      <BrowserRouter>
        <InvoiceDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice INV-001')).toBeInTheDocument();
    });

    // The print template should be present but hidden
    const hiddenDiv = document.querySelector('.hidden');
    expect(hiddenDiv).toBeInTheDocument();
  });
});
