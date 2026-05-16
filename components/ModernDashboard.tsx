'use client';

import { Book } from '@/lib/hooks/useBooks';
import { BookOpen, CheckCircle2, BookMarked, Flame } from 'lucide-react';
import { useCountUp } from '@/lib/hooks/useCountUp';

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
    <div className="space-y-6 mb-8">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Books"
          value={stats.totalBooks}
          Icon={BookOpen}
          gradient="from-warm-brown to-light-brown"
          delay={0}
        />
        <StatCard
          label="Books Read"
          value={stats.booksRead}
          Icon={CheckCircle2}
          gradient="from-gold to-amber"
          delay={100}
        />
        <StatCard
          label="Pages Read"
          value={stats.pagesRead}
          Icon={BookMarked}
          gradient="from-terracotta to-rust"
          delay={200}
        />
        <StatCard
          label="Day Streak"
          value={stats.currentStreak}
          Icon={Flame}
          gradient="from-deep-brown to-warm-brown"
          delay={300}
        />
      </div>

      {/* Currently Reading Section */}
      {currentlyReading.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
            <BookMarked className="w-8 h-8" style={{ color: 'var(--warm-brown)' }} />
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
  Icon,
  gradient,
  delay = 0,
}: {
  label: string;
  value: number | string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  gradient: string;
  delay?: number;
}) {
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace(/,/g, ''), 10) || 0;
  const animatedValue = useCountUp(numericValue, 1200, delay);
  const displayValue = typeof value === 'string' ? value : animatedValue.toLocaleString();

  const gradientMap: Record<string, string> = {
    'from-warm-brown to-light-brown': 'linear-gradient(135deg, #8b6f47 0%, #a88a5a 100%)',
    'from-gold to-amber': 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
    'from-terracotta to-rust': 'linear-gradient(135deg, #c17767 0%, #d4896e 100%)',
    'from-deep-brown to-warm-brown': 'linear-gradient(135deg, #6b5539 0%, #8b6f47 100%)',
  };

  return (
    <div
      className="rounded-2xl p-6 text-white shadow-elevation-3 hover:shadow-elevation-5 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer animate-fadeIn group"
      style={{
        background: gradientMap[gradient] || gradient,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <div className="text-4xl font-black tracking-tight">{displayValue}</div>
        </div>
      </div>
      <div className="text-sm font-bold opacity-95 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function CurrentlyReadingCard({ book }: { book: Book }) {
  const progress = book.currentPage && book.totalPages
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer group"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex gap-4 p-5">
        {/* Book Cover */}
        <div className="flex-shrink-0 relative">
          {book.coverUrl ? (
            <div className="relative">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-24 h-32 object-cover rounded-xl shadow-elevation-3 group-hover:shadow-elevation-4 transition-shadow"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div
              className="w-24 h-32 rounded-xl flex items-center justify-center shadow-elevation-2"
              style={{ background: 'linear-gradient(135deg, var(--warm-brown), var(--gold))', color: '#fff' }}
            >
              <BookOpen className="w-12 h-12" strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3
              className="font-bold text-lg mb-1 line-clamp-2 leading-tight"
              style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}
            >
              {book.title}
            </h3>
            <p
              className="text-sm mb-3 truncate font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {book.author}
            </p>
          </div>

          {/* Progress Bar */}
          {book.totalPages && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  {book.currentPage || 0} / {book.totalPages} pages
                </span>
                <span className="text-sm font-black px-2 py-0.5 rounded-full" style={{
                  background: 'var(--warm-brown)',
                  color: 'white'
                }}>
                  {progress}%
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden shadow-inner" style={{ background: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #8b6f47, #c9a961)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
