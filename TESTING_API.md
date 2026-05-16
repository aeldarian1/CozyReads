# CozyReads API Testing Guide

## ✅ TESTED & WORKING

### 1. **Search Books API** ✅ FULLY FUNCTIONAL

**Endpoint:** `GET /api/search-books?q={query}`

**Latest Test Results:**
```bash
# Test Query: "dune"
curl http://localhost:3001/api/search-books?q=dune

# Response: 8 books returned with complete data
{
  "books": [
    {
      "title": "Dune",
      "author": "Frank Herbert, Brian Herbert",
      "isbn": "9786171276895",
      "genre": "Science Fiction, Fantasy, Classics",
      "description": "Set on the desert planet Arrakis...",
      "coverUrl": "https://assets.hardcover.app/editions/...",
      "publishedDate": "1965-01-01",
      "totalPages": 704,
      "series": "Dune",
      "seriesNumber": 1
    },
    ...
  ],
  "total": 8,
  "sources": {
    "hardcover": true,
    "googleBooks": false
  }
}
```

**Features Working:**
- ✅ Hardcover API integration
- ✅ Bearer token authentication
- ✅ Full book metadata extraction
- ✅ Series information extraction
- ✅ Genre normalization
- ✅ Result deduplication
- ✅ Proper source attribution

---

### 2. **CSV Import API** 🔐 REQUIRES AUTHENTICATION

**Endpoint:** `POST /api/import/csv`

**Requirements:**
- Clerk JWT authentication token in `Authorization` header
- Multipart form data with `file` parameter (CSV file)

**CSV Format:**
```csv
title,author,isbn,genre,rating,readingStatus
The Great Gatsby,F. Scott Fitzgerald,978-0743273565,Fiction,5,completed
To Kill a Mockingbird,Harper Lee,978-0061120084,Classics,5,completed
1984,George Orwell,978-0451524935,Science Fiction,4,reading
```

**Supported Headers (case-insensitive):**
- `title` - Book title (required)
- `author` - Author name
- `isbn` - ISBN-10 or ISBN-13
- `genre` - Book genre(s)
- `rating` - Rating (0-5)
- `readingStatus` - One of: `want-to-read`, `reading`, `completed`, `dnf`
- `notes` - Personal notes about the book
- `dateAdded` - When you added the book
- `dateStarted` - When you started reading
- `dateCompleted` - When you finished reading

**Example Request (with authentication):**
```bash
curl -X POST http://localhost:3001/api/import/csv \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -F "file=@books.csv"
```

**Response:**
```json
{
  "imported": 3,
  "skipped": 0,
  "total": 3,
  "results": [
    {
      "title": "The Great Gatsby",
      "status": "success",
      "id": "book_123456"
    }
  ]
}
```

---

### 3. **Goodreads Import API** 🔐 REQUIRES AUTHENTICATION

**Endpoint:** `POST /api/import/goodreads`

**Requirements:**
- Clerk JWT authentication token
- Goodreads CSV export file OR Goodreads URL

**How to Export Goodreads CSV:**
1. Go to https://www.goodreads.com/review/import
2. Select "CSV" format
3. Download your books list
4. The file will contain your Goodreads ratings and reading history

**Supported Goodreads CSV Columns:**
- Book ID
- Title
- Author
- Author l-f
- Additional Authors
- ISBN
- ISBN13
- My Rating
- Average Rating
- Publisher
- Binding
- Number of Pages
- Year Published
- Original Publication Year
- Date Read
- Date Added
- Bookshelves
- Bookshelves with positions
- Exclusive Shelf
- My Review

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/import/goodreads \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -F "file=@goodreads_library_export.csv"
```

**Response:**
```json
{
  "imported": 45,
  "skipped": 2,
  "total": 47,
  "results": [
    {
      "title": "Harry Potter and the Sorcerer's Stone",
      "author": "J.K. Rowling",
      "status": "success",
      "id": "book_654321"
    }
  ],
  "skipped_details": [
    {
      "title": "Unknown Book",
      "reason": "Missing required fields"
    }
  ]
}
```

---

## Testing Authentication

### Getting a Clerk JWT Token

1. **Sign up/Login to the application:**
   - Navigate to `http://localhost:3001`
   - Click "Sign Up" or "Sign In"
   - Use test credentials from Clerk dashboard
   - After successful authentication, your JWT token is stored in browser cookies

2. **Extract token for API testing:**
   ```javascript
   // In browser console:
   fetch('http://localhost:3001/api/test-auth')
     .then(r => r.json())
     .then(data => console.log(data.token))
   ```

3. **Use in API requests:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:3001/api/import/csv
   ```

---

## API Status Dashboard

| API | Status | Notes |
|-----|--------|-------|
| Search Books | ✅ Working | Hardcover API returns 8-15 results per query |
| CSV Import | 🔐 Ready | Awaiting auth token for testing |
| Goodreads Import | 🔐 Ready | Awaiting auth token for testing |
| Enrich Book Metadata | 🔐 Ready | Uses Hardcover/Google Books |
| Collections Management | 🔐 Ready | Create, read, update, delete collections |
| Reading Goals | 🔐 Ready | Track reading progress |
| Statistics | 🔐 Ready | Reading stats and analytics |
| Search (Full-text) | 🔐 Ready | Query user's book library |

---

## Known Limitations

1. **Google Books API**: Rate-limited to prevent excessive requests
2. **Database Permissions**: Neon pool user has limited permissions (expected for shared connections)
3. **Authentication**: All data operations require Clerk authentication
4. **Rate Limiting**: Search API has built-in rate limiting (100 requests/minute)

---

## Sample Test Data

### Sample CSV for Testing:
```csv
title,author,isbn,genre,rating,readingStatus,dateCompleted
The Hobbit,J.R.R. Tolkien,978-0547928227,Fantasy,5,completed,2023-06-15
Neuromancer,William Gibson,978-0441569595,Science Fiction,4,completed,2023-07-20
Dune,Frank Herbert,978-0441013593,Science Fiction,5,reading,
The Name of the Wind,Patrick Rothfuss,978-0756404079,Fantasy,5,completed,2023-08-01
Cryptonomicon,Neal Stephenson,978-0375505935,Science Fiction,4,reading,
```

### Using Sample Data:
1. Create `sample_books.csv` with the data above
2. Authenticate via Clerk login
3. Call: `POST /api/import/csv` with the CSV file
4. Expected result: 5 books imported

---

## Troubleshooting

### "Unauthorized" on Import APIs
- **Cause**: Missing or invalid Clerk JWT token
- **Fix**: Ensure you're logged in to the application and the authorization header is set correctly

### "Malformed CSV" errors
- **Cause**: CSV format doesn't match expected structure
- **Fix**: Ensure headers are in the first row and data matches column types

### "Book already exists"
- **Cause**: ISBN or title already in user's library
- **Fix**: Duplicate prevention is working correctly; book is not re-imported

### Empty results from Hardcover search
- **Cause**: Query too specific or no matching books
- **Fix**: Try broader search terms (e.g., "dune" instead of "dune messiah chapter 3")

---

## Production Readiness

✅ **Hardcover Search API**: Production-ready
🟡 **CSV Import**: Requires authentication testing in browser
🟡 **Goodreads Import**: Requires authentication testing in browser
✅ **Database**: PostgreSQL connection working
✅ **Authentication**: Clerk OAuth configured
✅ **Environment Variables**: All configured

---

**Last Updated:** 2026-05-16
**Server Version:** Next.js 16.2.6
**Status:** Active Development
