import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserCreatePage } from '../pages/UserCreatePage';
import { useAuthStore } from '../store';
import { UserRole } from '../types';

// Mock the auth store
vi.mock('../store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock userService
vi.mock('../services', () => ({
  userService: {
    create: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('UserCreatePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows access denied for users without permission', () => {
    // Mock a manager user (no permission to create users)
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: '1',
        email: 'manager@test.com',
        full_name: 'Test Manager',
        role: UserRole.MANAGER,
        tenant_id: 'tenant-1',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    renderWithRouter(<UserCreatePage />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/You don't have permission to create new users/)).toBeInTheDocument();
  });

  it('shows registration form for owner', () => {
    // Mock an owner user
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: '1',
        email: 'owner@test.com',
        full_name: 'Test Owner',
        role: UserRole.OWNER,
        tenant_id: 'tenant-1',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    renderWithRouter(<UserCreatePage />);
    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Role/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/ })).toBeInTheDocument();
  });

  it('shows registration form for admin', () => {
    // Mock an admin user
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        full_name: 'Test Admin',
        role: UserRole.ADMIN,
        tenant_id: 'tenant-1',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    renderWithRouter(<UserCreatePage />);
    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/ })).toBeInTheDocument();
  });

  it('includes owner role option only for owner users', () => {
    // Mock an owner user
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: '1',
        email: 'owner@test.com',
        full_name: 'Test Owner',
        role: UserRole.OWNER,
        tenant_id: 'tenant-1',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    renderWithRouter(<UserCreatePage />);
    const roleSelect = screen.getByLabelText(/^Role/) as HTMLSelectElement;
    const ownerOption = Array.from(roleSelect.options).find(opt => opt.value === UserRole.OWNER);
    expect(ownerOption).toBeDefined();
  });

  it('does not include owner role option for admin users', () => {
    // Mock an admin user
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        full_name: 'Test Admin',
        role: UserRole.ADMIN,
        tenant_id: 'tenant-1',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    renderWithRouter(<UserCreatePage />);
    const roleSelect = screen.getByLabelText(/^Role/) as HTMLSelectElement;
    const ownerOption = Array.from(roleSelect.options).find(opt => opt.value === UserRole.OWNER);
    expect(ownerOption).toBeUndefined();
  });
});
