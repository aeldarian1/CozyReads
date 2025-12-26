import { Book } from '@/app/page';
import { BookSpine } from './BookSpine';

interface ShelfProps {
  books: Book[];
  bookColors: Map<string, string>;
  onBookClick: (book: Book) => void;
  label?: string;
  highlightedBookIds?: Set<string>;
}

export function Shelf({ books, bookColors, onBookClick, label, highlightedBookIds }: ShelfProps) {
  return (
    <div className="shelf-container mb-8">
      {/* Shelf Label */}
      {label && (
        <div className="mb-2 px-4">
          <span
            className="text-sm font-bold"
            style={{
              color: 'var(--text-dark)',
              fontFamily: 'Merriweather, serif',
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Shelf with books */}
      <div className="shelf relative">
        {/* Books container */}
        <div className="flex items-end gap-1 px-4 pb-3 overflow-x-auto">
          {books.map((book) => (
            <BookSpine
              key={book.id}
              book={book}
              color={bookColors.get(book.id) || '#8b6f47'}
              onClick={() => onBookClick(book)}
              isHighlighted={highlightedBookIds?.has(book.id)}
            />
          ))}
        </div>

        {/* Wooden shelf surface */}
        <div
          className="shelf-surface"
          style={{
            height: '20px',
            background: 'linear-gradient(to bottom, #8b7355 0%, #6d5d4f 50%, #5d4e37 100%)',
            borderRadius: '2px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
          }}
        >
          {/* Shelf edge highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
            }}
          />

          {/* Shelf front edge (3D effect) */}
          <div
            className="absolute -bottom-1 left-0 right-0 h-2"
            style={{
              background: 'linear-gradient(to bottom, #5d4e37, #4d3e27)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
          />
        </div>

        {/* Shelf bracket (left) */}
        <div
          className="absolute -left-2 bottom-0"
          style={{
            width: '12px',
            height: '30px',
            background: 'linear-gradient(to right, #6d5d4f, #5d4e37)',
            borderRadius: '2px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Shelf bracket (right) */}
        <div
          className="absolute -right-2 bottom-0"
          style={{
            width: '12px',
            height: '30px',
            background: 'linear-gradient(to right, #5d4e37, #6d5d4f)',
            borderRadius: '2px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>
    </div>
  );
}
