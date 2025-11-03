import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useUserStore } from '../store/userStore';
import { useTenantStore } from '../store/tenantStore';
import type { InvoiceUpdate, UserUpdate, TenantCreate } from '../types';

// Mock the services
vi.mock('../services', () => ({
  invoiceService: {
    update: vi.fn(),
    delete: vi.fn(),
    updateStatus: vi.fn(),
  },
  userService: {
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tenantService: {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Invoice Store - Update and Delete', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useInvoiceStore());
    act(() => {
      result.current.setError(null);
    });
  });

  it('should update an invoice successfully', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoice = {
      id: '1',
      invoice_number: 'INV-001',
      customer_name: 'Updated Customer',
      tenant_id: 'tenant-1',
      creator_id: 'user-1',
      status: 'draft' as const,
      issue_date: '2024-01-01',
      subtotal: 100,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 100,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    vi.mocked(invoiceService.update).mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoiceStore());

    const updateData: InvoiceUpdate = {
      customer_name: 'Updated Customer',
    };

    await act(async () => {
      await result.current.updateInvoice('1', updateData);
    });

    expect(invoiceService.update).toHaveBeenCalledWith('1', updateData);
    expect(result.current.currentInvoice).toEqual(mockInvoice);
  });

  it('should delete an invoice successfully', async () => {
    const { invoiceService } = await import('../services');
    vi.mocked(invoiceService.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.deleteInvoice('1');
    });

    expect(invoiceService.delete).toHaveBeenCalledWith('1');
  });

  it('should handle update error', async () => {
    const { invoiceService } = await import('../services');
    vi.mocked(invoiceService.update).mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      try {
        await result.current.updateInvoice('1', { customer_name: 'Test' });
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should update invoice status successfully', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoice = {
      id: '1',
      invoice_number: 'INV-001',
      customer_name: 'Test Customer',
      tenant_id: 'tenant-1',
      creator_id: 'user-1',
      updater_id: 'user-2',
      status: 'sent' as const,
      issue_date: '2024-01-01',
      subtotal: 100,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 100,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    vi.mocked(invoiceService.updateStatus).mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.updateInvoiceStatus('1', { status: 'sent' });
    });

    expect(invoiceService.updateStatus).toHaveBeenCalledWith('1', { status: 'sent' });
    expect(result.current.currentInvoice).toEqual(mockInvoice);
    expect(result.current.currentInvoice?.status).toBe('sent');
  });

  it('should update invoice status to paid with payment method', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoice = {
      id: '1',
      invoice_number: 'INV-001',
      customer_name: 'Test Customer',
      tenant_id: 'tenant-1',
      creator_id: 'user-1',
      updater_id: 'user-2',
      status: 'paid' as const,
      issue_date: '2024-01-01',
      subtotal: 100,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 100,
      payment_method: 'Credit Card',
      paid_at: '2024-01-03',
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-03',
    };

    vi.mocked(invoiceService.updateStatus).mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.updateInvoiceStatus('1', { 
        status: 'paid',
        payment_method: 'Credit Card'
      });
    });

    expect(invoiceService.updateStatus).toHaveBeenCalledWith('1', { 
      status: 'paid',
      payment_method: 'Credit Card'
    });
    expect(result.current.currentInvoice).toEqual(mockInvoice);
    expect(result.current.currentInvoice?.status).toBe('paid');
    expect(result.current.currentInvoice?.payment_method).toBe('Credit Card');
  });

  it('should update invoice status from draft to sent', async () => {
    const { invoiceService } = await import('../services');
    const mockInvoice = {
      id: '1',
      invoice_number: 'INV-001',
      customer_name: 'Test Customer',
      tenant_id: 'tenant-1',
      creator_id: 'user-1',
      updater_id: 'user-2',
      status: 'sent' as const,
      issue_date: '2024-01-01',
      subtotal: 100,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 100,
      items: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    vi.mocked(invoiceService.updateStatus).mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoiceStore());

    await act(async () => {
      await result.current.updateInvoiceStatus('1', { status: 'sent' });
    });

    expect(invoiceService.updateStatus).toHaveBeenCalledWith('1', { status: 'sent' });
    expect(result.current.currentInvoice).toEqual(mockInvoice);
    expect(result.current.currentInvoice?.status).toBe('sent');
  });
});

describe('User Store - Update and Delete', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.setError(null);
    });
  });

  it('should update a user successfully', async () => {
    const { userService } = await import('../services');
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      full_name: 'Updated User',
      role: 'manager' as const,
      tenant_id: 'tenant-1',
      is_active: true,
      is_verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    vi.mocked(userService.update).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUserStore());

    const updateData: UserUpdate = {
      full_name: 'Updated User',
      role: 'manager',
    };

    await act(async () => {
      await result.current.updateUser('1', updateData);
    });

    expect(userService.update).toHaveBeenCalledWith('1', updateData);
    expect(result.current.currentUser).toEqual(mockUser);
  });

  it('should delete a user successfully', async () => {
    const { userService } = await import('../services');
    vi.mocked(userService.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.deleteUser('1');
    });

    expect(userService.delete).toHaveBeenCalledWith('1');
  });

  it('should fetch all users', async () => {
    const { userService } = await import('../services');
    const mockUsers = [
      {
        id: '1',
        email: 'user1@example.com',
        full_name: 'User 1',
        role: 'admin' as const,
        tenant_id: 'tenant-1',
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    vi.mocked(userService.getAll).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUserStore());

    await act(async () => {
      await result.current.fetchUsers();
    });

    expect(userService.getAll).toHaveBeenCalled();
    expect(result.current.users).toEqual(mockUsers);
  });
});

describe('Tenant Store - Update and Delete', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTenantStore());
    act(() => {
      result.current.setError(null);
    });
  });

  it('should update a tenant successfully', async () => {
    const { tenantService } = await import('../services');
    const mockTenant = {
      id: '1',
      name: 'Updated Tenant',
      domain: 'updated.com',
      description: 'Updated description',
      plan_type: 'premium',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    vi.mocked(tenantService.update).mockResolvedValue(mockTenant);

    const { result } = renderHook(() => useTenantStore());

    const updateData: Partial<TenantCreate> = {
      name: 'Updated Tenant',
      description: 'Updated description',
    };

    await act(async () => {
      await result.current.updateTenant('1', updateData);
    });

    expect(tenantService.update).toHaveBeenCalledWith('1', updateData);
    expect(result.current.currentTenant).toEqual(mockTenant);
  });

  it('should delete a tenant successfully', async () => {
    const { tenantService } = await import('../services');
    vi.mocked(tenantService.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTenantStore());

    await act(async () => {
      await result.current.deleteTenant('1');
    });

    expect(tenantService.delete).toHaveBeenCalledWith('1');
  });

  it('should fetch a tenant by id', async () => {
    const { tenantService } = await import('../services');
    const mockTenant = {
      id: '1',
      name: 'Test Tenant',
      plan_type: 'free',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    vi.mocked(tenantService.getById).mockResolvedValue(mockTenant);

    const { result } = renderHook(() => useTenantStore());

    await act(async () => {
      await result.current.fetchTenantById('1');
    });

    expect(tenantService.getById).toHaveBeenCalledWith('1');
    expect(result.current.currentTenant).toEqual(mockTenant);
  });

  it('should handle update error', async () => {
    const { tenantService } = await import('../services');
    vi.mocked(tenantService.update).mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useTenantStore());

    await act(async () => {
      try {
        await result.current.updateTenant('1', { name: 'Test' });
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
