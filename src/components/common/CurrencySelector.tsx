import React from 'react';
import type { Currency } from '../../types';
import { getAvailableCurrencies } from '../../utils/currencyUtils';

interface CurrencySelectorProps {
  value: Currency | undefined;
  onChange: (currency: Currency) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  label = 'Currency',
  required = false,
  className = '',
}) => {
  const currencies = getAvailableCurrencies();

  return (
    <div className={className}>
      <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <select
        id="currency"
        name="currency"
        value={value || ''}
        onChange={(e) => onChange(e.target.value as Currency)}
        required={required}
        className="mt-1 input-field"
      >
        <option value="">Select currency</option>
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};
