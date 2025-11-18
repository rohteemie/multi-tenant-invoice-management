import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { authService } from '../services';

vi.mock('../services', () => ({
  authService: {
    resetPassword: vi.fn(),
  },
}));

const renderWithRouterAndToken = (token: string = 'valid-token') => {
  const url = token ? `/?token=${token}` : '/';
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ResetPasswordPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the reset password form', () => {
    renderWithRouterAndToken();

    expect(screen.getByText('Set new password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset password/i })).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /Reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('should show error when password is too short', async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /Reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('should show error when token is missing', async () => {
    renderWithRouterAndToken('');

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /Reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'validPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'validPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid or missing reset token/i)).toBeInTheDocument();
    });

    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValueOnce({
      message: 'Password reset successfully',
    });

    renderWithRouterAndToken('valid-token');

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /Reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: 'valid-token',
        new_password: 'newPassword123',
      });
    });
  });

  it('should show success message after successful password reset', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValueOnce({
      message: 'Password reset successfully',
    });

    renderWithRouterAndToken('valid-token');

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /Reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
      expect(screen.getByText(/Your password has been successfully reset/i)).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValueOnce(
      new Error('Invalid or expired token')
    );

    renderWithRouterAndToken('invalid-token');

    const passwordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /Reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired token/i)).toBeInTheDocument();
    });
  });
});
