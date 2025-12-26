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
      className="book-3d-container group cursor-pointer hover-3d-book"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
      }}
      title={`${book.title} by ${book.author}${book.rating > 0 ? ` • ${'★'.repeat(book.rating)}` : ''}`}
    >
      {/* Book spine (front face) */}
      <div
        className="book-spine absolute inset-0"
        style={{
          background: `linear-gradient(to right,
            ${color}f5 0%,
            ${color}dd 50%,
            ${color}c0 100%)`,
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`,
          borderRadius: '3px 0 0 3px',
          boxShadow: isHighlighted
            ? `0 0 20px rgba(212, 165, 116, 1),
               inset -4px 0 8px rgba(0, 0, 0, 0.5),
               inset 3px 0 4px rgba(255, 255, 255, 0.2),
               4px 4px 12px rgba(0, 0, 0, 0.4)`
            : `inset -4px 0 8px rgba(0, 0, 0, 0.5),
               inset 3px 0 4px rgba(255, 255, 255, 0.2),
               4px 4px 12px rgba(0, 0, 0, 0.3)`,
          position: 'absolute',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Spine left edge highlight */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            background: `linear-gradient(to right, ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'}, transparent)`,
            borderRadius: '3px 0 0 3px',
          }}
        />

        {/* Decorative spine lines */}
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

        {/* Vertical title text */}
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
                  ? '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.6)'
                  : '0 1px 3px rgba(255, 255, 255, 0.9), 0 0 2px rgba(0, 0, 0, 0.4)',
                maxHeight: `${height - 60}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '0.5px',
              }}
            >
              {book.title.toUpperCase()}
            </span>

            {height > 140 && (
              <span
                className="font-medium opacity-90"
                style={{
                  color: textColor,
                  fontSize: '11px',
                  textShadow: isDark
                    ? '0 1px 3px rgba(0, 0, 0, 0.7)'
                    : '0 1px 2px rgba(255, 255, 255, 0.7)',
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

        {/* Rating stars */}
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
                  textShadow: '0 1px 4px rgba(0, 0, 0, 1), 0 0 3px rgba(0, 0, 0, 0.6)',
                  filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.6))',
                }}
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* Spine texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none rounded-l-sm"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 0, 0, 0.05) 1px, rgba(0, 0, 0, 0.05) 2px)`,
          }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-l-sm"
          style={{
            background: `linear-gradient(to right, ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}, transparent)`,
          }}
        />
      </div>

      {/* 3D Page edges (right side of book) */}
      <div
        className="absolute top-0 bottom-0 right-0"
        style={{
          width: '12px',
          transform: 'rotateY(90deg) translateZ(-6px)',
          transformOrigin: 'left center',
          background: `linear-gradient(to right,
            #f5f0e8 0%,
            #ede8dc 20%,
            #e5dfd0 40%,
            #ddd7c8 60%,
            #d5cfc0 80%,
            #cdc7b8 100%)`,
          boxShadow: `
            inset -2px 0 4px rgba(0, 0, 0, 0.3),
            inset 2px 0 3px rgba(255, 255, 255, 0.2),
            2px 0 6px rgba(0, 0, 0, 0.2)
          `,
          borderRadius: '0 2px 2px 0',
        }}
      >
        {/* Page lines effect */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.03) 2px,
              rgba(0, 0, 0, 0.03) 3px)`,
          }}
        />
      </div>
    </div>
  );
}
