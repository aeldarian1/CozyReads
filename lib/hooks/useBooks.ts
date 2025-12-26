import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  genre?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  readingStatus: string;
  rating: number;
  review?: string | null;
  notes?: string | null;
  currentPage?: number | null;
  totalPages?: number | null;
  series?: string | null;
  seriesNumber?: number | null;
  dateAdded: string;
  dateFinished?: string | null;
  collections?: {
    collection: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
  }[];
}

export interface BooksFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  rating?: number;
  genre?: string;
  collection?: string;
  sortBy?: 'dateAdded' | 'title' | 'author' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface BooksResponse {
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function useBooks(filters: BooksFilters = {}) {
  return useQuery<BooksResponse>({
    queryKey: ['books', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.collection) params.append('collection', filters.collection);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/books?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (book: Partial<Book>) => {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        throw new Error('Failed to create book');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch books
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Book> & { id: string }) => {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update book');
      }

      return response.json();
    },
    onMutate: async (updatedBook) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['books'] });

      // Snapshot previous value
      const previousBooks = queryClient.getQueryData(['books']);

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: ['books'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((book: Book) =>
            book.id === updatedBook.id ? { ...book, ...updatedBook } : book
          ),
        };
      });

      return { previousBooks };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousBooks) {
        queryClient.setQueryData(['books'], context.previousBooks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      return response.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['books'] });
      const previousBooks = queryClient.getQueryData(['books']);

      // Optimistically remove book
      queryClient.setQueriesData({ queryKey: ['books'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((book: Book) => book.id !== deletedId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousBooks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBooks) {
        queryClient.setQueryData(['books'], context.previousBooks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
