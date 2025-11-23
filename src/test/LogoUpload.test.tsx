import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoUpload } from '../components/common/LogoUpload';

describe('LogoUpload Component', () => {
  it('renders upload area when no logo is present', () => {
    const mockUpload = vi.fn();
    render(<LogoUpload onUpload={mockUpload} />);
    
    expect(screen.getByText('Organization Logo')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, or SVG up to 2MB')).toBeInTheDocument();
  });

  it('displays logo preview when logo URL is provided', () => {
    const mockUpload = vi.fn();
    const logoUrl = 'https://example.com/logo.png';
    
    render(<LogoUpload currentLogoUrl={logoUrl} onUpload={mockUpload} />);
    
    const img = screen.getByAltText('Logo preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', logoUrl);
  });

  it('shows delete button when logo is present and onDelete is provided', () => {
    const mockUpload = vi.fn();
    const mockDelete = vi.fn();
    const logoUrl = 'https://example.com/logo.png';
    
    render(
      <LogoUpload 
        currentLogoUrl={logoUrl} 
        onUpload={mockUpload} 
        onDelete={mockDelete}
      />
    );
    
    expect(screen.getByText('Delete Logo')).toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    const mockUpload = vi.fn();
    const logoUrl = 'https://example.com/logo.png';
    
    render(
      <LogoUpload 
        currentLogoUrl={logoUrl} 
        onUpload={mockUpload}
      />
    );
    
    expect(screen.queryByText('Delete Logo')).not.toBeInTheDocument();
  });

  it('validates file type and shows error for invalid types', async () => {
    const mockUpload = vi.fn();
    render(<LogoUpload onUpload={mockUpload} />);
    
    const input = screen.getByLabelText('Choose file').parentElement?.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    if (input) {
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
      });
      
      expect(mockUpload).not.toHaveBeenCalled();
    }
  });

  it('validates file size and shows error for large files', async () => {
    const mockUpload = vi.fn();
    render(<LogoUpload onUpload={mockUpload} />);
    
    const input = screen.getByLabelText('Choose file').parentElement?.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    if (input) {
      // Create a file larger than 2MB
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText(/File is too large/)).toBeInTheDocument();
      });
      
      expect(mockUpload).not.toHaveBeenCalled();
    }
  });

  it('calls onUpload for valid file', async () => {
    const mockUpload = vi.fn().mockResolvedValue(undefined);
    render(<LogoUpload onUpload={mockUpload} />);
    
    const input = screen.getByLabelText('Choose file').parentElement?.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    
    if (input) {
      const validFile = new File(['content'], 'test.png', { type: 'image/png' });
      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(validFile);
      });
    }
  });

  it('calls onDelete when delete button is clicked', async () => {
    const mockUpload = vi.fn();
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const logoUrl = 'https://example.com/logo.png';
    
    render(
      <LogoUpload 
        currentLogoUrl={logoUrl} 
        onUpload={mockUpload} 
        onDelete={mockDelete}
      />
    );
    
    const deleteButton = screen.getByText('Delete Logo');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  it('shows loading state during upload/delete', () => {
    const mockUpload = vi.fn();
    const mockDelete = vi.fn();
    const logoUrl = 'https://example.com/logo.png';
    
    render(
      <LogoUpload 
        currentLogoUrl={logoUrl} 
        onUpload={mockUpload} 
        onDelete={mockDelete}
        isLoading={true}
      />
    );
    
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
