'use client';

import { useState } from 'react';
import { Star, CheckCircle, BookOpen, Clock, FolderPlus } from 'lucide-react';

interface QuickActionsProps {
  bookId: string;
  currentStatus: string;
  currentRating: number;
  onStatusChange: (status: string) => void;
  onRatingChange: (rating: number) => void;
  onAddToCollection: () => void;
}

export function QuickActions({
  bookId,
  currentStatus,
  currentRating,
  onStatusChange,
  onRatingChange,
  onAddToCollection,
}: QuickActionsProps) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const statuses = [
    { value: 'Want to Read', icon: BookOpen, color: '#3b82f6' },
    { value: 'Currently Reading', icon: Clock, color: '#eab308' },
    { value: 'Finished', icon: CheckCircle, color: '#22c55e' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Quick Rating */}
      <div className="flex items-center gap-1 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <span className="text-xs text-white font-semibold mr-1">Rate:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => {
              e.stopPropagation();
              onRatingChange(star === currentRating ? 0 : star);
            }}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-transform hover:scale-125"
          >
            <Star
              className="w-5 h-5"
              fill={star <= (hoveredStar || currentRating) ? '#fbbf24' : 'none'}
              stroke={star <= (hoveredStar || currentRating) ? '#fbbf24' : '#9ca3af'}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>

      {/* Quick Status Change */}
      <div className="flex gap-2">
        {statuses.map((status) => {
          const Icon = status.icon;
          const isActive = currentStatus === status.value;
          return (
            <button
              key={status.value}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(status.value);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: isActive ? status.color : 'rgba(0,0,0,0.6)',
                opacity: isActive ? 1 : 0.7,
              }}
              title={status.value}
            >
              <Icon className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          );
        })}
      </div>

      {/* Add to Collection */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCollection();
        }}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
        style={{
          background: 'rgba(139, 111, 71, 0.9)',
        }}
      >
        <FolderPlus className="w-4 h-4 text-white" strokeWidth={2} />
        <span className="text-xs text-white font-semibold">Add to Collection</span>
      </button>
    </div>
  );
}
