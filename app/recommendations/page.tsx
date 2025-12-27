'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Star,
  Plus,
  ChevronRight,
  Heart,
  Bookmark,
  Users,
  Target,
  Zap
} from 'lucide-react';

type BookRecommendation = {
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  genre?: string;
  reason?: string;
  isbn?: string;
};

type Recommendation = {
  type: string;
  title: string;
  description: string;
  items: string[];
};

type RecommendationData = {
  recommendations: Recommendation[];
  stats?: {
    totalBooks: number;
    favoriteGenres: string[];
    favoriteAuthors: string[];
  };
  message?: string;
};

export default function RecommendationsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookSuggestions, setBookSuggestions] = useState<BookRecommendation[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      const result = await response.json();
      setData(result);

      // Fetch actual book recommendations based on user's favorites
      if (result.stats?.favoriteGenres?.length > 0) {
        await fetchBookSuggestions(result.stats.favoriteGenres[0]);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookSuggestions = async (genre: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&orderBy=relevance&maxResults=6&langRestrict=en`
      );
      const data = await response.json();

      if (data.items) {
        const books: BookRecommendation[] = data.items.map((item: any) => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.[0] || 'Unknown Author',
          coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
          rating: item.volumeInfo.averageRating,
          genre: item.volumeInfo.categories?.[0],
          isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
          reason: `Popular in ${genre}`,
        }));
        setBookSuggestions(books);
      }
    } catch (error) {
      console.error('Error fetching book suggestions:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-current animate-spin"
              style={{ color: '#c9a961' }}></div>
            <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ color: '#c9a961' }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>
            Curating your personalized recommendations...
          </p>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'favorite_authors', label: 'Favorite Authors', icon: Heart },
    { id: 'favorite_genres', label: 'Your Genres', icon: Bookmark },
    { id: 'explore_new', label: 'Explore New', icon: Zap },
    { id: 'incomplete_series', label: 'Series', icon: BookOpen },
  ];

  const filteredRecommendations = selectedCategory === 'all'
    ? data?.recommendations
    : data?.recommendations.filter(rec => rec.type === selectedCategory);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Elegant Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #5d4e37 0%, #8b6f47 50%, #a08968 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl" style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Sparkles className="w-8 h-8 text-amber-100" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-5xl font-black text-amber-50 mb-2" style={{
                  fontFamily: 'Playfair Display, serif',
                  textShadow: '2px 4px 8px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.02em',
                }}>
                  Discover Your Next Read
                </h1>
                <p className="text-amber-100 text-lg font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Personalized recommendations powered by your reading history
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              ← Back to Library
            </button>
          </div>

          {/* Stats Cards */}
          {data?.stats && (
            <div className="grid grid-cols-3 gap-4 mt-8">
              <StatCard
                icon={BookOpen}
                label="Books in Library"
                value={data.stats.totalBooks}
                gradient="linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)"
              />
              <StatCard
                icon={Heart}
                label="Favorite Genres"
                value={data.stats.favoriteGenres.length}
                subtext={data.stats.favoriteGenres.slice(0, 2).join(', ')}
                gradient="linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)"
              />
              <StatCard
                icon={Users}
                label="Favorite Authors"
                value={data.stats.favoriteAuthors.length}
                subtext={data.stats.favoriteAuthors.slice(0, 2).join(', ')}
                gradient="linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {data?.message ? (
          <EmptyState router={router} message={data.message} />
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 hover:scale-105"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)'
                        : 'rgba(139, 111, 71, 0.1)',
                      color: isActive ? '#2d1f15' : '#8b6f47',
                      border: `2px solid ${isActive ? 'transparent' : 'rgba(139, 111, 71, 0.2)'}`,
                      boxShadow: isActive ? '0 4px 12px rgba(201, 169, 97, 0.3)' : 'none',
                    }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Book Suggestions from Google Books API */}
            {bookSuggestions.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6" style={{ color: '#c9a961' }} strokeWidth={2.5} />
                    <h2 className="text-3xl font-black" style={{
                      color: '#5d4e37',
                      fontFamily: 'Playfair Display, serif'
                    }}>
                      Trending in {data?.stats?.favoriteGenres[0]}
                    </h2>
                  </div>
                  <ChevronRight className="w-6 h-6" style={{ color: '#8b6f47' }} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {bookSuggestions.map((book, idx) => (
                    <BookCard key={idx} book={book} />
                  ))}
                </div>
              </section>
            )}

            {/* Recommendation Categories */}
            <div className="space-y-8">
              {filteredRecommendations?.map((rec, index) => (
                <RecommendationSection key={index} recommendation={rec} router={router} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, gradient }: any) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-105"
      style={{
        background: gradient,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6 text-amber-50" strokeWidth={2.5} />
        <span className="text-sm font-bold text-amber-100 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-4xl font-black text-white mb-1">
        {value}
      </div>
      {subtext && (
        <div className="text-sm text-amber-100 font-medium truncate">
          {subtext}
        </div>
      )}
    </div>
  );
}

function BookCard({ book }: { book: BookRecommendation }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(249, 247, 243, 0.6) 0%, rgba(252, 250, 248, 0.9) 100%)',
        border: '2px solid rgba(139, 111, 71, 0.2)',
        boxShadow: isHovered ? '0 12px 40px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book Cover */}
      <div className="aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
        {book.coverUrl && !imageError ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
          </div>
        )}

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(93, 78, 55, 0.9)' }}
        >
          <button
            className="px-4 py-2 rounded-lg font-bold transition-all hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
              color: '#2d1f15',
            }}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3
          className="font-bold text-sm line-clamp-2 mb-1"
          style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}
        >
          {book.title}
        </h3>
        <p className="text-xs mb-2 line-clamp-1" style={{ color: '#8b6f47' }}>
          {book.author}
        </p>

        {book.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-current text-yellow-500" />
            <span className="text-xs font-bold" style={{ color: '#8b6f47' }}>
              {book.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Reason badge */}
      {book.reason && (
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(201, 169, 97, 0.95)',
            color: '#2d1f15',
            backdropFilter: 'blur(10px)',
          }}
        >
          {book.reason}
        </div>
      )}
    </div>
  );
}

function RecommendationSection({ recommendation, router }: any) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'favorite_authors': return Heart;
      case 'favorite_genres': return Bookmark;
      case 'incomplete_series': return BookOpen;
      case 'explore_new': return Zap;
      case 'reading_challenge': return Target;
      default: return Sparkles;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'favorite_authors': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'favorite_genres': return 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)';
      case 'incomplete_series': return 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)';
      case 'explore_new': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'reading_challenge': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default: return 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)';
    }
  };

  const Icon = getIcon(recommendation.type);

  return (
    <div
      className="rounded-3xl p-8 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(249, 247, 243, 0.8) 0%, rgba(252, 250, 248, 1) 100%)',
        border: '2px solid rgba(139, 111, 71, 0.2)',
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className="p-4 rounded-2xl shadow-lg"
          style={{ background: getGradient(recommendation.type) }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h2
            className="text-3xl font-black mb-1"
            style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}
          >
            {recommendation.title}
          </h2>
          <p className="text-lg" style={{ color: '#8b6f47' }}>
            {recommendation.description}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendation.items.map((item: string, i: number) => (
          <RecommendationItem
            key={i}
            item={item}
            type={recommendation.type}
            router={router}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationItem({ item, type, router }: any) {
  const [isHovered, setIsHovered] = useState(false);

  const getAction = () => {
    switch (type) {
      case 'favorite_genres':
      case 'explore_new':
        return () => router.push(`/?genre=${encodeURIComponent(item)}`);
      case 'favorite_authors':
        return () => router.push(`/?author=${encodeURIComponent(item)}`);
      case 'incomplete_series':
        return () => router.push('/');
      default:
        return () => {};
    }
  };

  return (
    <div
      className="group relative rounded-2xl p-6 transition-all duration-300 cursor-pointer"
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(201, 169, 97, 0.15) 0%, rgba(212, 165, 116, 0.15) 100%)'
          : 'rgba(255, 255, 255, 0.5)',
        border: `2px solid ${isHovered ? '#c9a961' : 'rgba(139, 111, 71, 0.15)'}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(201, 169, 97, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
      onClick={getAction()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-bold text-lg flex-1"
          style={{ color: '#2d1f15', fontFamily: 'Merriweather, serif' }}
        >
          {item}
        </span>
        <ChevronRight
          className="w-5 h-5 transition-transform duration-300"
          style={{
            color: '#c9a961',
            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          }}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
}

function EmptyState({ router, message }: any) {
  return (
    <div className="text-center py-20">
      <div
        className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.1) 0%, rgba(212, 165, 116, 0.2) 100%)',
          border: '3px dashed rgba(139, 111, 71, 0.3)',
        }}
      >
        <BookOpen className="w-16 h-16" style={{ color: '#8b6f47', opacity: 0.5 }} strokeWidth={1.5} />
      </div>
      <h2
        className="text-4xl font-black mb-4"
        style={{ color: '#2d1f15', fontFamily: 'Playfair Display, serif' }}
      >
        {message}
      </h2>
      <p className="text-lg mb-8" style={{ color: '#8b6f47' }}>
        Build your library to unlock personalized recommendations
      </p>
      <button
        onClick={() => router.push('/')}
        className="px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 100%)',
          color: '#2d1f15',
        }}
      >
        <Plus className="w-5 h-5 inline mr-2" strokeWidth={2.5} />
        Start Adding Books
      </button>
    </div>
  );
}
