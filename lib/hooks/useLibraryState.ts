import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Book } from '@/lib/hooks/useBooks';
import { AdvancedFilters } from '@/components/AdvancedSearch';

export interface UseLibraryStateOptions {
  books: Book[];
}

export interface UseLibraryStateReturn {
  // Filter state
  filters: AdvancedFilters;
  setFilters: (filters: AdvancedFilters) => void;

  // Filtered and sorted books
  filteredBooks: Book[];

  // Sort state
  sortBy: string;
  setSortBy: (sortBy: string) => void;

  // Selection state
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  selectedBookIds: Set<string>;
  setSelectedBookIds: (ids: Set<string>) => void;
  toggleBookSelection: (bookId: string) => void;
  selectAllBooks: () => void;
  deselectAllBooks: () => void;

  // View state
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  editingBook: Book | null;
  setEditingBook: (book: Book | null) => void;

  // Quick edit menu
  quickEditMenu: { book: Book; position: { x: number; y: number } } | null;
  setQuickEditMenu: (menu: { book: Book; position: { x: number; y: number } } | null) => void;

  // Modal states
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isViewModalOpen: boolean;
  setIsViewModalOpen: (open: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  isShortcutsHelpOpen: boolean;
  setIsShortcutsHelpOpen: (open: boolean) => void;

  // Loading states
  isBulkDeleting: boolean;
  setIsBulkDeleting: (loading: boolean) => void;
  isBulkUpdating: boolean;
  setIsBulkUpdating: (loading: boolean) => void;

  // Available genres for filters
  availableGenres: string[];

  // Filter counts for quick tabs
  filterCounts: {
    all: number;
    wantToRead: number;
    reading: number;
    finished: number;
  };

  // Stats for dashboard
  currentlyReading: Book[];
  stats: {
    totalBooks: number;
    currentlyReading: number;
    finished: number;
    wantToRead: number;
    averageRating: number;
  };
}

/**
 * Custom hook to manage library state and filtering logic.
 * Centralizes all state management for the library page.
 */
export function useLibraryState({ books }: UseLibraryStateOptions): UseLibraryStateReturn {
  // Filter and sort state
  const [filters, setFilters] = useState<AdvancedFilters>({
    searchQuery: '',
    searchFields: ['title', 'author'],
    statusFilter: '',
    ratingRange: [0, 5],
    pageRange: [0, 2000],
    dateAddedFrom: '',
    dateAddedTo: '',
    dateFinishedFrom: '',
    dateFinishedTo: '',
    genreFilter: '',
    collectionFilter: '',
  });
  const [sortBy, setSortBy] = useState('dateAdded');

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());

  // View state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [quickEditMenu, setQuickEditMenu] = useState<{
    book: Book;
    position: { x: number; y: number };
  } | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Loading states
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(books, {
      keys: filters.searchFields,
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [books, filters.searchFields]);

  // Calculate available genres
  const availableGenres = useMemo(() => {
    const genres = new Set(
      books
        .map((book) => book.genre)
        .filter((genre): genre is string => Boolean(genre))
    );
    return Array.from(genres).sort();
  }, [books]);

  // Apply filters and sorting
  const filteredBooks = useMemo(() => {
    let filtered = [...books];

    // 1. Fuzzy search with Fuse.js
    if (filters.searchQuery && filters.searchQuery.length >= 2) {
      const results = fuse.search(filters.searchQuery);
      const matchedIds = new Set(results.map((r) => r.item.id));
      filtered = filtered.filter((book) => matchedIds.has(book.id));
    }

    // 2. Status filter
    if (filters.statusFilter) {
      filtered = filtered.filter((book) => book.readingStatus === filters.statusFilter);
    }

    // 3. Genre filter
    if (filters.genreFilter) {
      filtered = filtered.filter((book) => book.genre === filters.genreFilter);
    }

    // 4. Collection filter
    if (filters.collectionFilter) {
      filtered = filtered.filter((book) =>
        book.collections?.some(({ collection }) => collection.id === filters.collectionFilter)
      );
    }

    // 5. Rating range filter
    filtered = filtered.filter(
      (book) => book.rating >= filters.ratingRange[0] && book.rating <= filters.ratingRange[1]
    );

    // 6. Page range filter
    if (filters.pageRange[0] > 0 || filters.pageRange[1] < 2000) {
      filtered = filtered.filter((book) => {
        const pages = book.totalPages || 0;
        return pages >= filters.pageRange[0] && pages <= filters.pageRange[1];
      });
    }

    // 7. Date filters
    if (filters.dateAddedFrom) {
      filtered = filtered.filter(
        (book) => new Date(book.dateAdded) >= new Date(filters.dateAddedFrom)
      );
    }
    if (filters.dateAddedTo) {
      filtered = filtered.filter(
        (book) => new Date(book.dateAdded) <= new Date(filters.dateAddedTo)
      );
    }
    if (filters.dateFinishedFrom && filters.dateFinishedFrom !== '') {
      filtered = filtered.filter(
        (book) =>
          book.dateFinished && new Date(book.dateFinished) >= new Date(filters.dateFinishedFrom)
      );
    }
    if (filters.dateFinishedTo && filters.dateFinishedTo !== '') {
      filtered = filtered.filter(
        (book) =>
          book.dateFinished && new Date(book.dateFinished) <= new Date(filters.dateFinishedTo)
      );
    }

    // 8. Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return b.rating - a.rating;
        case 'dateFinished':
          if (!a.dateFinished && !b.dateFinished) return 0;
          if (!a.dateFinished) return 1;
          if (!b.dateFinished) return -1;
          return new Date(b.dateFinished).getTime() - new Date(a.dateFinished).getTime();
        case 'dateAdded':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return filtered;
  }, [books, filters, sortBy, fuse]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    return {
      all: books.length,
      wantToRead: books.filter((book) => book.readingStatus === 'Want to Read').length,
      reading: books.filter((book) => book.readingStatus === 'Currently Reading').length,
      finished: books.filter((book) => book.readingStatus === 'Finished').length,
    };
  }, [books]);

  // Calculate stats
  const currentlyReading = useMemo(() => {
    return books.filter((book) => book.readingStatus === 'Currently Reading');
  }, [books]);

  const stats = useMemo(() => {
    const finished = books.filter((book) => book.readingStatus === 'Finished');
    const totalRating = finished.reduce((sum, book) => sum + book.rating, 0);
    const averageRating = finished.length > 0 ? totalRating / finished.length : 0;

    return {
      totalBooks: books.length,
      currentlyReading: currentlyReading.length,
      finished: finished.length,
      wantToRead: books.filter((book) => book.readingStatus === 'Want to Read').length,
      averageRating,
    };
  }, [books, currentlyReading]);

  // Selection helpers
  const toggleBookSelection = (bookId: string) => {
    const newSelected = new Set(selectedBookIds);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBookIds(newSelected);
  };

  const selectAllBooks = () => {
    setSelectedBookIds(new Set(filteredBooks.map((book) => book.id)));
  };

  const deselectAllBooks = () => {
    setSelectedBookIds(new Set());
  };

  return {
    // Filter state
    filters,
    setFilters,

    // Filtered and sorted books
    filteredBooks,

    // Sort state
    sortBy,
    setSortBy,

    // Selection state
    isSelectionMode,
    setIsSelectionMode,
    selectedBookIds,
    setSelectedBookIds,
    toggleBookSelection,
    selectAllBooks,
    deselectAllBooks,

    // View state
    selectedBook,
    setSelectedBook,
    editingBook,
    setEditingBook,

    // Quick edit menu
    quickEditMenu,
    setQuickEditMenu,

    // Modal states
    isAddModalOpen,
    setIsAddModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,

    // Loading states
    isBulkDeleting,
    setIsBulkDeleting,
    isBulkUpdating,
    setIsBulkUpdating,

    // Available genres
    availableGenres,

    // Filter counts
    filterCounts,

    // Stats
    currentlyReading,
    stats,
  };
}
