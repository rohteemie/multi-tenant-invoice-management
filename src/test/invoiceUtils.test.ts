import { describe, it, expect } from 'vitest';
import { getValidInvoiceStatusTransitions, capitalizeFirstLetter } from '../utils/invoiceUtils';
import { InvoiceStatus } from '../types';

describe('Invoice Utils', () => {
  describe('getValidInvoiceStatusTransitions', () => {
    it('should return correct transitions for DRAFT status', () => {
      const transitions = getValidInvoiceStatusTransitions(InvoiceStatus.DRAFT);
      expect(transitions).toEqual([InvoiceStatus.SENT]);
    });

    it('should return correct transitions for SENT status', () => {
      const transitions = getValidInvoiceStatusTransitions(InvoiceStatus.SENT);
      expect(transitions).toEqual([InvoiceStatus.PAID, InvoiceStatus.OVERDUE]);
    });

    it('should return correct transitions for OVERDUE status', () => {
      const transitions = getValidInvoiceStatusTransitions(InvoiceStatus.OVERDUE);
      expect(transitions).toEqual([InvoiceStatus.PAID]);
    });

    it('should return empty array for PAID status', () => {
      const transitions = getValidInvoiceStatusTransitions(InvoiceStatus.PAID);
      expect(transitions).toEqual([]);
    });

    it('should return empty array for unknown status', () => {
      const transitions = getValidInvoiceStatusTransitions('unknown' as InvoiceStatus);
      expect(transitions).toEqual([]);
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a lowercase string', () => {
      expect(capitalizeFirstLetter('draft')).toBe('Draft');
      expect(capitalizeFirstLetter('sent')).toBe('Sent');
      expect(capitalizeFirstLetter('paid')).toBe('Paid');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalizeFirstLetter('Draft')).toBe('Draft');
      expect(capitalizeFirstLetter('SENT')).toBe('SENT');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
      expect(capitalizeFirstLetter('Z')).toBe('Z');
    });

    it('should handle strings with multiple words', () => {
      expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
    });
  });
});
