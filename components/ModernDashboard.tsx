'use client';

import { Book } from '@/lib/hooks/useBooks';

interface ModernDashboardProps {
  currentlyReading: Book[];
  stats: {
    totalBooks: number;
    booksRead: number;
    pagesRead: number;
    currentStreak: number;
  };
}

export function ModernDashboard({ currentlyReading, stats }: ModernDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Books"
          value={stats.totalBooks}
          icon="📚"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="Books Read"
          value={stats.booksRead}
          icon="✓"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          label="Pages Read"
          value={stats.pagesRead}
          icon="📖"
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          label="Day Streak"
          value={stats.currentStreak}
          icon="🔥"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Currently Reading Section */}
      {currentlyReading.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
            <span className="text-3xl">📖</span>
            Currently Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentlyReading.map((book) => (
              <CurrentlyReadingCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number | string;
  icon: string;
  gradient: string;
}) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className="rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{
        background: `linear-gradient(135deg, var(--${gradient}))`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <div className="text-right">
          <div className="text-3xl font-black">{displayValue}</div>
        </div>
      </div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
    </div>
  );
}

function CurrentlyReadingCard({ book }: { book: Book }) {
  const progress = book.currentPage && book.totalPages
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex gap-4 p-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div
              className="w-20 h-28 rounded-lg flex items-center justify-center text-3xl"
              style={{ background: 'var(--warm-brown)', color: '#fff' }}
            >
              📚
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-lg mb-1 truncate"
            style={{ color: 'var(--text-dark)' }}
          >
            {book.title}
          </h3>
          <p
            className="text-sm mb-3 truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {book.author}
          </p>

          {/* Progress Bar */}
          {book.totalPages && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {book.currentPage || 0} / {book.totalPages} pages
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--warm-brown)' }}>
                  {progress}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--warm-brown), var(--gold))',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
