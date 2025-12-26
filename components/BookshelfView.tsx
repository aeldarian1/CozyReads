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
      {/* Bookshelf background - enhanced with better depth */}
      <div
        className="min-h-screen rounded-2xl p-8 relative"
        style={{
          background: `
            radial-gradient(ellipse at top, #f8f4ec 0%, #f0ead9 50%, #e8dcc8 100%),
            linear-gradient(135deg, #f5f1e8 0%, #ede8dc 100%)
          `,
          boxShadow: `
            inset 0 3px 15px rgba(0, 0, 0, 0.08),
            inset 0 0 50px rgba(139, 111, 71, 0.03),
            0 5px 20px rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Enhanced wall texture overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(139, 111, 71, 0.08) 2px,
                rgba(139, 111, 71, 0.08) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(139, 111, 71, 0.05) 2px,
                rgba(139, 111, 71, 0.05) 4px
              )
            `,
          }}
        />

        {/* Subtle vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.05) 100%)',
          }}
        />

        {/* Shelves */}
        <div className="relative z-10">
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

        {/* Enhanced info footer */}
        <div className="relative z-10 mt-12 text-center">
          <div
            className="inline-block px-6 py-3 rounded-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(139, 111, 71, 0.2)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
              {books.length} {books.length === 1 ? 'book' : 'books'} • {shelves.length} {shelves.length === 1 ? 'shelf' : 'shelves'}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Click a book spine to view details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
