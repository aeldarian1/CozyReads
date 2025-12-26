'use client';

import { UserButton } from '@clerk/nextjs';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Lightbulb,
  Target,
  LibraryBig,
  BarChart3,
  Plus,
  Download,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';

interface ModernNavigationProps {
  onAddBook: () => void;
  onImport: () => void;
}

export function ModernNavigation({ onAddBook, onImport }: ModernNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: BookOpen, label: 'Library', href: '/' },
    { icon: Lightbulb, label: 'Discover', href: '/recommendations' },
    { icon: Target, label: 'Goals', href: '/goals' },
    { icon: LibraryBig, label: 'Series', href: '/series' },
    { icon: BarChart3, label: 'Statistics', href: '/statistics' },
  ];

  return (
    <>
      {/* Desktop Sidebar with Glassmorphism */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 shadow-2xl backdrop-blur-xl"
        style={{
          background: theme === 'dark'
            ? 'rgba(37, 35, 33, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          borderRight: theme === 'dark'
            ? '1px solid rgba(212, 165, 116, 0.2)'
            : '1px solid rgba(139, 111, 71, 0.2)',
          boxShadow: theme === 'dark'
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            : '0 8px 32px 0 rgba(139, 111, 71, 0.15)',
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
            <BookOpen className="w-8 h-8" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
            CozyReads
          </h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: isActive ? 'var(--gradient-accent)' : 'transparent',
                  color: isActive ? (theme === 'dark' ? '#1a1816' : '#2d1f15') : 'var(--text-dark)',
                  fontWeight: isActive ? '700' : '500',
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}

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
            <Plus className="w-5 h-5" strokeWidth={2} />
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
            <Download className="w-5 h-5" strokeWidth={2} />
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
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link
              href="/settings"
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
              }}
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
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
            <BookOpen className="w-6 h-6" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
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
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
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
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-transform duration-300"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
                transform: isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu with Glassmorphism */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 p-4 shadow-xl animate-fadeIn backdrop-blur-xl"
            style={{
              background: theme === 'dark'
                ? 'rgba(37, 35, 33, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderTop: theme === 'dark'
                ? '1px solid rgba(212, 165, 116, 0.3)'
                : '1px solid rgba(139, 111, 71, 0.3)',
              boxShadow: theme === 'dark'
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
                : '0 8px 32px 0 rgba(139, 111, 71, 0.2)',
            }}
          >
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: isActive ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                      color: isActive ? (theme === 'dark' ? '#1a1816' : '#2d1f15') : 'var(--text-dark)',
                      fontWeight: isActive ? '700' : '600',
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

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
                <Plus className="w-5 h-5" strokeWidth={2} />
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
                <Download className="w-5 h-5" strokeWidth={2} />
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
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all"
                style={{
                  color: isActive ? 'var(--warm-brown)' : 'var(--text-muted)',
                }}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
