'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Fuse from 'fuse.js';
import { useTheme } from '@/contexts/ThemeContext';
import { useDialog } from '@/contexts/DialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useBooks, useUpdateBook, useDeleteBook, type Book as BookType } from '@/lib/hooks/useBooks';
import { ModernNavigation } from '@/components/ModernNavigation';
import { ModernDashboard } from '@/components/ModernDashboard';
import { VirtualizedBookGrid } from '@/components/VirtualizedBookGrid';
import { QuickFilterTabs } from '@/components/QuickFilterTabs';
import { BookGrid } from '@/components/BookGrid';
import { BookshelfView } from '@/components/BookshelfView';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { AdvancedSearch, AdvancedFilters } from '@/components/AdvancedSearch';
import { AddBookModal } from '@/components/AddBookModal';
import { QuickEditMenu } from '@/components/QuickEditMenu';
import { ImportGoodreadsModal } from '@/components/ImportGoodreadsModal';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { BulkEnrichment } from '@/components/BulkEnrichment';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { Spinner } from '@/components/ui/Spinner';

// Lazy load heavy modals for better performance
const ViewBookModal = dynamic(() => import('@/components/ViewBookModal').then(mod => ({ default: mod.ViewBookModal })), {
  loading: () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <Spinner size="lg" />
    </div>
  ),
  ssr: false,
});

const AdvancedImportModal = dynamic(() => import('@/components/AdvancedImportModal').then(mod => ({ default: mod.AdvancedImportModal })), {
  loading: () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <Spinner size="lg" />
    </div>
  ),
  ssr: false,
});

// Use the Book type from the hooks file
export type Book = BookType;

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { confirm, alert } = useDialog();
  const toast = useToast();

  // Use React Query hooks for data fetching and mutations
  const { data: booksData, isLoading: isBooksLoading, refetch: refetchBooks } = useBooks({ limit: 1000 });
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();

  // Extract books from the response
  const books = booksData?.data || [];

  // Removed filteredBooks state - now using useMemo below
  const [collections, setCollections] = useState<{ id: string; name: string; icon: string; color: string }[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [quickEditMenu, setQuickEditMenu] = useState<{
    book: Book;
    position: { x: number; y: number };
  } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('cozyreads-view-mode');
    if (savedViewMode === 'grid' || savedViewMode === 'bookshelf') {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode preference to localStorage
  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    localStorage.setItem('cozyreads-view-mode', newView);
  };

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

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(books, {
      keys: filters.searchFields,
      threshold: 0.4, // 0 = exact match, 1 = match anything
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }, [books, filters.searchFields]);

  // Extract available genres
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    books.forEach((book) => {
      if (book.genre) genres.add(book.genre);
    });
    return Array.from(genres).sort();
  }, [books]);

  // Load collections on mount (books are loaded by useBooks hook)
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, will be redirected by middleware
          return;
        }
        throw new Error(`Failed to load collections: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setCollections(data);
      } else {
        console.error('Collections data is not an array:', data);
        setCollections([]);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      setCollections([]);
    }
  };

  // Apply filters with useMemo to prevent infinite loops
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

    // 6. Page count range filter
    filtered = filtered.filter((book) => {
      const pages = book.totalPages || 0;
      return pages >= filters.pageRange[0] && pages <= filters.pageRange[1];
    });

    // 7. Date added range filter
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

    // 8. Date finished range filter
    if (filters.dateFinishedFrom) {
      filtered = filtered.filter(
        (book) => book.dateFinished && new Date(book.dateFinished) >= new Date(filters.dateFinishedFrom)
      );
    }
    if (filters.dateFinishedTo) {
      filtered = filtered.filter(
        (book) => book.dateFinished && new Date(book.dateFinished) <= new Date(filters.dateFinishedTo)
      );
    }

    // 9. Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return b.rating - a.rating; // High to low
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

  const handleAddBook = () => {
    setEditingBook(null);
    setIsAddModalOpen(true);
  };

  const handleViewBook = (book: Book) => {
    setSelectedBook(book);
    setIsViewModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsViewModalOpen(false);
    setIsAddModalOpen(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    const confirmed = await confirm({
      title: 'Delete Book',
      message: 'Are you sure you want to delete this book? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      await deleteBookMutation.mutateAsync(bookId);
      setIsViewModalOpen(false);
      setQuickEditMenu(null);
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleQuickUpdate = async (bookId: string, updates: Partial<Book>) => {
    try {
      await updateBookMutation.mutateAsync({ id: bookId, ...updates });
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  // Selection handlers
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
    const allIds = new Set(filteredBooks.map(book => book.id));
    setSelectedBookIds(allIds);
  };

  const deselectAllBooks = () => {
    setSelectedBookIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedBookIds.size === filteredBooks.length && filteredBooks.length > 0) {
      deselectAllBooks();
    } else {
      selectAllBooks();
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    // Filter out any IDs that don't exist in current books
    const validBookIds = Array.from(selectedBookIds).filter(id =>
      books.some(book => book.id === id)
    );

    if (validBookIds.length === 0) {
      await alert({
        title: 'No Books Selected',
        message: 'No valid books selected for deletion.',
        variant: 'warning',
      });
      deselectAllBooks();
      return;
    }

    const bookWord = validBookIds.length === 1 ? 'book' : 'books';
    const confirmed = await confirm({
      title: 'Delete Books',
      message: `Are you sure you want to delete ${validBookIds.length} ${bookWord}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (!confirmed) return;

    setIsBulkDeleting(true);
    const errors: string[] = [];

    try {
      const deletePromises = validBookIds.map(async (bookId) => {
        try {
          const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || response.statusText);
          }

          return { success: true, bookId };
        } catch (err) {
          errors.push(`Failed to delete book: ${err instanceof Error ? err.message : 'Unknown error'}`);
          return { success: false, bookId };
        }
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;

      // Refetch books after bulk operation
      await refetchBooks();
      deselectAllBooks();
      setIsSelectionMode(false);

      if (errors.length > 0) {
        await alert({
          title: 'Partial Success',
          message: `Deleted ${successCount} of ${validBookIds.length} books.\n\nErrors:\n${errors.join('\n')}`,
          variant: 'warning',
        });
      } else {
        toast.success(`Successfully deleted ${successCount} ${bookWord}`);
      }
    } catch (error) {
      console.error('Error deleting books:', error);
      toast.error(`Failed to delete books: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await refetchBooks();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkAddToCollection = async (collectionId: string) => {
    // Filter out any IDs that don't exist in current books
    const validBookIds = Array.from(selectedBookIds).filter(id =>
      books.some(book => book.id === id)
    );

    if (validBookIds.length === 0) {
      await alert({
        title: 'No Books Selected',
        message: 'No valid books selected for adding to collection.',
        variant: 'warning',
      });
      deselectAllBooks();
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookIds: validBookIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add books to collection');
      }

      await refetchBooks();
      deselectAllBooks();
      setIsSelectionMode(false);
      const bookWord = validBookIds.length === 1 ? 'book' : 'books';
      toast.success(`Successfully added ${validBookIds.length} ${bookWord} to collection`);
    } catch (error) {
      console.error('Error adding books to collection:', error);
      toast.error(`Failed to add books to collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Reload books to sync state with server
      await refetchBooks();
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    // Filter out any IDs that don't exist in current books
    const validBookIds = Array.from(selectedBookIds).filter(id =>
      books.some(book => book.id === id)
    );

    if (validBookIds.length === 0) {
      await alert({
        title: 'No Books Selected',
        message: 'No valid books selected for status change.',
        variant: 'warning',
      });
      deselectAllBooks();
      return;
    }

    setIsBulkUpdating(true);
    const errors: string[] = [];

    try {
      const updatePromises = validBookIds.map(async (bookId) => {
        try {
          const response = await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ readingStatus: status }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || response.statusText);
          }

          return { success: true, bookId };
        } catch (err) {
          errors.push(`Failed to update book: ${err instanceof Error ? err.message : 'Unknown error'}`);
          return { success: false, bookId };
        }
      });

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(r => r.success).length;

      await refetchBooks();
      deselectAllBooks();
      setIsSelectionMode(false);

      if (errors.length > 0) {
        await alert({
          title: 'Partial Success',
          message: `Updated ${successCount} of ${validBookIds.length} books.\n\nErrors:\n${errors.join('\n')}`,
          variant: 'warning',
        });
      } else {
        const bookWord = validBookIds.length === 1 ? 'book' : 'books';
        toast.success(`Successfully updated ${successCount} ${bookWord}`);
      }
    } catch (error) {
      console.error('Error changing book status:', error);
      toast.error(`Failed to change book status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await refetchBooks();
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkExport = () => {
    const selectedBooks = books.filter(book => selectedBookIds.has(book.id));
    const csv = convertBooksToCSV(selectedBooks);
    downloadFile(csv, 'cozyreads-export.csv', 'text/csv');
  };

  const convertBooksToCSV = (books: Book[]) => {
    const headers = ['Title', 'Author', 'ISBN', 'Genre', 'Rating', 'Status', 'Review', 'Date Added', 'Date Finished'];
    const rows = books.map(book => [
      book.title,
      book.author,
      book.isbn || '',
      book.genre || '',
      book.rating,
      book.readingStatus,
      book.review || '',
      book.dateAdded ? new Date(book.dateAdded).toISOString().split('T')[0] : '',
      book.dateFinished ? new Date(book.dateFinished).toISOString().split('T')[0] : '',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBookRightClick = (book: Book, event: React.MouseEvent) => {
    event.preventDefault();
    setQuickEditMenu({
      book,
      position: { x: event.clientX, y: event.clientY },
    });
  };

  const handleSaveBook = async (bookData: any, selectedCollections?: string[]) => {
    try {
      const url = editingBook
        ? `/api/books/${editingBook.id}`
        : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      const savedBook = await response.json();

      // If collections were selected, add the book to those collections
      if (selectedCollections && selectedCollections.length > 0) {
        // First, if editing, remove from all collections
        if (editingBook) {
          const existingCollections = editingBook.collections || [];
          for (const { collection } of existingCollections) {
            await fetch(`/api/collections/${collection.id}/books`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookId: savedBook.id }),
            });
          }
        }

        // Then add to selected collections
        for (const collectionId of selectedCollections) {
          await fetch(`/api/collections/${collectionId}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: savedBook.id }),
          });
        }
      }

      await refetchBooks();
      setIsAddModalOpen(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  // Calculate stats for ModernDashboard
  const currentlyReading = useMemo(() => {
    return books.filter(book => book.readingStatus === 'Currently Reading');
  }, [books]);

  const stats = useMemo(() => {
    const finished = books.filter(b => b.readingStatus === 'Finished');
    const pagesRead = finished.reduce((sum, book) => sum + (book.totalPages || 0), 0);

    // Calculate streak (simplified - counts consecutive days with finished books)
    const finishedDates = finished
      .filter(b => b.dateFinished)
      .map(b => new Date(b.dateFinished!).toDateString())
      .sort();

    let streak = 0;
    const today = new Date().toDateString();
    if (finishedDates.includes(today) || finishedDates.length > 0) {
      streak = finishedDates.length > 0 ? 1 : 0; // Simplified streak calculation
    }

    return {
      totalBooks: books.length,
      booksRead: finished.length,
      pagesRead,
      currentStreak: streak,
    };
  }, [books]);

  // Calculate counts for QuickFilterTabs
  const filterCounts = useMemo(() => ({
    all: books.length,
    wantToRead: books.filter(b => b.readingStatus === 'Want to Read').length,
    currentlyReading: currentlyReading.length,
    finished: books.filter(b => b.readingStatus === 'Finished').length,
  }), [books, currentlyReading]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'a', description: 'Add new book', action: () => setIsAddModalOpen(true) },
    { key: 'i', description: 'Import from Goodreads', action: () => setIsImportModalOpen(true) },
    { key: '?', description: 'Show keyboard shortcuts', action: () => setIsShortcutsHelpOpen(true) },
    { key: 'Escape', description: 'Close modals', action: () => {
      setIsAddModalOpen(false);
      setIsViewModalOpen(false);
      setIsImportModalOpen(false);
      setIsShortcutsHelpOpen(false);
    }},
  ]);

  return (
    <div className="min-h-screen">
      {/* Modern Navigation */}
      <ModernNavigation
        onAddBook={handleAddBook}
        onImport={() => setIsImportModalOpen(true)}
        onShowShortcuts={() => setIsShortcutsHelpOpen(true)}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => {
          setIsSelectionMode(!isSelectionMode);
          if (isSelectionMode) {
            // Exit selection mode - clear selections
            setSelectedBookIds(new Set());
          }
        }}
        selectedCount={selectedBookIds.size}
      />

      {/* Main Content with proper spacing for sidebar on desktop and mobile nav */}
      <div className="lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Modern Dashboard with Stats and Currently Reading */}
          <ModernDashboard
            currentlyReading={currentlyReading}
            stats={stats}
          />

          {/* Bulk Enrichment */}
          <div className="mb-8">
            <BulkEnrichment />
          </div>

          {/* Quick Filter Tabs */}
          <QuickFilterTabs
            currentFilter={filters.statusFilter}
            onFilterChange={(status) => setFilters({ ...filters, statusFilter: status })}
            counts={filterCounts}
          />

        {/* Advanced Search */}
        <AdvancedSearch
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() =>
            setFilters({
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
            })
          }
          availableGenres={availableGenres}
          availableCollections={collections}
        />

        {/* View Toggle and Sort */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl flex-wrap shadow-elevation-2 backdrop-blur-xl" style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border-color)'
          }}>
            {/* View Toggle */}
            <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-black whitespace-nowrap" style={{ color: 'var(--text-dark)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-10 py-3 rounded-xl border-2 font-bold cursor-pointer transition-all duration-300 focus:outline-none focus:shadow-lg hover:border-opacity-80"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)',
                  minWidth: '180px'
                }}
              >
                <option value="dateAdded">📅 Date Added</option>
                <option value="title">🔤 Title</option>
                <option value="author">✍️ Author</option>
                <option value="rating">⭐ Rating</option>
                <option value="dateFinished">✓ Date Finished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Display - Virtualized Grid or Bookshelf View */}
        {viewMode === 'grid' ? (
          <VirtualizedBookGrid
            books={filteredBooks}
            onBookClick={handleViewBook}
            onBookUpdate={handleQuickUpdate}
            onAddToCollection={(bookId) => {
              // TODO: Show collection selection modal (Phase 3.1.1)
              toast.info('Collection selection feature coming soon', 'Feature Not Available');
            }}
            isSelectionMode={isSelectionMode}
            selectedBookIds={selectedBookIds}
            onToggleSelection={toggleBookSelection}
          />
        ) : (
          <BookshelfView
            books={filteredBooks}
            onBookClick={handleViewBook}
            searchQuery={filters.searchQuery}
          />
        )}
        </div>
      </div>

      {/* Modals */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        editingBook={editingBook}
      />

      <ViewBookModal
        isOpen={isViewModalOpen}
        book={selectedBook}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
      />

      {/* Quick Edit Menu */}
      {quickEditMenu && (
        <QuickEditMenu
          book={quickEditMenu.book}
          position={quickEditMenu.position}
          onClose={() => setQuickEditMenu(null)}
          onEdit={(book) => {
            setQuickEditMenu(null);
            handleEditBook(book);
          }}
          onDelete={() => {
            handleDeleteBook(quickEditMenu.book.id);
          }}
          onQuickUpdate={(updates) => handleQuickUpdate(quickEditMenu.book.id, updates)}
        />
      )}

      {/* Advanced Import Modal - Multiple sources with modern UI */}
      <AdvancedImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          refetchBooks();
          loadCollections();
        }}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedBookIds.size}
        totalCount={filteredBooks.length}
        onSelectAll={selectAllBooks}
        onDeselectAll={deselectAllBooks}
        onDelete={handleBulkDelete}
        onAddToCollection={handleBulkAddToCollection}
        onChangeStatus={handleBulkStatusChange}
        onExport={handleBulkExport}
        collections={collections}
        isDeleting={isBulkDeleting}
        isUpdating={isBulkUpdating}
      />
    </div>
  );
}
