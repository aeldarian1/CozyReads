# Search Books Problem & Solution

## Problem: Search API Returns an Empty List

When a valid search query returns 0 results, the search pipeline is usually missing one or both API keys.

### Root Cause

The API uses two sources:
1. **Hardcover API** (preferred - faster, higher quality)
2. **Google Books API** (fallback if Hardcover returns fewer than 5 results)

If both APIs are not configured, the search returns an empty list.

---

## Solution

### Step 1: Add API Keys to `.env.local`

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
# OPTION A: Use only Google Books (faster to set up)
GOOGLE_BOOKS_API_KEY="your_google_books_key_here"

# OPTION B: Use Hardcover (better results)
HARDCOVER_API_TOKEN="your_hardcover_token_here"

# OPTION C: Use both (recommended!)
GOOGLE_BOOKS_API_KEY="your_google_books_key_here"
HARDCOVER_API_TOKEN="your_hardcover_token_here"
```

### Step 2: How to Get API Keys

#### Google Books API (Free)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable the "Books API"
4. Create an API key (Credentials → Create Credentials)
5. Copy the key into `.env.local`

**Free limit:** 1,000 requests/day

#### Hardcover API Token (Free)

1. Go to https://hardcover.app/settings/api
2. Generate a new API token
3. Copy the token into `.env.local`

**Free limit:** No limit for basic search

### Step 3: Restart the Dev Server

```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

---

## Test the Search API

### Use the HTTP Example File

```http
GET http://localhost:3000/api/search-books?q=the great gatsby
```

### Or Use the Terminal

```bash
curl "http://localhost:3000/api/search-books?q=the%20great%20gatsby"
```

**Expected response:**

```json
{
  "books": [
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "genre": "Fiction",
      "coverUrl": "...",
      "description": "..."
    }
  ],
  "total": 1,
  "sources": {
    "hardcover": true,
    "googleBooks": false
  }
}
```

---

## Troubleshooting

### Problem: Empty List With No Errors

**Cause:** Both APIs are disabled or not configured.

**Solution:**
1. Check `.env.local` for `GOOGLE_BOOKS_API_KEY` or `HARDCOVER_API_TOKEN`
2. If missing, add them as shown above
3. Restart the dev server

### Problem: Google Books Returns a 403 Error

**Cause:** The API key is invalid or the API is not enabled.

**Solution:**
1. Go to https://console.cloud.google.com/
2. Verify that "Books API" is enabled
3. Verify that the API key is valid
4. Create a new key if needed

### Problem: Hardcover Returns a GraphQL Error

**Cause:** The token is invalid or lacks access.

**Solution:**
1. Go to https://hardcover.app/settings/api
2. Generate a new token
3. Make sure the token was copied exactly (no extra spaces)

### Problem: Search Works With Hardcover But Not Google Books

**Cause:** Google Books API is not enabled or the key is invalid.

**Solution:**
- Use Hardcover only by removing `GOOGLE_BOOKS_API_KEY` from `.env.local`
- Or fix the Google Books key

### Problem: Search Works Locally But Not in Production

**Cause:** Environment variables are not configured in production.

**Solution:**
1. On Vercel:
   - Go to Project Settings → Environment Variables
   - Add `GOOGLE_BOOKS_API_KEY` and `HARDCOVER_API_TOKEN`
2. In Docker:
   - Add them to `docker-compose.yml` or a `.env` file
3. On a VPS:
   - Add them to the systemd service file or PM2 config

---

## API Search Flow

```
User: Search "gatsby"
    ↓
GET /api/search-books?q=gatsby
    ↓
┌─────────────────────────────────────┐
│ Try Hardcover API (if token exists) │
└────┬────────────────────────────────┘
     │ Success? (< 5 results?)
     ├─ YES & < 5 → Try Google Books
     └─ NO → Try Google Books
     │
┌────▼─────────────────────────────────┐
│ Try Google Books API (if key exists) │
└────┬────────────────────────────────┘
     │
┌────▼────────────────────────────────┐
│ Deduplicate Results                 │
│ (by ISBN + title similarity)       │
└────┬────────────────────────────────┘
     │
┌────▼────────────────────────────────┐
│ Return Results                      │
│ { books[], total, sources }         │
└─────────────────────────────────────┘
```

---

## Recommended Configurations

### For Development (Localhost)
```env
GOOGLE_BOOKS_API_KEY="your_key_here"
HARDCOVER_API_TOKEN="your_token_here"
```

### For Production
```env
GOOGLE_BOOKS_API_KEY="your_key_here"
HARDCOVER_API_TOKEN="your_token_here"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

### Minimal Setup (Google Books Only)
```env
GOOGLE_BOOKS_API_KEY="your_key_here"
# Hardcover is optional
```

---

## Need Help?

If the issue persists:

1. **Check the logs:**
   ```bash
   npm run dev
   # Console output from the search-books route should appear here
   ```

2. **Test the API directly:**
   ```bash
   curl "http://localhost:3000/api/search-books?q=test"
   ```

3. **Check `.env.local`:**
   - It should be in the project root (next to package.json)
   - It should be in `.gitignore` (do not commit it)

4. **Restart everything:**
   ```bash
   # Stop the dev server
   npm run dev
   ```

5. **Check the Docker setup** if you are using docker-compose:
   ```yaml
   services:
     app:
       environment:
         - GOOGLE_BOOKS_API_KEY=your_key
         - HARDCOVER_API_TOKEN=your_token
   ```
