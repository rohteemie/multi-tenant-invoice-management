import { describe, it, expect } from 'vitest';
import type { InvoiceSummary, RevenueByStatus } from '../types/analytics';
import { formatCurrency } from '../utils/numberUtils';

describe('Analytics Types Integration', () => {
  describe('InvoiceSummary with string values (API response)', () => {
    it('should handle revenue fields as strings', () => {
      const summary: InvoiceSummary = {
        total_invoices: 10,
        draft_count: 2,
        sent_count: 3,
        paid_count: 4,
        overdue_count: 1,
        total_revenue: '1250.50',
        pending_amount: '500.00',
        overdue_amount: '150.25',
      };

      expect(formatCurrency(summary.total_revenue)).toBe('1250.50');
      expect(formatCurrency(summary.pending_amount)).toBe('500.00');
      expect(formatCurrency(summary.overdue_amount)).toBe('150.25');
    });
  });

  describe('InvoiceSummary with number values', () => {
    it('should handle revenue fields as numbers', () => {
      const summary: InvoiceSummary = {
        total_invoices: 10,
        draft_count: 2,
        sent_count: 3,
        paid_count: 4,
        overdue_count: 1,
        total_revenue: 1250.50,
        pending_amount: 500.00,
        overdue_amount: 150.25,
      };

      expect(formatCurrency(summary.total_revenue)).toBe('1250.50');
      expect(formatCurrency(summary.pending_amount)).toBe('500.00');
      expect(formatCurrency(summary.overdue_amount)).toBe('150.25');
    });
  });

  describe('RevenueByStatus with string values', () => {
    it('should handle total_amount as string', () => {
      const revenue: RevenueByStatus = {
        status: 'paid',
        count: 5,
        total_amount: '2500.75',
      };

      expect(formatCurrency(revenue.total_amount)).toBe('2500.75');
    });
  });

  describe('RevenueByStatus with number values', () => {
    it('should handle total_amount as number', () => {
      const revenue: RevenueByStatus = {
        status: 'paid',
        count: 5,
        total_amount: 2500.75,
      };

      expect(formatCurrency(revenue.total_amount)).toBe('2500.75');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined values gracefully', () => {
      const summary: InvoiceSummary = {
        total_invoices: 0,
        draft_count: 0,
        sent_count: 0,
        paid_count: 0,
        overdue_count: 0,
        total_revenue: '0',
        pending_amount: '0',
        overdue_amount: '0',
      };

      expect(formatCurrency(summary.total_revenue)).toBe('0.00');
      expect(formatCurrency(summary.pending_amount)).toBe('0.00');
      expect(formatCurrency(summary.overdue_amount)).toBe('0.00');
    });
  });
});
