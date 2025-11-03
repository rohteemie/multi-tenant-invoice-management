import { InvoiceStatus } from '../types';

/**
 * Get valid status transitions based on current invoice status.
 * This mirrors the backend validation rules from app/api/v1/endpoints/invoices.py
 * 
 * Valid transitions:
 * - DRAFT → SENT
 * - SENT → PAID or OVERDUE
 * - OVERDUE → PAID
 * - PAID → (no transitions - final state)
 * 
 * @param currentStatus - The current status of the invoice
 * @returns Array of valid next statuses
 */
export const getValidInvoiceStatusTransitions = (
  currentStatus: InvoiceStatus
): InvoiceStatus[] => {
  const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT],
    [InvoiceStatus.SENT]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
    [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID],
    [InvoiceStatus.PAID]: [], // Cannot transition from PAID
  };
  return transitions[currentStatus] || [];
};

/**
 * Capitalize the first letter of a string
 * @param text - The text to capitalize
 * @returns The text with the first letter capitalized
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};
