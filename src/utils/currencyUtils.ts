import type { Currency } from '../types';

/**
 * Currency symbols mapping
 * Aligned with backend - supports NGN, USD, GBP, EUR only
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

/**
 * Currency decimal places
 */
export const CURRENCY_DECIMALS: Record<Currency, number> = {
  NGN: 2,
  USD: 2,
  GBP: 2,
  EUR: 2,
};

/**
 * Format a number as currency with proper symbol and formatting
 */
export const formatCurrencyWithSymbol = (
  amount: number,
  currency: Currency = 'NGN',
  showSymbol: boolean = true
): string => {
  const decimals = CURRENCY_DECIMALS[currency];
  const formattedAmount = amount.toFixed(decimals);
  
  if (!showSymbol) {
    return formattedAmount;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${formattedAmount}`;
};

/**
 * Get all available currencies
 * Aligned with backend - NGN, USD, GBP, EUR only
 */
export const getAvailableCurrencies = (): { code: Currency; name: string; symbol: string }[] => {
  return [
    { code: 'NGN', name: 'Nigerian Naira', symbol: CURRENCY_SYMBOLS.NGN },
    { code: 'USD', name: 'US Dollar', symbol: CURRENCY_SYMBOLS.USD },
    { code: 'GBP', name: 'British Pound', symbol: CURRENCY_SYMBOLS.GBP },
    { code: 'EUR', name: 'Euro', symbol: CURRENCY_SYMBOLS.EUR },
  ];
};

/**
 * Parse currency string to number
 */
export const parseCurrencyAmount = (value: string): number => {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};
