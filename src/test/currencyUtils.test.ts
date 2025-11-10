import { describe, it, expect } from 'vitest';
import {
  formatCurrencyWithSymbol,
  getAvailableCurrencies,
  parseCurrencyAmount,
  CURRENCY_SYMBOLS,
  CURRENCY_DECIMALS,
} from '../utils/currencyUtils';

describe('currencyUtils', () => {
  describe('formatCurrencyWithSymbol', () => {
    it('should format USD with symbol', () => {
      expect(formatCurrencyWithSymbol(1234.56, 'USD')).toBe('$1234.56');
    });

    it('should format EUR with symbol', () => {
      expect(formatCurrencyWithSymbol(1234.56, 'EUR')).toBe('€1234.56');
    });

    it('should format GBP with symbol', () => {
      expect(formatCurrencyWithSymbol(1234.56, 'GBP')).toBe('£1234.56');
    });

    it('should format NGN with symbol', () => {
      expect(formatCurrencyWithSymbol(1234.56, 'NGN')).toBe('₦1234.56');
    });

    it('should format JPY with symbol (no decimals)', () => {
      expect(formatCurrencyWithSymbol(1234.56, 'JPY')).toBe('1235 ¥');
    });

    it('should format without symbol when showSymbol is false', () => {
      expect(formatCurrencyWithSymbol(1234.56, 'USD', false)).toBe('1234.56');
    });

    it('should handle zero amounts', () => {
      expect(formatCurrencyWithSymbol(0, 'USD')).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrencyWithSymbol(-100, 'USD')).toBe('$-100.00');
    });

    it('should use default USD when no currency specified', () => {
      expect(formatCurrencyWithSymbol(100)).toBe('$100.00');
    });
  });

  describe('getAvailableCurrencies', () => {
    it('should return all available currencies', () => {
      const currencies = getAvailableCurrencies();
      expect(currencies).toHaveLength(7);
      expect(currencies[0]).toEqual({
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
      });
    });

    it('should include all supported currencies', () => {
      const currencies = getAvailableCurrencies();
      const codes = currencies.map((c) => c.code);
      expect(codes).toContain('USD');
      expect(codes).toContain('EUR');
      expect(codes).toContain('GBP');
      expect(codes).toContain('NGN');
      expect(codes).toContain('JPY');
      expect(codes).toContain('CAD');
      expect(codes).toContain('AUD');
    });
  });

  describe('parseCurrencyAmount', () => {
    it('should parse plain numbers', () => {
      expect(parseCurrencyAmount('1234.56')).toBe(1234.56);
    });

    it('should parse amounts with currency symbols', () => {
      expect(parseCurrencyAmount('$1,234.56')).toBe(1234.56);
      expect(parseCurrencyAmount('€1,234.56')).toBe(1234.56);
      expect(parseCurrencyAmount('£1,234.56')).toBe(1234.56);
    });

    it('should parse amounts with spaces', () => {
      expect(parseCurrencyAmount('$ 1234.56')).toBe(1234.56);
    });

    it('should handle negative amounts', () => {
      expect(parseCurrencyAmount('-$100.00')).toBe(-100);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrencyAmount('invalid')).toBe(0);
      expect(parseCurrencyAmount('')).toBe(0);
    });
  });

  describe('CURRENCY_SYMBOLS', () => {
    it('should have symbols for all currencies', () => {
      expect(CURRENCY_SYMBOLS.USD).toBe('$');
      expect(CURRENCY_SYMBOLS.EUR).toBe('€');
      expect(CURRENCY_SYMBOLS.GBP).toBe('£');
      expect(CURRENCY_SYMBOLS.NGN).toBe('₦');
      expect(CURRENCY_SYMBOLS.JPY).toBe('¥');
      expect(CURRENCY_SYMBOLS.CAD).toBe('C$');
      expect(CURRENCY_SYMBOLS.AUD).toBe('A$');
    });
  });

  describe('CURRENCY_DECIMALS', () => {
    it('should have correct decimal places', () => {
      expect(CURRENCY_DECIMALS.USD).toBe(2);
      expect(CURRENCY_DECIMALS.EUR).toBe(2);
      expect(CURRENCY_DECIMALS.GBP).toBe(2);
      expect(CURRENCY_DECIMALS.NGN).toBe(2);
      expect(CURRENCY_DECIMALS.JPY).toBe(0); // Japanese Yen doesn't use decimals
      expect(CURRENCY_DECIMALS.CAD).toBe(2);
      expect(CURRENCY_DECIMALS.AUD).toBe(2);
    });
  });
});
