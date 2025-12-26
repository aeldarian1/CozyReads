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
        {/* Books container with better spacing */}
        <div className="flex items-end gap-1.5 px-6 pb-4 overflow-x-auto">
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

        {/* Wooden shelf surface - enhanced */}
        <div
          className="shelf-surface relative"
          style={{
            height: '24px',
            background: `
              linear-gradient(to bottom,
                #9d8b7a 0%,
                #8b7355 20%,
                #7a6551 40%,
                #6d5d4f 60%,
                #5d4e37 80%,
                #4d3e27 100%
              )
            `,
            borderRadius: '3px 3px 0 0',
            boxShadow: `
              0 3px 8px rgba(0, 0, 0, 0.4),
              inset 0 2px 1px rgba(255, 255, 255, 0.15),
              inset 0 -1px 3px rgba(0, 0, 0, 0.3)
            `,
            position: 'relative',
          }}
        >
          {/* Wood grain texture */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 3px,
                  rgba(0, 0, 0, 0.1) 3px,
                  rgba(0, 0, 0, 0.1) 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 30px,
                  rgba(0, 0, 0, 0.05) 30px,
                  rgba(0, 0, 0, 0.05) 32px
                )
              `,
              borderRadius: '3px 3px 0 0',
            }}
          />

          {/* Shelf top edge highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), transparent)',
              borderRadius: '3px 3px 0 0',
            }}
          />

          {/* Shelf front edge (3D effect) - more pronounced */}
          <div
            className="absolute -bottom-2 left-0 right-0 h-3"
            style={{
              background: 'linear-gradient(to bottom, #5d4e37 0%, #4d3e27 50%, #3d2e17 100%)',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              borderRadius: '0 0 2px 2px',
            }}
          />
        </div>

        {/* Enhanced shelf brackets */}
        <div
          className="absolute -left-2 bottom-0"
          style={{
            width: '16px',
            height: '36px',
            background: `
              linear-gradient(135deg,
                #7a6551 0%,
                #6d5d4f 30%,
                #5d4e37 50%,
                #4d3e27 100%
              )
            `,
            borderRadius: '3px',
            boxShadow: `
              0 3px 6px rgba(0, 0, 0, 0.4),
              inset 1px 1px 2px rgba(255, 255, 255, 0.1),
              inset -1px -1px 2px rgba(0, 0, 0, 0.2)
            `,
            border: '1px solid rgba(0, 0, 0, 0.2)',
          }}
        />

        <div
          className="absolute -right-2 bottom-0"
          style={{
            width: '16px',
            height: '36px',
            background: `
              linear-gradient(225deg,
                #7a6551 0%,
                #6d5d4f 30%,
                #5d4e37 50%,
                #4d3e27 100%
              )
            `,
            borderRadius: '3px',
            boxShadow: `
              0 3px 6px rgba(0, 0, 0, 0.4),
              inset 1px 1px 2px rgba(255, 255, 255, 0.1),
              inset -1px -1px 2px rgba(0, 0, 0, 0.2)
            `,
            border: '1px solid rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>
    </div>
  );
}
