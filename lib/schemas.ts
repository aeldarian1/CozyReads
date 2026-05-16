import { z } from 'zod';
import { validateISBN } from './validation';

/**
 * Zod validation schemas for all forms and API inputs.
 * Provides type-safe validation with helpful error messages.
 */

// Book validation schema
export const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters')
    .trim(),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(300, 'Author must be less than 300 characters')
    .trim(),
  isbn: z
    .string()
    .optional()
    .refine((isbn) => !isbn || validateISBN(isbn), {
      message: 'Invalid ISBN format. Please enter a valid ISBN-10 or ISBN-13',
    }),
  genre: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  coverUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  readingStatus: z.enum(['Want to Read', 'Currently Reading', 'Finished']),
  rating: z
    .number()
    .min(0, 'Rating must be at least 0')
    .max(5, 'Rating must be at most 5')
    .int('Rating must be a whole number'),
  review: z.string().max(5000, 'Review must be less than 5000 characters').optional(),
  notes: z.string().max(10000, 'Notes must be less than 10000 characters').optional(),
  currentPage: z
    .number()
    .min(0, 'Current page must be at least 0')
    .int('Current page must be a whole number')
    .optional()
    .nullable(),
  totalPages: z
    .number()
    .min(1, 'Total pages must be at least 1')
    .int('Total pages must be a whole number')
    .optional()
    .nullable(),
  series: z.string().max(200).optional().nullable(),
  seriesNumber: z.number().min(1).int().optional().nullable(),
  dateFinished: z.string().optional().nullable(),
})
.refine(
  (data) => {
    if (data.currentPage != null && data.totalPages != null) {
      return data.currentPage <= data.totalPages;
    }
    return true;
  },
  {
    message: 'Current page cannot exceed total pages',
    path: ['currentPage'],
  }
);

export type BookInput = z.infer<typeof bookSchema>;

// Collection validation schema
export const collectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Collection name is required')
    .max(100, 'Collection name must be less than 100 characters')
    .trim(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
  icon: z.string().min(1, 'Icon is required').max(10, 'Icon must be a single emoji'),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

// Quote validation schema
export const quoteSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  text: z
    .string()
    .min(1, 'Quote text is required')
    .max(5000, 'Quote must be less than 5000 characters')
    .trim(),
  pageNumber: z.number().min(1).int().optional().nullable(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional().nullable(),
  isFavorite: z.boolean().default(false),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

// Reading session validation schema
export const readingSessionSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  startPage: z.number().min(1).int().optional().nullable(),
  endPage: z.number().min(1).int().optional().nullable(),
  pagesRead: z.number().min(1).int().optional().nullable(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').int().optional().nullable(),
  sessionDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional().nullable(),
})
.refine(
  (data) => {
    if (data.startPage != null && data.endPage != null) {
      return data.endPage >= data.startPage;
    }
    return true;
  },
  {
    message: 'End page must be greater than or equal to start page',
    path: ['endPage'],
  }
);

export type ReadingSessionInput = z.infer<typeof readingSessionSchema>;

// Reading goal validation schema
export const readingGoalSchema = z.object({
  year: z
    .number()
    .int()
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be before 2100'),
  targetBooks: z.number().min(1, 'Target must be at least 1 book').int(),
  targetPages: z.number().min(1, 'Target must be at least 1 page').int(),
  description: z.string().max(500).optional().nullable(),
});

export type ReadingGoalInput = z.infer<typeof readingGoalSchema>;

// Import validation schema
export const importSchema = z.object({
  source: z.enum(['goodreads-csv', 'csv', 'manual']),
  file: z.instanceof(File).optional(),
  previewOnly: z.boolean().default(false),
});

export type ImportInput = z.infer<typeof importSchema>;

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').int().default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').int().default(50),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Search/Filter validation schema
export const bookFilterSchema = z.object({
  searchQuery: z.string().max(200).optional(),
  statusFilter: z.enum(['Want to Read', 'Currently Reading', 'Finished']).optional(),
  genreFilter: z.string().max(100).optional(),
  collectionFilter: z.string().uuid().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxRating: z.number().min(0).max(5).optional(),
  dateAddedFrom: z.string().optional(),
  dateAddedTo: z.string().optional(),
  sortBy: z.enum(['dateAdded', 'title', 'author', 'rating']).default('dateAdded'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BookFilterInput = z.infer<typeof bookFilterSchema>;

// Bulk operation validation schemas
export const bulkDeleteSchema = z.object({
  bookIds: z.array(z.string().uuid()).min(1, 'At least one book ID is required'),
});

export const bulkUpdateStatusSchema = z.object({
  bookIds: z.array(z.string().uuid()).min(1, 'At least one book ID is required'),
  status: z.enum(['Want to Read', 'Currently Reading', 'Finished']),
});

export const bulkAddToCollectionSchema = z.object({
  bookIds: z.array(z.string().uuid()).min(1, 'At least one book ID is required'),
  collectionIds: z.array(z.string().uuid()).min(1, 'At least one collection ID is required'),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
export type BulkAddToCollectionInput = z.infer<typeof bulkAddToCollectionSchema>;
