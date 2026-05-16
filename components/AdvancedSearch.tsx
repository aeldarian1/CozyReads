'use client';

import { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export type AdvancedFilters = {
  searchQuery: string;
  searchFields: string[]; // Which fields to search in
  statusFilter: string;
  ratingRange: [number, number];
  pageRange: [number, number];
  dateAddedFrom: string;
  dateAddedTo: string;
  dateFinishedFrom: string;
  dateFinishedTo: string;
  genreFilter: string;
  collectionFilter: string;
};

type AdvancedSearchProps = {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
  availableGenres: string[];
  availableCollections: { id: string; name: string; icon: string; color: string }[];
};

export function AdvancedSearch({
  filters,
  onFiltersChange,
  onClearFilters,
  availableGenres,
  availableCollections,
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSearchField = (field: string) => {
    const fields = filters.searchFields.includes(field)
      ? filters.searchFields.filter((f) => f !== field)
      : [...filters.searchFields, field];
    updateFilter('searchFields', fields);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.statusFilter ||
    filters.ratingRange[0] > 0 ||
    filters.ratingRange[1] < 5 ||
    filters.pageRange[0] > 0 ||
    filters.pageRange[1] < 2000 ||
    filters.dateAddedFrom ||
    filters.dateAddedTo ||
    filters.dateFinishedFrom ||
    filters.dateFinishedTo ||
    filters.genreFilter ||
    filters.collectionFilter;

  return (
    <div className="mb-6 rounded-2xl overflow-hidden shadow-elevation-3 backdrop-blur-xl group" style={{
      background: 'var(--gradient-card)',
      border: '2px solid var(--border-color)'
    }}>
      {/* Header */}
      <div
        className="p-5 cursor-pointer flex items-center justify-between transition-all duration-300 hover:shadow-elevation-4 relative overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'var(--gradient-accent)' }}
      >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2.5 rounded-xl bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-colors">
            <Search className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-white" style={{
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            Advanced Search
          </h3>
          {hasActiveFilters && (
            <span className="px-3 py-1.5 rounded-full text-xs font-black animate-fadeIn shadow-lg" style={{
              background: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              {/* Count active filters */}
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 relative z-10">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <X className="w-4 h-4" strokeWidth={3} />
              Clear All
            </button>
          )}
          <ChevronDown
            className="w-6 h-6 text-white transition-transform duration-300"
            strokeWidth={3}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 animate-fadeIn">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-black mb-3 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
              <Search className="w-4 h-4" style={{ color: 'var(--warm-brown)' }} strokeWidth={2.5} />
              Search Text
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Type to search (typo-tolerant)..."
              className="w-full px-5 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:border-opacity-100 focus:shadow-lg font-medium"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)'
              }}
            />
          </div>

          {/* Search Fields */}
          <div>
            <label className="block text-sm font-black mb-3" style={{ color: 'var(--text-dark)' }}>
              Search In:
            </label>
            <div className="flex flex-wrap gap-3">
              {['title', 'author', 'genre', 'description', 'review'].map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSearchField(field)}
                  className="px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  style={{
                    background: filters.searchFields.includes(field)
                      ? 'var(--gradient-accent)'
                      : 'var(--bg-tertiary)',
                    color: filters.searchFields.includes(field) ? 'white' : 'var(--text-dark)',
                    border: `2px solid ${filters.searchFields.includes(field) ? 'transparent' : 'var(--border-color)'}`,
                    textShadow: filters.searchFields.includes(field) ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="block text-sm font-black mb-3 flex items-center justify-between" style={{ color: 'var(--text-dark)' }}>
              <span>Rating Range</span>
              <span className="px-3 py-1 rounded-full text-xs font-black" style={{
                background: 'var(--gradient-accent)',
                color: 'white'
              }}>
                {filters.ratingRange[0]} - {filters.ratingRange[1]} ⭐
              </span>
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="0"
                max="5"
                value={filters.ratingRange[0]}
                onChange={(e) => updateFilter('ratingRange', [parseInt(e.target.value), filters.ratingRange[1]])}
                className="flex-1 accent-[var(--warm-brown)]"
              />
              <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{
                color: 'var(--text-dark)',
                background: 'var(--bg-tertiary)'
              }}>to</span>
              <input
                type="range"
                min="0"
                max="5"
                value={filters.ratingRange[1]}
                onChange={(e) => updateFilter('ratingRange', [filters.ratingRange[0], parseInt(e.target.value)])}
                className="flex-1 accent-[var(--warm-brown)]"
              />
            </div>
          </div>

          {/* Page Count Range */}
          <div>
            <label className="block text-sm font-black mb-3 flex items-center justify-between" style={{ color: 'var(--text-dark)' }}>
              <span>Page Count</span>
              <span className="px-3 py-1 rounded-full text-xs font-black" style={{
                background: 'var(--gradient-accent)',
                color: 'white'
              }}>
                {filters.pageRange[0]} - {filters.pageRange[1] === 2000 ? '2000+' : filters.pageRange[1]}
              </span>
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                min="0"
                max="2000"
                value={filters.pageRange[0]}
                onChange={(e) => updateFilter('pageRange', [parseInt(e.target.value) || 0, filters.pageRange[1]])}
                className="w-28 px-4 py-2.5 rounded-xl border-2 font-bold text-center transition-all duration-300 focus:outline-none focus:shadow-lg"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
              <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{
                color: 'var(--text-dark)',
                background: 'var(--bg-tertiary)'
              }}>to</span>
              <input
                type="number"
                min="0"
                max="2000"
                value={filters.pageRange[1]}
                onChange={(e) => updateFilter('pageRange', [filters.pageRange[0], parseInt(e.target.value) || 2000])}
                className="w-28 px-4 py-2.5 rounded-xl border-2 font-bold text-center transition-all duration-300 focus:outline-none focus:shadow-lg"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>
          </div>

          {/* Status, Genre, and Collection Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-black mb-3" style={{ color: 'var(--text-dark)' }}>
                Reading Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter('statusFilter', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-dark)',
                  background: 'var(--bg-secondary)'
                }}
              >
                <option value="">All Statuses</option>
                <option value="Want to Read">📚 Want to Read</option>
                <option value="Currently Reading">📖 Currently Reading</option>
                <option value="Finished">✓ Finished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black mb-3" style={{ color: 'var(--text-dark)' }}>
                Genre
              </label>
              <select
                value={filters.genreFilter}
                onChange={(e) => updateFilter('genreFilter', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-dark)',
                  background: 'var(--bg-secondary)'
                }}
              >
                <option value="">All Genres</option>
                {availableGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black mb-3" style={{ color: 'var(--text-dark)' }}>
                Collection
              </label>
              <select
                value={filters.collectionFilter}
                onChange={(e) => updateFilter('collectionFilter', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-dark)',
                  background: 'var(--bg-secondary)'
                }}
              >
                <option value="">All Collections</option>
                {availableCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.icon} {collection.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-black mb-3" style={{ color: 'var(--text-dark)' }}>
                Date Added
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  value={filters.dateAddedFrom}
                  onChange={(e) => updateFilter('dateAddedFrom', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                />
                <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{
                  color: 'var(--text-dark)',
                  background: 'var(--bg-tertiary)'
                }}>to</span>
                <input
                  type="date"
                  value={filters.dateAddedTo}
                  onChange={(e) => updateFilter('dateAddedTo', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black mb-3" style={{ color: 'var(--text-dark)' }}>
                Date Finished
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  value={filters.dateFinishedFrom}
                  onChange={(e) => updateFilter('dateFinishedFrom', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                />
                <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{
                  color: 'var(--text-dark)',
                  background: 'var(--bg-tertiary)'
                }}>to</span>
                <input
                  type="date"
                  value={filters.dateFinishedTo}
                  onChange={(e) => updateFilter('dateFinishedTo', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none focus:shadow-lg cursor-pointer"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-dark)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
