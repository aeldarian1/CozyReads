// ISBN validation utilities

export function validateISBN(isbn: string): {
  valid: boolean;
  type: 'ISBN-10' | 'ISBN-13' | null;
  message: string;
} {
  if (!isbn) {
    return { valid: false, type: null, message: 'ISBN is empty' };
  }

  // Remove hyphens and spaces
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  // Check if it contains only digits (and possibly X for ISBN-10)
  if (!/^[\dX]+$/i.test(cleanIsbn)) {
    return {
      valid: false,
      type: null,
      message: 'ISBN contains invalid characters',
    };
  }

  if (cleanIsbn.length === 10) {
    return validateISBN10(cleanIsbn);
  } else if (cleanIsbn.length === 13) {
    return validateISBN13(cleanIsbn);
  } else {
    return {
      valid: false,
      type: null,
      message: 'ISBN must be 10 or 13 digits',
    };
  }
}

function validateISBN10(isbn: string): {
  valid: boolean;
  type: 'ISBN-10' | 'ISBN-13' | null;
  message: string;
} {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn[i]);
    if (isNaN(digit)) {
      return {
        valid: false,
        type: null,
        message: 'Invalid ISBN-10 format',
      };
    }
    sum += digit * (10 - i);
  }

  // Last digit can be X (represents 10)
  const lastChar = isbn[9].toUpperCase();
  const lastDigit = lastChar === 'X' ? 10 : parseInt(lastChar);

  if (isNaN(lastDigit) && lastChar !== 'X') {
    return {
      valid: false,
      type: null,
      message: 'Invalid ISBN-10 check digit',
    };
  }

  sum += lastDigit;

  if (sum % 11 === 0) {
    return {
      valid: true,
      type: 'ISBN-10',
      message: 'Valid ISBN-10',
    };
  } else {
    return {
      valid: false,
      type: null,
      message: 'Invalid ISBN-10 checksum',
    };
  }
}

function validateISBN13(isbn: string): {
  valid: boolean;
  type: 'ISBN-10' | 'ISBN-13' | null;
  message: string;
} {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i]);
    if (isNaN(digit)) {
      return {
        valid: false,
        type: null,
        message: 'Invalid ISBN-13 format',
      };
    }
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  if (sum % 10 === 0) {
    return {
      valid: true,
      type: 'ISBN-13',
      message: 'Valid ISBN-13',
    };
  } else {
    return {
      valid: false,
      type: null,
      message: 'Invalid ISBN-13 checksum',
    };
  }
}

export function formatISBN(isbn: string): string {
  const clean = isbn.replace(/[-\s]/g, '');

  if (clean.length === 10) {
    // Format as: 1-234-56789-X
    return `${clean.slice(0, 1)}-${clean.slice(1, 4)}-${clean.slice(4, 9)}-${clean.slice(9)}`;
  } else if (clean.length === 13) {
    // Format as: 978-1-234-56789-0
    return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 7)}-${clean.slice(7, 12)}-${clean.slice(12)}`;
  }

  return isbn; // Return as-is if not 10 or 13 digits
}
