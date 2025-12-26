'use client';

import { useEffect, useState } from 'react';

export type ViewMode = 'grid' | 'bookshelf';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg p-1" style={{
      background: 'rgba(139, 111, 71, 0.1)',
      border: '1px solid rgba(139, 111, 71, 0.2)',
    }}>
      {/* Grid View Button */}
      <button
        onClick={() => onViewChange('grid')}
        className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
          currentView === 'grid' ? 'shadow-md' : 'hover:bg-opacity-50'
        }`}
        style={{
          background: currentView === 'grid' ? 'var(--gradient-accent)' : 'transparent',
          color: currentView === 'grid' ? 'var(--bg-primary)' : 'var(--text-dark)',
        }}
        title="Grid View"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="hidden sm:inline font-semibold text-sm">Grid</span>
      </button>

      {/* Bookshelf View Button */}
      <button
        onClick={() => onViewChange('bookshelf')}
        className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
          currentView === 'bookshelf' ? 'shadow-md' : 'hover:bg-opacity-50'
        }`}
        style={{
          background: currentView === 'bookshelf' ? 'var(--gradient-accent)' : 'transparent',
          color: currentView === 'bookshelf' ? 'var(--bg-primary)' : 'var(--text-dark)',
        }}
        title="Bookshelf View"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="hidden sm:inline font-semibold text-sm">Shelf</span>
      </button>
    </div>
  );
}
