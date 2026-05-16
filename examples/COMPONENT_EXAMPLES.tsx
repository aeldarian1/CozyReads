import React from 'react';
import { BookCard } from './BookCard';

/**
 * BookGrid Component - Example Implementation
 * 
 * This component demonstrates:
 * - TypeScript types
 * - Component composition
 * - Responsive grid layout
 * - Error handling
 * - Loading states
 */

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  rating: number;
  genre?: string;
  readingStatus: 'Want to Read' | 'Currently Reading' | 'Finished';
}

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  error?: Error | null;
  onBookClick?: (book: Book) => void;
  onBookUpdate?: (bookId: string, updates: Partial<Book>) => void;
  columns?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Example: A responsive book grid component
 * 
 * Usage:
 * ```tsx
 * <BookGrid 
 *   books={myBooks}
 *   columns={4}
 *   onBookClick={handleBookClick}
 *   onBookUpdate={handleUpdate}
 * />
 * ```
 */
export const BookGrid: React.FC<BookGridProps> = ({
  books,
  isLoading = false,
  error = null,
  onBookClick,
  onBookUpdate,
  columns = 4,
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error loading books</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // Handle empty state
  if (books.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No books found</p>
      </div>
    );
  }

  // Render grid
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
      }}
    >
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onBookClick?.(book)}
          onUpdate={(updates) => onBookUpdate?.(book.id, updates)}
        />
      ))}
    </div>
  );
};

/**
 * Example: Custom hook for managing book grid state
 */
export const useBookGrid = (initialBooks: Book[]) => {
  const [books, setBooks] = React.useState(initialBooks);
  const [filter, setFilter] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'title' | 'rating' | 'date'>('title');

  // Filter books
  const filteredBooks = React.useMemo(() => {
    let result = [...books];

    if (filter) {
      result = result.filter((book) =>
        book.readingStatus === filter ||
        book.genre === filter ||
        book.title.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Sort books
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'date':
          // Assuming dateAdded exists
          return 0;
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [books, filter, sortBy]);

  return {
    books: filteredBooks,
    allBooks: books,
    setBooks,
    filter,
    setFilter,
    sortBy,
    setSortBy,
  };
};

/**
 * Example: Using the hook in a component
 */
export function BookLibrary() {
  const [allBooks, setAllBooks] = React.useState<Book[]>([]);
  const { books, filter, setFilter, sortBy, setSortBy } = useBookGrid(allBooks);

  React.useEffect(() => {
    // Fetch books
    // setAllBooks(fetchedBooks);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filter and Sort Controls */}
      <div className="flex gap-4">
        <select
          value={filter || ''}
          onChange={(e) => setFilter(e.target.value || null)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Books</option>
          <option value="Finished">Finished</option>
          <option value="Currently Reading">Currently Reading</option>
          <option value="Want to Read">Want to Read</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="title">Sort by Title</option>
          <option value="rating">Sort by Rating</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Book Grid */}
      <BookGrid books={books} />
    </div>
  );
}

/**
 * Example: Component documentation with JSDoc
 * 
 * @component BookCard - Displays a single book with interaction options
 * 
 * @example
 * ```tsx
 * <BookCard
 *   book={{
 *     id: '1',
 *     title: 'The Great Gatsby',
 *     author: 'F. Scott Fitzgerald',
 *     rating: 5,
 *     readingStatus: 'Finished'
 *   }}
 *   onClick={() => console.log('Clicked')}
 * />
 * ```
 */
