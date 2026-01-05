import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantBrandingSettings } from '../components/tenant/TenantBrandingSettings';

describe('TenantBrandingSettings', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    primaryColor: '#000000',
    secondaryColor: '#666666',
    customFooter: '',
    draftWatermarkEnabled: false,
    onChange: mockOnChange,
    disabled: false,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all form fields', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/secondary color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/custom footer/i)).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should display current color values', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const primaryColorInputs = screen.getAllByDisplayValue('#000000');
    const secondaryColorInputs = screen.getAllByDisplayValue('#666666');
    
    expect(primaryColorInputs.length).toBeGreaterThan(0);
    expect(secondaryColorInputs.length).toBeGreaterThan(0);
  });

  it('should call onChange when primary color is changed', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const colorInput = screen.getByLabelText(/primary color/i).closest('div')?.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('primary_color', '#ff0000');
  });

  it('should call onChange when secondary color is changed', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const colorInput = screen.getByLabelText(/secondary color/i).closest('div')?.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('secondary_color', '#00ff00');
  });

  it('should call onChange when custom footer text is changed', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const textArea = screen.getByLabelText(/custom footer/i);
    fireEvent.change(textArea, { target: { value: 'Thank you for your business!' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('custom_footer', 'Thank you for your business!');
  });

  it('should not allow footer text longer than 500 characters', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const textArea = screen.getByLabelText(/custom footer/i);
    const longText = 'a'.repeat(501);
    fireEvent.change(textArea, { target: { value: longText } });
    
    // Should not call onChange for text longer than 500 chars
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should allow footer text exactly 500 characters', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const textArea = screen.getByLabelText(/custom footer/i);
    const maxText = 'a'.repeat(500);
    fireEvent.change(textArea, { target: { value: maxText } });
    
    expect(mockOnChange).toHaveBeenCalledWith('custom_footer', maxText);
  });

  it('should display character count for custom footer', () => {
    const propsWithFooter = { ...defaultProps, customFooter: 'Hello' };
    render(<TenantBrandingSettings {...propsWithFooter} />);
    
    expect(screen.getByText(/5\/500 characters/i)).toBeInTheDocument();
  });

  it('should toggle draft watermark when switch is clicked', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    
    expect(mockOnChange).toHaveBeenCalledWith('draft_watermark_enabled', true);
  });

  it('should show watermark toggle in enabled state', () => {
    const propsWithWatermark = { ...defaultProps, draftWatermarkEnabled: true };
    render(<TenantBrandingSettings {...propsWithWatermark} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should disable all inputs when disabled prop is true', () => {
    const disabledProps = { ...defaultProps, disabled: true };
    render(<TenantBrandingSettings {...disabledProps} />);
    
    const colorInputs = screen.getAllByRole('textbox');
    colorInputs.forEach(input => {
      expect(input).toBeDisabled();
    });
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
  });

  it('should display color preview boxes', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('should not accept invalid hex color format', () => {
    render(<TenantBrandingSettings {...defaultProps} />);
    
    const primaryColorDiv = screen.getByLabelText(/primary color/i).closest('div');
    const textInputs = primaryColorDiv?.querySelectorAll('input[type="text"]');
    const primaryColorText = textInputs?.[0] as HTMLInputElement;
    
    if (primaryColorText) {
      // Try to set invalid color
      fireEvent.change(primaryColorText, { target: { value: 'invalid' } });
      
      // Should not call onChange with invalid color
      expect(mockOnChange).not.toHaveBeenCalledWith('primary_color', 'invalid');
    }
  });
});
