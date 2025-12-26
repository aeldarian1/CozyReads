import { Book } from '@/app/page';

interface BookSpineProps {
  book: Book;
  color: string;
  onClick: () => void;
  isHighlighted?: boolean;
}

export function BookSpine({ book, color, onClick, isHighlighted = false }: BookSpineProps) {
  // Calculate spine height based on page count
  const getSpineHeight = () => {
    if (!book.totalPages) return 160; // Default height
    // Formula: height = min(260, max(100, pageCount * 0.3))
    return Math.min(260, Math.max(100, book.totalPages * 0.3));
  };

  const height = getSpineHeight();

  // Lighten or darken color for hover effect
  const getHoverColor = (rgb: string) => {
    // Simple brightness increase
    return rgb.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, (match, r, g, b) => {
      const factor = 1.1;
      return `rgb(${Math.min(255, Math.floor(parseInt(r) * factor))}, ${Math.min(255, Math.floor(parseInt(g) * factor))}, ${Math.min(255, Math.floor(parseInt(b) * factor))})`;
    });
  };

  return (
    <div
      onClick={onClick}
      className="book-spine group relative cursor-pointer transition-all duration-300"
      style={{
        width: '40px',
        height: `${height}px`,
        background: `linear-gradient(to right, ${color}, ${color}dd)`,
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '2px 0 0 2px',
        boxShadow: isHighlighted
          ? '0 0 10px rgba(212, 165, 116, 0.8), inset -2px 0 4px rgba(0, 0, 0, 0.3)'
          : 'inset -2px 0 4px rgba(0, 0, 0, 0.3), inset 2px 0 2px rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}
      title={`${book.title} by ${book.author}`}
    >
      {/* Spine edge effect */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent)',
        }}
      />

      {/* Vertical title text */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden px-1 group-hover:translate-x-1 transition-transform duration-200"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <span
          className="text-xs font-semibold truncate"
          style={{
            color: '#fff',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            maxHeight: `${height - 20}px`,
          }}
        >
          {book.title}
        </span>
      </div>

      {/* Author name at bottom (if space permits) */}
      {height > 140 && (
        <div
          className="absolute bottom-2 left-0 right-0 flex items-center justify-center overflow-hidden px-1"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          <span
            className="text-xs opacity-80 truncate"
            style={{
              color: '#fff',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              maxHeight: '40px',
            }}
          >
            {book.author.split(' ').slice(-1)[0]} {/* Last name only */}
          </span>
        </div>
      )}

      {/* Hover pull-out effect overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent)',
        }}
      />

      {/* Rating indicator (small stars at top) */}
      {book.rating > 0 && height > 120 && (
        <div
          className="absolute top-2 left-0 right-0 flex justify-center gap-0.5"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        >
          {[...Array(book.rating)].map((_, i) => (
            <span
              key={i}
              className="text-xs"
              style={{
                color: '#ffd700',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
