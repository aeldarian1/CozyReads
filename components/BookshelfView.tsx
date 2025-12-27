'use client';

import { useEffect, useState } from 'react';
import { Book } from '@/app/page';
import { Shelf } from './Shelf';
import { Virtual3DBookshelf } from './Virtual3DBookshelf';
import { preloadBookColors } from '@/lib/color-extractor';
import { Library, BookOpen, Loader2 } from 'lucide-react';

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

  // Group books into shelves - fit more books per shelf
  const getBooksPerShelf = () => {
    if (typeof window === 'undefined') return 30;
    if (window.innerWidth < 640) return 10; // mobile
    if (window.innerWidth < 1024) return 18; // tablet
    if (window.innerWidth < 1536) return 25; // laptop
    return 30; // desktop - more books!
  };

  const [booksPerShelf, setBooksPerShelf] = useState(getBooksPerShelf());

  // Set correct books per shelf on mount (client-side)
  useEffect(() => {
    setBooksPerShelf(getBooksPerShelf());
  }, []);

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
      <div className="flex items-center justify-center py-32">
        <div className="text-center animate-fadeIn">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: 'var(--gradient-accent)' }} />
            <Loader2 className="w-16 h-16 animate-spin relative" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
            Building your bookshelf...
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Loading book collection
          </p>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-32 px-6 rounded-2xl animate-fadeIn shadow-elevation-2" style={{
        background: 'var(--gradient-card)',
        border: '3px dashed var(--border-color)'
      }}>
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: 'var(--gradient-accent)' }} />
          <Library className="w-24 h-24 relative" style={{ color: 'var(--warm-brown)' }} strokeWidth={1.5} />
        </div>
        <h3 className="text-4xl font-black mb-4" style={{
          color: 'var(--text-dark)',
          fontFamily: 'Playfair Display, serif'
        }}>
          Your Bookshelf Awaits
        </h3>
        <p className="text-lg font-medium mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
          Start building your cozy collection of literary treasures
        </p>
        <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl inline-flex" style={{
          background: 'var(--bg-tertiary)',
          border: '2px solid var(--border-color)'
        }}>
          <BookOpen className="w-5 h-5" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>
            Click "Add Book" to begin your reading journey
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookshelf-view">
      {/* Modern Enhanced Bookshelf Container */}
      <div
        className="rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.4) 0%, rgba(30, 30, 30, 0.6) 100%)',
          border: '1px solid rgba(139, 111, 71, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Ambient lighting for depth */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        {/* Subtle vignette for depth */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.03) 100%)',
          }}
        />

        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl shadow-lg"
              style={{
                background: 'var(--gradient-accent)',
              }}
            >
              <Library className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black" style={{
                color: 'var(--text-dark)',
                fontFamily: 'Playfair Display, serif'
              }}>
                Your Bookshelf
              </h2>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                {books.length} {books.length === 1 ? 'book' : 'books'} across {shelves.length} {shelves.length === 1 ? 'shelf' : 'shelves'}
              </p>
            </div>
          </div>

          {/* Info Badge */}
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm"
            style={{
              background: 'var(--bg-tertiary)',
              border: '2px solid var(--border-color)',
            }}
          >
            <BookOpen className="w-5 h-5" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>
              Click any book to view details
            </span>
          </div>
        </div>

        {/* CSS-based Bookshelf - Much Better! */}
        <div className="relative z-10 space-y-8">
          {shelves.map((shelfBooks, index) => (
            <Shelf
              key={index}
              books={shelfBooks}
              bookColors={bookColors}
              onBookClick={onBookClick}
              highlightedBookIds={highlightedBookIds}
              index={index}
            />
          ))}
        </div>

        {/* Footer Stats */}
        <div
          className="mt-10 pt-8 border-t-2 relative z-10"
          style={{
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div
                className="text-3xl font-black mb-1"
                style={{ color: 'var(--warm-brown)' }}
              >
                {books.length}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                Total Books
              </div>
            </div>
            <div className="w-px h-12" style={{
              background: 'var(--border-color)',
            }} />
            <div className="text-center">
              <div
                className="text-3xl font-black mb-1"
                style={{ color: 'var(--warm-brown)' }}
              >
                {shelves.length}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                Shelves
              </div>
            </div>
            <div className="w-px h-12" style={{
              background: 'var(--border-color)',
            }} />
            <div className="text-center">
              <div
                className="text-3xl font-black mb-1"
                style={{ color: 'var(--warm-brown)' }}
              >
                {highlightedBookIds.size > 0 ? highlightedBookIds.size : books.length}
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                {highlightedBookIds.size > 0 ? 'Matches' : 'Displayed'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
