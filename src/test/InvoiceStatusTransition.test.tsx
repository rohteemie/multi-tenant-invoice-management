import { describe, it, expect } from 'vitest';
import { InvoiceStatus } from '../types';
import { getValidInvoiceStatusTransitions } from '../utils';

describe('Invoice Status Transitions', () => {
  describe('DRAFT status transitions', () => {
    it('should allow transition from DRAFT to SENT', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.DRAFT);
      expect(validTransitions).toContain(InvoiceStatus.SENT);
      expect(validTransitions).toHaveLength(1);
    });

    it('should NOT allow direct transition from DRAFT to PAID', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.DRAFT);
      expect(validTransitions).not.toContain(InvoiceStatus.PAID);
    });

    it('should NOT allow direct transition from DRAFT to OVERDUE', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.DRAFT);
      expect(validTransitions).not.toContain(InvoiceStatus.OVERDUE);
    });
  });

  describe('SENT status transitions', () => {
    it('should allow transition from SENT to PAID', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.SENT);
      expect(validTransitions).toContain(InvoiceStatus.PAID);
    });

    it('should allow transition from SENT to OVERDUE', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.SENT);
      expect(validTransitions).toContain(InvoiceStatus.OVERDUE);
    });

    it('should NOT allow transition from SENT back to DRAFT', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.SENT);
      expect(validTransitions).not.toContain(InvoiceStatus.DRAFT);
    });

    it('should have exactly 2 valid transitions', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.SENT);
      expect(validTransitions).toHaveLength(2);
    });
  });

  describe('OVERDUE status transitions', () => {
    it('should allow transition from OVERDUE to PAID', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.OVERDUE);
      expect(validTransitions).toContain(InvoiceStatus.PAID);
      expect(validTransitions).toHaveLength(1);
    });

    it('should NOT allow transition from OVERDUE back to SENT', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.OVERDUE);
      expect(validTransitions).not.toContain(InvoiceStatus.SENT);
    });

    it('should NOT allow transition from OVERDUE back to DRAFT', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.OVERDUE);
      expect(validTransitions).not.toContain(InvoiceStatus.DRAFT);
    });
  });

  describe('PAID status transitions', () => {
    it('should NOT allow any transitions from PAID status', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.PAID);
      expect(validTransitions).toHaveLength(0);
    });

    it('should return empty array for PAID status', () => {
      const validTransitions = getValidInvoiceStatusTransitions(InvoiceStatus.PAID);
      expect(validTransitions).toEqual([]);
    });
  });

  describe('Status transition flow validation', () => {
    it('should follow complete lifecycle: DRAFT → SENT → PAID', () => {
      // Start with DRAFT
      let currentStatus: InvoiceStatus = InvoiceStatus.DRAFT;
      let validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // DRAFT should only allow SENT
      expect(validTransitions).toContain(InvoiceStatus.SENT);
      
      // Move to SENT
      currentStatus = InvoiceStatus.SENT;
      validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // SENT should allow PAID
      expect(validTransitions).toContain(InvoiceStatus.PAID);
      
      // Move to PAID
      currentStatus = InvoiceStatus.PAID;
      validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // PAID should allow no transitions
      expect(validTransitions).toHaveLength(0);
    });

    it('should follow overdue lifecycle: DRAFT → SENT → OVERDUE → PAID', () => {
      // Start with DRAFT
      let currentStatus: InvoiceStatus = InvoiceStatus.DRAFT;
      let validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // Move to SENT
      expect(validTransitions).toContain(InvoiceStatus.SENT);
      currentStatus = InvoiceStatus.SENT;
      validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // SENT should allow OVERDUE
      expect(validTransitions).toContain(InvoiceStatus.OVERDUE);
      currentStatus = InvoiceStatus.OVERDUE;
      validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // OVERDUE should allow PAID
      expect(validTransitions).toContain(InvoiceStatus.PAID);
      currentStatus = InvoiceStatus.PAID;
      validTransitions = getValidInvoiceStatusTransitions(currentStatus);
      
      // PAID should allow no transitions
      expect(validTransitions).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle all defined invoice statuses', () => {
      const allStatuses = [
        InvoiceStatus.DRAFT,
        InvoiceStatus.SENT,
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
      ];

      allStatuses.forEach((status) => {
        const transitions = getValidInvoiceStatusTransitions(status);
        expect(Array.isArray(transitions)).toBe(true);
      });
    });

    it('should ensure transitions are valid invoice statuses', () => {
      const allStatuses = [
        InvoiceStatus.DRAFT,
        InvoiceStatus.SENT,
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
      ];

      allStatuses.forEach((status) => {
        const transitions = getValidInvoiceStatusTransitions(status);
        transitions.forEach((transition) => {
          expect(allStatuses).toContain(transition);
        });
      });
    });
  });
});
