/**
 * Accessibility utilities for creating inclusive user experiences.
 * Provides helpers for ARIA attributes, keyboard navigation, and screen readers.
 */

/**
 * Generate a unique ID for ARIA attributes.
 * Ensures consistent and unique IDs across the application.
 *
 * @param prefix - Prefix for the ID (e.g., 'dialog', 'menu')
 * @returns Unique ID string
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Visually hidden but accessible to screen readers.
 * Use this for screen reader-only text.
 */
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0,
};

/**
 * ARIA attributes for common patterns.
 */
export const ariaPatterns = {
  /**
   * Combobox (searchable dropdown) pattern.
   */
  combobox: (options: {
    expanded: boolean;
    hasPopup?: boolean;
    controls?: string;
    activeDescendant?: string;
  }) => ({
    role: 'combobox',
    'aria-expanded': options.expanded,
    'aria-haspopup': options.hasPopup !== false ? 'listbox' : undefined,
    'aria-controls': options.controls,
    'aria-activedescendant': options.activeDescendant,
  }),

  /**
   * Menu/Navigation pattern.
   */
  menu: (options: { label: string; orientation?: 'horizontal' | 'vertical' }) => ({
    role: 'menu',
    'aria-label': options.label,
    'aria-orientation': options.orientation || 'vertical',
  }),

  menuItem: (options: { disabled?: boolean }) => ({
    role: 'menuitem',
    'aria-disabled': options.disabled || undefined,
  }),

  /**
   * Dialog/Modal pattern.
   */
  dialog: (options: { labelledBy?: string; describedBy?: string; modal?: boolean }) => ({
    role: 'dialog',
    'aria-modal': options.modal !== false,
    'aria-labelledby': options.labelledBy,
    'aria-describedby': options.describedBy,
  }),

  /**
   * Tab pattern.
   */
  tabList: (options: { label: string; orientation?: 'horizontal' | 'vertical' }) => ({
    role: 'tablist',
    'aria-label': options.label,
    'aria-orientation': options.orientation || 'horizontal',
  }),

  tab: (options: { selected: boolean; controls: string }) => ({
    role: 'tab',
    'aria-selected': options.selected,
    'aria-controls': options.controls,
    tabIndex: options.selected ? 0 : -1,
  }),

  tabPanel: (options: { labelledBy: string; hidden?: boolean }) => ({
    role: 'tabpanel',
    'aria-labelledby': options.labelledBy,
    hidden: options.hidden,
  }),

  /**
   * Grid pattern (for book grids).
   */
  grid: (options: { label: string; rowCount?: number; colCount?: number }) => ({
    role: 'grid',
    'aria-label': options.label,
    'aria-rowcount': options.rowCount,
    'aria-colcount': options.colCount,
  }),

  gridCell: (options: { rowIndex: number; colIndex: number }) => ({
    role: 'gridcell',
    'aria-rowindex': options.rowIndex,
    'aria-colindex': options.colIndex,
  }),

  /**
   * Button pattern.
   */
  button: (options: {
    label?: string;
    pressed?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    hasPopup?: boolean;
  }) => ({
    role: 'button',
    'aria-label': options.label,
    'aria-pressed': options.pressed,
    'aria-expanded': options.expanded,
    'aria-disabled': options.disabled,
    'aria-haspopup': options.hasPopup,
    tabIndex: options.disabled ? -1 : 0,
  }),

  /**
   * Checkbox pattern.
   */
  checkbox: (options: { label: string; checked: boolean; disabled?: boolean }) => ({
    role: 'checkbox',
    'aria-label': options.label,
    'aria-checked': options.checked,
    'aria-disabled': options.disabled,
    tabIndex: options.disabled ? -1 : 0,
  }),

  /**
   * Progress bar pattern.
   */
  progressBar: (options: { label: string; value: number; max?: number; min?: number }) => ({
    role: 'progressbar',
    'aria-label': options.label,
    'aria-valuenow': options.value,
    'aria-valuemin': options.min || 0,
    'aria-valuemax': options.max || 100,
    'aria-valuetext': `${options.value} of ${options.max || 100}`,
  }),

  /**
   * Alert pattern.
   */
  alert: (options: { live?: 'polite' | 'assertive' }) => ({
    role: 'alert',
    'aria-live': options.live || 'assertive',
    'aria-atomic': true,
  }),

  /**
   * Status pattern.
   */
  status: () => ({
    role: 'status',
    'aria-live': 'polite' as const,
    'aria-atomic': true,
  }),
};

/**
 * Keyboard event helpers.
 */
export const keyboard = {
  /**
   * Check if Enter or Space was pressed (for button-like elements).
   */
  isActivationKey: (e: React.KeyboardEvent): boolean => {
    return e.key === 'Enter' || e.key === ' ';
  },

  /**
   * Check if an arrow key was pressed.
   */
  isArrowKey: (e: React.KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
  },

  /**
   * Handle arrow navigation in a list/grid.
   */
  handleArrowNavigation: (
    e: React.KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    options: {
      orientation?: 'vertical' | 'horizontal' | 'grid';
      columns?: number; // For grid layout
      wrap?: boolean;
    } = {}
  ): number => {
    const { orientation = 'vertical', columns = 1, wrap = false } = options;
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (e.key === 'ArrowDown') {
        newIndex = currentIndex + 1;
      } else if (e.key === 'ArrowUp') {
        newIndex = currentIndex - 1;
      }
    } else if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        newIndex = currentIndex + 1;
      } else if (e.key === 'ArrowLeft') {
        newIndex = currentIndex - 1;
      }
    } else if (orientation === 'grid') {
      switch (e.key) {
        case 'ArrowDown':
          newIndex = currentIndex + columns;
          break;
        case 'ArrowUp':
          newIndex = currentIndex - columns;
          break;
        case 'ArrowRight':
          newIndex = currentIndex + 1;
          break;
        case 'ArrowLeft':
          newIndex = currentIndex - 1;
          break;
      }
    }

    // Handle Home/End keys
    if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = totalItems - 1;
    }

    // Wrap or clamp
    if (wrap) {
      newIndex = (newIndex + totalItems) % totalItems;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, totalItems - 1));
    }

    return newIndex;
  },
};

/**
 * Semantic HTML helpers.
 */
export const semanticHTML = {
  /**
   * Create a semantic heading with proper level.
   */
  heading: (level: 1 | 2 | 3 | 4 | 5 | 6, text: string) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return { Tag, text };
  },

  /**
   * Get the next heading level (for nested sections).
   */
  nextHeadingLevel: (currentLevel: number): 1 | 2 | 3 | 4 | 5 | 6 => {
    return Math.min(currentLevel + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
  },
};

/**
 * Focus management helpers.
 */
export const focus = {
  /**
   * Focus an element and scroll it into view.
   */
  focusAndScroll: (element: HTMLElement | null) => {
    if (!element) return;

    element.focus();
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  },

  /**
   * Get all focusable elements within a container.
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)).filter((el) => {
      const element = el as HTMLElement;
      return (
        element.offsetParent !== null &&
        !element.hasAttribute('aria-hidden') &&
        getComputedStyle(element).visibility !== 'hidden'
      );
    }) as HTMLElement[];
  },

  /**
   * Save and restore focus (useful for modals).
   */
  createFocusManager: () => {
    let previousFocus: HTMLElement | null = null;

    return {
      save: () => {
        previousFocus = document.activeElement as HTMLElement;
      },
      restore: () => {
        previousFocus?.focus();
        previousFocus = null;
      },
    };
  },
};

/**
 * Get human-readable text for screen readers.
 */
export const screenReaderText = {
  /**
   * Format a date for screen readers.
   */
  date: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format a number for screen readers (e.g., "3 of 10").
   */
  count: (current: number, total: number): string => {
    return `${current} of ${total}`;
  },

  /**
   * Format a percentage for screen readers.
   */
  percentage: (value: number): string => {
    return `${Math.round(value)} percent`;
  },

  /**
   * Create a descriptive label for a book.
   */
  bookLabel: (title: string, author: string): string => {
    return `${title} by ${author}`;
  },

  /**
   * Create a descriptive label for a reading status.
   */
  readingStatus: (status: string, current?: number, total?: number): string => {
    if (status === 'Currently Reading' && current && total) {
      return `${status}, page ${current} of ${total}`;
    }
    return status;
  },
};
