'use client';

import { useState } from 'react';
import { Book } from '@/app/page';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onAddToCollection: (collectionId: string) => void;
  onChangeStatus: (status: string) => void;
  onExport: () => void;
  collections: { id: string; name: string; icon: string; color: string }[];
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onAddToCollection,
  onChangeStatus,
  onExport,
  collections,
  isDeleting = false,
  isUpdating = false,
}: BulkActionsBarProps) {
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const isLoading = isDeleting || isUpdating;

  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn"
      style={{
        maxWidth: '90%',
      }}
    >
      <div
        className="rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4 flex-wrap"
        style={{
          background: 'var(--gradient-navbar)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Selection Info */}
        <div className="text-amber-50 font-bold flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span>{selectedCount} selected</span>
        </div>

        {/* Select All / Deselect All */}
        <button
          onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
          className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: 'linear-gradient(135deg, #c74444 0%, #a93838 100%)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
        </button>

        {/* Add to Collection */}
        <div className="relative">
          <button
            onClick={() => setShowCollectionMenu(!showCollectionMenu)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            📚 Add to Collection
          </button>
          {showCollectionMenu && (
            <div
              className="absolute bottom-full mb-2 right-0 rounded-lg overflow-hidden shadow-lg min-w-48"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              {collections.length > 0 ? (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      onAddToCollection(collection.id);
                      setShowCollectionMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-opacity-50 transition-all flex items-center gap-2"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-dark)',
                    }}
                  >
                    <span>{collection.icon}</span>
                    <span>{collection.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No collections yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Status */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {isUpdating ? '⏳ Updating...' : '📖 Change Status'}
          </button>
          {showStatusMenu && (
            <div
              className="absolute bottom-full mb-2 right-0 rounded-lg overflow-hidden shadow-lg min-w-48"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              {['Want to Read', 'Currently Reading', 'Finished'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onChangeStatus(status);
                    setShowStatusMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-opacity-50 transition-all"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-dark)',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={onExport}
          className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: 'var(--gradient-accent)',
            color: 'var(--bg-primary)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          💾 Export
        </button>
      </div>
    </div>
  );
}
