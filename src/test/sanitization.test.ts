import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeId,
  sanitizeQuery,
  sanitizeAction,
  sanitizeNumber,
  sanitizeBoolean,
  validatePagination,
} from '../utils/sanitization';

describe('Sanitization Utilities', () => {
  describe('sanitizeString', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
      expect(sanitizeString(input)).toBe(expected);
    });

    it('should escape ampersands', () => {
      expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(sanitizeString(`He said "Hello"`)).toBe('He said &quot;Hello&quot;');
      expect(sanitizeString("It's nice")).toBe('It&#x27;s nice');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeString(123 as unknown as string)).toBe('');
      expect(sanitizeString(null as unknown as string)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid email addresses', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
    });

    it('should convert email to lowercase', () => {
      expect(sanitizeEmail('Test@EXAMPLE.COM')).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });

    it('should reject invalid email formats', () => {
      expect(() => sanitizeEmail('not-an-email')).toThrow('Invalid email format');
      expect(() => sanitizeEmail('@example.com')).toThrow('Invalid email format');
      expect(() => sanitizeEmail('test@')).toThrow('Invalid email format');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeEmail(123 as unknown as string)).toBe('');
    });
  });

  describe('sanitizeId', () => {
    it('should allow alphanumeric characters, hyphens, and underscores', () => {
      expect(sanitizeId('user-123_abc')).toBe('user-123_abc');
      expect(sanitizeId('TENANT_ID_456')).toBe('TENANT_ID_456');
    });

    it('should remove special characters', () => {
      expect(sanitizeId('user<script>alert("xss")</script>123')).toBe('userscriptalertxssscript123');
      expect(sanitizeId('id@#$%^&*()')).toBe('id');
    });

    it('should handle empty strings', () => {
      expect(sanitizeId('')).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeId(null as unknown as string)).toBe('');
    });
  });

  describe('sanitizeQuery', () => {
    it('should escape HTML and remove script keyword', () => {
      const input = 'search<script>alert("xss")</script>term';
      const result = sanitizeQuery(input);
      // After HTML escaping and script removal
      expect(result).not.toContain('script'); // script keyword removed
      expect(result).not.toContain('<'); // < escaped to &lt;
      expect(result).not.toContain('>'); // > escaped to &gt;
    });

    it('should escape and neutralize event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeQuery(input);
      // After HTML escaping, onclick attribute is escaped and harmless
      expect(result).toContain('&lt;'); // Escaped <
      expect(result).toContain('&gt;'); // Escaped >
    });

    it('should trim whitespace', () => {
      expect(sanitizeQuery('  search term  ')).toBe('search term');
    });

    it('should limit length to 1000 characters', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeQuery(longString).length).toBe(1000);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeQuery(null as unknown as string)).toBe('');
    });
  });

  describe('sanitizeAction', () => {
    it('should allow letters, numbers, underscores, and hyphens', () => {
      expect(sanitizeAction('user_created')).toBe('user_created');
      expect(sanitizeAction('tenant-updated')).toBe('tenant-updated');
      expect(sanitizeAction('INVOICE_DELETED')).toBe('INVOICE_DELETED');
      expect(sanitizeAction('action_v2_123')).toBe('action_v2_123');
    });

    it('should remove special characters but keep numbers', () => {
      expect(sanitizeAction('user_created_123')).toBe('user_created_123');
      expect(sanitizeAction('action@#$%')).toBe('action');
    });

    it('should trim whitespace', () => {
      expect(sanitizeAction('  user_created  ')).toBe('user_created');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeAction(null as unknown as string)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should accept valid numbers', () => {
      expect(sanitizeNumber(42)).toBe(42);
      expect(sanitizeNumber('42')).toBe(42);
      expect(sanitizeNumber(3.14)).toBe(3.14);
      expect(sanitizeNumber('3.14')).toBe(3.14);
    });

    it('should enforce minimum value', () => {
      expect(() => sanitizeNumber(5, 10)).toThrow('Number must be at least 10');
      expect(() => sanitizeNumber(-5, 0)).toThrow('Number must be at least 0');
    });

    it('should enforce maximum value', () => {
      expect(() => sanitizeNumber(15, undefined, 10)).toThrow('Number must be at most 10');
      expect(() => sanitizeNumber(1001, 0, 1000)).toThrow('Number must be at most 1000');
    });

    it('should accept numbers within range', () => {
      expect(sanitizeNumber(50, 0, 100)).toBe(50);
      expect(sanitizeNumber('75', 0, 100)).toBe(75);
    });

    it('should throw error for invalid numbers', () => {
      expect(() => sanitizeNumber('not-a-number')).toThrow('Invalid number');
      expect(() => sanitizeNumber(NaN)).toThrow('Invalid number');
    });
  });

  describe('sanitizeBoolean', () => {
    it('should return boolean values as-is', () => {
      expect(sanitizeBoolean(true)).toBe(true);
      expect(sanitizeBoolean(false)).toBe(false);
    });

    it('should convert truthy strings to true', () => {
      expect(sanitizeBoolean('true')).toBe(true);
      expect(sanitizeBoolean('TRUE')).toBe(true);
      expect(sanitizeBoolean('1')).toBe(true);
      expect(sanitizeBoolean('yes')).toBe(true);
    });

    it('should convert falsy strings to false', () => {
      expect(sanitizeBoolean('false')).toBe(false);
      expect(sanitizeBoolean('0')).toBe(false);
      expect(sanitizeBoolean('no')).toBe(false);
      expect(sanitizeBoolean('')).toBe(false);
    });

    it('should convert numbers correctly', () => {
      expect(sanitizeBoolean(1)).toBe(true);
      expect(sanitizeBoolean(0)).toBe(false);
      expect(sanitizeBoolean(42)).toBe(true);
      expect(sanitizeBoolean(-1)).toBe(true);
    });

    it('should return false for other types', () => {
      expect(sanitizeBoolean(null)).toBe(false);
      expect(sanitizeBoolean(undefined)).toBe(false);
      expect(sanitizeBoolean({})).toBe(false);
    });
  });

  describe('validatePagination', () => {
    it('should return default values when no params provided', () => {
      expect(validatePagination()).toEqual({ skip: 0, limit: 100 });
    });

    it('should accept valid skip and limit', () => {
      expect(validatePagination(10, 50)).toEqual({ skip: 10, limit: 50 });
      expect(validatePagination(0, 100)).toEqual({ skip: 0, limit: 100 });
    });

    it('should enforce minimum skip of 0', () => {
      expect(() => validatePagination(-10, 100)).toThrow('Number must be at least 0');
    });

    it('should enforce minimum limit of 1', () => {
      expect(() => validatePagination(0, 0)).toThrow('Number must be at least 1');
    });

    it('should enforce maximum limit of 1000', () => {
      expect(() => validatePagination(0, 2000)).toThrow('Number must be at most 1000');
    });

    it('should use default limit when not provided', () => {
      expect(validatePagination(10)).toEqual({ skip: 10, limit: 100 });
    });

    it('should use default skip when not provided', () => {
      expect(validatePagination(undefined, 50)).toEqual({ skip: 0, limit: 50 });
    });
  });
});
