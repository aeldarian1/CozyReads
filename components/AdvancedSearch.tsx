'use client';

import { useState } from 'react';

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
    <div className="mb-6 rounded-2xl overflow-hidden shadow-lg" style={{
      background: 'var(--gradient-card)',
      border: '2px solid var(--border-color)'
    }}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-opacity-80 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'var(--gradient-accent)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <h3 className="text-xl font-bold text-white" style={{
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Advanced Search
          </h3>
          {hasActiveFilters && (
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
              background: 'rgba(212, 165, 116, 0.9)',
              color: '#2d1f15'
            }}>
              Active Filters
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              Clear All
            </button>
          )}
          <span className="text-white text-2xl transform transition-transform" style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#5d4e37' }}>
              Search Text
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Type to search (typo-tolerant)..."
              className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
              style={{
                borderColor: 'rgba(139, 111, 71, 0.3)',
                background: '#fefefe',
                color: '#3e2723'
              }}
            />
          </div>

          {/* Search Fields */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#5d4e37' }}>
              Search In:
            </label>
            <div className="flex flex-wrap gap-2">
              {['title', 'author', 'genre', 'description', 'review'].map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSearchField(field)}
                  className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    background: filters.searchFields.includes(field)
                      ? 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)'
                      : 'rgba(139, 111, 71, 0.1)',
                    color: filters.searchFields.includes(field) ? 'white' : '#5d4e37',
                    border: '2px solid rgba(139, 111, 71, 0.3)'
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#5d4e37' }}>
              Rating Range: {filters.ratingRange[0]} - {filters.ratingRange[1]} ⭐
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="0"
                max="5"
                value={filters.ratingRange[0]}
                onChange={(e) => updateFilter('ratingRange', [parseInt(e.target.value), filters.ratingRange[1]])}
                className="flex-1"
              />
              <span className="text-sm font-bold" style={{ color: '#8b6f47' }}>to</span>
              <input
                type="range"
                min="0"
                max="5"
                value={filters.ratingRange[1]}
                onChange={(e) => updateFilter('ratingRange', [filters.ratingRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>

          {/* Page Count Range */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#5d4e37' }}>
              Page Count: {filters.pageRange[0]} - {filters.pageRange[1] === 2000 ? '2000+' : filters.pageRange[1]}
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                min="0"
                max="2000"
                value={filters.pageRange[0]}
                onChange={(e) => updateFilter('pageRange', [parseInt(e.target.value) || 0, filters.pageRange[1]])}
                className="w-24 px-3 py-2 rounded-lg border-2"
                style={{ borderColor: 'rgba(139, 111, 71, 0.3)' }}
              />
              <span className="text-sm font-bold" style={{ color: '#8b6f47' }}>to</span>
              <input
                type="number"
                min="0"
                max="2000"
                value={filters.pageRange[1]}
                onChange={(e) => updateFilter('pageRange', [filters.pageRange[0], parseInt(e.target.value) || 2000])}
                className="w-24 px-3 py-2 rounded-lg border-2"
                style={{ borderColor: 'rgba(139, 111, 71, 0.3)' }}
              />
            </div>
          </div>

          {/* Status, Genre, and Collection Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                Reading Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter('statusFilter', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-dark)', background: 'var(--bg-secondary)' }}
              >
                <option value="">All Statuses</option>
                <option value="Want to Read">📚 Want to Read</option>
                <option value="Currently Reading">📖 Currently Reading</option>
                <option value="Finished">✓ Finished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                Genre
              </label>
              <select
                value={filters.genreFilter}
                onChange={(e) => updateFilter('genreFilter', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-dark)', background: 'var(--bg-secondary)' }}
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
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                Collection
              </label>
              <select
                value={filters.collectionFilter}
                onChange={(e) => updateFilter('collectionFilter', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-dark)', background: 'var(--bg-secondary)' }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#5d4e37' }}>
                Date Added
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={filters.dateAddedFrom}
                  onChange={(e) => updateFilter('dateAddedFrom', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2"
                  style={{ borderColor: 'rgba(139, 111, 71, 0.3)' }}
                />
                <span className="text-sm" style={{ color: '#8b6f47' }}>to</span>
                <input
                  type="date"
                  value={filters.dateAddedTo}
                  onChange={(e) => updateFilter('dateAddedTo', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2"
                  style={{ borderColor: 'rgba(139, 111, 71, 0.3)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#5d4e37' }}>
                Date Finished
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={filters.dateFinishedFrom}
                  onChange={(e) => updateFilter('dateFinishedFrom', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2"
                  style={{ borderColor: 'rgba(139, 111, 71, 0.3)' }}
                />
                <span className="text-sm" style={{ color: '#8b6f47' }}>to</span>
                <input
                  type="date"
                  value={filters.dateFinishedTo}
                  onChange={(e) => updateFilter('dateFinishedTo', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-2"
                  style={{ borderColor: 'rgba(139, 111, 71, 0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
