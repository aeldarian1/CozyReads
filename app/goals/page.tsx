'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

type GoalProgress = {
  hasGoal: boolean;
  year: number;
  goal?: {
    targetBooks: number;
    targetPages: number | null;
    description: string | null;
  };
  progress?: {
    booksRead: number;
    pagesRead: number;
    percentageBooks: number;
    percentagePages: number | null;
    booksRemaining: number;
    pagesRemaining: number | null;
    booksAheadBehind: number;
    pagesAheadBehind: number;
    isPaceGood: boolean;
  };
  monthlyProgress?: { month: string; count: number }[];
  recentBooks?: any[];
};

export default function GoalsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [goalProgress, setGoalProgress] = useState<GoalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    targetBooks: '',
    targetPages: '',
    description: '',
  });

  useEffect(() => {
    loadGoalProgress();
  }, []);

  const loadGoalProgress = async () => {
    try {
      const year = new Date().getFullYear();
      const response = await fetch(`/api/goals/progress?year=${year}`);
      const data = await response.json();
      setGoalProgress(data);

      if (data.hasGoal) {
        setFormData({
          year: year.toString(),
          targetBooks: data.goal.targetBooks.toString(),
          targetPages: data.goal.targetPages?.toString() || '',
          description: data.goal.description || '',
        });
      }
    } catch (error) {
      console.error('Error loading goal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowEditModal(false);
      loadGoalProgress();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--warm-brown)' }}></div>
          <p style={{ color: 'var(--text-dark)' }}>Loading goals...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const maxMonthlyCount = goalProgress?.monthlyProgress
    ? Math.max(...goalProgress.monthlyProgress.map(m => m.count), 1)
    : 1;

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
                🎯 Reading Goals {currentYear}
              </h1>
              <p className="text-amber-100 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                Track your reading progress and stay motivated
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'var(--text-dark)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {goalProgress?.hasGoal ? '✏️ Edit Goal' : '➕ Set Goal'}
              </button>
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
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!goalProgress?.hasGoal ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
              No reading goal set for {currentYear}
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Set a goal to track your reading progress throughout the year
            </p>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              style={{
                background: 'var(--gradient-accent)',
                color: 'var(--text-dark)',
              }}
            >
              ➕ Set Your {currentYear} Goal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Books Progress */}
              <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden" style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--border-color)',
              }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                  📚 Books Progress
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-black mb-1" style={{ color: 'var(--warm-brown)' }}>
                      {goalProgress.progress!.booksRead} / {goalProgress.goal!.targetBooks}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {goalProgress.progress!.booksRemaining} books remaining
                    </div>
                  </div>
                  <div className="relative" style={{ width: '100px', height: '100px' }}>
                    <svg className="transform -rotate-90" width="100" height="100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(139, 111, 71, 0.2)" strokeWidth="8" fill="none" />
                      <circle
                        cx="50" cy="50" r="40"
                        stroke="#d4a574"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - goalProgress.progress!.percentageBooks / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>
                        {goalProgress.progress!.percentageBooks}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${goalProgress.progress!.isPaceGood ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {goalProgress.progress!.isPaceGood ? '✓' : '⚠️'} You're {Math.abs(goalProgress.progress!.booksAheadBehind)} book{Math.abs(goalProgress.progress!.booksAheadBehind) !== 1 ? 's' : ''} {goalProgress.progress!.isPaceGood ? 'ahead' : 'behind'} pace
                </div>
              </div>

              {/* Pages Progress (if set) */}
              {goalProgress.goal!.targetPages && (
                <div className="rounded-2xl p-6 shadow-lg" style={{
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--border-color)',
                }}>
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                    📖 Pages Progress
                  </h2>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-4xl font-black mb-1" style={{ color: 'var(--warm-brown)' }}>
                        {goalProgress.progress!.pagesRead.toLocaleString()} / {goalProgress.goal!.targetPages.toLocaleString()}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {goalProgress.progress!.pagesRemaining!.toLocaleString()} pages remaining
                      </div>
                    </div>
                    <div className="relative" style={{ width: '100px', height: '100px' }}>
                      <svg className="transform -rotate-90" width="100" height="100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(139, 111, 71, 0.2)" strokeWidth="8" fill="none" />
                        <circle
                          cx="50" cy="50" r="40"
                          stroke="#6d8a96"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - (goalProgress.progress!.percentagePages || 0) / 100)}`}
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>
                          {goalProgress.progress!.percentagePages}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly Progress Chart */}
            <div className="rounded-2xl p-6 shadow-lg" style={{
              background: 'var(--gradient-card)',
              border: '1px solid var(--border-color)',
            }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-dark)' }}>
                Monthly Reading Progress
              </h2>
              <div className="flex items-end justify-between h-48 gap-2">
                {goalProgress.monthlyProgress!.map(({ month, count }) => (
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
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {month}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Books */}
            {goalProgress.recentBooks && goalProgress.recentBooks.length > 0 && (
              <div className="rounded-2xl p-6 shadow-lg" style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--border-color)',
              }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                  Recently Finished
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {goalProgress.recentBooks.map((book) => (
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
                        <p className="font-bold text-sm line-clamp-2 mb-1" style={{ color: 'var(--text-dark)' }}>
                          {book.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {book.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Goal Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl max-w-md w-full p-8 shadow-2xl" style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-dark)' }}>
              {goalProgress?.hasGoal ? 'Edit' : 'Set'} Reading Goal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Target Books *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.targetBooks}
                  onChange={(e) => setFormData({ ...formData, targetBooks: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                  placeholder="e.g., 52"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Target Pages (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.targetPages}
                  onChange={(e) => setFormData({ ...formData, targetPages: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                  placeholder="e.g., 20000"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                  placeholder="What's your motivation?"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-dark)',
                  border: '1px solid var(--border-color)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'var(--text-dark)',
                }}
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
