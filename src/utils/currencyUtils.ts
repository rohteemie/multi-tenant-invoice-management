import type { Currency } from '../types';

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
};

/**
 * Currency decimal places
 */
export const CURRENCY_DECIMALS: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  NGN: 2,
  JPY: 0, // Japanese Yen doesn't use decimals
  CAD: 2,
  AUD: 2,
};

/**
 * Format a number as currency with proper symbol and formatting
 */
export const formatCurrencyWithSymbol = (
  amount: number,
  currency: Currency = 'USD',
  showSymbol: boolean = true
): string => {
  const decimals = CURRENCY_DECIMALS[currency];
  const formattedAmount = amount.toFixed(decimals);
  
  if (!showSymbol) {
    return formattedAmount;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // For currencies like JPY that use symbols after amount
  if (currency === 'JPY') {
    return `${formattedAmount} ${symbol}`;
  }
  
  return `${symbol}${formattedAmount}`;
};

/**
 * Get all available currencies
 */
export const getAvailableCurrencies = (): { code: Currency; name: string; symbol: string }[] => {
  return [
    { code: 'USD', name: 'US Dollar', symbol: CURRENCY_SYMBOLS.USD },
    { code: 'EUR', name: 'Euro', symbol: CURRENCY_SYMBOLS.EUR },
    { code: 'GBP', name: 'British Pound', symbol: CURRENCY_SYMBOLS.GBP },
    { code: 'NGN', name: 'Nigerian Naira', symbol: CURRENCY_SYMBOLS.NGN },
    { code: 'JPY', name: 'Japanese Yen', symbol: CURRENCY_SYMBOLS.JPY },
    { code: 'CAD', name: 'Canadian Dollar', symbol: CURRENCY_SYMBOLS.CAD },
    { code: 'AUD', name: 'Australian Dollar', symbol: CURRENCY_SYMBOLS.AUD },
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
