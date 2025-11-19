import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { InvoiceDetailPage } from '../pages/InvoiceDetailPage';
import { InvoiceListPage } from '../pages/InvoiceListPage';
import { useInvoiceStore } from '../store';
import { InvoiceStatus } from '../types';

// Mock the store
vi.mock('../store', () => ({
  useInvoiceStore: vi.fn(),
}));

const mockInvoice = {
  id: '1',
  tenant_id: 'tenant-1',
  invoice_number: 'INV-001',
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  customer_phone: '123-456-7890',
  customer_address: '123 Test St',
  status: InvoiceStatus.SENT,
  issue_date: '2024-01-01',
  due_date: '2024-01-31',
  subtotal: 100,
  tax_amount: 10,
  discount_amount: 5,
  total_amount: 105,
  notes: 'Test notes',
  items: [
    {
      id: '1',
      description: 'Test Item',
      quantity: 2,
      unit_price: 50,
      total_price: 100,
    },
  ],
  creator_id: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('Invoice UI Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Z-Index Fix', () => {
    it('should render Mark as Paid modal with proper z-index classes', async () => {
      const mockStore = {
        currentInvoice: mockInvoice,
        isLoading: false,
        error: null,
        fetchInvoiceById: vi.fn(),
        updateInvoiceStatus: vi.fn(),
        deleteInvoice: vi.fn(),
        sendInvoiceEmail: vi.fn(),
        downloadInvoicePDF: vi.fn(),
        setError: vi.fn(),
      };
      
      (useInvoiceStore as any).mockReturnValue(mockStore);

      const { container } = render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      // Click Mark as Paid button
      const markAsPaidButton = screen.getByText('Mark as Paid');
      await userEvent.click(markAsPaidButton);

      // Wait for modal to appear
      await waitFor(() => {
        const modal = screen.getByText('Mark Invoice as Paid');
        expect(modal).toBeInTheDocument();
      });

      // Check that modal content has proper z-index class
      const modalContent = container.querySelector('.relative.z-10');
      expect(modalContent).toBeInTheDocument();
      
      // Verify payment method select is visible and interactive
      const paymentSelect = screen.getByRole('combobox');
      expect(paymentSelect).toBeInTheDocument();
      expect(paymentSelect).toBeVisible();

      // Verify Confirm Payment button is visible
      const confirmButton = screen.getByText('Confirm Payment');
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toBeVisible();
    });

    it('should render Update Status modal with proper z-index classes', async () => {
      const mockStore = {
        currentInvoice: mockInvoice,
        isLoading: false,
        error: null,
        fetchInvoiceById: vi.fn(),
        updateInvoiceStatus: vi.fn(),
        deleteInvoice: vi.fn(),
        sendInvoiceEmail: vi.fn(),
        downloadInvoicePDF: vi.fn(),
        setError: vi.fn(),
      };
      
      (useInvoiceStore as any).mockReturnValue(mockStore);

      const { container } = render(
        <BrowserRouter>
          <InvoiceDetailPage />
        </BrowserRouter>
      );

      // Click Update Status button
      const updateStatusButton = screen.getByText('Update Status');
      await userEvent.click(updateStatusButton);

      // Wait for modal to appear
      await waitFor(() => {
        const modal = screen.getByText('Update Invoice Status');
        expect(modal).toBeInTheDocument();
      });

      // Check that modal content has proper z-index class
      const modalContent = container.querySelector('.relative.z-10');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('Delete Functionality in Invoice List', () => {
    it('should show delete button for draft invoices', () => {
      const draftInvoice = { ...mockInvoice, status: InvoiceStatus.DRAFT };
      const mockStore = {
        invoices: [draftInvoice],
        isLoading: false,
        error: null,
        fetchInvoices: vi.fn(),
        exportInvoices: vi.fn(),
        deleteInvoice: vi.fn(),
      };

      (useInvoiceStore as any).mockReturnValue(mockStore);

      const { container } = render(
        <BrowserRouter>
          <InvoiceListPage />
        </BrowserRouter>
      );

      // Check that delete button exists for draft invoice
      const deleteButton = container.querySelector('button[title="Delete invoice"]');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeVisible();
    });

    it('should NOT show delete button for non-draft invoices', () => {
      const mockStore = {
        invoices: [mockInvoice], // SENT status
        isLoading: false,
        error: null,
        fetchInvoices: vi.fn(),
        exportInvoices: vi.fn(),
        deleteInvoice: vi.fn(),
      };

      (useInvoiceStore as any).mockReturnValue(mockStore);

      const { container } = render(
        <BrowserRouter>
          <InvoiceListPage />
        </BrowserRouter>
      );

      // Check that delete button does NOT exist for sent invoice
      const deleteButton = container.querySelector('button[title="Delete invoice"]');
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('should call deleteInvoice when delete button is clicked and confirmed', async () => {
      const draftInvoice = { ...mockInvoice, status: InvoiceStatus.DRAFT };
      const mockDeleteInvoice = vi.fn().mockResolvedValue(undefined);
      const mockFetchInvoices = vi.fn().mockResolvedValue(undefined);
      
      const mockStore = {
        invoices: [draftInvoice],
        isLoading: false,
        error: null,
        fetchInvoices: mockFetchInvoices,
        exportInvoices: vi.fn(),
        deleteInvoice: mockDeleteInvoice,
      };

      (useInvoiceStore as any).mockReturnValue(mockStore);

      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const { container } = render(
        <BrowserRouter>
          <InvoiceListPage />
        </BrowserRouter>
      );

      const deleteButton = container.querySelector('button[title="Delete invoice"]');
      expect(deleteButton).toBeInTheDocument();

      // Click delete button
      await userEvent.click(deleteButton!);

      // Verify confirm was called with correct message
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete invoice INV-001?');

      // Verify deleteInvoice was called
      await waitFor(() => {
        expect(mockDeleteInvoice).toHaveBeenCalledWith('1');
      });

      // Verify list is refreshed after deletion
      await waitFor(() => {
        expect(mockFetchInvoices).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should NOT call deleteInvoice when delete is cancelled', async () => {
      const draftInvoice = { ...mockInvoice, status: InvoiceStatus.DRAFT };
      const mockDeleteInvoice = vi.fn();
      
      const mockStore = {
        invoices: [draftInvoice],
        isLoading: false,
        error: null,
        fetchInvoices: vi.fn(),
        exportInvoices: vi.fn(),
        deleteInvoice: mockDeleteInvoice,
      };

      (useInvoiceStore as any).mockReturnValue(mockStore);

      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      const { container } = render(
        <BrowserRouter>
          <InvoiceListPage />
        </BrowserRouter>
      );

      const deleteButton = container.querySelector('button[title="Delete invoice"]');
      await userEvent.click(deleteButton!);

      // Verify deleteInvoice was NOT called
      expect(mockDeleteInvoice).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });
});
