import { describe, it, expect } from 'vitest';
import { toNumber, formatCurrency } from '../utils/numberUtils';

describe('numberUtils', () => {
  describe('toNumber', () => {
    it('should convert string numbers to numbers', () => {
      expect(toNumber('123.45')).toBe(123.45);
      expect(toNumber('0')).toBe(0);
      expect(toNumber('999.99')).toBe(999.99);
    });

    it('should handle number inputs', () => {
      expect(toNumber(123.45)).toBe(123.45);
      expect(toNumber(0)).toBe(0);
      expect(toNumber(999.99)).toBe(999.99);
    });

    it('should handle null and undefined', () => {
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber(null, 100)).toBe(100);
      expect(toNumber(undefined, 100)).toBe(100);
    });

    it('should handle invalid strings with default value', () => {
      expect(toNumber('invalid')).toBe(0);
      expect(toNumber('invalid', 50)).toBe(50);
      expect(toNumber('', 25)).toBe(25);
    });
  });

  describe('formatCurrency', () => {
    it('should format string numbers with 2 decimal places', () => {
      expect(formatCurrency('123.45')).toBe('123.45');
      expect(formatCurrency('100')).toBe('100.00');
      expect(formatCurrency('0.5')).toBe('0.50');
    });

    it('should format number inputs with 2 decimal places', () => {
      expect(formatCurrency(123.45)).toBe('123.45');
      expect(formatCurrency(100)).toBe('100.00');
      expect(formatCurrency(0.5)).toBe('0.50');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('0.00');
      expect(formatCurrency(undefined)).toBe('0.00');
      expect(formatCurrency(null, 100)).toBe('100.00');
    });

    it('should handle invalid inputs with default value', () => {
      expect(formatCurrency('invalid')).toBe('0.00');
      expect(formatCurrency('invalid', 50)).toBe('50.00');
    });

    it('should round correctly', () => {
      expect(formatCurrency(123.456)).toBe('123.46');
      expect(formatCurrency('123.454')).toBe('123.45');
    });
  });
});
