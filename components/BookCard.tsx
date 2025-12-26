import { Book } from '@/app/page';

// Genre color mapping
const genreColors: { [key: string]: { bg: string; text: string } } = {
  'Fiction': { bg: '#8b6f47', text: '#fff' },
  'Non-Fiction': { bg: '#6d8a96', text: '#fff' },
  'Mystery': { bg: '#7d5ba6', text: '#fff' },
  'Romance': { bg: '#c45b7d', text: '#fff' },
  'Science Fiction': { bg: '#5a7fa6', text: '#fff' },
  'Fantasy': { bg: '#8a5d9f', text: '#fff' },
  'Thriller': { bg: '#c74444', text: '#fff' },
  'Horror': { bg: '#4a4a4a', text: '#fff' },
  'Biography': { bg: '#d4a574', text: '#2d1f15' },
  'History': { bg: '#8b7355', text: '#fff' },
  'Science': { bg: '#5d9f8a', text: '#fff' },
  'Self-Help': { bg: '#9f8a5d', text: '#fff' },
  'Poetry': { bg: '#a67d7d', text: '#fff' },
  'Adventure': { bg: '#7a9269', text: '#fff' },
  'Juvenile Fiction': { bg: '#f4a460', text: '#2d1f15' },
  'Legends': { bg: '#6d5d4f', text: '#fff' },
};

export function BookCard({
  book,
  onClick,
  onRightClick,
  isSelected = false,
  onSelect
}: {
  book: Book;
  onClick: () => void;
  onRightClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
  onSelect?: (bookId: string) => void;
}) {
  const statusStyles = {
    'Want to Read': { bg: '#6d8a96', emoji: '📚' },
    'Currently Reading': { bg: '#d4a574', emoji: '📖' },
    'Finished': { bg: '#5d7052', emoji: '✓' },
  };

  const status = statusStyles[book.readingStatus as keyof typeof statusStyles];

  // Star rendering function
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="inline-block transition-all duration-200"
          style={{
            color: i <= book.rating ? '#d4a574' : 'rgba(139, 111, 71, 0.2)',
            fontSize: '1.1rem',
            textShadow: i <= book.rating ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Get genre color
  const genreColor = book.genre && genreColors[book.genre]
    ? genreColors[book.genre]
    : { bg: 'rgba(139, 111, 71, 0.15)', text: '#5d4e37' };

  // Calculate reading progress percentage
  const progressPercent = book.currentPage && book.totalPages
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onRightClick}
      className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 group relative flex flex-col w-full"
      style={{
        background: 'var(--gradient-card)',
        border: `1px solid var(--border-color)`,
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.15), 0 1px 3px rgba(93, 78, 55, 0.1)',
        transform: 'perspective(1000px) rotateX(0deg)',
      }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" style={{
        background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 45%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 55%, transparent 100%)',
        transform: 'translateX(-100%)',
        animation: 'shine 3s ease-in-out infinite'
      }} />

      {/* Selection Checkbox */}
      {onSelect && (
        <div
          className={`absolute top-3 right-3 z-20 transition-all duration-200 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(book.id);
          }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              background: isSelected ? 'var(--gradient-accent)' : 'rgba(255, 255, 255, 0.9)',
              border: '2px solid var(--warm-brown)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {isSelected && (
              <span className="text-white font-bold text-sm">✓</span>
            )}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
        {book.coverUrl ? (
          <>
            <img
              src={book.coverUrl}
              alt={book.title}
              loading="lazy"
              className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-700"
              style={{
                filter: 'sepia(0.05) brightness(1.03) contrast(1.05)',
                imageRendering: 'crisp-edges',
              }}
            />
            {/* Reading Progress Ring for Currently Reading */}
            {book.readingStatus === 'Currently Reading' && progressPercent > 0 && (
              <div className="absolute bottom-3 left-3" style={{
                width: '48px',
                height: '48px',
              }}>
                <svg className="transform -rotate-90" width="48" height="48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#d4a574"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercent / 100)}`}
                    style={{
                      transition: 'stroke-dashoffset 0.5s ease',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold" style={{
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
                  }}>
                    {progressPercent}%
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-64 flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 50%, #8b6f47 100%)',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)',
            }} />
            <svg
              className="w-20 h-20 text-amber-100 opacity-70 mb-3 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-amber-100 text-sm font-bold text-center opacity-90 line-clamp-2 relative z-10" style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {book.title}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <span
          className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-2 rounded-full shadow-2xl flex items-center gap-1 group-hover:scale-110 transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${status.bg} 0%, ${status.bg}dd 100%)`,
            border: '2px solid rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}
        >
          <span>{status.emoji}</span>
        </span>

        {/* Action hint overlay on hover - only over cover */}
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="transition-all duration-300 transform scale-95 group-hover:scale-100">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-2xl" style={{
              border: '2px solid rgba(139, 111, 71, 0.3)'
            }}>
              <p className="text-xs font-bold text-center mb-1" style={{ color: '#5d4e37' }}>
                Click to view details
              </p>
              <p className="text-xs text-center" style={{ color: '#8b6f47' }}>
                Right-click for quick actions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pt-4 pb-4 transition-colors duration-300">
        <h3 className="font-bold text-base mb-1.5 line-clamp-2 transition-colors duration-300" style={{
          color: 'var(--text-dark)',
          fontFamily: 'Merriweather, serif',
          lineHeight: '1.3'
        }}>
          {book.title}
        </h3>
        <p className="text-xs mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          by {book.author}
        </p>

        {/* Visual Indicators Row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Genre Badge */}
          {book.genre && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{
              background: genreColor.bg,
              color: genreColor.text,
            }}>
              {book.genre}
            </span>
          )}

          {/* Page Count */}
          {book.totalPages && (
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {book.totalPages}
            </span>
          )}

          {/* Date Added */}
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(book.dateAdded)}
          </span>
        </div>

        {/* Collection Badges */}
        {book.collections && book.collections.length > 0 && (
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {book.collections.slice(0, 3).map(({ collection }) => (
              <span
                key={collection.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold shadow-sm"
                style={{
                  background: collection.color,
                  color: '#fff',
                }}
                title={collection.name}
              >
                <span className="text-sm">{collection.icon}</span>
                <span className="max-w-[60px] truncate">{collection.name}</span>
              </span>
            ))}
            {book.collections.length > 3 && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{
                  background: 'rgba(139, 111, 71, 0.2)',
                  color: 'var(--text-dark)',
                }}
                title={`+${book.collections.length - 3} more collections`}
              >
                +{book.collections.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Reading Progress Bar (for Currently Reading) */}
        {book.readingStatus === 'Currently Reading' && book.currentPage && book.totalPages && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-dark)' }}>
                Page {book.currentPage} of {book.totalPages}
              </span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{
              background: 'rgba(139, 111, 71, 0.2)'
            }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #d4a574 0%, #c89b65 100%)',
                }}
              />
            </div>
          </div>
        )}

        {/* Star Rating - Always shown */}
        <div className="flex items-center gap-0.5">
          {renderStars()}
        </div>
      </div>
    </div>
  );
}
