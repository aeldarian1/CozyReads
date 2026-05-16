import { renderHook } from '@testing-library/react';
import { useBooks } from '../useBooks';
import { QueryProvider } from '@/components/QueryProvider';

/**
 * Example Test: useBooks Hook
 * 
 * This demonstrates how to test custom React hooks
 * that use React Query for data fetching.
 */
describe('useBooks', () => {
  // Wrap the hook with QueryProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryProvider>{children}</QueryProvider>
  );

  it('should fetch books on mount', async () => {
    const { result } = renderHook(() => useBooks(), { wrapper });

    // Initially, data should be undefined and loading should be true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should return array of books', async () => {
    const { result } = renderHook(() => useBooks(), { wrapper });

    // Wait for the query to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // After loading, data should be an array
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // Mock the fetch to fail
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useBooks(), { wrapper });

    // Wait for error to be set
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have an error
    expect(result.current.isError).toBe(true);
  });
});

/**
 * Example Test: BookCard Component
 * 
 * This demonstrates how to test React components
 * using React Testing Library.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookCard } from '../BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    rating: 5,
    coverUrl: 'https://example.com/image.jpg',
    readingStatus: 'Finished' as const,
  };

  it('should render book title and author', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('should display rating stars', () => {
    render(<BookCard book={mockBook} />);

    const ratingElements = screen.getAllByRole('button', { name: /star/i });
    expect(ratingElements).toHaveLength(5);
  });

  it('should handle click on edit button', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(<BookCard book={mockBook} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockBook);
  });

  it('should show reading status badge', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('Finished')).toBeInTheDocument();
  });
});

/**
 * Example Test: API Route
 * 
 * This demonstrates how to test Next.js API routes.
 */
import { GET } from '../route';

describe('GET /api/books', () => {
  it('should return 200 with books data', async () => {
    const request = new Request('http://localhost:3000/api/books');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should support pagination', async () => {
    const request = new Request('http://localhost:3000/api/books?page=1&limit=10');

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.length).toBeLessThanOrEqual(10);
  });

  it('should filter by reading status', async () => {
    const request = new Request(
      'http://localhost:3000/api/books?status=Finished'
    );

    const response = await GET(request);
    const data = await response.json();

    data.data.forEach((book: any) => {
      expect(book.readingStatus).toBe('Finished');
    });
  });
});
