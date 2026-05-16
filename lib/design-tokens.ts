/**
 * Design tokens for consistent styling across the application.
 * Centralized color palette, shadows, spacing, and other design values.
 */

export const colors = {
  // Reading status colors
  status: {
    wantToRead: {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#3b82f6',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    reading: {
      bg: 'rgba(234, 179, 8, 0.1)',
      text: '#eab308',
      border: 'rgba(234, 179, 8, 0.3)',
    },
    finished: {
      bg: 'rgba(34, 197, 94, 0.1)',
      text: '#22c55e',
      border: 'rgba(34, 197, 94, 0.3)',
    },
  },

  // Brand colors (from CSS variables)
  brand: {
    cream: '#f5f1e8',
    warmBrown: '#8b6f47',
    darkBrown: '#5d4e37',
    softOrange: '#d4a574',
    paper: '#fdf8f3',
    gold: '#c9a961',
    deepBrown: '#4a3f35',
  },

  // Semantic colors
  semantic: {
    success: { bg: 'rgba(34, 197, 94, 0.1)', text: '#15803d', border: 'rgba(34, 197, 94, 0.3)' },
    warning: { bg: 'rgba(251, 191, 36, 0.1)', text: '#d97706', border: 'rgba(251, 191, 36, 0.3)' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', text: '#b91c1c', border: 'rgba(239, 68, 68, 0.3)' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1e40af', border: 'rgba(59, 130, 246, 0.3)' },
  },
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  elevation2: '0 4px 12px rgba(139, 111, 71, 0.15)',
  elevation3: '0 8px 24px rgba(139, 111, 71, 0.2)',
  elevation4: '0 12px 32px rgba(139, 111, 71, 0.25)',
  elevation5: '0 16px 48px rgba(139, 111, 71, 0.3)',
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const typography = {
  fonts: {
    sans: "'Open Sans', sans-serif",
    serif: "'Playfair Display', serif",
    body: "'Merriweather', serif",
  },
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

/**
 * Helper function to get status color configuration
 */
export function getStatusColor(status: string) {
  const statusMap: Record<string, typeof colors.status.wantToRead> = {
    'Want to Read': colors.status.wantToRead,
    'Currently Reading': colors.status.reading,
    'Finished': colors.status.finished,
  };
  return statusMap[status] || colors.status.wantToRead;
}
