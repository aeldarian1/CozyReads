import { Book } from '@/app/page';

export function StatsCards({ books }: { books: Book[] }) {
  const stats = {
    total: books.length,
    finished: books.filter((b) => b.readingStatus === 'Finished').length,
    reading: books.filter((b) => b.readingStatus === 'Currently Reading').length,
    wantToRead: books.filter((b) => b.readingStatus === 'Want to Read').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Books" value={stats.total} color="purple" />
      <StatCard title="Finished" value={stats.finished} color="green" />
      <StatCard title="Currently Reading" value={stats.reading} color="yellow" />
      <StatCard title="Want to Read" value={stats.wantToRead} color="blue" />
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  const styles = {
    purple: { bg: '#fdf8f3', text: '#8b6f47', icon: '📚' },
    green: { bg: '#f0f7ed', text: '#5d7052', icon: '✓' },
    yellow: { bg: '#fff9ed', text: '#d4a574', icon: '📖' },
    blue: { bg: '#f0f4f8', text: '#5d7896', icon: '💭' },
  };

  const style = styles[color as keyof typeof styles];

  return (
    <div
      className="rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer relative overflow-hidden"
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px rgba(93, 78, 55, 0.15), 0 2px 6px rgba(93, 78, 55, 0.08)'
      }}
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" style={{
        background: 'linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
        transform: 'translateX(-100%)',
      }} />

      <div className="flex items-center gap-4 relative z-10">
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{style.icon}</span>
        <div>
          <h3 className="text-5xl font-black mb-1 group-hover:scale-105 transition-transform duration-300" style={{
            color: 'var(--warm-brown)',
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {value}
          </h3>
          <p className="font-bold text-sm uppercase tracking-wider" style={{
            color: 'var(--text-muted)',
            letterSpacing: '0.1em'
          }}>
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
