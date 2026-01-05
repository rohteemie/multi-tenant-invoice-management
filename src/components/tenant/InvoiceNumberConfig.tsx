import React, { useMemo } from 'react';

interface InvoiceNumberConfigProps {
  prefix?: string;
  format?: string;
  sequence?: number;
  onChange: (field: string, value: string | number) => void;
  disabled?: boolean;
}

export const InvoiceNumberConfig: React.FC<InvoiceNumberConfigProps> = ({
  prefix = '',
  format = 'INV-{YYYY}-{0000}',
  sequence = 1,
  onChange,
  disabled = false,
}) => {
  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Enforce max 20 characters
    if (value.length <= 20) {
      onChange('invoice_number_prefix', value);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Enforce max 100 characters
    if (value.length <= 100) {
      onChange('invoice_number_format', value);
    }
  };

  const handleSequenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onChange('invoice_number_sequence', value);
    }
  };

  // Generate preview invoice number
  const previewInvoiceNumber = useMemo(() => {
    let preview = format || 'INV-{YYYY}-{0000}';
    const currentDate = new Date();
    
    // Replace date placeholders
    preview = preview.replace('{YYYY}', currentDate.getFullYear().toString());
    preview = preview.replace('{YY}', currentDate.getFullYear().toString().slice(-2));
    preview = preview.replace('{MM}', String(currentDate.getMonth() + 1).padStart(2, '0'));
    preview = preview.replace('{DD}', String(currentDate.getDate()).padStart(2, '0'));
    
    // Replace sequence placeholders
    const seq = sequence || 1;
    preview = preview.replace('{0000}', String(seq).padStart(4, '0'));
    preview = preview.replace('{000}', String(seq).padStart(3, '0'));
    preview = preview.replace('{00}', String(seq).padStart(2, '0'));
    preview = preview.replace('{0}', String(seq));
    
    // Add prefix if provided
    if (prefix) {
      preview = `${prefix}${preview}`;
    }
    
    return preview;
  }, [prefix, format, sequence]);

  const formatHelp = [
    '{YYYY} - 4-digit year (e.g., 2024)',
    '{YY} - 2-digit year (e.g., 24)',
    '{MM} - 2-digit month (e.g., 01)',
    '{DD} - 2-digit day (e.g., 15)',
    '{0000} - 4-digit sequence with leading zeros',
    '{000} - 3-digit sequence with leading zeros',
    '{00} - 2-digit sequence with leading zeros',
    '{0} - Sequence number without padding',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Invoice Number Prefix */}
        <div>
          <label htmlFor="invoice_number_prefix" className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number Prefix
          </label>
          <input
            id="invoice_number_prefix"
            name="invoice_number_prefix"
            type="text"
            value={prefix}
            onChange={handlePrefixChange}
            disabled={disabled}
            placeholder="e.g., ORG-"
            maxLength={20}
            className="input-field"
          />
          <p className="mt-1 text-xs text-gray-500">
            {prefix.length}/20 characters - Optional prefix for all invoice numbers
          </p>
        </div>

        {/* Current Sequence */}
        <div>
          <label htmlFor="invoice_number_sequence" className="block text-sm font-medium text-gray-700 mb-1">
            Current Sequence Number
          </label>
          <input
            id="invoice_number_sequence"
            name="invoice_number_sequence"
            type="number"
            value={sequence}
            onChange={handleSequenceChange}
            disabled={disabled}
            min="0"
            className="input-field"
          />
          <p className="mt-1 text-xs text-gray-500">
            Next invoice will use this number and increment
          </p>
        </div>
      </div>

      {/* Invoice Number Format */}
      <div>
        <label htmlFor="invoice_number_format" className="block text-sm font-medium text-gray-700 mb-1">
          Invoice Number Format
        </label>
        <input
          id="invoice_number_format"
          name="invoice_number_format"
          type="text"
          value={format}
          onChange={handleFormatChange}
          disabled={disabled}
          placeholder="INV-{YYYY}-{0000}"
          maxLength={100}
          className="input-field font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          {format.length}/100 characters - Define how invoice numbers are generated
        </p>
      </div>

      {/* Format Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Available Format Tokens</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {formatHelp.map((help, index) => (
            <li key={index} className="font-mono">
              {help}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-blue-700">
          Example: <span className="font-mono">INV-{'{YYYY}'}-{'{MM}'}-{'{0000}'}</span> generates{' '}
          <span className="font-mono font-semibold">INV-2024-01-0001</span>
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Next invoice number:</span>
          <span className="font-mono text-lg font-semibold text-gray-900">{previewInvoiceNumber}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          This is what your next invoice number will look like based on the current configuration.
        </p>
      </div>
    </div>
  );
};
