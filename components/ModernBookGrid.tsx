import { Book } from '@/lib/hooks/useBooks';
import { ModernBookCard } from './ModernBookCard';
import { BookOpen } from 'lucide-react';

interface ModernBookGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export function ModernBookGrid({ books, onBookClick }: ModernBookGridProps) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <ModernBookCard
          key={book.id}
          book={book}
          onClick={() => onBookClick(book)}
        />
      ))}
    </div>
  );
}
