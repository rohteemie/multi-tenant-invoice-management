import { describe, it, expect } from 'vitest';
import {
  calculateItemTax,
  calculateItemTotal,
  calculateInvoiceTotals,
  formatTaxRate,
  isValidTaxRate,
} from '../utils/taxUtils';

describe('taxUtils', () => {
  describe('calculateItemTax', () => {
    it('should calculate tax for an item', () => {
      expect(calculateItemTax(2, 100, 10)).toBe(20); // 2 * 100 * 10% = 20
    });

    it('should handle zero tax rate', () => {
      expect(calculateItemTax(2, 100, 0)).toBe(0);
    });

    it('should handle fractional tax rates', () => {
      expect(calculateItemTax(1, 100, 7.5)).toBe(7.5);
    });

    it('should handle decimal quantities', () => {
      expect(calculateItemTax(2.5, 40, 10)).toBe(10); // 2.5 * 40 * 10% = 10
    });

    it('should handle decimal prices', () => {
      expect(calculateItemTax(3, 33.33, 10)).toBeCloseTo(9.999, 2);
    });

    it('should default to 0% tax when not specified', () => {
      expect(calculateItemTax(5, 100)).toBe(0);
    });
  });

  describe('calculateItemTotal', () => {
    it('should calculate total including tax', () => {
      expect(calculateItemTotal(2, 100, 10)).toBe(220); // (2 * 100) + 20% = 220
    });

    it('should handle zero tax rate', () => {
      expect(calculateItemTotal(2, 100, 0)).toBe(200);
    });

    it('should handle fractional tax rates', () => {
      expect(calculateItemTotal(1, 100, 7.5)).toBe(107.5);
    });

    it('should default to no tax when not specified', () => {
      expect(calculateItemTotal(3, 50)).toBe(150);
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('should calculate invoice totals with multiple items', () => {
      const items = [
        { quantity: 2, unit_price: 100, tax_rate: 10 },
        { quantity: 1, unit_price: 50, tax_rate: 5 },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(250); // (2*100) + (1*50) = 250
      expect(result.totalTax).toBe(22.5); // (200*10%) + (50*5%) = 20 + 2.5
      expect(result.total).toBe(272.5); // 250 + 22.5
      expect(result.itemsWithTax).toHaveLength(2);
    });

    it('should calculate with no tax', () => {
      const items = [
        { quantity: 2, unit_price: 100 },
        { quantity: 1, unit_price: 50 },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(250);
      expect(result.totalTax).toBe(0);
      expect(result.total).toBe(250);
    });

    it('should calculate with mixed tax rates', () => {
      const items = [
        { quantity: 1, unit_price: 100, tax_rate: 10 },
        { quantity: 1, unit_price: 100, tax_rate: 0 },
        { quantity: 1, unit_price: 100, tax_rate: 20 },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(300);
      expect(result.totalTax).toBe(30); // 10 + 0 + 20
      expect(result.total).toBe(330);
    });

    it('should handle empty items array', () => {
      const result = calculateInvoiceTotals([]);

      expect(result.subtotal).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.total).toBe(0);
      expect(result.itemsWithTax).toHaveLength(0);
    });

    it('should provide per-item breakdown', () => {
      const items = [
        { quantity: 2, unit_price: 100, tax_rate: 10 },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.itemsWithTax[0]).toEqual({
        subtotal: 200,
        tax: 20,
        total: 220,
      });
    });
  });

  describe('formatTaxRate', () => {
    it('should format whole numbers', () => {
      expect(formatTaxRate(10)).toBe('10.00%');
    });

    it('should format decimals', () => {
      expect(formatTaxRate(7.5)).toBe('7.50%');
    });

    it('should format zero', () => {
      expect(formatTaxRate(0)).toBe('0.00%');
    });

    it('should format large numbers', () => {
      expect(formatTaxRate(100)).toBe('100.00%');
    });

    it('should format small decimals', () => {
      expect(formatTaxRate(0.01)).toBe('0.01%');
    });
  });

  describe('isValidTaxRate', () => {
    it('should validate rates within range', () => {
      expect(isValidTaxRate(0)).toBe(true);
      expect(isValidTaxRate(10)).toBe(true);
      expect(isValidTaxRate(50)).toBe(true);
      expect(isValidTaxRate(100)).toBe(true);
    });

    it('should invalidate negative rates', () => {
      expect(isValidTaxRate(-1)).toBe(false);
      expect(isValidTaxRate(-10)).toBe(false);
    });

    it('should invalidate rates over 100', () => {
      expect(isValidTaxRate(101)).toBe(false);
      expect(isValidTaxRate(200)).toBe(false);
    });

    it('should validate fractional rates', () => {
      expect(isValidTaxRate(7.5)).toBe(true);
      expect(isValidTaxRate(0.01)).toBe(true);
      expect(isValidTaxRate(99.99)).toBe(true);
    });
  });
});
