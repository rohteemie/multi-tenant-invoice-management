import React from 'react';

interface TenantBrandingSettingsProps {
  primaryColor?: string;
  secondaryColor?: string;
  customFooter?: string;
  draftWatermarkEnabled?: boolean;
  onChange: (field: string, value: string | boolean) => void;
  disabled?: boolean;
}

export const TenantBrandingSettings: React.FC<TenantBrandingSettingsProps> = ({
  primaryColor = '#000000',
  secondaryColor = '#666666',
  customFooter = '',
  draftWatermarkEnabled = false,
  onChange,
  disabled = false,
}) => {
  const handleColorChange = (field: string, value: string) => {
    // Validate hex color format
    if (value && !value.match(/^#[0-9A-Fa-f]{6}$/)) {
      return; // Only allow valid hex colors
    }
    onChange(field, value);
  };

  const handleFooterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce max 500 characters
    if (value.length <= 500) {
      onChange('custom_footer', value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Primary Color Picker */}
        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              value={primaryColor}
              onChange={(e) => handleColorChange('primary_color', e.target.value)}
              disabled={disabled}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => handleColorChange('primary_color', e.target.value)}
              disabled={disabled}
              placeholder="#000000"
              maxLength={7}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="input-field flex-1"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Used for headers and primary branding elements
          </p>
        </div>

        {/* Secondary Color Picker */}
        <div>
          <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-1">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="secondary_color"
              name="secondary_color"
              type="color"
              value={secondaryColor}
              onChange={(e) => handleColorChange('secondary_color', e.target.value)}
              disabled={disabled}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => handleColorChange('secondary_color', e.target.value)}
              disabled={disabled}
              placeholder="#666666"
              maxLength={7}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="input-field flex-1"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Used for accents and secondary elements
          </p>
        </div>
      </div>

      {/* Custom Footer */}
      <div>
        <label htmlFor="custom_footer" className="block text-sm font-medium text-gray-700 mb-1">
          Custom Footer
        </label>
        <textarea
          id="custom_footer"
          name="custom_footer"
          rows={4}
          value={customFooter}
          onChange={handleFooterChange}
          disabled={disabled}
          placeholder="Add custom footer text for your invoices (e.g., payment terms, legal notes, thank you message)"
          className="input-field"
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">
          {customFooter.length}/500 characters - This text will appear at the bottom of your invoices
        </p>
      </div>

      {/* Draft Watermark Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="draft_watermark_enabled" className="block text-sm font-medium text-gray-700">
            Draft Watermark
          </label>
          <p className="text-xs text-gray-500">
            Show "DRAFT" watermark on draft invoices
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={draftWatermarkEnabled}
          onClick={() => onChange('draft_watermark_enabled', !draftWatermarkEnabled)}
          disabled={disabled}
          className={`${
            draftWatermarkEnabled ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span
            aria-hidden="true"
            className={`${
              draftWatermarkEnabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </button>
      </div>

      {/* Preview Section */}
      <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Color Preview</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <div
              className="h-16 rounded border border-gray-300 flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Primary
            </div>
          </div>
          <div className="flex-1">
            <div
              className="h-16 rounded border border-gray-300 flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
