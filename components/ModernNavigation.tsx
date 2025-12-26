'use client';

import { UserButton } from '@clerk/nextjs';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

interface ModernNavigationProps {
  onAddBook: () => void;
  onImport: () => void;
}

export function ModernNavigation({ onAddBook, onImport }: ModernNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: '📚', label: 'Library', href: '/', active: true },
    { icon: '💡', label: 'Discover', href: '/recommendations' },
    { icon: '🎯', label: 'Goals', href: '/goals' },
    { icon: '📖', label: 'Series', href: '/series' },
    { icon: '📊', label: 'Statistics', href: '/statistics' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 shadow-2xl"
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h1 className="text-2xl font-black flex items-center gap-3"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: 'var(--text-dark)',
            }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--warm-brown)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            CozyReads
          </h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => window.location.href = item.href}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: item.active ? 'var(--gradient-accent)' : 'transparent',
                color: item.active ? (theme === 'dark' ? '#1a1816' : '#2d1f15') : 'var(--text-dark)',
                fontWeight: item.active ? '700' : '500',
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-4 h-px" style={{ background: 'var(--border-color)' }} />

          {/* Action Buttons */}
          <button
            onClick={onAddBook}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              background: 'var(--gradient-accent)',
              color: theme === 'dark' ? '#1a1816' : '#2d1f15',
              fontWeight: '700',
            }}
          >
            <span className="text-xl">➕</span>
            <span>Add Book</span>
          </button>

          <button
            onClick={onImport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-dark)',
              fontWeight: '600',
            }}
          >
            <span className="text-xl">📥</span>
            <span>Import Books</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 ring-2 ring-offset-2',
                },
              }}
            />
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
              }}
            >
              <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
            <button
              onClick={() => window.location.href = '/settings'}
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
              }}
            >
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 shadow-lg"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-black flex items-center gap-2"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: 'var(--text-dark)',
            }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: 'var(--warm-brown)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            CozyReads
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
              }}
            >
              <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
              }}
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 p-4 shadow-xl animate-fadeIn"
            style={{
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    window.location.href = item.href;
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{
                    background: item.active ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                    color: item.active ? (theme === 'dark' ? '#1a1816' : '#2d1f15') : 'var(--text-dark)',
                    fontWeight: item.active ? '700' : '600',
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="h-px my-2" style={{ background: 'var(--border-color)' }} />

              <button
                onClick={() => {
                  onAddBook();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
                style={{
                  background: 'var(--gradient-accent)',
                  color: theme === 'dark' ? '#1a1816' : '#2d1f15',
                  fontWeight: '700',
                }}
              >
                <span className="text-xl">➕</span>
                <span>Add Book</span>
              </button>

              <button
                onClick={() => {
                  onImport();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-dark)',
                  fontWeight: '600',
                }}
              >
                <span className="text-xl">📥</span>
                <span>Import Books</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 shadow-2xl"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.href}
              onClick={() => window.location.href = item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all"
              style={{
                color: item.active ? 'var(--warm-brown)' : 'var(--text-muted)',
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
