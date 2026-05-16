# 📊 API Documentation

Complete API documentation for CozyReads endpoints.

## Base URL

```
http://localhost:3000/api
```

All endpoints require authentication (Clerk JWT token in Authorization header).

---

## 📚 Books API

### Get All Books

```http
GET /api/books
```

**Query Parameters:**
- `status` - Filter by reading status (Want to Read, Currently Reading, Finished)
- `genre` - Filter by genre
- `sortBy` - Sort by (date, title, author, rating)
- `page` - Pagination page
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "genre": "Fiction",
      "rating": 5,
      "readingStatus": "Finished",
      "coverUrl": "https://..."
    }
  ],
  "total": 42
}
```

### Get Book by ID

```http
GET /api/books/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "genre": "Fiction",
    "description": "...",
    "rating": 5,
    "review": "Amazing book!",
    "readingStatus": "Finished",
    "currentPage": 180,
    "totalPages": 180,
    "dateFinished": "2024-01-15"
  }
}
```

### Create Book

```http
POST /api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "genre": "Fiction",
  "description": "Classic American novel",
  "coverUrl": "https://...",
  "readingStatus": "Want to Read",
  "rating": 0
}
```

**Response:** `201 Created`

### Update Book

```http
PATCH /api/books/:id
Content-Type: application/json

{
  "rating": 5,
  "review": "Amazing!",
  "readingStatus": "Finished",
  "currentPage": 180
}
```

**Response:** `200 OK`

### Delete Book

```http
DELETE /api/books/:id
```

**Response:** `204 No Content`

---

## 🏷️ Collections API

### Get All Collections

```http
GET /api/collections
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Fantasy",
      "icon": "🧙",
      "color": "#8b6f47",
      "books": 12
    }
  ]
}
```

### Create Collection

```http
POST /api/collections
Content-Type: application/json

{
  "name": "Fantasy",
  "icon": "🧙",
  "color": "#8b6f47",
  "description": "Fantasy novels"
}
```

### Add Book to Collection

```http
POST /api/collections/:collectionId/books
Content-Type: application/json

{
  "bookId": "uuid"
}
```

### Remove Book from Collection

```http
DELETE /api/collections/:collectionId/books/:bookId
```

---

## 📊 Statistics API

### Get Reading Statistics

```http
GET /api/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBooks": 42,
    "booksRead": 28,
    "booksReading": 5,
    "booksWantToRead": 9,
    "averageRating": 4.2,
    "favoriteGenre": "Fiction",
    "totalPages": 8432,
    "readingStreak": 12,
    "monthlyStats": [
      {
        "month": "January",
        "booksRead": 3,
        "pagesRead": 542
      }
    ]
  }
}
```

---

## 📥 Import API

### Import from CSV

```http
POST /api/import
Content-Type: multipart/form-data

file: <CSV file>
```

**CSV Format:**
```
title,author,isbn,genre,rating,status
The Great Gatsby,F. Scott Fitzgerald,978-0-7432-7356-5,Fiction,5,Finished
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 42,
    "skipped": 2,
    "errors": []
  }
}
```

### Import from Goodreads

```http
POST /api/import/goodreads
Content-Type: multipart/form-data

file: <Goodreads CSV export>
```

---

## 💬 Quotes API

### Get All Quotes

```http
GET /api/quotes
```

**Query Parameters:**
- `bookId` - Filter by book
- `page` - Pagination

### Create Quote

```http
POST /api/quotes
Content-Type: application/json

{
  "text": "It is a truth universally acknowledged...",
  "bookId": "uuid",
  "pageNumber": 5
}
```

### Delete Quote

```http
DELETE /api/quotes/:id
```

---

## 🔍 Search API

### Search Books

```http
GET /api/search-books?q=gatsby
```

**Query Parameters:**
- `q` - Search query
- `source` - Data source (hardcover, google-books, openlibrary)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "description": "...",
      "coverUrl": "https://...",
      "source": "google-books"
    }
  ]
}
```

---

## 🔍 Bulk Operations

### Bulk Enrich Books

```http
POST /api/bulk-enrich
Content-Type: application/json

{
  "bookIds": ["uuid1", "uuid2"],
  "enrichFields": ["description", "coverUrl", "genre"]
}
```

### Standardize Genres

```http
POST /api/normalize-genres
Content-Type: application/json

{
  "bookIds": ["uuid1", "uuid2"]
}
```

---

## ⚠️ Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | User not authorized for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Server error |

---

## 🔑 Authentication

All requests must include the Clerk JWT token:

```http
Authorization: Bearer <jwt_token>
```

The token is automatically included when using the application. For testing, obtain a token from Clerk dashboard.

---

## 📝 Rate Limiting

API endpoints are rate-limited per user:

- **Standard endpoints**: 100 requests/minute
- **Import endpoints**: 10 requests/minute
- **Bulk operations**: 5 requests/minute

Rate limit headers in response:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 🧪 Testing API

Use tools like:
- **Postman** - Visual API client
- **Thunder Client** - VSCode extension
- **REST Client** - VSCode extension
- **curl** - Command line

Example with curl:

```bash
# Get all books
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/books

# Create a book
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Great Gatsby","author":"F. Scott Fitzgerald"}' \
  http://localhost:3000/api/books
```

---

## 📚 SDK / Client Libraries

For frontend integration, use the provided React hooks:

```typescript
import { useBooks, useCreateBook, useUpdateBook } from '@/lib/hooks';

// Get all books
const { data: books, isLoading } = useBooks();

// Create book
const { mutate: createBook } = useCreateBook();
createBook({ title: "...", author: "..." });

// Update book
const { mutate: updateBook } = useUpdateBook();
updateBook({ id: "uuid", rating: 5 });
```

---

## 🔗 Related Resources

- [Architecture](./ARCHITECTURE.md) - System design and components
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Local development setup
- [Source Code](./app/api/) - API implementation
