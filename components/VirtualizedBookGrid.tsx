'use client';

import { Book } from '@/lib/hooks/useBooks';
import { ModernBookCard } from './ModernBookCard';
import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VirtualizedBookGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onBookUpdate?: (bookId: string, updates: Partial<Book>) => void;
  onAddToCollection?: (bookId: string) => void;
}

export function VirtualizedBookGrid({ books, onBookClick, onBookUpdate, onAddToCollection }: VirtualizedBookGridProps) {
  // Using CSS Grid for responsive layout - performs well for most library sizes
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - (window.innerWidth >= 1024 ? 256 : 0) - 48, // Account for sidebar and padding
        height: window.innerHeight - 200, // Account for header and filters
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (books.length === 0) {
    return (
      <div className="text-center py-20 px-4 rounded-2xl" style={{
        background: 'var(--gradient-card)',
        border: '3px dashed var(--border-color)'
      }}>
        <div className="flex justify-center mb-6">
          <BookOpen className="w-24 h-24" style={{ color: 'var(--warm-brown)' }} strokeWidth={1.5} />
        </div>
        <h3 className="text-3xl font-bold mb-3" style={{
          color: 'var(--text-dark)',
          fontFamily: 'Playfair Display, serif'
        }}>
          Your library awaits...
        </h3>
        <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>
          Start building your cozy collection
        </p>
        <p className="text-sm" style={{ color: 'var(--warm-brown)' }}>
          Click "Add Book" to begin your reading journey
        </p>
      </div>
    );
  }

  // Calculate grid dimensions
  const cardWidth = 280;
  const cardHeight = 450;
  const gap = 24;
  const columnCount = Math.max(1, Math.floor(dimensions.width / (cardWidth + gap)));
  const rowCount = Math.max(1, Math.ceil(books.length / columnCount));

  return (
    <div style={{ width: '100%', height: dimensions.height, overflow: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, ${cardWidth}px)`,
          gap: `${gap}px`,
          padding: `${gap}px`,
          justifyContent: 'center',
        }}
      >
        {books.map((book, index) => (
          <div
            key={book.id}
            style={{
              animation: 'scaleIn 0.4s ease-out forwards',
              animationDelay: `${Math.min(index * 0.05, 2)}s`,
              opacity: 0,
            }}
          >
            <ModernBookCard
              book={book}
              onClick={() => onBookClick(book)}
              onUpdate={(updates) => onBookUpdate?.(book.id, updates)}
              onAddToCollection={onAddToCollection}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
