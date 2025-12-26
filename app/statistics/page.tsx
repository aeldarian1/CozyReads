'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

type Statistics = {
  overview: {
    totalBooks: number;
    wantToRead: number;
    currentlyReading: number;
    finished: number;
    averageRating: number;
    totalPagesRead: number;
    booksFinishedThisMonth: number;
    booksFinishedThisYear: number;
  };
  genreDistribution: { genre: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  topRatedBooks: {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
    genre: string | null;
  }[];
  recentlyFinished: {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
    rating: number;
    dateFinished: string | null;
  }[];
};

export default function StatisticsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--warm-brown)' }}></div>
          <p style={{ color: 'var(--text-dark)' }}>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-dark)' }}>Failed to load statistics.</p>
      </div>
    );
  }

  const { overview, genreDistribution, ratingDistribution, monthlyTrend, topRatedBooks, recentlyFinished } = stats;

  // Find max value for chart scaling
  const maxGenreCount = Math.max(...genreDistribution.map(g => g.count), 1);
  const maxMonthlyCount = Math.max(...monthlyTrend.map(m => m.count), 1);

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
                📊 Reading Statistics
              </h1>
              <p className="text-amber-100 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                Track your reading journey and insights
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
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="text-3xl mb-2">📚</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-dark)' }}>
              {overview.totalBooks}
            </div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              Total Books
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-dark)' }}>
              {overview.finished}
            </div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              Books Finished
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-dark)' }}>
              {overview.averageRating.toFixed(1)}
            </div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              Average Rating
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="text-3xl mb-2">📖</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-dark)' }}>
              {overview.totalPagesRead.toLocaleString()}
            </div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              Pages Read
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl p-6 shadow-lg mb-8" style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-color)'
        }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
            Reading Status
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(109, 138, 150, 0.1)' }}>
              <div className="text-2xl mb-2">📚</div>
              <div className="text-2xl font-black mb-1" style={{ color: '#6d8a96' }}>
                {overview.wantToRead}
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                Want to Read
              </div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(212, 165, 116, 0.1)' }}>
              <div className="text-2xl mb-2">📖</div>
              <div className="text-2xl font-black mb-1" style={{ color: '#d4a574' }}>
                {overview.currentlyReading}
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                Currently Reading
              </div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(93, 112, 82, 0.1)' }}>
              <div className="text-2xl mb-2">✓</div>
              <div className="text-2xl font-black mb-1" style={{ color: '#5d7052' }}>
                {overview.finished}
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                Finished
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Genre Distribution */}
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
              Books by Genre
            </h2>
            <div className="space-y-3">
              {genreDistribution.slice(0, 5).map(({ genre, count }) => (
                <div key={genre}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
                      {genre}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--warm-brown)' }}>
                      {count}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden" style={{
                    background: 'rgba(139, 111, 71, 0.2)'
                  }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(count / maxGenreCount) * 100}%`,
                        background: 'linear-gradient(90deg, #d4a574 0%, #c89b65 100%)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
              Rating Distribution
            </h2>
            <div className="space-y-3">
              {ratingDistribution.reverse().map(({ rating, count }) => (
                <div key={rating}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
                      {'★'.repeat(rating)}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--warm-brown)' }}>
                      {count}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden" style={{
                    background: 'rgba(139, 111, 71, 0.2)'
                  }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(count / overview.totalBooks) * 100}%`,
                        background: 'linear-gradient(90deg, #d4a574 0%, #c89b65 100%)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="rounded-2xl p-6 shadow-lg mb-8" style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-color)'
        }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-dark)' }}>
            Books Finished (Last 12 Months)
          </h2>
          <div className="flex items-end justify-between h-64 gap-2">
            {monthlyTrend.map(({ month, count }) => (
              <div key={month} className="flex-1 flex flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                  style={{
                    height: `${(count / maxMonthlyCount) * 100}%`,
                    minHeight: count > 0 ? '8px' : '0',
                    background: 'linear-gradient(180deg, #d4a574 0%, #c89b65 100%)',
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {count} {count === 1 ? 'book' : 'books'}
                  </div>
                </div>
                <div className="text-xs font-semibold transform -rotate-45 origin-top-left mt-8" style={{ color: 'var(--text-muted)' }}>
                  {month.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Books */}
        {topRatedBooks.length > 0 && (
          <div className="rounded-2xl p-6 shadow-lg mb-8" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
              ⭐ Top Rated Books (5 Stars)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topRatedBooks.map((book) => (
                <div key={book.id} className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)'
                    }}>
                      <svg className="w-12 h-12 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-sm line-clamp-2" style={{ color: 'var(--text-dark)' }}>
                      {book.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {book.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Finished */}
        {recentlyFinished.length > 0 && (
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
              Recently Finished
            </h2>
            <div className="space-y-4">
              {recentlyFinished.map((book) => (
                <div key={book.id} className="flex gap-4 p-4 rounded-xl hover:shadow-md transition-shadow" style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-lg shadow-md" />
                  ) : (
                    <div className="w-16 h-24 rounded-lg flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)'
                    }}>
                      <svg className="w-8 h-8 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-dark)' }}>
                      {book.title}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                      by {book.author}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{
                            color: star <= book.rating ? '#d4a574' : 'rgba(139, 111, 71, 0.2)'
                          }}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        • Finished {book.dateFinished ? new Date(book.dateFinished).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
