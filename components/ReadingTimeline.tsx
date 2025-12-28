'use client';

import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, TrendingUp } from 'lucide-react';

interface ReadingSession {
  id: string;
  bookId: string;
  startPage?: number | null;
  endPage?: number | null;
  pagesRead?: number | null;
  duration?: number | null;
  sessionDate: string;
  notes?: string | null;
  book: {
    title: string;
    author: string;
    coverUrl?: string | null;
  };
}

export function ReadingTimeline() {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPages: 0,
    totalMinutes: 0,
    booksRead: 0,
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reading-sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error loading reading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const groupSessionsByDate = (sessions: ReadingSession[]) => {
    const grouped: { [key: string]: ReadingSession[] } = {};

    sessions.forEach(session => {
      const date = new Date(session.sessionDate).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

  const groupedSessions = groupSessionsByDate(sessions);
  const dates = Object.keys(groupedSessions).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Reading Sessions"
          value={stats.totalSessions}
          color="#c9a961"
        />
        <StatCard
          icon={TrendingUp}
          label="Pages Read"
          value={stats.totalPages}
          color="#8b6f47"
        />
        <StatCard
          icon={Clock}
          label="Minutes Reading"
          value={stats.totalMinutes}
          color="#d4a574"
        />
        <StatCard
          icon={BookOpen}
          label="Books"
          value={stats.booksRead}
          color="#a08968"
        />
      </div>

      {/* Timeline */}
      <div
        className="rounded-2xl p-6 shadow-elevation-3"
        style={{
          background: 'var(--gradient-card)',
          border: '2px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
          <h2
            className="text-2xl font-black"
            style={{ color: 'var(--text-dark)', fontFamily: 'Playfair Display, serif' }}
          >
            Reading Timeline
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading your reading history...
          </div>
        ) : sessions.length === 0 ? (
          <div
            className="text-center py-12 px-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 111, 71, 0.05), rgba(139, 111, 71, 0.1))',
              border: '2px dashed rgba(139, 111, 71, 0.3)',
            }}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#8b6f47', opacity: 0.3 }} strokeWidth={1.5} />
            <p className="text-gray-600 font-medium">
              No reading sessions yet. Start reading to build your timeline!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 mb-4">
                  <div
                    className="inline-block px-4 py-2 rounded-xl font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, var(--warm-brown), var(--gold))',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(201, 169, 97, 0.3)',
                    }}
                  >
                    {formatDate(date)}
                  </div>
                </div>

                {/* Sessions for this date */}
                <div className="space-y-4 pl-4 border-l-4" style={{ borderColor: 'var(--warm-brown)' }}>
                  {groupedSessions[date].map((session, idx) => (
                    <div
                      key={session.id}
                      className="relative pl-6 pb-4 group"
                      style={{
                        borderLeft: idx < groupedSessions[date].length - 1 ? '2px dashed rgba(139, 111, 71, 0.2)' : 'none',
                        marginLeft: '-4px',
                      }}
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute left-0 top-2 w-4 h-4 rounded-full border-4"
                        style={{
                          background: 'var(--warm-brown)',
                          borderColor: 'var(--bg-primary)',
                          marginLeft: '-10px',
                        }}
                      />

                      {/* Session Card */}
                      <div
                        className="rounded-xl p-4 transition-all duration-300 group-hover:shadow-lg"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div className="flex gap-4">
                          {/* Book Cover */}
                          {session.book.coverUrl && (
                            <div className="flex-shrink-0">
                              <img
                                src={session.book.coverUrl}
                                alt={session.book.title}
                                className="w-16 h-24 object-cover rounded shadow-md"
                              />
                            </div>
                          )}

                          {/* Session Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-bold text-lg truncate"
                                  style={{ color: 'var(--text-dark)' }}
                                >
                                  {session.book.title}
                                </h3>
                                <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                                  {session.book.author}
                                </p>
                              </div>
                              <span
                                className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                                style={{
                                  background: 'rgba(139, 111, 71, 0.1)',
                                  color: 'var(--warm-brown)',
                                }}
                              >
                                {formatTime(session.sessionDate)}
                              </span>
                            </div>

                            {/* Reading Stats */}
                            <div className="flex flex-wrap gap-3 mb-2">
                              {session.pagesRead != null && session.pagesRead > 0 && (
                                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                  <BookOpen className="w-4 h-4" strokeWidth={2} />
                                  <span>{session.pagesRead} pages</span>
                                </div>
                              )}
                              {session.duration != null && session.duration > 0 && (
                                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                  <Clock className="w-4 h-4" strokeWidth={2} />
                                  <span>{session.duration} min</span>
                                </div>
                              )}
                              {session.startPage !== null && session.endPage !== null && (
                                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                  <span>pp. {session.startPage}-{session.endPage}</span>
                                </div>
                              )}
                            </div>

                            {/* Session Notes */}
                            {session.notes && (
                              <p
                                className="text-sm italic mt-2 p-2 rounded"
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                "{session.notes}"
                              </p>
                            )}
                          </div>
                        </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; color?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 hover:scale-105"
      style={{
        background: 'var(--gradient-card)',
        border: '2px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="p-2 rounded-lg"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-5 h-5" color={color} strokeWidth={2.5} />
        </div>
        <div className="text-3xl font-black" style={{ color }}>
          {value.toLocaleString()}
        </div>
      </div>
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  );
}
