import { NextRequest, NextResponse } from 'next/server';
import { normalizeGenres } from '@/lib/genre-mapper';

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

// Book search API route using Hardcover
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

    return NextResponse.json({ books, total: books.length });
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
