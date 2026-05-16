import { NextRequest, NextResponse } from 'next/server';
import { normalizeGenres } from '@/lib/genre-mapper';
import { searchGoogleBooks } from '@/lib/google-books';

/**
 * Calculate similarity between two strings (0-1 range)
 * Uses simple token-based matching for performance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  // Exact match
  if (s1 === s2) return 1.0;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // Token-based similarity
  const tokens1 = s1.split(/\s+/);
  const tokens2 = s2.split(/\s+/);
  const matchingTokens = tokens1.filter(t => tokens2.some(t2 => t.includes(t2) || t2.includes(t)));

  return matchingTokens.length / Math.max(tokens1.length, tokens2.length);
}

/**
 * Validates if a search result is relevant to the query
 * Returns true if the result passes quality checks
 */
function isRelevantResult(hit: any, searchQuery: string): boolean {
  const document = hit.document;
  const highlights = hit.highlights || [];

  // Get matched fields from highlights
  const titleHighlight = highlights.find((h: any) => h.field === 'title');
  const authorHighlight = highlights.find((h: any) => h.field === 'author_names');
  const seriesHighlight = highlights.find((h: any) => h.field === 'series_names');

  // Priority 1: Title must have some match
  const titleMatchTokens = titleHighlight?.matched_tokens || [];
  if (titleMatchTokens.length === 0 && !seriesHighlight) {
    // If title has no matches and series has no matches, likely not relevant
    return false;
  }

  // Priority 2: Calculate title similarity with search query
  const titleSimilarity = calculateSimilarity(document.title || '', searchQuery);

  // Accept if title similarity is high enough
  if (titleSimilarity >= 0.5) return true;

  // Priority 3: Check if it's a series match (e.g., "Harry Potter" matches series)
  if (seriesHighlight && titleMatchTokens.length > 0) {
    return true;
  }

  // Priority 4: If we have both title and author matches, it's likely relevant
  if (titleMatchTokens.length > 0 && authorHighlight) {
    return true;
  }

  return false;
}

/**
 * Deduplicate books by ISBN and title similarity
 * Prefers books with more complete data
 */
function deduplicateBooks(books: any[]): any[] {
  const seen = new Map<string, any>();

  for (const book of books) {
    // Create a unique key based on ISBN or normalized title
    const isbn = book.isbn?.replace(/[-\s]/g, '');
    const normalizedTitle = book.title?.toLowerCase().replace(/[^\w\s]/g, '').trim();

    let key = isbn || normalizedTitle;

    if (!key) continue;

    // If we haven't seen this book, add it
    if (!seen.has(key)) {
      seen.set(key, book);
      continue;
    }

    // If we have seen it, keep the one with more complete data
    const existing = seen.get(key);
    const existingScore = scoreBookCompleteness(existing);
    const newScore = scoreBookCompleteness(book);

    if (newScore > existingScore) {
      seen.set(key, book);
    }
  }

  return Array.from(seen.values());
}

/**
 * Score how complete a book's data is (higher = more complete)
 */
function scoreBookCompleteness(book: any): number {
  let score = 0;

  if (book.title) score += 1;
  if (book.author) score += 1;
  if (book.isbn) score += 2;
  if (book.description && book.description.length > 50) score += 2;
  if (book.coverUrl) score += 2;
  if (book.genre) score += 1;
  if (book.totalPages) score += 1;
  if (book.publisher) score += 1;
  if (book.publishedDate) score += 1;
  if (book.series) score += 1;

  return score;
}

// Book search API route using Hardcover + Google Books fallback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use Hardcover GraphQL API (fastest, best quality)
    let books: any[] = [];

    try {
      const hardcoverQuery = `
        query SearchBooks($query: String!) {
          search(query: $query, query_type: "books", per_page: 15) {
            results
          }
        }
      `;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authentication token if available
      const hardcoverToken = process.env.HARDCOVER_API_TOKEN;
      if (hardcoverToken) {
        headers['Authorization'] = `Bearer ${hardcoverToken}`;
      }

      const hardcoverResponse = await fetch('https://api.hardcover.app/v1/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: hardcoverQuery,
          variables: { query },
        }),
      });

      console.log('Hardcover API Status:', hardcoverResponse.status, hardcoverResponse.statusText);
      console.log('Hardcover Token Present:', !!hardcoverToken);

      if (hardcoverResponse.ok) {
        const hardcoverData = await hardcoverResponse.json();

        console.log('Hardcover API Response:', JSON.stringify(hardcoverData, null, 2));

        // Check for GraphQL errors
        if (hardcoverData.errors) {
          console.error('Hardcover GraphQL Errors:', JSON.stringify(hardcoverData.errors, null, 2));
        }

        if (hardcoverData.data?.search?.results?.hits) {
          // Filter and map results, only keeping relevant ones
          books = hardcoverData.data.search.results.hits
            .filter((hit: any) => isRelevantResult(hit, query))
            .map((hit: any) => {
              const book = hit.document;

              // Extract author names
              const authors = book.author_names || [];

              // Extract ISBNs (prefer ISBN-13, then ISBN-10)
              const isbns = book.isbns || [];
              const isbn13 = isbns.find((i: string) => i.length === 13);
              const isbn10 = isbns.find((i: string) => i.length === 10);
              const isbn = isbn13 || isbn10 || isbns[0] || '';

              // Extract and normalize genres (limit to top 3)
              const genres = book.genres || [];
              const normalizedGenres = normalizeGenres(genres.slice(0, 5).join(', '), 3);

              // Extract series information
              const series = book.featured_series?.series?.name || null;
              const seriesNumber = book.featured_series?.position || null;

              // Extract release date (format: YYYY-MM-DD or YYYY)
              const releaseDate = book.release_date || '';

              // Get high-quality cover image
              const coverUrl = book.image?.url || '';

              // Extract description (clean HTML if present)
              const description = book.description || '';

              return {
                title: book.title || '',
                author: authors.join(', '),
                isbn,
                genre: normalizedGenres || '',
                description,
                coverUrl,
                publisher: '', // Not available in search results
                publishedDate: releaseDate,
                totalPages: book.pages || null,
                series,
                seriesNumber,
              };
            });
        }
      } else {
        console.error('Hardcover API returned error status:', hardcoverResponse.status);
        const errorText = await hardcoverResponse.text();
        console.error('Hardcover Error Response:', errorText);
      }
    } catch (hardcoverError) {
      console.error('Hardcover search failed:', hardcoverError);
    }

    // If Hardcover returned few results, supplement with Google Books
    const shouldUseGoogleBooks = books.length < 5;

    if (shouldUseGoogleBooks) {
      console.log('Using Google Books as fallback (Hardcover returned < 5 results)');

      try {
        const googleBooks = await searchGoogleBooks(query, 10);

        if (googleBooks.length > 0) {
          console.log(`Google Books returned ${googleBooks.length} results`);

          // Combine results
          const allBooks = [...books, ...googleBooks];

          // Deduplicate by ISBN and title
          books = deduplicateBooks(allBooks);

          console.log(`After deduplication: ${books.length} total results`);
        }
      } catch (googleError) {
        console.error('Google Books search failed:', googleError);
        // Continue with Hardcover results only
      }
    }

    return NextResponse.json({
      books,
      total: books.length,
      sources: {
        hardcover: books.filter(b => !b.isbn || books.length === 0).length > 0,
        googleBooks: shouldUseGoogleBooks
      }
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
