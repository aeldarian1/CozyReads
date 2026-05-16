export function BookCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl p-4 shadow-lg" style={{
      background: 'var(--gradient-card)',
      border: '1px solid var(--border-color)',
    }}>
      {/* Cover skeleton */}
      <div className="w-full aspect-[2/3] rounded-xl mb-4" style={{
        background: 'var(--bg-tertiary)',
      }} />

      {/* Title skeleton */}
      <div className="h-4 rounded mb-2" style={{
        background: 'var(--bg-tertiary)',
        width: '80%',
      }} />

      {/* Author skeleton */}
      <div className="h-3 rounded mb-3" style={{
        background: 'var(--bg-tertiary)',
        width: '60%',
      }} />

      {/* Rating skeleton */}
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-4 rounded" style={{
            background: 'var(--bg-tertiary)',
          }} />
        ))}
      </div>

      {/* Status badge skeleton */}
      <div className="h-6 rounded-full mb-3" style={{
        background: 'var(--bg-tertiary)',
        width: '50%',
      }} />

      {/* Action buttons skeleton */}
      <div className="flex gap-2">
        <div className="flex-1 h-9 rounded-lg" style={{
          background: 'var(--bg-tertiary)',
        }} />
        <div className="flex-1 h-9 rounded-lg" style={{
          background: 'var(--bg-tertiary)',
        }} />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BookshelfSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          {/* Shelf header skeleton */}
          <div className="h-8 rounded mb-4" style={{
            background: 'var(--bg-tertiary)',
            width: '200px',
          }} />

          {/* Books on shelf skeleton */}
          <div className="flex gap-2 overflow-hidden">
            {[...Array(10)].map((_, j) => (
              <div key={j} className="w-24 aspect-[2/3] rounded" style={{
                background: 'var(--bg-tertiary)',
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
