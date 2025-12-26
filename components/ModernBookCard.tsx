'use client';

import { Book } from '@/lib/hooks/useBooks';
import { useState } from 'react';

interface ModernBookCardProps {
  book: Book;
  onClick?: () => void;
  onUpdate?: (updates: Partial<Book>) => void;
}

export function ModernBookCard({ book, onClick, onUpdate }: ModernBookCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    'Want to Read': { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', border: '#3b82f6' },
    'Currently Reading': { bg: 'rgba(234, 179, 8, 0.1)', text: '#a16207', border: '#eab308' },
    'Finished': { bg: 'rgba(34, 197, 94, 0.1)', text: '#15803d', border: '#22c55e' },
  };

  const status = statusColors[book.readingStatus as keyof typeof statusColors] || statusColors['Want to Read'];

  return (
    <div
      className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📚
          </div>
        )}

        {/* Rating Overlay */}
        {book.rating > 0 && (
          <div
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1 shadow-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-white text-sm font-bold">{book.rating}</span>
          </div>
        )}

        {/* Status Badge */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 backdrop-blur-md"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-bold inline-block"
            style={{
              background: status.bg,
              color: status.text,
              border: `1px solid ${status.border}`,
            }}
          >
            {book.readingStatus}
          </div>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3
          className="font-bold text-base mb-1 line-clamp-2 min-h-[2.5rem]"
          style={{ color: 'var(--text-dark)' }}
        >
          {book.title}
        </h3>
        <p
          className="text-sm mb-3 line-clamp-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {book.author}
        </p>

        {/* Progress Bar for Currently Reading */}
        {book.readingStatus === 'Currently Reading' && book.currentPage && book.totalPages && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {book.currentPage} / {book.totalPages} pages
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--warm-brown)' }}>
                {Math.round((book.currentPage / book.totalPages) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(book.currentPage / book.totalPages) * 100}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                }}
              />
            </div>
          </div>
        )}

        {/* Genre Tag */}
        {book.genre && (
          <div className="flex flex-wrap gap-1">
            <span
              className="px-2 py-1 rounded-md text-xs font-medium"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
              }}
            >
              {book.genre.split(',')[0].trim()}
            </span>
          </div>
        )}

        {/* Series Info */}
        {book.series && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              📖 {book.series} #{book.seriesNumber}
            </span>
          </div>
        )}
      </div>

      {/* Hover Actions */}
      <div
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
      >
        <button
          className="px-6 py-3 rounded-xl font-bold text-white transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--warm-brown), var(--gold))',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
