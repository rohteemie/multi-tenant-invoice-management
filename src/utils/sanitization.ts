/**
 * Input Sanitization Utilities
 * Provides functions to sanitize user input to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by escaping HTML special characters
 * Prevents XSS attacks by converting potentially dangerous characters to HTML entities
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize email input
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  // Remove whitespace and convert to lowercase
  const cleaned = email.trim().toLowerCase();

  // Basic email validation pattern
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
  if (!emailPattern.test(cleaned)) {
    throw new Error('Invalid email format');
  }

  return cleaned;
}

/**
 * Sanitize tenant/user ID
 * Ensures IDs only contain safe characters
 */
export function sanitizeId(id: string): string {
  if (typeof id !== 'string') {
    return '';
  }

  // Only allow alphanumeric characters, hyphens, and underscores
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Sanitize search/filter query
 * Removes potentially dangerous characters from search queries
 */
export function sanitizeQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // First escape HTML to prevent any tag injection
  let sanitized = sanitizeString(query);
  
  // Remove any remaining script-like patterns after HTML escaping
  // This is a defense-in-depth measure
  sanitized = sanitized.replace(/script/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Trim and limit length
  return sanitized.trim().substring(0, 1000);
}

/**
 * Validate and sanitize action filter for audit logs
 * Only allows specific action formats: letters, numbers, underscores, and hyphens
 */
export function sanitizeAction(action: string): string {
  if (typeof action !== 'string') {
    return '';
  }

  // Allow letters, numbers, underscores, and hyphens (common in action names)
  return action.replace(/[^a-zA-Z0-9_-]/g, '').trim();
}

/**
 * Sanitize numeric input
 * Ensures input is a valid number within acceptable range
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number {
  let num: number;

  if (typeof input === 'string') {
    num = parseFloat(input);
  } else {
    num = input;
  }

  if (isNaN(num)) {
    throw new Error('Invalid number');
  }

  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }

  return num;
}

/**
 * Sanitize boolean input
 * Safely converts various inputs to boolean
 */
export function sanitizeBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    const lower = input.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }

  if (typeof input === 'number') {
    return input !== 0;
  }

  return false;
}

/**
 * Validate pagination parameters
 * Ensures skip and limit are within acceptable bounds
 */
export function validatePagination(skip?: number, limit?: number): { skip: number; limit: number } {
  const validSkip = skip !== undefined ? sanitizeNumber(skip, 0) : 0;
  const validLimit = limit !== undefined ? sanitizeNumber(limit, 1, 1000) : 100;

  return {
    skip: validSkip,
    limit: validLimit,
  };
}

/**
 * Generic object sanitizer
 * Recursively sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
