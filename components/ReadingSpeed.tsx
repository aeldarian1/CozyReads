'use client';

import { useState, useEffect } from 'react';

type ReadingSpeedData = {
  averagePagesPerDay: number;
  averageBooksPerMonth: number;
  totalPagesRead: number;
  estimatedHoursRead: number;
  readingVelocity: string;
  recentBooksCount: number;
  recentPagesRead: number;
  monthlyTrend: 'up' | 'down' | 'stable';
  totalBooksFinished: number;
  message?: string;
};

export function ReadingSpeed() {
  const [speedData, setSpeedData] = useState<ReadingSpeedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpeedData();
  }, []);

  const loadSpeedData = async () => {
    try {
      const response = await fetch('/api/reading-speed');
      const data = await response.json();
      setSpeedData(data);
    } catch (error) {
      console.error('Error loading reading speed data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !speedData) {
    return null;
  }

  if (speedData.message) {
    return null; // Don't show if no data
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#15803d';
      case 'down': return '#b91c1c';
      default: return 'var(--text-muted)';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return 'Reading more!';
      case 'down': return 'Slowing down';
      default: return 'Steady pace';
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{
      background: 'var(--gradient-card)',
      border: '1px solid var(--border-color)',
    }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-9xl opacity-5" style={{
        transform: 'rotate(-15deg)',
        color: 'var(--warm-brown)',
      }}>
        ⚡
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
            ⚡ Reading Speed
          </h3>
          <div className="px-3 py-1 rounded-full text-sm font-bold" style={{
            background: 'linear-gradient(135deg, #d4a574 0%, #c89b65 100%)',
            color: '#2d1f15',
          }}>
            {speedData.readingVelocity}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📖</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Pages/Day
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color: 'var(--warm-brown)' }}>
              {speedData.averagePagesPerDay}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📚</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Books/Month
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color: 'var(--warm-brown)' }}>
              {speedData.averageBooksPerMonth}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📄</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Total Pages
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              {speedData.totalPagesRead.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⏱️</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Est. Hours
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              {speedData.estimatedHoursRead}h
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(201, 169, 97, 0.1) 100%)',
          border: '1px solid var(--border-color)',
        }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>{getTrendIcon(speedData.monthlyTrend)}</span>
              <span className="font-bold text-sm" style={{ color: 'var(--text-dark)' }}>
                Last 30 Days
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{
              background: 'rgba(139, 111, 71, 0.1)',
              color: getTrendColor(speedData.monthlyTrend),
            }}>
              {getTrendText(speedData.monthlyTrend)}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Books: </span>
              <span className="font-bold" style={{ color: 'var(--text-dark)' }}>
                {speedData.recentBooksCount}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pages: </span>
              <span className="font-bold" style={{ color: 'var(--text-dark)' }}>
                {speedData.recentPagesRead}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
