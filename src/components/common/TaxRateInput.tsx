import React from 'react';
import { formatTaxRate } from '../../utils/taxUtils';

interface TaxRateInputProps {
  value: number;
  onChange: (rate: number) => void;
  label?: string;
  required?: boolean;
  className?: string;
  min?: number;
  max?: number;
}

export const TaxRateInput: React.FC<TaxRateInputProps> = ({
  value,
  onChange,
  label = 'Tax Rate (%)',
  required = false,
  className = '',
  min = 0,
  max = 100,
}) => {
  return (
    <div className={className}>
      <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="number"
          id="tax_rate"
          name="tax_rate"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step="0.01"
          required={required}
          className="input-field pr-12"
          placeholder="0.00"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">%</span>
        </div>
      </div>
      {value > 0 && (
        <p className="mt-1 text-sm text-gray-500">
          Tax rate: {formatTaxRate(value)}
        </p>
      )}
    </div>
  );
};
