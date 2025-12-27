'use client';

import { useState } from 'react';
import { Quote, Heart, Edit2, Trash2, BookMarked } from 'lucide-react';

interface QuoteData {
  id: string;
  text: string;
  pageNumber?: number | null;
  notes?: string | null;
  isFavorite: boolean;
  createdAt: string;
  book?: {
    title: string;
    author: string;
    coverUrl?: string | null;
  };
}

interface QuoteCardProps {
  quote: QuoteData;
  onUpdate?: (id: string, updates: Partial<QuoteData>) => void;
  onDelete?: (id: string) => void;
  onEdit?: (quote: QuoteData) => void;
  showBookInfo?: boolean;
}

export function QuoteCard({ quote, onUpdate, onDelete, onEdit, showBookInfo = false }: QuoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleFavorite = () => {
    if (onUpdate) {
      onUpdate(quote.id, { isFavorite: !quote.isFavorite });
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this quote?')) {
      onDelete(quote.id);
    }
  };

  return (
    <div
      className="group relative rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl"
      style={{
        background: 'var(--gradient-card)',
        border: '2px solid var(--border-color)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with page number and actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Quote
            className="w-5 h-5"
            style={{ color: 'var(--warm-brown)' }}
            strokeWidth={2.5}
          />
          {quote.pageNumber && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: 'var(--warm-brown)',
                color: 'white',
              }}
            >
              Page {quote.pageNumber}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              background: quote.isFavorite ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
            }}
            title={quote.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className="w-4 h-4"
              style={{ color: quote.isFavorite ? '#ef4444' : 'var(--text-muted)' }}
              fill={quote.isFavorite ? '#ef4444' : 'none'}
              strokeWidth={2}
            />
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(quote)}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{ background: 'var(--bg-tertiary)' }}
              title="Edit quote"
            >
              <Edit2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={2} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              title="Delete quote"
            >
              <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Quote text */}
      <blockquote className="mb-4">
        <p
          className="text-lg leading-relaxed italic"
          style={{
            color: 'var(--text-dark)',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          "{quote.text}"
        </p>
      </blockquote>

      {/* Notes */}
      {quote.notes && (
        <div
          className="mb-4 p-4 rounded-xl"
          style={{
            background: 'var(--bg-tertiary)',
            borderLeft: '4px solid var(--warm-brown)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {quote.notes}
          </p>
        </div>
      )}

      {/* Book info (if showing quotes from multiple books) */}
      {showBookInfo && quote.book && (
        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          {quote.book.coverUrl ? (
            <img
              src={quote.book.coverUrl}
              alt={quote.book.title}
              className="w-10 h-14 object-cover rounded shadow-md"
            />
          ) : (
            <div
              className="w-10 h-14 rounded flex items-center justify-center"
              style={{ background: 'var(--warm-brown)' }}
            >
              <BookMarked className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-sm truncate"
              style={{ color: 'var(--text-dark)' }}
            >
              {quote.book.title}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {quote.book.author}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
