import { Book } from '@/app/page';
import { motion } from 'framer-motion';

interface BookSpineProps {
  book: Book;
  color: string;
  onClick: () => void;
  isHighlighted?: boolean;
}

// Warm, cozy color palette that fits the theme
const BOOK_COLORS = [
  '#8b4513', // Saddle Brown
  '#a0522d', // Sienna
  '#cd853f', // Peru
  '#d2691e', // Chocolate
  '#b8860b', // Dark Goldenrod
  '#daa520', // Goldenrod
  '#c19a6b', // Camel
  '#8b7355', // Burlywood
  '#704214', // Sepia
  '#a67c52', // Tan
  '#9b7653', // Light Brown
  '#6b5d4a', // Dark Tan
  '#b87333', // Copper
  '#aa6c39', // Raw Sienna
  '#8b6f47', // Warm Brown
  '#966919', // Dark Tan
  '#c9a961', // Gold
  '#7c6a4f', // Taupe Brown
  '#9d8164', // Khaki
  '#8a6b4e', // Coffee Brown
  '#a68969', // Sand
  '#7a5f3f', // Mocha
  '#c4a574', // Light Khaki
  '#937856', // Dusty Brown
  '#b5976b', // Wheat
];

export function BookSpine({ book, color, onClick, isHighlighted = false }: BookSpineProps) {
  // VARIABLE HEIGHT - more realistic appearance
  const getSpineHeight = () => {
    // Base height with variation based on book ID for consistency
    const hash = book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = (hash % 30) - 15; // -15 to +15 variation
    const baseHeight = 160;
    return baseHeight + variation; // 145px to 175px range
  };

  const height = getSpineHeight();

  // VARIABLE WIDTH based on page count - narrower to fit more books
  const getSpineWidth = () => {
    if (!book.totalPages) return 35; // Default width
    // Formula: more pages = wider book (25px to 55px range)
    const minWidth = 25;
    const maxWidth = 55;
    const pagesPerWidth = 20; // 20 pages = 1px of width
    const calculatedWidth = minWidth + (book.totalPages / pagesPerWidth);
    return Math.min(maxWidth, Math.max(minWidth, calculatedWidth));
  };

  const width = getSpineWidth();

  // Get color from rich palette based on book ID (consistent per book)
  const getBookColor = () => {
    // Use book ID to consistently assign a color
    const hash = book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return BOOK_COLORS[hash % BOOK_COLORS.length];
  };

  const bookColor = getBookColor();

  // Check if color is dark or light for better text contrast
  const isColorDark = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const textColor = isColorDark(bookColor) ? '#ffffff' : '#2d2d2d';
  const isDark = isColorDark(bookColor);

  return (
    <motion.div
      onClick={onClick}
      className="book-3d-container group cursor-pointer"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
      variants={{
        hidden: { opacity: 0, rotateY: -90, scale: 0.8 },
        visible: {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
          }
        }
      }}
      whileHover={{
        scale: 1.03,
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{
        scale: 1.05,
        y: -8,
        transition: { type: "spring", stiffness: 500, damping: 20 }
      }}
      title={`${book.title} by ${book.author}${book.rating > 0 ? ` • ${'★'.repeat(book.rating)}` : ''}`}
    >
      {/* Book spine (front face) - Modern design with cover image */}
      <motion.div
        className="book-spine absolute inset-0"
        style={{
          background: book.coverUrl
            ? `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${book.coverUrl})`
            : `linear-gradient(135deg,
                ${bookColor} 0%,
                ${bookColor}ee 50%,
                ${bookColor}cc 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)'}`,
          borderRadius: '4px 0 0 4px',
          boxShadow: isHighlighted
            ? `0 0 20px ${bookColor}80,
               0 4px 12px rgba(0, 0, 0, 0.3),
               0 6px 0 -2px rgba(0, 0, 0, 0.4),
               inset -2px 0 8px rgba(0, 0, 0, 0.3),
               inset 1px 0 2px rgba(255, 255, 255, 0.2)`
            : `0 4px 8px rgba(0, 0, 0, 0.2),
               0 6px 0 -2px rgba(0, 0, 0, 0.4),
               inset -2px 0 6px rgba(0, 0, 0, 0.3),
               inset 1px 0 2px rgba(255, 255, 255, 0.15)`,
          position: 'absolute',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Enhanced spine highlight - left edge */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: '6px',
            background: `linear-gradient(to right,
              ${bookColor}dd 0%,
              ${bookColor}aa 50%,
              transparent 100%)`,
            boxShadow: `inset 2px 0 4px rgba(255, 215, 0, 0.3)`,
          }}
        />

        {/* Modern decorative bands */}
        <div
          className="absolute left-1 right-1 top-3"
          style={{
            height: '2px',
            background: `linear-gradient(to right,
              transparent,
              ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'},
              transparent)`,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        />
        <div
          className="absolute left-1 right-1 bottom-3"
          style={{
            height: '2px',
            background: `linear-gradient(to right,
              transparent,
              ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'},
              transparent)`,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Vertical title text - only show when no cover image */}
        {!book.coverUrl && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden"
            style={{
              padding: '10px 0',
            }}
          >
            {/* Title - top section */}
            <div
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                maxHeight: `${height - 65}px`,
                overflow: 'hidden',
              }}
            >
              <span
                className="font-bold tracking-wide"
                style={{
                  color: '#f5f1e8',
                  fontSize: width > 45 ? '13px' : '11px',
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 0 3px rgba(0, 0, 0, 0.7)',
                  letterSpacing: '0.8px',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {book.title.toUpperCase()}
              </span>
            </div>

            {/* Author - bottom section */}
            <div
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                maxHeight: '55px',
                overflow: 'hidden',
              }}
            >
              <span
                className="font-medium"
                style={{
                  color: '#f5f1e8',
                  fontSize: width > 45 ? '10px' : '9px',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.5px',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  opacity: 0.9,
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {book.author}
              </span>
            </div>
          </div>
        )}

        {/* Reading Progress Bar for Currently Reading */}
        {book.readingStatus === 'Currently Reading' && book.currentPage && book.totalPages && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px 0 0 4px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${(book.currentPage / book.totalPages) * 100}%`,
                background: 'linear-gradient(to top, #eab308 0%, #fbbf24 100%)',
                boxShadow: '0 0 8px rgba(234, 179, 8, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                transition: 'height 0.3s ease',
              }}
            />
          </div>
        )}

        {/* Rating badge - clean corner badge */}
        {book.rating > 0 && (
          <div
            className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span
              style={{
                color: '#ffd700',
                fontSize: '9px',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              ★
            </span>
            <span
              style={{
                color: '#ffffff',
                fontSize: '8px',
                fontWeight: 'bold',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              {book.rating}
            </span>
          </div>
        )}

        {/* Spine texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none rounded-l-sm"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 0, 0, 0.05) 1px, rgba(0, 0, 0, 0.05) 2px)`,
          }}
        />

        {/* Reading status color tint */}
        {book.readingStatus && book.readingStatus !== 'Want to Read' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-l-sm"
            style={{
              background: book.readingStatus === 'Currently Reading'
                ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), transparent)'
                : book.readingStatus === 'Finished'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), transparent)'
                : 'transparent',
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Enhanced hover glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-l-sm"
          style={{
            background: `linear-gradient(135deg,
              ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.4)'} 0%,
              transparent 70%)`,
            mixBlendMode: 'overlay',
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-l-sm overflow-hidden"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `linear-gradient(45deg,
                transparent 30%,
                rgba(255, 255, 255, 0.3) 50%,
                transparent 70%)`,
              transform: 'translateX(-100%)',
              animation: 'shine 0.6s ease-in-out',
            }}
          />
        </motion.div>
      </motion.div>

      {/* 3D Page edges (right side of book) - optimized */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          width: '10px',
          transform: 'rotateY(90deg) translateZ(-5px)',
          transformOrigin: 'left center',
          background: 'linear-gradient(to right, #ede8dc 0%, #d5cfc0 100%)',
          boxShadow: 'inset -2px 0 3px rgba(0, 0, 0, 0.25), 1px 0 4px rgba(0, 0, 0, 0.15)',
          borderRadius: '0 2px 2px 0',
          backfaceVisibility: 'hidden',
        }}
        animate={{
          boxShadow: [
            'inset -2px 0 3px rgba(0, 0, 0, 0.25), 1px 0 4px rgba(0, 0, 0, 0.15)',
            'inset -2px 0 3px rgba(0, 0, 0, 0.35), 1px 0 4px rgba(0, 0, 0, 0.25)',
            'inset -2px 0 3px rgba(0, 0, 0, 0.25), 1px 0 4px rgba(0, 0, 0, 0.15)',
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
