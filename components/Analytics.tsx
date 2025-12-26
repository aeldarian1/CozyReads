'use client';

import { Book } from '@/app/page';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Analytics({ books, onBooksUpdated }: { books: Book[]; onBooksUpdated?: () => void }) {
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isStandardizing, setIsStandardizing] = useState(false);

  const handleNormalizeGenres = async () => {
    if (!confirm('This will normalize all book genres in your library. Continue?')) {
      return;
    }

    setIsNormalizing(true);
    try {
      const response = await fetch('/api/normalize-genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Successfully normalized ${data.stats.updated} book genres!\n\nUpdated: ${data.stats.updated}\nUnchanged: ${data.stats.unchanged}\n\nRefreshing page...`);

        // Refresh the page to show updated genres
        if (onBooksUpdated) {
          onBooksUpdated();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(data.error || 'Failed to normalize genres');
      }
    } catch (error) {
      console.error('Error normalizing genres:', error);
      alert('❌ Failed to normalize genres. Please try again.');
    } finally {
      setIsNormalizing(false);
    }
  };

  const handleStandardizeBooks = async () => {
    if (!confirm('This will standardize authors, titles, and reading status for all books in your library. Continue?')) {
      return;
    }

    setIsStandardizing(true);
    try {
      const response = await fetch('/api/standardize-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Successfully standardized book data!\n\nAuthors: ${data.stats.authorsUpdated}\nTitles: ${data.stats.titlesUpdated}\nStatus: ${data.stats.statusUpdated}\nSeries Extracted: ${data.stats.seriesExtracted}\n\nRefreshing page...`);

        // Refresh the page to show updated data
        if (onBooksUpdated) {
          onBooksUpdated();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(data.error || 'Failed to standardize books');
      }
    } catch (error) {
      console.error('Error standardizing books:', error);
      alert('❌ Failed to standardize books. Please try again.');
    } finally {
      setIsStandardizing(false);
    }
  };
  // Genre Distribution Data - Split compound genres and count individually
  const genreData = books.reduce((acc: { [key: string]: number }, book) => {
    const genreString = book.genre || 'Uncategorized';

    // Split by comma and count each genre separately
    const genres = genreString.split(',').map(g => g.trim());

    genres.forEach(genre => {
      if (genre) {
        acc[genre] = (acc[genre] || 0) + 1;
      }
    });

    return acc;
  }, {});

  // Sort by count and group small genres into "Other"
  const sortedGenres = Object.entries(genreData).sort((a, b) => b[1] - a[1]);
  const topGenresCount = 7; // Show top 7 genres
  const topGenres = sortedGenres.slice(0, topGenresCount);
  const otherGenres = sortedGenres.slice(topGenresCount);

  const genreChartData = [
    ...topGenres.map(([name, value]) => ({ name, value })),
    ...(otherGenres.length > 0
      ? [{ name: 'Other', value: otherGenres.reduce((sum, [, val]) => sum + val, 0) }]
      : []
    )
  ];

  // Books per Month Data (last 12 months)
  const monthlyData: { [key: string]: number } = {};
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyData[monthKey] = 0;
  }

  books.forEach((book) => {
    const dateToUse = book.dateFinished || book.dateAdded;
    const bookDate = new Date(dateToUse);
    const monthKey = bookDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (monthlyData[monthKey] !== undefined) {
      monthlyData[monthKey]++;
    }
  });

  const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    books: count,
  }));

  // Rating Distribution
  const ratingData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating}★`,
    count: books.filter((b) => b.rating === rating).length,
  }));

  // Colors for charts
  const COLORS = ['#8b6f47', '#d4a574', '#5d7052', '#6d8a96', '#c9a961', '#a08968', '#7a9269'];

  // Calculate insights
  const ratedBooks = books.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
    : 'N/A';

  const totalPages = books.reduce((sum, b) => sum + (b.totalPages || 0), 0);
  const avgPages = books.length > 0 ? Math.round(totalPages / books.length) : 0;

  const mostReadGenre = sortedGenres.filter(([name]) => name !== 'Uncategorized')[0]?.[0] || 'None';

  return (
    <div className="mb-8 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl" style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.15)',
      }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-black mb-2" style={{
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-playfair), serif',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              📊 Reading Analytics
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              Insights into your reading journey
            </p>
          </div>
          <button
            onClick={handleStandardizeBooks}
            disabled={isStandardizing}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isStandardizing ? 'var(--text-muted)' : 'var(--warm-brown)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(139, 111, 71, 0.3)',
            }}
          >
            {isStandardizing ? '⏳ Standardizing...' : '🔧 Standardize All Books'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Average Rating" value={avgRating} icon="⭐" />
        <StatCard title="Avg. Pages/Book" value={avgPages.toString()} icon="📄" />
        <StatCard title="Top Genre" value={mostReadGenre} icon="🏆" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books Per Month */}
        <ChartCard title="📈 Books Added Per Month">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 111, 71, 0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6d4c41', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#6d4c41' }} />
              <Tooltip
                contentStyle={{
                  background: '#fdf8f3',
                  border: '1px solid rgba(139, 111, 71, 0.3)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(93, 78, 55, 0.15)'
                }}
              />
              <Bar dataKey="books" fill="#d4a574" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Genre Distribution */}
        <ChartCard
          title="🥧 Genre Distribution"
          action={
            <button
              onClick={handleNormalizeGenres}
              disabled={isNormalizing}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isNormalizing ? 'var(--text-muted)' : 'var(--warm-brown)',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(139, 111, 71, 0.3)',
              }}
            >
              {isNormalizing ? '⏳ Normalizing...' : '✨ Normalize Genres'}
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => {
                  const pct = ((percent ?? 0) * 100).toFixed(0);
                  // Only show label if percentage is >= 5%
                  return parseFloat(pct) >= 5 ? `${name}: ${pct}%` : '';
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genreChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#fdf8f3',
                  border: '1px solid rgba(139, 111, 71, 0.3)',
                  borderRadius: '8px',
                }}
                formatter={(value: number | undefined) => [`${value || 0} books`, 'Count']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating Distribution */}
        <ChartCard title="⭐ Rating Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 111, 71, 0.1)" />
              <XAxis dataKey="rating" tick={{ fill: '#6d4c41' }} />
              <YAxis tick={{ fill: '#6d4c41' }} />
              <Tooltip
                contentStyle={{
                  background: '#fdf8f3',
                  border: '1px solid rgba(139, 111, 71, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#8b6f47" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Rated Books */}
        <ChartCard title="🏆 Top Rated Books">
          <div
            className="space-y-3 max-h-[300px] overflow-y-auto pr-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--warm-brown) transparent',
            }}
          >
            {books
              .filter((b) => b.rating > 0)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((book, idx) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span className="text-2xl font-black" style={{ color: 'var(--warm-brown)' }}>
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text-dark)' }}>
                      {book.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {book.author}
                    </p>
                  </div>
                  <div className="text-lg font-bold flex-shrink-0" style={{ color: 'var(--warm-brown)' }}>
                    {'★'.repeat(book.rating)}
                  </div>
                </div>
              ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px rgba(93, 78, 55, 0.12)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{
          color: 'var(--text-dark)',
          fontFamily: 'var(--font-playfair), serif',
        }}>
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div
      className="rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-2xl font-black" style={{
            color: 'var(--warm-brown)',
            fontFamily: 'var(--font-playfair), serif',
          }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
