'use client';

import { useEffect, useState } from 'react';
import { Book } from '@/app/page';
import { Shelf } from './Shelf';
import { preloadBookColors } from '@/lib/color-extractor';

interface BookshelfViewProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  searchQuery?: string;
}

export function BookshelfView({ books, onBookClick, searchQuery }: BookshelfViewProps) {
  const [bookColors, setBookColors] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Preload colors for all books
  useEffect(() => {
    const loadColors = async () => {
      setIsLoading(true);
      const colors = await preloadBookColors(books);
      setBookColors(colors);
      setIsLoading(false);
    };

    loadColors();
  }, [books]);

  // Group books into shelves (15 books per shelf on desktop)
  const getBooksPerShelf = () => {
    if (typeof window === 'undefined') return 15;
    if (window.innerWidth < 640) return 6; // mobile
    if (window.innerWidth < 1024) return 10; // tablet
    return 15; // desktop
  };

  const [booksPerShelf, setBooksPerShelf] = useState(getBooksPerShelf());

  // Update books per shelf on window resize
  useEffect(() => {
    const handleResize = () => {
      setBooksPerShelf(getBooksPerShelf());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create shelves by grouping books
  const shelves = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  // Highlight books matching search query
  const highlightedBookIds = new Set<string>();
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    books.forEach((book) => {
      if (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      ) {
        highlightedBookIds.add(book.id);
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Building your bookshelf...
          </p>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-20 px-4 rounded-2xl" style={{
        background: 'linear-gradient(135deg, #fdf8f3 0%, #f5f1e8 100%)',
        border: '3px dashed rgba(139, 111, 71, 0.3)'
      }}>
        <div className="text-8xl mb-6">📚</div>
        <h3 className="text-3xl font-bold mb-3" style={{
          color: '#5d4e37',
          fontFamily: 'Merriweather, serif'
        }}>
          Your bookshelf awaits...
        </h3>
        <p className="text-lg mb-4" style={{ color: '#6d4c41' }}>
          Start building your cozy collection
        </p>
        <p className="text-sm" style={{ color: '#8b6f47' }}>
          Click "📚 Add New Book" above to begin your reading journey
        </p>
      </div>
    );
  }

  return (
    <div className="bookshelf-view">
      {/* Bookshelf background */}
      <div
        className="min-h-screen rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #f5f1e8 0%, #ede8dc 100%)',
          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Wall texture overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 111, 71, 0.1) 2px, rgba(139, 111, 71, 0.1) 4px)',
          }}
        />

        {/* Shelves */}
        <div className="relative">
          {shelves.map((shelfBooks, index) => (
            <Shelf
              key={index}
              books={shelfBooks}
              bookColors={bookColors}
              onBookClick={onBookClick}
              highlightedBookIds={highlightedBookIds}
            />
          ))}
        </div>

        {/* Info footer */}
        <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>
            {books.length} {books.length === 1 ? 'book' : 'books'} • {shelves.length} {shelves.length === 1 ? 'shelf' : 'shelves'}
          </p>
          <p className="mt-1 text-xs">
            Click a book spine to view details
          </p>
        </div>
      </div>
    </div>
  );
}
