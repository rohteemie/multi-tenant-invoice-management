import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceNumberConfig } from '../components/tenant/InvoiceNumberConfig';

describe('InvoiceNumberConfig', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    prefix: '',
    format: 'INV-{YYYY}-{0000}',
    sequence: 1,
    onChange: mockOnChange,
    disabled: false,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all form fields', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    expect(screen.getByLabelText(/invoice number prefix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invoice number format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current sequence number/i)).toBeInTheDocument();
  });

  it('should display current values', () => {
    const props = {
      ...defaultProps,
      prefix: 'ORG-',
      format: 'INV-{YYYY}-{0000}',
      sequence: 42,
    };
    render(<InvoiceNumberConfig {...props} />);
    
    expect(screen.getByDisplayValue('ORG-')).toBeInTheDocument();
    expect(screen.getByDisplayValue('INV-{YYYY}-{0000}')).toBeInTheDocument();
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
  });

  it('should call onChange when prefix is changed', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/invoice number prefix/i);
    fireEvent.change(input, { target: { value: 'ACME-' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('invoice_number_prefix', 'ACME-');
  });

  it('should not allow prefix longer than 20 characters', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/invoice number prefix/i);
    const longPrefix = 'a'.repeat(21);
    fireEvent.change(input, { target: { value: longPrefix } });
    
    // Should not call onChange for text longer than 20 chars
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should allow prefix exactly 20 characters', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/invoice number prefix/i);
    const maxPrefix = 'a'.repeat(20);
    fireEvent.change(input, { target: { value: maxPrefix } });
    
    expect(mockOnChange).toHaveBeenCalledWith('invoice_number_prefix', maxPrefix);
  });

  it('should call onChange when format is changed', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/invoice number format/i);
    fireEvent.change(input, { target: { value: '{YYYY}-{MM}-{0000}' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('invoice_number_format', '{YYYY}-{MM}-{0000}');
  });

  it('should not allow format longer than 100 characters', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/invoice number format/i);
    const longFormat = 'a'.repeat(101);
    fireEvent.change(input, { target: { value: longFormat } });
    
    // Should not call onChange for text longer than 100 chars
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should allow format exactly 100 characters', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/invoice number format/i);
    const maxFormat = 'a'.repeat(100);
    fireEvent.change(input, { target: { value: maxFormat } });
    
    expect(mockOnChange).toHaveBeenCalledWith('invoice_number_format', maxFormat);
  });

  it('should call onChange when sequence is changed', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/current sequence number/i);
    fireEvent.change(input, { target: { value: '100' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('invoice_number_sequence', 100);
  });

  it('should not allow negative sequence numbers', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    const input = screen.getByLabelText(/current sequence number/i);
    fireEvent.change(input, { target: { value: '-5' } });
    
    // Should not call onChange for negative numbers
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should display format help text', () => {
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    expect(screen.getByText(/available format tokens/i)).toBeInTheDocument();
    expect(screen.getByText(/4-digit year/i)).toBeInTheDocument();
    expect(screen.getByText(/2-digit month/i)).toBeInTheDocument();
    expect(screen.getByText(/4-digit sequence with leading zeros/i)).toBeInTheDocument();
  });

  it('should display preview of invoice number', () => {
    const currentYear = new Date().getFullYear();
    render(<InvoiceNumberConfig {...defaultProps} />);
    
    expect(screen.getByText(/next invoice number:/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`INV-${currentYear}-0001`))).toBeInTheDocument();
  });

  it('should update preview when prefix changes', () => {
    const { rerender } = render(<InvoiceNumberConfig {...defaultProps} />);
    
    const currentYear = new Date().getFullYear();
    
    // Update with prefix
    rerender(<InvoiceNumberConfig {...defaultProps} prefix="ACME-" />);
    
    expect(screen.getByText(new RegExp(`ACME-INV-${currentYear}-0001`))).toBeInTheDocument();
  });

  it('should update preview when format changes', () => {
    const { rerender } = render(<InvoiceNumberConfig {...defaultProps} />);
    
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Update format
    rerender(<InvoiceNumberConfig {...defaultProps} format="{YYYY}-{MM}-{000}" />);
    
    expect(screen.getByText(new RegExp(`${currentYear}-${currentMonth}-001`))).toBeInTheDocument();
  });

  it('should update preview when sequence changes', () => {
    const { rerender } = render(<InvoiceNumberConfig {...defaultProps} />);
    
    const currentYear = new Date().getFullYear();
    
    // Update sequence
    rerender(<InvoiceNumberConfig {...defaultProps} sequence={42} />);
    
    expect(screen.getByText(new RegExp(`INV-${currentYear}-0042`))).toBeInTheDocument();
  });

  it('should disable all inputs when disabled prop is true', () => {
    const disabledProps = { ...defaultProps, disabled: true };
    render(<InvoiceNumberConfig {...disabledProps} />);
    
    const inputs = screen.getAllByRole('spinbutton').concat(screen.getAllByRole('textbox'));
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('should display character count for prefix', () => {
    const props = { ...defaultProps, prefix: 'ACME-' };
    render(<InvoiceNumberConfig {...props} />);
    
    expect(screen.getByText(/5\/20 characters/i)).toBeInTheDocument();
  });

  it('should display character count for format', () => {
    const props = { ...defaultProps, format: 'INV-{YYYY}-{0000}' };
    render(<InvoiceNumberConfig {...props} />);
    
    expect(screen.getByText(/17\/100 characters/i)).toBeInTheDocument();
  });
});
