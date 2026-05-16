'use client';

import { Book } from '@/app/page';
import { useEffect, useRef } from 'react';

interface QuickEditMenuProps {
  book: Book;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: () => void;
  onQuickUpdate: (updates: Partial<Book>) => Promise<void>;
}

export function QuickEditMenu({
  book,
  position,
  onClose,
  onEdit,
  onDelete,
  onQuickUpdate,
}: QuickEditMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleStatusChange = async (status: string) => {
    await onQuickUpdate({ readingStatus: status });
    onClose();
  };

  const handleRatingChange = async (rating: number) => {
    await onQuickUpdate({ rating });
    onClose();
  };

  const statuses = [
    { label: '📚 Want to Read', value: 'Want to Read', icon: '📚' },
    { label: '📖 Currently Reading', value: 'Currently Reading', icon: '📖' },
    { label: '✓ Finished', value: 'Finished', icon: '✓' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-xl shadow-2xl overflow-hidden animate-fadeIn"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '240px',
        background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f3 100%)',
        border: '2px solid rgba(139, 111, 71, 0.3)',
        boxShadow: '0 10px 40px rgba(93, 78, 55, 0.3)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          background: 'linear-gradient(135deg, #5d4e37 0%, #6d5d4f 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <p className="text-sm font-bold text-amber-50 truncate" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          Quick Actions
        </p>
        <p className="text-xs text-amber-200 truncate mt-0.5">{book.title}</p>
      </div>

      <div className="py-2">
        {/* Status Section */}
        <div className="px-2 py-1">
          <p className="px-2 text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#8b6f47' }}>
            Change Status
          </p>
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className="w-full px-3 py-2 text-left text-sm rounded-lg transition-all hover:scale-[1.02] flex items-center gap-2"
              style={{
                background: book.readingStatus === status.value ? 'rgba(139, 111, 71, 0.15)' : 'transparent',
                color: '#3e2723',
                fontWeight: book.readingStatus === status.value ? '600' : '400',
              }}
            >
              <span>{status.icon}</span>
              <span>{status.label.replace(/^[📚📖✓]\s/, '')}</span>
              {book.readingStatus === status.value && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>

        <div className="my-2 mx-2 border-t" style={{ borderColor: 'rgba(139, 111, 71, 0.2)' }} />

        {/* Rating Section */}
        <div className="px-2 py-1">
          <p className="px-2 text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#8b6f47' }}>
            Set Rating
          </p>
          <div className="px-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className="flex-1 py-2 rounded-lg transition-all hover:scale-110"
                style={{
                  background: book.rating >= rating ? 'linear-gradient(135deg, #d4a574 0%, #c89b65 100%)' : 'rgba(139, 111, 71, 0.1)',
                  color: book.rating >= rating ? '#2d1f15' : '#8b6f47',
                  fontSize: '18px',
                  border: '1px solid rgba(139, 111, 71, 0.2)',
                }}
                title={`${rating} star${rating > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="my-2 mx-2 border-t" style={{ borderColor: 'rgba(139, 111, 71, 0.2)' }} />

        {/* Main Actions */}
        <div className="px-2 py-1">
          <button
            onClick={() => { onEdit(book); onClose(); }}
            className="w-full px-3 py-2 text-left text-sm rounded-lg transition-all hover:scale-[1.02] flex items-center gap-2 font-semibold"
            style={{
              background: 'rgba(139, 111, 71, 0.08)',
              color: '#5d4e37',
            }}
          >
            <span>✏️</span>
            <span>Edit Details</span>
            <span className="ml-auto text-xs opacity-60">E</span>
          </button>

          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full px-3 py-2 text-left text-sm rounded-lg transition-all hover:scale-[1.02] flex items-center gap-2 mt-1 font-semibold"
            style={{
              background: 'rgba(193, 73, 83, 0.1)',
              color: '#a83a44',
            }}
          >
            <span>🗑️</span>
            <span>Delete Book</span>
            <span className="ml-auto text-xs opacity-60">Del</span>
          </button>
        </div>
      </div>
    </div>
  );
}
