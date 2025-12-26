'use client';

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { UserButton } from '@clerk/nextjs';
import { useTheme } from '@/contexts/ThemeContext';
import { BookGrid } from '@/components/BookGrid';
import { BookshelfView } from '@/components/BookshelfView';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { StatsCards } from '@/components/StatsCards';
import { AdvancedSearch, AdvancedFilters } from '@/components/AdvancedSearch';
import { AddBookModal } from '@/components/AddBookModal';
import { ViewBookModal } from '@/components/ViewBookModal';
import { ReadingGoal } from '@/components/ReadingGoal';
import { Analytics } from '@/components/Analytics';
import { QuickEditMenu } from '@/components/QuickEditMenu';
import { CollectionsManager } from '@/components/CollectionsManager';
import { ImportGoodreadsModal } from '@/components/ImportGoodreadsModal';
import { ImportCSVModal } from '@/components/ImportCSVModal';
import { BulkActionsBar } from '@/components/BulkActionsBar';

export type Book = {
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
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string; icon: string; color: string }[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [quickEditMenu, setQuickEditMenu] = useState<{
    book: Book;
    position: { x: number; y: number };
  } | null>(null);

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

  // Load books and collections
  useEffect(() => {
    loadBooks();
    loadCollections();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [books, filters, sortBy]);

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, will be redirected by middleware
          return;
        }
        throw new Error(`Failed to load books: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        console.error('Books data is not an array:', data);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setBooks([]);
    }
  };

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

  const applyFilters = () => {
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

    setFilteredBooks(filtered);
  };

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
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
      loadBooks();
      setIsViewModalOpen(false);
      setQuickEditMenu(null);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleQuickUpdate = async (bookId: string, updates: Partial<Book>) => {
    try {
      await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      loadBooks();
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
    if (!confirm(`Delete ${selectedBookIds.size} selected books?`)) return;

    try {
      await Promise.all(
        Array.from(selectedBookIds).map(bookId =>
          fetch(`/api/books/${bookId}`, { method: 'DELETE' })
        )
      );
      loadBooks();
      deselectAllBooks();
    } catch (error) {
      console.error('Error deleting books:', error);
    }
  };

  const handleBulkAddToCollection = async (collectionId: string) => {
    try {
      await fetch(`/api/collections/${collectionId}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookIds: Array.from(selectedBookIds) }),
      });
      loadBooks();
    } catch (error) {
      console.error('Error adding books to collection:', error);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    try {
      await Promise.all(
        Array.from(selectedBookIds).map(bookId =>
          fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ readingStatus: status }),
          })
        )
      );
      loadBooks();
    } catch (error) {
      console.error('Error changing book status:', error);
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
      book.dateAdded,
      book.dateFinished || '',
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

      loadBooks();
      setIsAddModalOpen(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="relative shadow-2xl backdrop-blur-sm transition-all duration-300" style={{
        background: 'var(--gradient-navbar)',
        boxShadow: '0 8px 32px rgba(74, 63, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        borderBottom: `1px solid var(--border-color)`
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)'
        }} />
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-amber-50 flex items-center gap-1 sm:gap-2 md:gap-3 hover:gap-2 sm:hover:gap-3 md:hover:gap-4 transition-all duration-300" style={{
              fontFamily: 'Playfair Display, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 15px rgba(201, 169, 97, 0.3)',
              letterSpacing: '0.02em'
            }}>
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-11 lg:h-11 text-amber-200 drop-shadow-lg animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                style={{ filter: 'drop-shadow(0 0 8px rgba(201, 169, 97, 0.6))' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="hidden sm:inline">CozyReads</span>
              <span className="inline sm:hidden">Cozy</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={toggleTheme}
                className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-xl shadow-md relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.2) 0%, rgba(212, 165, 116, 0.3) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                <span className="relative z-10 text-lg sm:text-xl md:text-2xl">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
                  }}
                />
              </button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 ring-2 ring-white/30 hover:ring-amber-300/50 transition-all',
                  },
                }}
              />
              <button
                onClick={() => window.location.href = '/recommendations'}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #a08968 0%, #8b6f47 100%)',
                  color: '#fef3e2',
                  boxShadow: '0 6px 20px rgba(160, 137, 104, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">💡</span>
                  <span className="hidden lg:inline">Discover</span>
                  <span className="inline lg:hidden">💡</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
              <button
                onClick={() => window.location.href = '/goals'}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
                  color: '#2d1f15',
                  boxShadow: '0 6px 20px rgba(201, 169, 97, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">🎯</span>
                  <span className="hidden lg:inline">Goals</span>
                  <span className="inline lg:hidden">🎯</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
              <button
                onClick={() => window.location.href = '/series'}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)',
                  color: '#fef3e2',
                  boxShadow: '0 6px 20px rgba(139, 111, 71, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">📚</span>
                  <span className="hidden lg:inline">Series</span>
                  <span className="inline lg:hidden">📚</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
              <button
                onClick={() => window.location.href = '/statistics'}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #5d7052 0%, #6d8a96 100%)',
                  color: '#fef3e2',
                  boxShadow: '0 6px 20px rgba(93, 112, 82, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">📊</span>
                  <span className="hidden lg:inline">Statistics</span>
                  <span className="hidden sm:inline lg:hidden">Stats</span>
                  <span className="inline sm:hidden">📊</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #6b5d4f 0%, #8b6f47 100%)',
                  color: '#fef3e2',
                  boxShadow: '0 6px 20px rgba(107, 93, 79, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">📥</span>
                  <span className="hidden lg:inline">Import from Goodreads</span>
                  <span className="hidden sm:inline lg:hidden">Import</span>
                  <span className="inline sm:hidden">📥</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
              <button
                onClick={() => setIsCSVImportModalOpen(true)}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #5d7052 0%, #6d8a96 100%)',
                  color: '#fef3e2',
                  boxShadow: '0 6px 20px rgba(93, 112, 82, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">📄</span>
                  <span className="hidden lg:inline">Import CSV</span>
                  <span className="hidden sm:inline lg:hidden">CSV</span>
                  <span className="inline sm:hidden">📄</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
              <button
                onClick={handleAddBook}
                className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl shadow-xl relative overflow-hidden group"
                style={{
                  background: 'var(--gradient-accent)',
                  color: theme === 'dark' ? '#1a1816' : '#2d1f15',
                  boxShadow: '0 6px 20px rgba(201, 169, 97, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
                }}
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">📚</span>
                  <span className="hidden md:inline">Add New Book</span>
                  <span className="hidden sm:inline md:hidden">Add Book</span>
                  <span className="inline sm:hidden">Add</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Stats */}
        <StatsCards books={books} />

        {/* Reading Goal */}
        <ReadingGoal books={books} />

        {/* Analytics Dashboard */}
        {books.length > 0 && <Analytics books={books} />}

        {/* Collections Manager */}
        <CollectionsManager />

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
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl flex-wrap" style={{
            background: 'var(--gradient-card)',
            border: '2px solid var(--border-color)'
          }}>
            {/* View Toggle */}
            <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-lg border-2 font-semibold"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
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

        {/* Books Display - Grid or Bookshelf View */}
        {viewMode === 'grid' ? (
          <BookGrid
            books={filteredBooks}
            onBookClick={handleViewBook}
            onBookRightClick={handleBookRightClick}
            selectedBookIds={selectedBookIds}
            onBookSelect={toggleBookSelection}
          />
        ) : (
          <BookshelfView
            books={filteredBooks}
            onBookClick={handleViewBook}
            searchQuery={filters.searchQuery}
          />
        )}
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

      {/* Import from Goodreads Modal */}
      <ImportGoodreadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          loadBooks();
          loadCollections();
        }}
      />

      {/* Import CSV Modal */}
      <ImportCSVModal
        isOpen={isCSVImportModalOpen}
        onClose={() => setIsCSVImportModalOpen(false)}
        onImportComplete={() => {
          loadBooks();
        }}
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
      />
    </div>
  );
}
