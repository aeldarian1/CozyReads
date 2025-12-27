import { Book } from '@/app/page';
import { BookSpine } from './BookSpine';
import { motion } from 'framer-motion';

interface ShelfProps {
  books: Book[];
  bookColors: Map<string, string>;
  onBookClick: (book: Book) => void;
  label?: string;
  highlightedBookIds?: Set<string>;
  index?: number;
  genreLabel?: string;
}

export function Shelf({ books, bookColors, onBookClick, label, highlightedBookIds, index = 0, genreLabel }: ShelfProps) {
  const shelfVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="shelf-container"
      variants={shelfVariants}
    >
      {/* Genre Label */}
      {genreLabel && (
        <motion.div
          className="mb-4 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[var(--warm-brown)] to-transparent opacity-30" style={{ width: '30px' }} />
            <span className="text-lg font-black tracking-wide" style={{
              color: 'var(--warm-brown)',
              fontFamily: 'Playfair Display, serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {genreLabel}
            </span>
            <div className="h-px flex-grow bg-gradient-to-r from-[var(--warm-brown)] to-transparent opacity-30" style={{ width: '100px' }} />
          </div>
        </motion.div>
      )}

      {/* Shelf Label */}
      {label && (
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="text-sm font-black" style={{
            color: 'var(--text-dark)',
            fontFamily: 'Playfair Display, serif',
          }}>
            {label}
          </span>
        </motion.div>
      )}

      {/* Modern 3D Shelf Container with enhanced styling */}
      <div
        className="relative rounded-2xl overflow-visible shadow-2xl group"
        style={{
          background: 'linear-gradient(to bottom, rgba(139, 111, 71, 0.08), rgba(139, 111, 71, 0.12))',
          border: '1px solid rgba(139, 111, 71, 0.2)',
          transformStyle: 'preserve-3d',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Enhanced 3D Back Wall */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
          background: 'linear-gradient(to bottom, rgba(30, 30, 30, 0.05) 0%, rgba(30, 30, 30, 0.1) 100%)',
          transform: 'translateZ(-10px)',
          boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.08)',
        }} />

        {/* Books Container with 3D depth */}
        <div className="flex items-end gap-1 pt-6 pb-0 overflow-x-auto scrollbar-thin relative" style={{
          minHeight: '180px',
          paddingLeft: '32px',
          paddingRight: '32px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(139, 111, 71, 0.02) 100%)',
          transformStyle: 'preserve-3d',
          overflowY: 'visible',
        }}>
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

        {/* Enhanced 3D Shelf Base */}
        <div className="relative h-5 shadow-2xl transition-all duration-300" style={{
          background: 'linear-gradient(to bottom, #a3876e 0%, #8b7355 50%, #6b5d4a 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          transform: 'translateZ(5px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
        }}>
          {/* Glossy top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 opacity-70" style={{
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.6), transparent)',
            boxShadow: '0 1px 3px rgba(255, 255, 255, 0.3)',
          }} />

          {/* Wood grain texture */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(90deg,
              transparent,
              transparent 10px,
              rgba(0, 0, 0, 0.1) 10px,
              rgba(0, 0, 0, 0.1) 11px)`,
          }} />

          {/* Enhanced shelf front edge */}
          <div className="absolute -bottom-1 left-0 right-0 h-2" style={{
            background: 'linear-gradient(to bottom, rgba(107, 93, 74, 0.9), rgba(75, 63, 50, 1))',
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
            transform: 'translateZ(-2px)',
            borderRadius: '0 0 2px 2px',
          }} />
        </div>

        {/* Side brackets for 3D depth */}
        <div className="absolute left-0 bottom-0 w-3 h-full pointer-events-none" style={{
          background: 'linear-gradient(to right, rgba(139, 111, 71, 0.15), transparent)',
          transform: 'translateZ(10px)',
        }} />
        <motion.div
          className="absolute right-0 bottom-0 w-3 h-full pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(139, 111, 71, 0.15), transparent)',
            translateZ: 10,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}
