import { Book } from '@/app/page';

export function ViewBookModal({
  isOpen,
  book,
  onClose,
  onEdit,
  onDelete,
}: {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}) {
  if (!isOpen || !book) return null;

  const statusColors = {
    'Want to Read': 'bg-purple-600',
    'Currently Reading': 'bg-pink-600',
    'Finished': 'bg-blue-500',
  };

  const stars = book.rating > 0 ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : 'Not rated';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
      }}>
        <div className="relative overflow-hidden p-8 rounded-t-3xl" style={{
          background: 'linear-gradient(135deg, #5d4e37 0%, #6d5d4f 50%, #8b6f47 100%)',
          boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px)'
          }} />
          <h2 className="text-3xl font-black text-amber-50 relative z-10" style={{
            fontFamily: 'Playfair Display, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 15px rgba(201, 169, 97, 0.3)'
          }}>{book.title}</h2>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-white opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700">Author:</label>
                  <p className="text-gray-600">{book.author}</p>
                </div>

                {book.genre && (
                  <div>
                    <label className="font-bold text-gray-700">Genre:</label>
                    <p className="text-gray-600">{book.genre}</p>
                  </div>
                )}

                {book.isbn && (
                  <div>
                    <label className="font-bold text-gray-700">ISBN:</label>
                    <p className="text-gray-600">{book.isbn}</p>
                  </div>
                )}

                {book.series && (
                  <div>
                    <label className="font-bold text-gray-700">📚 Series:</label>
                    <p className="text-gray-600">
                      {book.series}
                      {book.seriesNumber && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold" style={{
                          background: 'linear-gradient(135deg, #8b6f47 0%, #a08968 100%)',
                          color: '#fff',
                        }}>
                          Book #{book.seriesNumber}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <label className="font-bold text-gray-700">Status:</label>
                  <span
                    className={`inline-block ml-2 ${
                      statusColors[book.readingStatus as keyof typeof statusColors]
                    } text-white text-sm font-bold px-3 py-1 rounded-full`}
                  >
                    {book.readingStatus}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-gray-700">Rating:</label>
                  <p className="text-yellow-400 text-2xl">{stars}</p>
                </div>

                {/* Reading Progress */}
                {book.readingStatus === 'Currently Reading' && book.currentPage && book.totalPages && (
                  <div>
                    <label className="font-bold text-gray-700 mb-2 block">
                      Reading Progress:
                    </label>
                    <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Page {book.currentPage} of {book.totalPages}
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          {Math.round((book.currentPage / book.totalPages) * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-purple-800 h-full transition-all"
                          style={{
                            width: `${Math.min((book.currentPage / book.totalPages) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {book.description && (
                  <div>
                    <label className="font-bold text-gray-700">Description:</label>
                    <p className="text-gray-600 mt-1">{book.description}</p>
                  </div>
                )}

                {book.review && (
                  <div>
                    <label className="font-bold text-gray-700">
                      ⭐ Personal Review:
                    </label>
                    <p className="text-gray-600 mt-1">{book.review}</p>
                  </div>
                )}

                {book.notes && (
                  <div>
                    <label className="font-bold text-gray-700">
                      📝 Personal Notes:
                    </label>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">{book.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => onDelete(book.id)}
              className="px-6 py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #c14953 0%, #a83a44 100%)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => onEdit(book)}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #c9a961 0%, #d4a574 50%, #c89b65 100%)',
                color: '#2d1f15',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                boxShadow: '0 6px 20px rgba(201, 169, 97, 0.4)'
              }}
            >
              <span className="relative z-10">
                ✏️ Edit Book
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                }}
              />
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #e8dcc8 0%, #d4cbb8 100%)',
                color: '#5d4e37',
                border: '1px solid rgba(93, 78, 55, 0.2)'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
