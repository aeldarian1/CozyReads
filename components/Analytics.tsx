'use client';

import { Book } from '@/app/page';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Analytics({ books }: { books: Book[] }) {
  // Genre Distribution Data
  const genreData = books.reduce((acc: { [key: string]: number }, book) => {
    const genre = book.genre || 'Uncategorized';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const genreChartData = Object.entries(genreData).map(([name, value]) => ({
    name,
    value,
  }));

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

  const mostReadGenre = Object.entries(genreData).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  return (
    <div className="mb-8 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl" style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.15)',
      }}>
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
        <ChartCard title="🥧 Genre Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
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
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
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
                  <div className="flex-1">
                    <p className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text-dark)' }}>
                      {book.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {book.author}
                    </p>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--warm-brown)' }}>
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px rgba(93, 78, 55, 0.12)',
      }}
    >
      <h3 className="text-xl font-bold mb-4" style={{
        color: 'var(--text-dark)',
        fontFamily: 'var(--font-playfair), serif',
      }}>
        {title}
      </h3>
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
