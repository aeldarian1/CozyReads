/**
 * Testing utilities and helpers for component and integration tests.
 * Provides common test setup, mocks, and utilities.
 *
 * Usage with Vitest and React Testing Library:
 *
 * @example
 * import { renderWithProviders, screen } from '@/lib/test-utils';
 *
 * test('renders book card', () => {
 *   renderWithProviders(<BookCard book={mockBook} />);
 *   expect(screen.getByText('1984')).toBeInTheDocument();
 * });
 */

import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { DialogProvider } from '@/contexts/DialogContext';

/**
 * Create a test query client with default options.
 * Disables retries and sets short cache times for faster tests.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * Wrapper component that provides all necessary contexts for testing.
 */
export function TestProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <DialogProvider>
            {children}
          </DialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components with all providers.
 * Use this instead of RTL's render in tests.
 *
 * @example
 * const { container } = renderWithProviders(<MyComponent />);
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: {
    queryClient?: QueryClient;
    initialTheme?: 'light' | 'dark';
  }
) {
  // Note: This requires @testing-library/react to be installed
  // You would typically have: import { render } from '@testing-library/react';
  // For now, this is a placeholder structure

  const { queryClient = createTestQueryClient(), initialTheme } = options || {};

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <DialogProvider>
            {children}
          </DialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  // Return structure compatible with RTL render
  return {
    // Would call render(ui, { wrapper: Wrapper, ...renderOptions })
    // Placeholder for actual implementation
    wrapper: Wrapper,
  };
}

/**
 * Mock book data for testing.
 */
export const mockBooks = {
  basic: {
    id: 'book-1',
    userId: 'user-1',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    genre: 'Dystopian',
    description: 'A dystopian social science fiction novel',
    coverUrl: 'https://example.com/1984.jpg',
    readingStatus: 'Finished' as const,
    rating: 5,
    review: 'Masterpiece',
    notes: 'Read in 2024',
    currentPage: null,
    totalPages: 328,
    series: null,
    seriesNumber: null,
    dateAdded: new Date('2024-01-01'),
    dateFinished: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },

  currentlyReading: {
    id: 'book-2',
    userId: 'user-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: null,
    genre: 'Fantasy',
    description: 'A fantasy adventure',
    coverUrl: null,
    readingStatus: 'Currently Reading' as const,
    rating: 0,
    review: null,
    notes: null,
    currentPage: 150,
    totalPages: 310,
    series: 'Middle Earth',
    seriesNumber: 1,
    dateAdded: new Date('2024-02-01'),
    dateFinished: null,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },

  wantToRead: {
    id: 'book-3',
    userId: 'user-1',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441172719',
    genre: 'Science Fiction',
    description: 'Sci-fi epic',
    coverUrl: 'https://example.com/dune.jpg',
    readingStatus: 'Want to Read' as const,
    rating: 0,
    review: null,
    notes: 'Recommended by friend',
    currentPage: null,
    totalPages: 688,
    series: 'Dune',
    seriesNumber: 1,
    dateAdded: new Date('2024-03-01'),
    dateFinished: null,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
};

/**
 * Mock collection data for testing.
 */
export const mockCollections = {
  favorites: {
    id: 'collection-1',
    userId: 'user-1',
    name: 'Favorites',
    description: 'My all-time favorites',
    color: '#ef4444',
    icon: '❤️',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  classics: {
    id: 'collection-2',
    userId: 'user-1',
    name: 'Classics',
    description: 'Classic literature',
    color: '#8b6f47',
    icon: '📚',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
};

/**
 * Mock user data for testing.
 */
export const mockUser = {
  id: 'user-1',
  clerkId: 'clerk-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock fetch responses for API testing.
 */
export const mockFetch = {
  /**
   * Create a mock fetch response.
   */
  response: (data: any, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response);
  },

  /**
   * Mock successful GET /api/books
   */
  getBooks: () => mockFetch.response({
    data: Object.values(mockBooks),
    total: 3,
  }),

  /**
   * Mock successful POST /api/books
   */
  createBook: (book: any) => mockFetch.response({
    success: true,
    data: { id: 'new-book-id', ...book },
  }),

  /**
   * Mock successful DELETE /api/books/:id
   */
  deleteBook: () => mockFetch.response({
    success: true,
    message: 'Book deleted',
  }),

  /**
   * Mock error response
   */
  error: (message: string, status = 500) => mockFetch.response({
    error: message,
  }, status),
};

/**
 * Utility to wait for async operations in tests.
 */
export const wait = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utility to wait for next tick.
 */
export const waitForNextTick = () => wait(0);

/**
 * Mock window.matchMedia for responsive design tests.
 */
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/**
 * Mock IntersectionObserver for lazy loading tests.
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    observe = () => null;
    disconnect = () => null;
    unobserve = () => null;
    takeRecords = () => [];
    root = null;
    rootMargin = '';
    thresholds = [];
  } as any;
}

/**
 * Spy on console methods for testing.
 */
export function spyOnConsole() {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  const errors: any[] = [];
  const warnings: any[] = [];
  const logs: any[] = [];

  console.error = (...args: any[]) => errors.push(args);
  console.warn = (...args: any[]) => warnings.push(args);
  console.log = (...args: any[]) => logs.push(args);

  return {
    errors,
    warnings,
    logs,
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    },
  };
}

/**
 * Helper to test keyboard shortcuts.
 */
export function fireKeyboardEvent(
  key: string,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  } = {}
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });

  document.dispatchEvent(event);
  return event;
}

/**
 * Mock localStorage for tests.
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  const localStorageMock = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
}

/**
 * Assertion helpers for common patterns.
 */
export const assertions = {
  /**
   * Check if an element has accessible name.
   */
  hasAccessibleName: (element: Element, name: string): boolean => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const textContent = element.textContent;

    return !!(
      ariaLabel === name ||
      (ariaLabelledBy && document.getElementById(ariaLabelledBy)?.textContent === name) ||
      textContent === name
    );
  },

  /**
   * Check if element is keyboard focusable.
   */
  isFocusable: (element: Element): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    const isNaturallyFocusable = [
      'A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'
    ].includes(element.tagName);

    return isNaturallyFocusable || (tabIndex !== null && tabIndex !== '-1');
  },
};

/**
 * Re-export commonly used testing library methods.
 * Note: These would come from @testing-library/react in actual implementation.
 */
export { TestProviders as AllTheProviders };
