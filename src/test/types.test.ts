import { describe, it, expect } from 'vitest';
import { InvoiceStatus, UserRole } from '../types';

describe('Type Constants', () => {
  it('InvoiceStatus should have correct values', () => {
    expect(InvoiceStatus.DRAFT).toBe('draft');
    expect(InvoiceStatus.SENT).toBe('sent');
    expect(InvoiceStatus.PAID).toBe('paid');
    expect(InvoiceStatus.OVERDUE).toBe('overdue');
  });

  it('UserRole should have correct values', () => {
    expect(UserRole.OWNER).toBe('owner');
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.MANAGER).toBe('manager');
    expect(UserRole.ATTENDANT).toBe('attendant');
  });
});
