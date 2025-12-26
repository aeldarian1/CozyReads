'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

type Recommendation = {
  type: string;
  title: string;
  description: string;
  items: string[];
};

type RecommendationData = {
  recommendations: Recommendation[];
  stats?: {
    totalBooks: number;
    favoriteGenres: string[];
    favoriteAuthors: string[];
  };
  message?: string;
};

export default function RecommendationsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--warm-brown)' }}></div>
          <p style={{ color: 'var(--text-dark)' }}>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'favorite_authors': return '✍️';
      case 'favorite_genres': return '🎭';
      case 'incomplete_series': return '📚';
      case 'explore_new': return '🔍';
      case 'reading_challenge': return '🏆';
      default: return '💡';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'favorite_authors': return 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)';
      case 'favorite_genres': return 'linear-gradient(135deg, #d4a574 0%, #c89b65 100%)';
      case 'incomplete_series': return 'linear-gradient(135deg, #6d8a96 0%, #5d7052 100%)';
      case 'explore_new': return 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)';
      case 'reading_challenge': return 'linear-gradient(135deg, #5d7052 0%, #6d8a96 100%)';
      default: return 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)';
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-50 mb-2" style={{
                fontFamily: 'Playfair Display, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                💡 Recommendations
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                Personalized suggestions based on your reading history
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {data?.message ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
              {data.message}
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Add more books to your library to get personalized recommendations
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              style={{
                background: 'var(--gradient-accent)',
                color: 'var(--text-dark)',
              }}
            >
              Start Adding Books
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            {data?.stats && (
              <div className="rounded-2xl p-6 shadow-lg mb-8" style={{
                background: 'var(--gradient-card)',
                border: '1px solid var(--border-color)',
              }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                  Your Reading Profile
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                      Total Books
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
                      {data.stats.totalBooks}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                      Favorite Genres
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--warm-brown)' }}>
                      {data.stats.favoriteGenres.join(', ') || 'None yet'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                      Favorite Authors
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--warm-brown)' }}>
                      {data.stats.favoriteAuthors.join(', ') || 'None yet'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {data?.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                      style={{
                        background: getColor(rec.type),
                      }}
                    >
                      {getIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1" style={{
                        color: 'var(--text-dark)',
                        fontFamily: 'Merriweather, serif'
                      }}>
                        {rec.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {rec.items.map((item, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl transition-all hover:scale-102"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                            {item}
                          </span>
                          {rec.type === 'favorite_genres' || rec.type === 'explore_new' ? (
                            <button
                              onClick={() => router.push(`/?genre=${encodeURIComponent(item)}`)}
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                background: 'var(--gradient-accent)',
                                color: 'var(--text-dark)',
                              }}
                            >
                              Browse
                            </button>
                          ) : rec.type === 'favorite_authors' ? (
                            <button
                              onClick={() => router.push(`/?author=${encodeURIComponent(item)}`)}
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                background: 'var(--gradient-accent)',
                                color: 'var(--text-dark)',
                              }}
                            >
                              Browse
                            </button>
                          ) : rec.type === 'incomplete_series' ? (
                            <button
                              onClick={() => router.push('/series')}
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                background: 'var(--gradient-accent)',
                                color: 'var(--text-dark)',
                              }}
                            >
                              View Series
                            </button>
                          ) : rec.type === 'reading_challenge' ? (
                            <button
                              onClick={() => router.push('/goals')}
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                background: 'var(--gradient-accent)',
                                color: 'var(--text-dark)',
                              }}
                            >
                              Set Goal
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
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
