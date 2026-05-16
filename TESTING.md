# 🧪 Testing Guide

Complete guide for writing and running tests in CozyReads.

## Test Setup

CozyReads uses:
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Testing Library Queries** - DOM queries

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- books.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Book"
```

## Unit Tests

Testing utility functions and custom hooks.

### Example: Utility Function Test

```typescript
// lib/utils.ts
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// lib/__tests__/utils.test.ts
import { formatDate } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('1/15/2024');
  });

  it('should handle edge cases', () => {
    const date = new Date('2024-12-31');
    expect(formatDate(date)).toBe('12/31/2024');
  });
});
```

## Component Tests

Testing React components with React Testing Library.

### Example: Component Test

```typescript
// components/__tests__/BookCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookCard } from '../BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    rating: 5,
  };

  it('should render book information', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('should display rating', () => {
    render(<BookCard book={mockBook} />);

    const ratingElement = screen.getByTestId('book-rating');
    expect(ratingElement).toHaveTextContent('5');
  });
});
```

## Hook Tests

Testing custom React hooks.

### Example: Hook Test

```typescript
// lib/hooks/__tests__/useBooks.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBooks } from '../useBooks';
import { QueryProvider } from '@/components/QueryProvider';

describe('useBooks', () => {
  it('should fetch books', async () => {
    const { result } = renderHook(() => useBooks(), {
      wrapper: QueryProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(expect.any(Array));
  });
});
```

## API Route Tests

Testing API endpoints.

### Example: API Route Test

```typescript
// app/api/books/__tests__/route.test.ts
import { GET } from '../route';

describe('/api/books', () => {
  it('should return books for authenticated user', async () => {
    const request = new Request('http://localhost:3000/api/books');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.any(Array));
  });
});
```

## Best Practices

### 1. **Use Descriptive Test Names**

```typescript
// ❌ Bad
it('works', () => {
  // ...
});

// ✓ Good
it('should fetch books and update state when component mounts', () => {
  // ...
});
```

### 2. **Test User Behavior, Not Implementation**

```typescript
// ❌ Bad - Testing implementation
it('should call setBooks with data', () => {
  // ...
});

// ✓ Good - Testing user-facing behavior
it('should display books on the page', () => {
  render(<BookList />);
  expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
});
```

### 3. **Use Data-Testid for Complex Queries**

```typescript
// Instead of relying on text
<button data-testid="delete-book">Delete</button>

// In test
const deleteButton = screen.getByTestId('delete-book');
```

### 4. **Test Edge Cases**

```typescript
it('should handle empty list', () => {
  render(<BookList books={[]} />);
  expect(screen.getByText('No books found')).toBeInTheDocument();
});

it('should handle null values', () => {
  render(<BookCard book={null} />);
  expect(screen.getByTestId('empty-state')).toBeInTheDocument();
});
```

### 5. **Mock External Dependencies**

```typescript
jest.mock('@/lib/api', () => ({
  fetchBooks: jest.fn(() => Promise.resolve(mockBooks)),
}));

import { fetchBooks } from '@/lib/api';

it('should handle API errors', async () => {
  (fetchBooks as jest.Mock).mockRejectedValue(new Error('API Error'));
  // Test error handling
});
```

## Test Coverage

Check test coverage:

```bash
npm run test:coverage
```

Coverage targets (configurable in `jest.config.js`):
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Testing Patterns

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should update after async operation', async () => {
  const { result } = renderHook(() => useBooks());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should add book on form submit', async () => {
  const user = userEvent.setup();
  render(<AddBookForm />);

  const input = screen.getByPlaceholderText('Book title');
  await user.type(input, 'The Great Gatsby');

  const submitButton = screen.getByRole('button', { name: /add/i });
  await user.click(submitButton);

  expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
});
```

### Testing Context

```typescript
import { ToastProvider } from '@/contexts/ToastContext';

it('should use toast context', () => {
  render(
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  );

  // Test component that uses toast
});
```

## Debugging Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use test.only to run single test
it.only('should...', () => {});

# Use test.skip to skip test
it.skip('should...', () => {});

# Enable debug output
DEBUG=* npm run test
```

## CI/CD Integration

Tests run automatically on:
- Every push to any branch
- Every pull request
- On schedule (nightly builds)

See [.github/workflows/ci.yml](./.github/workflows/ci.yml) for configuration.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
