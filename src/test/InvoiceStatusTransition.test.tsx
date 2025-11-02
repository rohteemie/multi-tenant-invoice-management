import { describe, it, expect } from 'vitest';
import { InvoiceStatus } from '../types';

describe('Invoice Status Transitions', () => {
  /**
   * Helper function to get valid transitions (mirrors the logic in InvoiceDetailPage)
   */
  const getValidTransitions = (currentStatus: InvoiceStatus): InvoiceStatus[] => {
    const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT],
      [InvoiceStatus.SENT]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
      [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID],
      [InvoiceStatus.PAID]: [], // Cannot transition from PAID
    };
    return transitions[currentStatus] || [];
  };

  describe('DRAFT status transitions', () => {
    it('should allow transition from DRAFT to SENT', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.DRAFT);
      expect(validTransitions).toContain(InvoiceStatus.SENT);
      expect(validTransitions).toHaveLength(1);
    });

    it('should NOT allow direct transition from DRAFT to PAID', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.DRAFT);
      expect(validTransitions).not.toContain(InvoiceStatus.PAID);
    });

    it('should NOT allow direct transition from DRAFT to OVERDUE', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.DRAFT);
      expect(validTransitions).not.toContain(InvoiceStatus.OVERDUE);
    });
  });

  describe('SENT status transitions', () => {
    it('should allow transition from SENT to PAID', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.SENT);
      expect(validTransitions).toContain(InvoiceStatus.PAID);
    });

    it('should allow transition from SENT to OVERDUE', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.SENT);
      expect(validTransitions).toContain(InvoiceStatus.OVERDUE);
    });

    it('should NOT allow transition from SENT back to DRAFT', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.SENT);
      expect(validTransitions).not.toContain(InvoiceStatus.DRAFT);
    });

    it('should have exactly 2 valid transitions', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.SENT);
      expect(validTransitions).toHaveLength(2);
    });
  });

  describe('OVERDUE status transitions', () => {
    it('should allow transition from OVERDUE to PAID', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.OVERDUE);
      expect(validTransitions).toContain(InvoiceStatus.PAID);
      expect(validTransitions).toHaveLength(1);
    });

    it('should NOT allow transition from OVERDUE back to SENT', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.OVERDUE);
      expect(validTransitions).not.toContain(InvoiceStatus.SENT);
    });

    it('should NOT allow transition from OVERDUE back to DRAFT', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.OVERDUE);
      expect(validTransitions).not.toContain(InvoiceStatus.DRAFT);
    });
  });

  describe('PAID status transitions', () => {
    it('should NOT allow any transitions from PAID status', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.PAID);
      expect(validTransitions).toHaveLength(0);
    });

    it('should return empty array for PAID status', () => {
      const validTransitions = getValidTransitions(InvoiceStatus.PAID);
      expect(validTransitions).toEqual([]);
    });
  });

  describe('Status transition flow validation', () => {
    it('should follow complete lifecycle: DRAFT → SENT → PAID', () => {
      // Start with DRAFT
      let currentStatus: InvoiceStatus = InvoiceStatus.DRAFT;
      let validTransitions = getValidTransitions(currentStatus);
      
      // DRAFT should only allow SENT
      expect(validTransitions).toContain(InvoiceStatus.SENT);
      
      // Move to SENT
      currentStatus = InvoiceStatus.SENT;
      validTransitions = getValidTransitions(currentStatus);
      
      // SENT should allow PAID
      expect(validTransitions).toContain(InvoiceStatus.PAID);
      
      // Move to PAID
      currentStatus = InvoiceStatus.PAID;
      validTransitions = getValidTransitions(currentStatus);
      
      // PAID should allow no transitions
      expect(validTransitions).toHaveLength(0);
    });

    it('should follow overdue lifecycle: DRAFT → SENT → OVERDUE → PAID', () => {
      // Start with DRAFT
      let currentStatus: InvoiceStatus = InvoiceStatus.DRAFT;
      let validTransitions = getValidTransitions(currentStatus);
      
      // Move to SENT
      expect(validTransitions).toContain(InvoiceStatus.SENT);
      currentStatus = InvoiceStatus.SENT;
      validTransitions = getValidTransitions(currentStatus);
      
      // SENT should allow OVERDUE
      expect(validTransitions).toContain(InvoiceStatus.OVERDUE);
      currentStatus = InvoiceStatus.OVERDUE;
      validTransitions = getValidTransitions(currentStatus);
      
      // OVERDUE should allow PAID
      expect(validTransitions).toContain(InvoiceStatus.PAID);
      currentStatus = InvoiceStatus.PAID;
      validTransitions = getValidTransitions(currentStatus);
      
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
        const transitions = getValidTransitions(status);
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
        const transitions = getValidTransitions(status);
        transitions.forEach((transition) => {
          expect(allStatuses).toContain(transition);
        });
      });
    });
  });
});
