import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserCreatePage } from '../pages/UserCreatePage';
import { useAuthStore } from '../store';
import { UserRole } from '../types';
import type { User } from '../types';

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

// Helper function to mock auth store with user
const mockAuthStore = (user: User | null) => {
  (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ user });
};

// Helper to create a test user
const createTestUser = (role: UserRole): User => ({
  id: '1',
  email: `${role}@test.com`,
  full_name: `Test ${role}`,
  role,
  tenant_id: 'tenant-1',
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('UserCreatePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows access denied for users without permission', () => {
    mockAuthStore(createTestUser(UserRole.MANAGER));

    renderWithRouter(<UserCreatePage />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/You don't have permission to create new users/)).toBeInTheDocument();
  });

  it('shows registration form for owner', () => {
    mockAuthStore(createTestUser(UserRole.OWNER));

    renderWithRouter(<UserCreatePage />);
    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Role/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/ })).toBeInTheDocument();
  });

  it('shows registration form for admin', () => {
    mockAuthStore(createTestUser(UserRole.ADMIN));

    renderWithRouter(<UserCreatePage />);
    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create User/ })).toBeInTheDocument();
  });

  it('includes owner role option only for owner users', () => {
    mockAuthStore(createTestUser(UserRole.OWNER));

    renderWithRouter(<UserCreatePage />);
    const roleSelect = screen.getByLabelText(/^Role/) as HTMLSelectElement;
    const ownerOption = Array.from(roleSelect.options).find(opt => opt.value === UserRole.OWNER);
    expect(ownerOption).toBeDefined();
  });

  it('does not include owner role option for admin users', () => {
    mockAuthStore(createTestUser(UserRole.ADMIN));

    renderWithRouter(<UserCreatePage />);
    const roleSelect = screen.getByLabelText(/^Role/) as HTMLSelectElement;
    const ownerOption = Array.from(roleSelect.options).find(opt => opt.value === UserRole.OWNER);
    expect(ownerOption).toBeUndefined();
  });
});
