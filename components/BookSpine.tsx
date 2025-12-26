import { Book } from '@/app/page';

interface BookSpineProps {
  book: Book;
  color: string;
  onClick: () => void;
  isHighlighted?: boolean;
}

export function BookSpine({ book, color, onClick, isHighlighted = false }: BookSpineProps) {
  // Calculate spine height based on page count with more variation
  const getSpineHeight = () => {
    if (!book.totalPages) return 180; // Default height
    // Formula: more dramatic height variation
    return Math.min(280, Math.max(120, book.totalPages * 0.35));
  };

  const height = getSpineHeight();
  const width = 50; // Wider spines for better readability

  // Check if color is dark or light for better text contrast
  const isColorDark = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const textColor = isColorDark(color) ? '#ffffff' : '#2d2d2d';
  const isDark = isColorDark(color);

  return (
    <div
      onClick={onClick}
      className="book-spine group relative cursor-pointer transition-all duration-300 hover:-translate-x-1 hover:z-20"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: `linear-gradient(to right, ${color}f0, ${color}dd, ${color}cc)`,
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`,
        borderRadius: '3px 0 0 3px',
        boxShadow: isHighlighted
          ? '0 0 15px rgba(212, 165, 116, 0.9), inset -3px 0 6px rgba(0, 0, 0, 0.4), inset 2px 0 3px rgba(255, 255, 255, 0.15), 2px 2px 8px rgba(0, 0, 0, 0.3)'
          : 'inset -3px 0 6px rgba(0, 0, 0, 0.4), inset 2px 0 3px rgba(255, 255, 255, 0.15), 2px 2px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
      }}
      title={`${book.title} by ${book.author}${book.rating > 0 ? ` • ${'★'.repeat(book.rating)}` : ''}`}
    >
      {/* Spine left edge highlight */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: `linear-gradient(to right, ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.4)'}, transparent)`,
          borderRadius: '3px 0 0 3px',
        }}
      />

      {/* Decorative spine lines (top and bottom) */}
      <div
        className="absolute left-1 right-1 top-2 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}, transparent)`,
        }}
      />
      <div
        className="absolute left-1 right-1 bottom-2 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}, transparent)`,
        }}
      />

      {/* Vertical title text - larger and more readable */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden px-2"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <span
            className="font-bold tracking-wide"
            style={{
              color: textColor,
              fontSize: '14px',
              textShadow: isDark
                ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.5)'
                : '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 1px rgba(0, 0, 0, 0.3)',
              maxHeight: `${height - 60}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
            }}
          >
            {book.title.toUpperCase()}
          </span>

          {/* Author name - always show if there's space */}
          {height > 140 && (
            <span
              className="font-medium opacity-90"
              style={{
                color: textColor,
                fontSize: '11px',
                textShadow: isDark
                  ? '0 1px 2px rgba(0, 0, 0, 0.6)'
                  : '0 1px 1px rgba(255, 255, 255, 0.6)',
                maxHeight: '50px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {book.author}
            </span>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-l-sm"
        style={{
          background: `linear-gradient(to right, ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)'}, transparent)`,
        }}
      />

      {/* Rating stars - positioned at top */}
      {book.rating > 0 && height > 100 && (
        <div
          className="absolute top-3 left-0 right-0 flex justify-center items-center gap-0.5 px-1"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        >
          {[...Array(book.rating)].map((_, i) => (
            <span
              key={i}
              style={{
                color: '#ffd700',
                fontSize: '10px',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.5)',
                filter: 'drop-shadow(0 0 1px rgba(255, 215, 0, 0.5))',
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Spine texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none rounded-l-sm"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0, 0, 0, 0.05) 1px,
              rgba(0, 0, 0, 0.05) 2px
            )
          `,
        }}
      />
    </div>
  );
}
