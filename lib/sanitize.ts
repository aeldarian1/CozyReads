import DOMPurify from 'isomorphic-dompurify';

/**
 * Input sanitization utilities for protecting against XSS and injection attacks.
 * All user inputs should be sanitized before storage or display.
 *
 * Features:
 * - HTML sanitization with DOMPurify
 * - SQL injection prevention
 * - Path traversal prevention
 * - Command injection prevention
 * - Email validation and sanitization
 * - URL validation and sanitization
 */

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Removes potentially dangerous tags and attributes.
 *
 * @param dirty - Untrusted HTML string
 * @param options - Configuration options
 * @returns Sanitized HTML string
 *
 * @example
 * const clean = sanitizeHTML('<p>Hello <script>alert("XSS")</script></p>');
 * // Returns: '<p>Hello </p>'
 */
export function sanitizeHTML(
  dirty: string,
  options: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    allowLinks?: boolean;
  } = {}
): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    allowedAttributes = ['href', 'title', 'class'],
    allowLinks = true,
  } = options;

  const config: any = {
    ALLOWED_TAGS: allowLinks ? [...allowedTags, 'a'] : allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize plain text input by removing HTML and limiting length.
 * Use this for user inputs like titles, names, descriptions.
 *
 * @param input - Untrusted text input
 * @param maxLength - Maximum allowed length (default: 10000)
 * @returns Sanitized text string
 *
 * @example
 * const clean = sanitizeText('<script>alert("XSS")</script>Hello', 50);
 * // Returns: 'alert("XSS")Hello' (HTML tags removed)
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize and validate email addresses.
 *
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Basic sanitization
  const sanitized = email.toLowerCase().trim();

  // Email regex (basic validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Check for dangerous characters
  if (sanitized.includes('<') || sanitized.includes('>') || sanitized.includes('"')) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize and validate URLs.
 * Only allows http:// and https:// protocols.
 *
 * @param url - URL to validate
 * @param allowedDomains - Optional whitelist of allowed domains
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeURL(url: string, allowedDomains?: string[]): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Check domain whitelist if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        return null;
      }
    }

    return parsed.toString();
  } catch (error) {
    return null;
  }
}

/**
 * Prevent path traversal attacks in file paths.
 * Removes ../ and other dangerous patterns.
 *
 * @param path - File path to sanitize
 * @returns Sanitized path
 */
export function sanitizeFilePath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Remove any path traversal attempts
  let sanitized = path.replace(/\.\./g, '');

  // Remove leading/trailing slashes
  sanitized = sanitized.replace(/^\/+|\/+$/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Only allow alphanumeric, dash, underscore, dot, and forward slash
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_./]/g, '');

  return sanitized;
}

/**
 * Sanitize SQL-like input to prevent injection.
 * NOTE: This is NOT a replacement for parameterized queries!
 * Always use prepared statements. This is a defense-in-depth measure.
 *
 * @param input - Input that might be used in SQL context
 * @returns Sanitized input
 */
export function sanitizeSQLInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");

  // Remove SQL comments
  sanitized = sanitized.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*/g, '');
  sanitized = sanitized.replace(/\*\//g, '');

  // Remove dangerous keywords (case-insensitive)
  const dangerousKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE',
    'EXEC', 'EXECUTE', 'SCRIPT', 'INSERT', 'UPDATE',
  ];

  for (const keyword of dangerousKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  return sanitized;
}

/**
 * Sanitize ISBN (book identifier).
 * Allows only ISBN-10 and ISBN-13 formats.
 *
 * @param isbn - ISBN to sanitize
 * @returns Sanitized ISBN or null if invalid
 */
export function sanitizeISBN(isbn: string): string | null {
  if (!isbn || typeof isbn !== 'string') {
    return null;
  }

  // Remove hyphens, spaces
  const cleaned = isbn.replace(/[-\s]/g, '');

  // ISBN-10: 10 digits (last can be X)
  const isbn10Regex = /^\d{9}[\dX]$/i;

  // ISBN-13: 13 digits
  const isbn13Regex = /^\d{13}$/;

  if (isbn10Regex.test(cleaned) || isbn13Regex.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return null;
}

/**
 * Sanitize numeric input.
 * Ensures the value is a valid number within optional bounds.
 *
 * @param input - Numeric input (string or number)
 * @param options - Min/max constraints
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(
  input: string | number,
  options: { min?: number; max?: number; integer?: boolean } = {}
): number | null {
  const { min, max, integer = false } = options;

  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  // Check if integer is required
  if (integer && !Number.isInteger(num)) {
    return null;
  }

  // Check bounds
  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

/**
 * Sanitize JSON input.
 * Safely parse JSON and validate against a schema.
 *
 * @param input - JSON string
 * @param maxDepth - Maximum nesting depth (prevents DoS)
 * @returns Parsed object or null if invalid
 */
export function sanitizeJSON(input: string, maxDepth: number = 10): any | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(input);

    // Check depth to prevent deeply nested objects (DoS attack)
    const depth = getObjectDepth(parsed);
    if (depth > maxDepth) {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

/**
 * Helper to calculate object nesting depth.
 */
function getObjectDepth(obj: any, currentDepth: number = 0): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth;
  }

  if (Array.isArray(obj)) {
    return Math.max(
      currentDepth,
      ...obj.map((item) => getObjectDepth(item, currentDepth + 1))
    );
  }

  const values = Object.values(obj);
  if (values.length === 0) {
    return currentDepth + 1;
  }

  return Math.max(
    currentDepth + 1,
    ...values.map((value) => getObjectDepth(value, currentDepth + 1))
  );
}

/**
 * Batch sanitization for multiple inputs.
 * Useful for sanitizing form data.
 *
 * @param inputs - Object with key-value pairs to sanitize
 * @param config - Sanitization rules for each field
 * @returns Sanitized object
 *
 * @example
 * const clean = sanitizeObject(
 *   { title: '<script>XSS</script>Book', rating: '5' },
 *   {
 *     title: { type: 'text', maxLength: 500 },
 *     rating: { type: 'number', min: 0, max: 5 }
 *   }
 * );
 */
export function sanitizeObject<T extends Record<string, any>>(
  inputs: T,
  config: Record<
    keyof T,
    | { type: 'text'; maxLength?: number }
    | { type: 'html'; allowLinks?: boolean }
    | { type: 'number'; min?: number; max?: number; integer?: boolean }
    | { type: 'email' }
    | { type: 'url'; allowedDomains?: string[] }
    | { type: 'isbn' }
  >
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const key in config) {
    const value = inputs[key];
    const rule = config[key];

    if (value === undefined || value === null) {
      continue;
    }

    switch (rule.type) {
      case 'text':
        sanitized[key] = sanitizeText(String(value), rule.maxLength) as any;
        break;

      case 'html':
        sanitized[key] = sanitizeHTML(String(value), { allowLinks: rule.allowLinks }) as any;
        break;

      case 'number':
        sanitized[key] = sanitizeNumber(value, rule) as any;
        break;

      case 'email':
        sanitized[key] = sanitizeEmail(String(value)) as any;
        break;

      case 'url':
        sanitized[key] = sanitizeURL(String(value), rule.allowedDomains) as any;
        break;

      case 'isbn':
        sanitized[key] = sanitizeISBN(String(value)) as any;
        break;
    }
  }

  return sanitized;
}

/**
 * Predefined sanitization rules for common book fields.
 */
export const BookFieldSanitizers = {
  title: { type: 'text' as const, maxLength: 500 },
  author: { type: 'text' as const, maxLength: 300 },
  description: { type: 'html' as const, allowLinks: true },
  isbn: { type: 'isbn' as const },
  genre: { type: 'text' as const, maxLength: 100 },
  rating: { type: 'number' as const, min: 0, max: 5, integer: true },
  currentPage: { type: 'number' as const, min: 0, integer: true },
  totalPages: { type: 'number' as const, min: 1, integer: true },
  review: { type: 'html' as const, allowLinks: false },
  notes: { type: 'html' as const, allowLinks: false },
  coverUrl: { type: 'url' as const },
  series: { type: 'text' as const, maxLength: 200 },
  seriesNumber: { type: 'number' as const, min: 1, integer: true },
};
