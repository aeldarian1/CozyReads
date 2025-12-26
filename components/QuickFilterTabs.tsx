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
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
              style={{
                background: isActive ? tab.color : 'var(--bg-secondary)',
                border: `2px solid ${isActive ? tab.color : 'var(--border-color)'}`,
                color: isActive ? '#ffffff' : 'var(--text-dark)',
                fontWeight: isActive ? '700' : '600',
                boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none',
              }}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span>{tab.label}</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
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
