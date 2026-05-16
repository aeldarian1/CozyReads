# CozyReads Example Documentation

This folder contains example files to demonstrate how to use CozyReads with real data.

## Files Included

### `api-examples.http`
**Thunder Client / REST Client compatible API examples**

Contains ready-to-use HTTP requests for all major API endpoints:
- Getting books (with filters, pagination)
- Creating, updating, deleting books
- Managing collections
- Creating quotes
- Importing books from CSV/Goodreads
- Fetching statistics and goals

**How to use:**
1. Install [Thunder Client](https://www.thunderclient.com/) or [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension
2. Open `api-examples.http` in VS Code
3. Make sure the dev server is running (`npm run dev`)
4. Click "Send Request" above any HTTP request
5. See the response below

### `sample-books.csv`
**Example CSV file for bulk book import**

Contains 7 books with fields:
- title, author, isbn, genre, rating, status, date_added

**How to use:**
1. Go to CozyReads dashboard
2. Click "Import"
3. Select "Import from CSV"
4. Choose `sample-books.csv`
5. Review and confirm the import

### `sample-goodreads-export.csv`
**Example Goodreads export format**

Contains the actual Goodreads export format with all fields:
- Book ID, Title, Author, ISBN, Ratings, Status, etc.

**How to use:**
1. Go to CozyReads dashboard
2. Click "Import"
3. Select "Import from Goodreads"
4. Choose `sample-goodreads-export.csv`
5. Review and confirm the import

### `TESTING_EXAMPLES.test.ts`
**Test examples showing how to test CozyReads**

Contains examples of:
- Testing custom hooks (useBooks)
- Testing React components (BookCard)
- Testing API routes (GET /api/books)
- Using mocks and assertions
- Error handling tests

**How to use:**
```bash
# Run the example tests
npm run test -- TESTING_EXAMPLES.test.ts

# Run with coverage
npm run test:coverage -- TESTING_EXAMPLES.test.ts

# Watch mode (re-run on file changes)
npm run test:watch -- TESTING_EXAMPLES.test.ts
```

### `COMPONENT_EXAMPLES.tsx`
**React component examples with best practices**

Contains examples of:
- `BookGrid` component (responsive, reusable)
- `useBookGrid` hook (state management)
- `BookLibrary` component (component composition)
- Proper TypeScript typing
- Loading/error/empty states
- JSDoc documentation

**Key patterns shown:**
- Functional components with hooks
- TypeScript interfaces
- React Query integration
- Error handling
- Loading states
- JSDoc comments

### `API_ROUTE_EXAMPLES.ts`
**Next.js API route examples**

Contains examples of:
- GET route with pagination and filtering
- POST route with validation
- Custom React hooks for API calls (useBooks, useCreateBook)
- Error handling
- Prisma queries
- Request validation with Zod

**Pattern demonstrated:**
```typescript
// Authentication → Validation → Query → Response
try {
  const user = await getAuthenticatedUser();
  const data = bookSchema.parse(body);
  const book = await prisma.book.create({...});
  return NextResponse.json({...});
} catch (error) {
  // Error handling
}
```

### `seed-data.sql`
**SQL seed data for populating database**

Contains INSERT statements for:
- Users
- Books (with various statuses)
- Collections
- Quotes
- Reading goals
- Reading sessions
- Import history

**How to use:**
```bash
# Using psql directly
psql $DATABASE_URL -f examples/seed-data.sql

# Or run with your database client
```

## Learning Path

1. **Start with examples**: Look at `COMPONENT_EXAMPLES.tsx` to see how components are structured
2. **Try the API**: Use `api-examples.http` to test API endpoints
3. **Write tests**: Use `TESTING_EXAMPLES.test.ts` as a template
4. **Import data**: Use `sample-books.csv` or `sample-goodreads-export.csv` to populate the app

## Best Practices Demonstrated

### ✓ TypeScript
- Strong typing with interfaces
- Generic types
- Type-safe Zod validation

### ✓ React Patterns
- Functional components with hooks
- Custom hooks for logic reuse
- Proper prop types

### ✓ API Design
- Clean route handlers
- Consistent error responses
- Pagination and filtering

### ✓ Testing
- Mocking external dependencies
- Testing user behavior
- Component and hook tests

### ✓ Code Organization
- Clear component structure
- Separated concerns
- Reusable utilities

## Next Steps

1. **Study the patterns**: Review examples to understand the codebase style
2. **Try modifying them**: Change values, add new fields, experiment
3. **Create your own**: Use these as templates when building new features
4. **Reference in PRs**: Link to these examples when explaining your code

## References

- See [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
- See [API.md](../API.md) for complete API documentation
- See [TESTING.md](../TESTING.md) for testing best practices
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for code guidelines
