'use client';

import { useState, useEffect } from 'react';

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalBooksFinished: number;
  booksThisMonth: number;
  booksThisYear: number;
};

export function ReadingStreak() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const response = await fetch('/api/streaks');
      const data = await response.json();
      setStreakData(data);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streakData) {
    return null;
  }

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '📚';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 14) return '🔥🔥🔥';
    return '🔥🔥🔥🔥';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your reading streak today!';
    if (streak === 1) return 'Great start! Keep it going!';
    if (streak < 7) return 'You\'re on fire! Keep reading!';
    if (streak < 30) return 'Amazing streak! You\'re a reading champion!';
    return 'Incredible! You\'re unstoppable!';
  };

  return (
    <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{
      background: 'var(--gradient-card)',
      border: '1px solid var(--border-color)',
    }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-9xl opacity-5" style={{
        transform: 'rotate(15deg)',
        color: 'var(--warm-brown)',
      }}>
        🔥
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
            📅 Reading Streak
          </h3>
          <div className="text-2xl">
            {getStreakEmoji(streakData.currentStreak)}
          </div>
        </div>

        {/* Current Streak */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black" style={{ color: 'var(--warm-brown)' }}>
              {streakData.currentStreak}
            </span>
            <span className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>
              {streakData.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
            {getStreakMessage(streakData.currentStreak)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Longest Streak
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              {streakData.longestStreak}
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              This Month
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              {streakData.booksThisMonth}
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              This Year
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              {streakData.booksThisYear}
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              All Time
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              {streakData.totalBooksFinished}
            </div>
          </div>
        </div>

        {streakData.lastReadDate && (
          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Last read: {new Date(streakData.lastReadDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
