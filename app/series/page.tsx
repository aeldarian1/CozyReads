'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  rating: number;
  readingStatus: string;
  seriesNumber: number | null;
};

type Series = {
  name: string;
  books: Book[];
  totalBooks: number;
  completedBooks: number;
};

export default function SeriesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const response = await fetch('/api/books');
      const books = await response.json();

      // Group books by series
      const seriesMap = new Map<string, Book[]>();
      books.forEach((book: any) => {
        if (book.series) {
          if (!seriesMap.has(book.series)) {
            seriesMap.set(book.series, []);
          }
          seriesMap.get(book.series)!.push({
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            rating: book.rating,
            readingStatus: book.readingStatus,
            seriesNumber: book.seriesNumber,
          });
        }
      });

      // Convert to array and sort books within each series
      const seriesArray = Array.from(seriesMap.entries()).map(([name, books]) => {
        const sortedBooks = books.sort((a, b) => {
          if (a.seriesNumber === null) return 1;
          if (b.seriesNumber === null) return -1;
          return a.seriesNumber - b.seriesNumber;
        });

        return {
          name,
          books: sortedBooks,
          totalBooks: sortedBooks.length,
          completedBooks: sortedBooks.filter(b => b.readingStatus === 'Finished').length,
        };
      });

      // Sort series by name
      seriesArray.sort((a, b) => a.name.localeCompare(b.name));

      setSeriesList(seriesArray);
    } catch (error) {
      console.error('Error loading series:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--warm-brown)' }}></div>
          <p style={{ color: 'var(--text-dark)' }}>Loading series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: 'var(--gradient-navbar)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px)'
        }} />
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-amber-50 mb-2" style={{
                fontFamily: 'Playfair Display, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                📚 Book Series
              </h1>
              <p className="text-amber-100 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                Explore your book series collections
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              ← Back to Library
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {seriesList.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
              No series found
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Add series information to your books to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {seriesList.map((series) => (
              <div
                key={series.name}
                className="rounded-2xl p-6 shadow-lg"
                style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {/* Series Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{
                      color: 'var(--text-dark)',
                      fontFamily: 'Merriweather, serif'
                    }}>
                      {series.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                          {series.totalBooks}
                        </span>
                        {series.totalBooks === 1 ? 'book' : 'books'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold" style={{ color: '#5d7052' }}>
                          {series.completedBooks}
                        </span>
                        completed
                      </span>
                      {series.completedBooks === series.totalBooks && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{
                          background: '#5d7052',
                          color: '#fff',
                        }}>
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress Circle */}
                  <div className="relative" style={{ width: '60px', height: '60px' }}>
                    <svg className="transform -rotate-90" width="60" height="60">
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        stroke="rgba(139, 111, 71, 0.2)"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        stroke="#d4a574"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 25}`}
                        strokeDashoffset={`${2 * Math.PI * 25 * (1 - series.completedBooks / series.totalBooks)}`}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>
                        {Math.round((series.completedBooks / series.totalBooks) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {series.books.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => router.push(`/?bookId=${book.id}`)}
                      className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-48 flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)',
                          }}
                        >
                          <svg className="w-12 h-12 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          {book.seriesNumber && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{
                              background: 'var(--gradient-accent)',
                              color: 'var(--text-dark)',
                            }}>
                              Book #{book.seriesNumber}
                            </span>
                          )}
                          {book.readingStatus === 'Finished' && (
                            <span className="text-green-600 text-sm font-bold">✓</span>
                          )}
                        </div>
                        <p className="font-bold text-sm line-clamp-2 mb-1" style={{ color: 'var(--text-dark)' }}>
                          {book.title}
                        </p>
                        {book.rating > 0 && (
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className="text-xs"
                                style={{
                                  color: star <= book.rating ? '#d4a574' : 'rgba(139, 111, 71, 0.2)',
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
