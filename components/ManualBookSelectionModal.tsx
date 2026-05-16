'use client';

import { useState } from 'react';

interface ManualBookSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    bookId: string;
    title: string;
    author: string;
    isbn: string | null;
    reason: string;
  };
  onBookSelected: (bookId: string, selectedData: GoogleBook) => Promise<void>;
}

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
  };
}

export function ManualBookSelectionModal({
  isOpen,
  onClose,
  book,
  onBookSelected,
}: ManualBookSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState(`${book.title} ${book.author}`);
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search-books?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search books. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = async (selectedBook: GoogleBook) => {
    setIsUpdating(true);
    try {
      await onBookSelected(book.bookId, selectedBook);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update book. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f3 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
              Select Correct Book
            </h2>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              <strong>Current:</strong> {book.title} by {book.author}
            </p>
            <p className="text-sm" style={{ color: '#d97706' }}>
              <strong>Issue:</strong> {book.reason}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors text-2xl"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, author, or ISBN..."
              className="flex-1 px-4 py-3 rounded-xl border-2 outline-none focus:border-[var(--warm-brown)] transition-colors"
              style={{
                background: '#ffffff',
                borderColor: 'var(--border-color)',
                color: 'var(--text-dark)',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              style={{
                background: isSearching ? 'var(--text-muted)' : 'var(--warm-brown)',
                color: '#ffffff',
              }}
            >
              <span className="text-lg">🔍</span>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
              Search Results ({searchResults.length})
            </h3>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="p-4 rounded-xl border-2 hover:border-[var(--warm-brown)] transition-all cursor-pointer flex gap-4"
                style={{
                  background: '#ffffff',
                  borderColor: 'var(--border-color)',
                }}
                onClick={() => handleSelectBook(result)}
              >
                {result.volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={result.volumeInfo.imageLinks.thumbnail}
                    alt={result.volumeInfo.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                ) : (
                  <div
                    className="w-16 h-24 rounded flex items-center justify-center text-3xl"
                    style={{ background: 'var(--cream)', color: 'var(--text-muted)' }}
                  >
                    📖
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--text-dark)' }}>
                    {result.volumeInfo.title}
                  </h4>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    {result.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                  </p>
                  {result.volumeInfo.description && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {result.volumeInfo.description}
                    </p>
                  )}
                  {result.volumeInfo.categories && (
                    <p className="text-xs mt-2" style={{ color: 'var(--warm-brown)' }}>
                      {result.volumeInfo.categories.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-xl"
            style={{ background: 'var(--cream)' }}
          >
            <div className="text-5xl mb-3" style={{ color: 'var(--text-muted)' }}>🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>
              Search for the correct book using the search box above
            </p>
          </div>
        )}

        {isUpdating && (
          <div
            className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-3xl"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>
                Updating book...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
