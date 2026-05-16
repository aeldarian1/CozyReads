'use client';

import { useState, useEffect } from 'react';
import { X, Quote, Heart } from 'lucide-react';

interface QuoteData {
  id?: string;
  text: string;
  pageNumber?: number | null;
  notes?: string | null;
  isFavorite: boolean;
}

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: QuoteData) => void;
  bookTitle: string;
  editingQuote?: QuoteData | null;
}

export function AddQuoteModal({ isOpen, onClose, onSave, bookTitle, editingQuote }: AddQuoteModalProps) {
  const [formData, setFormData] = useState<QuoteData>({
    text: '',
    pageNumber: null,
    notes: '',
    isFavorite: false,
  });

  useEffect(() => {
    if (editingQuote) {
      setFormData(editingQuote);
    } else {
      setFormData({
        text: '',
        pageNumber: null,
        notes: '',
        isFavorite: false,
      });
    }
  }, [editingQuote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.text.trim()) {
      onSave(formData);
      setFormData({
        text: '',
        pageNumber: null,
        notes: '',
        isFavorite: false,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-primary)',
          border: '2px solid var(--border-color)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, var(--warm-brown), var(--gold))',
            borderBottom: '2px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <Quote className="w-6 h-6 text-white" strokeWidth={2.5} />
            <div>
              <h2 className="text-xl font-black text-white">
                {editingQuote ? 'Edit Quote' : 'Add Quote'}
              </h2>
              <p className="text-sm text-white/80 font-medium">
                {bookTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Quote Text */}
          <div>
            <label
              className="block font-bold mb-2 tracking-wide uppercase text-xs"
              style={{ color: 'var(--text-dark)' }}
            >
              Quote Text *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)',
                fontFamily: 'Playfair Display, serif',
                fontSize: '16px',
              }}
              placeholder="Enter the quote..."
            />
          </div>

          {/* Page Number and Favorite */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block font-bold mb-2 tracking-wide uppercase text-xs"
                style={{ color: 'var(--text-dark)' }}
              >
                Page Number
              </label>
              <input
                type="number"
                value={formData.pageNumber || ''}
                onChange={(e) => setFormData({ ...formData, pageNumber: e.target.value ? parseInt(e.target.value) : null })}
                min="1"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)',
                }}
                placeholder="Page number..."
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
                className="w-full px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  background: formData.isFavorite
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'var(--bg-secondary)',
                  color: formData.isFavorite ? 'white' : 'var(--text-dark)',
                  border: '2px solid var(--border-color)',
                }}
              >
                <Heart
                  className="w-4 h-4"
                  fill={formData.isFavorite ? 'white' : 'none'}
                  strokeWidth={2}
                />
                {formData.isFavorite ? 'Favorite' : 'Mark Favorite'}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              className="block font-bold mb-2 tracking-wide uppercase text-xs"
              style={{ color: 'var(--text-dark)' }}
            >
              Personal Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)',
              }}
              placeholder="Your thoughts about this quote..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--warm-brown), var(--gold))',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
              }}
            >
              {editingQuote ? 'Update Quote' : 'Save Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
