import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Enhanced Query Client configuration for optimal performance.
 * Includes:
 * - Aggressive caching with appropriate stale times
 * - Smart retry logic with exponential backoff
 * - Network-aware refetching
 * - Error handling defaults
 */

const queryConfig: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes before considering it stale
    staleTime: 1000 * 60 * 5,

    // Keep unused data in cache for 30 minutes
    gcTime: 1000 * 60 * 30,

    // Don't refetch on window focus (reduces unnecessary API calls)
    refetchOnWindowFocus: false,

    // Don't refetch on component mount if data is still fresh
    refetchOnMount: false,

    // Refetch on network reconnection
    refetchOnReconnect: true,

    // Retry failed queries once with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }

      // Retry server errors up to 2 times
      return failureCount < 2;
    },

    // Exponential backoff delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Network mode: online-first, fallback to cache
    networkMode: 'online',
  },

  mutations: {
    // Retry failed mutations once
    retry: 1,

    // Network mode for mutations
    networkMode: 'online',

    // Default error handler for mutations
    onError: (error) => {
      console.error('Mutation error:', error);
      // You can add toast notifications here if needed
    },
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query keys factory for consistent key management.
 * Helps with cache invalidation and prefetching.
 */
export const queryKeys = {
  books: {
    all: ['books'] as const,
    lists: () => [...queryKeys.books.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.books.lists(), filters] as const,
    details: () => [...queryKeys.books.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
  },

  collections: {
    all: ['collections'] as const,
    lists: () => [...queryKeys.collections.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.collections.lists(), filters] as const,
    details: () => [...queryKeys.collections.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.collections.details(), id] as const,
  },

  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (bookId?: string) => [...queryKeys.quotes.lists(), { bookId }] as const,
  },

  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (year?: number) => [...queryKeys.goals.lists(), { year }] as const,
  },

  statistics: {
    all: ['statistics'] as const,
    overview: () => [...queryKeys.statistics.all, 'overview'] as const,
    byGenre: () => [...queryKeys.statistics.all, 'by-genre'] as const,
    byAuthor: () => [...queryKeys.statistics.all, 'by-author'] as const,
    readingPace: () => [...queryKeys.statistics.all, 'reading-pace'] as const,
  },
};

/**
 * Helper to prefetch data for better UX.
 * Call this on hover or route navigation.
 */
export async function prefetchBooks() {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.books.lists(),
    queryFn: async () => {
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export async function prefetchCollections() {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.collections.lists(),
    queryFn: async () => {
      const response = await fetch('/api/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Helper to invalidate related queries after mutations.
 */
export function invalidateBookQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
}

export function invalidateCollectionQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
}

export function invalidateQuoteQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
}
