'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/app/page';

export function AddBookModal({
  isOpen,
  onClose,
  onSave,
  editingBook,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: any, selectedCollections?: string[]) => void;
  editingBook: Book | null;
}) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    coverUrl: '',
    readingStatus: 'Want to Read',
    rating: 0,
    review: '',
    currentPage: '',
    totalPages: '',
  });

  const [apiSearch, setApiSearch] = useState('');
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Load collections
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  // Handle editing book changes
  useEffect(() => {
    if (editingBook) {
      setFormData({
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn || '',
        genre: editingBook.genre || '',
        description: editingBook.description || '',
        coverUrl: editingBook.coverUrl || '',
        readingStatus: editingBook.readingStatus,
        rating: editingBook.rating,
        review: editingBook.review || '',
        currentPage: editingBook.currentPage?.toString() || '',
        totalPages: editingBook.totalPages?.toString() || '',
      });
      // Set selected collections from editing book
      setSelectedCollections(
        editingBook.collections?.map(({ collection }) => collection.id) || []
      );
    }
  }, [editingBook]);

  // Reset form when modal opens for new book
  useEffect(() => {
    if (isOpen && !editingBook) {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        description: '',
        coverUrl: '',
        readingStatus: 'Want to Read',
        rating: 0,
        review: '',
        currentPage: '',
        totalPages: '',
      });
      setSelectedCollections([]);
      setApiResults([]);
      setApiSearch('');
    }
  }, [isOpen, editingBook]);

  const searchGoogleBooks = async () => {
    if (!apiSearch.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const response = await fetch(
        `/api/search-books?q=${encodeURIComponent(apiSearch)}`
      );
      const data = await response.json();
      setApiResults(data.books || []);
      if (data.books?.length === 0) {
        setSearchError('No books found. Try different keywords!');
      }
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setApiSearch('');
    setApiResults([]);
    setSearchError('');
  };

  const fillFromApi = (book: any) => {
    setFormData({
      ...formData,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      description: book.description,
      coverUrl: book.coverUrl,
      totalPages: book.totalPages?.toString() || '',
    });
    setApiResults([]);
    setApiSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      currentPage: formData.currentPage ? parseInt(formData.currentPage) : null,
      totalPages: formData.totalPages ? parseInt(formData.totalPages) : null,
    };
    onSave(dataToSave, selectedCollections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{
      background: 'rgba(0, 0, 0, 0.7)'
    }}>
      <div className="rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100" style={{
        background: 'var(--bg-primary)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-color)'
      }}>
        <div className="relative overflow-hidden p-8 rounded-t-3xl" style={{
          background: 'var(--gradient-navbar)',
          boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px)'
          }} />
          <h2 className="text-3xl font-black text-amber-50 relative z-10 flex items-center gap-3" style={{
            fontFamily: 'Playfair Display, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(201, 169, 97, 0.3)'
          }}>
            <span className="text-4xl">{editingBook ? '✏️' : '📚'}</span>
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Google Books API Search */}
          {!editingBook && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg" style={{
              background: 'var(--gradient-card)',
              border: '2px solid var(--border-color)'
            }}>
              {/* Header */}
              <div className="p-4" style={{
                background: 'var(--gradient-accent)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <h3 className="font-bold flex items-center gap-2 text-lg" style={{
                  color: 'var(--bg-primary)',
                  fontFamily: 'Playfair Display, serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search Google Books
                </h3>
                <p className="text-xs mt-1 opacity-90" style={{ color: 'var(--bg-primary)' }}>Find and auto-fill book information</p>
              </div>

              {/* Search Input */}
              <div className="p-5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, author, or ISBN..."
                    value={apiSearch}
                    onChange={(e) => setApiSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchGoogleBooks())}
                    className="w-full px-4 py-3 pr-24 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base"
                    style={{
                      borderColor: 'var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-dark)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  {apiSearch && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{
                        color: 'var(--text-muted)',
                        background: 'var(--bg-tertiary)'
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={searchGoogleBooks}
                    disabled={isSearching || !apiSearch.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    style={{
                      background: 'var(--gradient-accent)',
                      color: 'var(--bg-primary)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {isSearching ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ...
                      </span>
                    ) : '🔍'}
                  </button>
                </div>

                {/* Hints */}
                {!apiResults.length && !isSearching && !searchError && (
                  <p className="text-xs mt-2 px-1" style={{ color: '#8b6f47' }}>
                    💡 Tip: Use specific terms like "The Hobbit Tolkien" or ISBN for best results
                  </p>
                )}

                {/* Error State */}
                {searchError && (
                  <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <span className="text-2xl">📭</span>
                    <div className="flex-1">
                      <p className="font-semibold text-red-700">{searchError}</p>
                      <p className="text-xs text-red-600 mt-1">Try different keywords or add the book manually below</p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {apiResults.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold" style={{ color: '#5d4e37' }}>
                        📚 Found {apiResults.length} {apiResults.length === 1 ? 'book' : 'books'}
                      </p>
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: '#8b6f47' }}
                      >
                        Clear results
                      </button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {apiResults.map((book, index) => (
                        <div
                          key={index}
                          onClick={() => fillFromApi(book)}
                          className="group flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                          style={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #fdf8f3 100%)',
                            border: '2px solid rgba(139, 111, 71, 0.15)'
                          }}
                        >
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-16 h-24 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                            />
                          ) : (
                            <div className="w-16 h-24 rounded-lg flex items-center justify-center" style={{
                              background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)'
                            }}>
                              <svg className="w-8 h-8 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm line-clamp-2 group-hover:text-amber-900 transition-colors" style={{
                              color: '#3e2723',
                              fontFamily: 'Merriweather, serif'
                            }}>
                              {book.title}
                            </h4>
                            <p className="text-sm mt-1" style={{ color: '#6d4c41' }}>
                              by {book.author}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {book.publishedDate && (
                                <span className="text-xs px-2 py-1 rounded-full" style={{
                                  background: 'rgba(139, 111, 71, 0.1)',
                                  color: '#5d4e37'
                                }}>
                                  📅 {book.publishedDate}
                                </span>
                              )}
                              {book.genre && (
                                <span className="text-xs px-2 py-1 rounded-full" style={{
                                  background: 'rgba(212, 165, 116, 0.15)',
                                  color: '#8b6f47'
                                }}>
                                  {book.genre}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#c9a961' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center text-sm mb-6 py-3 rounded-xl" style={{
            color: 'var(--text-muted)',
            background: 'var(--bg-tertiary)',
            border: '1px dashed var(--border-color)'
          }}>
            ✍️ Or fill in manually below
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                Author *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                ISBN
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                Genre
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)'
              }}
              placeholder="A brief description of the book..."
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)'
              }}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                Reading Status
              </label>
              <select
                value={formData.readingStatus}
                onChange={(e) =>
                  setFormData({ ...formData, readingStatus: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all font-semibold"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              >
                <option value="Want to Read">📚 Want to Read</option>
                <option value="Currently Reading">📖 Currently Reading</option>
                <option value="Finished">✓ Finished</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                ⭐ Set Rating
              </label>
              <div className="flex items-center justify-center gap-1 p-4 rounded-xl" style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border-color)',
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={(e) => {
                      const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                      stars?.forEach((s, i) => {
                        if (i < star) {
                          s.style.transform = 'scale(1.2)';
                        }
                      });
                    }}
                    onMouseLeave={(e) => {
                      const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                      stars?.forEach((s) => {
                        s.style.transform = 'scale(1)';
                      });
                    }}
                    className="transition-all duration-200 cursor-pointer p-2"
                    style={{
                      transform: 'scale(1)',
                    }}
                  >
                    <span className="text-4xl transition-all duration-200" style={{
                      color: formData.rating >= star ? '#d4a574' : 'rgba(139, 111, 71, 0.25)',
                      filter: formData.rating >= star ? 'drop-shadow(0 2px 4px rgba(212, 165, 116, 0.4))' : 'none',
                      textShadow: formData.rating >= star ? '0 2px 8px rgba(201, 169, 97, 0.3)' : 'none',
                    }}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-center mt-2 text-sm font-semibold" style={{ color: '#c9a961' }}>
                  {formData.rating} {formData.rating === 1 ? 'Star' : 'Stars'}
                </p>
              )}
            </div>
          </div>

          {/* Reading Progress */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-5 rounded-xl border-2" style={{
            background: 'var(--bg-tertiary)',
            borderColor: 'var(--border-color)'
          }}>
            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                📖 Current Page
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentPage}
                onChange={(e) =>
                  setFormData({ ...formData, currentPage: e.target.value })
                }
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            <div>
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                📄 Total Pages
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalPages}
                onChange={(e) =>
                  setFormData({ ...formData, totalPages: e.target.value })
                }
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)'
                }}
              />
            </div>
            {formData.currentPage && formData.totalPages && parseInt(formData.currentPage) > 0 && parseInt(formData.totalPages) > 0 && (
              <div className="col-span-2 pt-2">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                  Progress: {Math.round((parseInt(formData.currentPage) / parseInt(formData.totalPages)) * 100)}%
                </div>
                <div className="w-full rounded-full h-3 overflow-hidden" style={{
                  background: 'rgba(139, 111, 71, 0.2)'
                }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      background: 'linear-gradient(90deg, #d4a574 0%, #c89b65 100%)',
                      width: `${Math.min((parseInt(formData.currentPage) / parseInt(formData.totalPages)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
              📝 Personal Review/Notes
            </label>
            <textarea
              rows={3}
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all resize-none"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-dark)'
              }}
              placeholder="Your thoughts about this book..."
            />
          </div>

          {/* Collections Selector */}
          {collections.length > 0 && (
            <div className="mb-6">
              <label className="block font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: 'var(--text-dark)' }}>
                📚 Add to Collections
              </label>
              <div className="flex flex-wrap gap-2 p-4 rounded-xl border-2" style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)'
              }}>
                {collections.map((collection: any) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => {
                      setSelectedCollections(prev =>
                        prev.includes(collection.id)
                          ? prev.filter(id => id !== collection.id)
                          : [...prev, collection.id]
                      );
                    }}
                    className="px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    style={{
                      background: selectedCollections.includes(collection.id)
                        ? collection.color
                        : 'var(--bg-secondary)',
                      color: selectedCollections.includes(collection.id) ? '#fff' : 'var(--text-dark)',
                      border: `2px solid ${selectedCollections.includes(collection.id) ? collection.color : 'var(--border-color)'}`,
                      boxShadow: selectedCollections.includes(collection.id)
                        ? '0 4px 12px rgba(0, 0, 0, 0.2)'
                        : '0 2px 6px rgba(93, 78, 55, 0.1)',
                    }}
                  >
                    <span className="text-lg">{collection.icon}</span>
                    <span>{collection.name}</span>
                  </button>
                ))}
              </div>
              {selectedCollections.length > 0 && (
                <p className="text-sm mt-2" style={{ color: '#c9a961' }}>
                  {selectedCollections.length} {selectedCollections.length === 1 ? 'collection' : 'collections'} selected
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)'
              }}
            >
              ✕ Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl relative overflow-hidden group"
              style={{
                background: 'var(--gradient-accent)',
                color: 'var(--bg-primary)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)',
                boxShadow: '0 6px 20px rgba(201, 169, 97, 0.4)'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {editingBook ? 'Update Book' : 'Save Book'}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                }}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
