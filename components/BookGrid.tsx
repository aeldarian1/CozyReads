import { Book } from '@/app/page';
import { BookCard } from './BookCard';

export function BookGrid({
  books,
  onBookClick,
  onBookRightClick,
  selectedBookIds,
  onBookSelect,
}: {
  books: Book[];
  onBookClick: (book: Book) => void;
  onBookRightClick?: (book: Book, event: React.MouseEvent) => void;
  selectedBookIds?: Set<string>;
  onBookSelect?: (bookId: string) => void;
}) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 px-4 rounded-2xl" style={{
        background: 'linear-gradient(135deg, #fdf8f3 0%, #f5f1e8 100%)',
        border: '3px dashed rgba(139, 111, 71, 0.3)'
      }}>
        <div className="text-8xl mb-6">📚</div>
        <h3 className="text-3xl font-bold mb-3" style={{
          color: '#5d4e37',
          fontFamily: 'Merriweather, serif'
        }}>
          Your library awaits...
        </h3>
        <p className="text-lg mb-4" style={{ color: '#6d4c41' }}>
          Start building your cozy collection
        </p>
        <p className="text-sm" style={{ color: '#8b6f47' }}>
          Click "📚 Add New Book" above to begin your reading journey
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      style={{
        gridAutoRows: '1fr',
      }}
    >
      {books.map((book) => (
        <div key={book.id} className="flex">
          <BookCard
            book={book}
            onClick={() => onBookClick(book)}
            onRightClick={onBookRightClick ? (e) => onBookRightClick(book, e) : undefined}
            isSelected={selectedBookIds?.has(book.id)}
            onSelect={onBookSelect}
          />
        </div>
      ))}
    </div>
  );
}
