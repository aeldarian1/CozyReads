'use client';

import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'A', description: 'Add new book' },
    { key: 'I', description: 'Import from Goodreads' },
    { key: '/', description: 'Focus search' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Close modals/overlays' },
    { key: '←/→', description: 'Navigate pages' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full shadow-elevation-5 animate-scaleIn backdrop-blur-xl"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-8 h-8" style={{ color: 'var(--warm-brown)' }} />
            <h2
              className="text-2xl font-bold"
              style={{
                color: 'var(--text-dark)',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-dark)' }} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-dark)' }}>
                {shortcut.description}
              </span>
              <kbd
                className="px-3 py-1.5 rounded-md text-xs font-mono font-bold shadow-sm"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--warm-brown)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Press <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'var(--bg-tertiary)' }}>?</kbd> anytime to see this help
        </p>
      </div>
    </div>
  );
}
