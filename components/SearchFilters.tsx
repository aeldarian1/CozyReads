export function SearchFilters({
  searchQuery,
  statusFilter,
  ratingFilter,
  sortBy,
  onSearchChange,
  onStatusChange,
  onRatingChange,
  onSortChange,
}: {
  searchQuery: string;
  statusFilter: string;
  ratingFilter: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onSortChange: (value: string) => void;
}) {
  const inputStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f3 100%)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#3e2723',
    boxShadow: '0 2px 8px rgba(93, 78, 55, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by title, author, or genre..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{...inputStyle, paddingLeft: '44px'}}
          className="w-full focus:outline-none transition-all duration-300 hover:shadow-lg focus:shadow-xl hover:scale-[1.02]"
        />
        <svg
          className="absolute left-3 top-3.5 w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: '#8b6f47' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        style={inputStyle}
        className="focus:outline-none transition-all duration-300 hover:shadow-lg focus:shadow-xl hover:scale-[1.02] cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="Want to Read">📚 Want to Read</option>
        <option value="Currently Reading">📖 Currently Reading</option>
        <option value="Finished">✓ Finished</option>
      </select>

      <select
        value={ratingFilter}
        onChange={(e) => onRatingChange(e.target.value)}
        style={inputStyle}
        className="focus:outline-none transition-all duration-300 hover:shadow-lg focus:shadow-xl hover:scale-[1.02] cursor-pointer"
      >
        <option value="">All Ratings</option>
        <option value="5">★★★★★ 5 Stars</option>
        <option value="4">★★★★☆ 4 Stars</option>
        <option value="3">★★★☆☆ 3 Stars</option>
        <option value="2">★★☆☆☆ 2 Stars</option>
        <option value="1">★☆☆☆☆ 1 Star</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={inputStyle}
        className="focus:outline-none transition-all duration-300 hover:shadow-lg focus:shadow-xl hover:scale-[1.02] cursor-pointer"
      >
        <option value="dateAdded">📅 Date Added</option>
        <option value="title">🔤 Title</option>
        <option value="author">✍️ Author</option>
        <option value="rating">⭐ Rating</option>
        <option value="dateFinished">✓ Date Finished</option>
      </select>
    </div>
  );
}
