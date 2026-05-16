'use client';

import { BookOpen, Clock, CheckCircle, Library } from 'lucide-react';

interface QuickFilterTabsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    wantToRead: number;
    currentlyReading: number;
    finished: number;
  };
}

export function QuickFilterTabs({ currentFilter, onFilterChange, counts }: QuickFilterTabsProps) {
  const tabs = [
    { id: '', label: 'All Books', icon: Library, count: counts.all, color: '#8b6f47' },
    { id: 'Want to Read', label: 'Want to Read', icon: BookOpen, count: counts.wantToRead, color: '#3b82f6' },
    { id: 'Currently Reading', label: 'Reading', icon: Clock, count: counts.currentlyReading, color: '#eab308' },
    { id: 'Finished', label: 'Finished', icon: CheckCircle, count: counts.finished, color: '#22c55e' },
  ];

  return (
    <div className="mb-6 overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 whitespace-nowrap group relative overflow-hidden"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${tab.color} 0%, ${tab.color}dd 100%)`
                  : 'var(--bg-secondary)',
                border: `2px solid ${isActive ? tab.color : 'var(--border-color)'}`,
                color: isActive ? '#ffffff' : 'var(--text-dark)',
                fontWeight: isActive ? '700' : '600',
                boxShadow: isActive
                  ? `0 8px 20px ${tab.color}50, 0 4px 8px ${tab.color}30`
                  : '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {/* Shine effect on active */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}

              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-transparent'} transition-colors`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold">{tab.label}</span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-black min-w-[28px] text-center shadow-sm"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-tertiary)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
