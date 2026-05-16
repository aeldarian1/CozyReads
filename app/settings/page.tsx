'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

type UserSettings = {
  // Display Preferences
  defaultView: 'grid' | 'bookshelf';
  booksPerPage: number;
  defaultSort: string;

  // Reading Preferences
  defaultReadingStatus: string;
  autoEnrichBooks: boolean;

  // Privacy & Data
  showReadingStats: boolean;
  enableExportReminders: boolean;

  // Notifications (future feature)
  enableReadingReminders: boolean;
  reminderTime: string;
  enableStreakNotifications: boolean;
  enableGoalNotifications: boolean;
};

const DEFAULT_SETTINGS: UserSettings = {
  defaultView: 'grid',
  booksPerPage: 20,
  defaultSort: 'dateAdded',
  defaultReadingStatus: 'Want to Read',
  autoEnrichBooks: true,
  showReadingStats: true,
  enableExportReminders: false,
  enableReadingReminders: false,
  reminderTime: '09:00',
  enableStreakNotifications: true,
  enableGoalNotifications: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('userSettings', JSON.stringify(DEFAULT_SETTINGS));
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--warm-brown)' }}></div>
          <p style={{ color: 'var(--text-dark)' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

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
                ⚙️ Settings
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                Customize your reading experience
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Display Preferences */}
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)',
          }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
              <span>🎨</span>
              Display Preferences
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Default View Mode
                </label>
                <select
                  value={settings.defaultView}
                  onChange={(e) => setSettings({ ...settings, defaultView: e.target.value as 'grid' | 'bookshelf' })}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-dark)',
                  }}
                >
                  <option value="grid">Grid View</option>
                  <option value="bookshelf">Bookshelf View</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Books Per Page
                </label>
                <select
                  value={settings.booksPerPage}
                  onChange={(e) => setSettings({ ...settings, booksPerPage: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-dark)',
                  }}
                >
                  <option value="10">10 books</option>
                  <option value="20">20 books</option>
                  <option value="50">50 books</option>
                  <option value="100">100 books</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Default Sort Order
                </label>
                <select
                  value={settings.defaultSort}
                  onChange={(e) => setSettings({ ...settings, defaultSort: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-dark)',
                  }}
                >
                  <option value="dateAdded">Date Added (Newest)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="author">Author (A-Z)</option>
                  <option value="rating">Rating (Highest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reading Preferences */}
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)',
          }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
              <span>📚</span>
              Reading Preferences
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm" style={{ color: 'var(--text-dark)' }}>
                  Default Reading Status for New Books
                </label>
                <select
                  value={settings.defaultReadingStatus}
                  onChange={(e) => setSettings({ ...settings, defaultReadingStatus: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-dark)',
                  }}
                >
                  <option value="Want to Read">Want to Read</option>
                  <option value="Reading">Currently Reading</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-70" style={{
                background: 'var(--bg-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={settings.autoEnrichBooks}
                  onChange={(e) => setSettings({ ...settings, autoEnrichBooks: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    Auto-Enrich Books from Google Books
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Automatically fetch covers, descriptions, and metadata when adding books
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)',
          }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
              <span>🔒</span>
              Privacy & Data
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-70" style={{
                background: 'var(--bg-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={settings.showReadingStats}
                  onChange={(e) => setSettings({ ...settings, showReadingStats: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    Show Reading Statistics
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Display stats cards and analytics on the dashboard
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-opacity-70" style={{
                background: 'var(--bg-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={settings.enableExportReminders}
                  onChange={(e) => setSettings({ ...settings, enableExportReminders: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    Monthly Export Reminders
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Get reminded to backup your library data monthly
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Notifications (Future Feature) */}
          <div className="rounded-2xl p-6 shadow-lg" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)',
          }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
              <span>🔔</span>
              Notifications
              <span className="text-xs px-2 py-1 rounded-full" style={{
                background: 'rgba(139, 111, 71, 0.2)',
                color: 'var(--warm-brown)',
                fontWeight: 'normal',
              }}>
                Coming Soon
              </span>
            </h2>

            <div className="space-y-3 opacity-50">
              <label className="flex items-center gap-3 cursor-not-allowed p-3 rounded-xl" style={{
                background: 'var(--bg-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={settings.enableReadingReminders}
                  disabled
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    Daily Reading Reminders
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Get reminded to read at your preferred time
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-not-allowed p-3 rounded-xl" style={{
                background: 'var(--bg-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={settings.enableStreakNotifications}
                  disabled
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    Streak Notifications
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Get notified about your reading streaks and milestones
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-not-allowed p-3 rounded-xl" style={{
                background: 'var(--bg-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={settings.enableGoalNotifications}
                  disabled
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    Goal Progress Updates
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Get notified about reading goal milestones
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{
                background: 'var(--gradient-accent)',
                color: 'var(--text-dark)',
              }}
            >
              {saving ? 'Saving...' : savedMessage ? '✓ Saved!' : 'Save Settings'}
            </button>

            <button
              onClick={resetToDefaults}
              className="px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)',
              }}
            >
              Reset to Defaults
            </button>
          </div>

          {savedMessage && (
            <div className="p-4 rounded-xl text-center" style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              <p className="font-semibold" style={{ color: '#15803d' }}>
                ✓ Settings saved successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
