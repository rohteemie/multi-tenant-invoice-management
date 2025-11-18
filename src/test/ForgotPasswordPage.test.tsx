import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { authService } from '../services';

vi.mock('../services', () => ({
  authService: {
    requestPasswordReset: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ForgotPasswordPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the forgot password form', () => {
    renderWithRouter(<ForgotPasswordPage />);

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send reset link/i })).toBeInTheDocument();
    expect(screen.getByText('Back to login')).toBeInTheDocument();
  });

  it('should submit form with email address', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce({
      message: 'Password reset email sent successfully',
    });

    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.requestPasswordReset).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });

  it('should show success message after successful submission', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce({
      message: 'Password reset email sent successfully',
    });

    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      expect(screen.getByText(/If an account exists with that email address/i)).toBeInTheDocument();
    });
  });

  it('should show error message on failure', async () => {
    vi.mocked(authService.requestPasswordReset).mockRejectedValueOnce(
      new Error('Failed to send reset email')
    );

    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to send reset email/i)).toBeInTheDocument();
    });
  });

  it('should clear email field after successful submission', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce({
      message: 'Password reset email sent successfully',
    });

    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
  });
});
