/**
 * Centralized TypeScript type definitions for the application.
 * Replaces all 'any' types with properly typed interfaces.
 */

export type ReadingStatus = 'Want to Read' | 'Currently Reading' | 'Finished';

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  description: string | null;
  coverUrl: string | null;
  readingStatus: ReadingStatus;
  rating: number;
  review: string | null;
  notes: string | null;
  currentPage: number | null;
  totalPages: number | null;
  series: string | null;
  seriesNumber: number | null;
  dateAdded: Date | string;
  dateFinished: Date | string | null;
  publisher: string | null;
  publishedDate: string | null;
  goodreadsId: string | null;
  externalSource: string | null;
  externalMetadata: any | null;
  importedAt: Date | string | null;
  collections?: BookCollection[];
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BookCollection {
  id: string;
  bookId: string;
  collectionId: string;
  collection: Collection;
}

export interface Quote {
  id: string;
  userId: string;
  bookId: string;
  text: string;
  pageNumber: number | null;
  notes: string | null;
  isFavorite: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  book?: Book;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  startPage: number | null;
  endPage: number | null;
  pagesRead: number | null;
  duration: number | null;
  sessionDate: Date | string;
  notes: string | null;
  book?: Book;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  year: number;
  targetBooks: number;
  targetPages: number;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ImportHistory {
  id: string;
  userId: string;
  source: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  skipCount: number;
  errorCount: number;
  errors: any;
  createdAt: Date | string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// API Response Types

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

export interface BooksApiResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
}

// Form Types

export interface BookFormData {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  description?: string;
  coverUrl?: string;
  readingStatus: ReadingStatus;
  rating: number;
  review?: string;
  notes?: string;
  currentPage?: number;
  totalPages?: number;
  series?: string;
  seriesNumber?: number;
  dateFinished?: string;
}

export interface CollectionFormData {
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface QuoteFormData {
  text: string;
  pageNumber?: number;
  notes?: string;
  isFavorite: boolean;
}

// Filter Types

export interface BookFilters {
  searchQuery: string;
  searchFields: string[];
  statusFilter: string;
  ratingRange: [number, number];
  pageRange: [number, number];
  dateAddedFrom: string;
  dateAddedTo: string;
  dateFinishedFrom: string;
  dateFinishedTo: string;
  genreFilter: string;
  collectionFilter: string;
}

// Import Types

export interface ParsedBook {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  rating: number;
  readingStatus: ReadingStatus;
  review?: string;
  dateAdded: string;
  dateFinished?: string;
  goodreadsId?: string;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  imported: number;
  skipped: number;
  skippedDueToMissingFields: number;
  booksWithoutISBN: number;
  failed: number;
  errors: string[];
  collectionsCreated: string[];
}

// Statistics Types

export interface ReadingStatistics {
  totalBooks: number;
  booksRead: number;
  booksReading: number;
  booksWantToRead: number;
  totalPages: number;
  averageRating: number;
  topGenres: Array<{ genre: string; count: number }>;
  topAuthors: Array<{ author: string; count: number }>;
  booksPerMonth: Array<{ month: string; count: number }>;
}

// Enrichment Types

export interface EnrichedBookData {
  title?: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  description?: string;
  genre?: string;
  pageCount?: number;
  publisher?: string;
  publishedDate?: string;
}

// Modal Types

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export interface AlertDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'loading';
}

// Toast Types

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  duration?: number;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'loading';
}

export interface PromiseToastMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
}

// Undo/Redo Types

export interface UndoableAction {
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
  description: string;
}
