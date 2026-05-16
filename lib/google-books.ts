/**
 * Google Books API service
 * Provides book search and metadata retrieval from Google Books
 */

import { normalizeGenres } from './genre-mapper';

export interface GoogleBook {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  coverUrl: string;
  publisher: string;
  publishedDate: string;
  totalPages: number | null;
  series: string | null;
  seriesNumber: number | null;
}

/**
 * Search for books using Google Books API
 * @param query - Search query (book title, author, ISBN, etc.)
 * @param maxResults - Maximum number of results to return (default: 15)
 * @returns Array of book objects
 */
export async function searchGoogleBooks(
  query: string,
  maxResults: number = 15
): Promise<GoogleBook[]> {
  try {
    // Google Books API endpoint
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';

    // Build query parameters
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      printType: 'books',
      orderBy: 'relevance',
    });

    // Add API key if available (increases rate limit)
    if (apiKey) {
      params.append('key', apiKey);
    }

    const url = `${baseUrl}?${params.toString()}`;

    console.log('Google Books API Request:', url.replace(apiKey, 'API_KEY_HIDDEN'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Google Books API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log('Google Books: No results found');
      return [];
    }

    // Map Google Books results to our format
    const books: GoogleBook[] = data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo || {};
      const saleInfo = item.saleInfo || {};

      // Extract authors
      const authors = volumeInfo.authors || [];
      const author = authors.join(', ');

      // Extract ISBNs (prefer ISBN-13, then ISBN-10)
      const industryIdentifiers = volumeInfo.industryIdentifiers || [];
      const isbn13 = industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
      const isbn10 = industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
      const isbn = isbn13?.identifier || isbn10?.identifier || '';

      // Extract and normalize genres/categories
      const categories = volumeInfo.categories || [];
      const normalizedGenres = normalizeGenres(categories.join(', '), 3);

      // Extract cover image (prefer high quality)
      const imageLinks = volumeInfo.imageLinks || {};
      const coverUrl =
        imageLinks.extraLarge ||
        imageLinks.large ||
        imageLinks.medium ||
        imageLinks.thumbnail ||
        imageLinks.smallThumbnail ||
        '';

      // Clean description (remove HTML tags if present)
      const description = (volumeInfo.description || '')
        .replace(/<[^>]*>/g, '')
        .trim();

      // Extract series information from title if present
      // Common patterns: "Title (Series #1)", "Title: Series Book 1"
      let series: string | null = null;
      let seriesNumber: number | null = null;
      const title = volumeInfo.title || '';

      const seriesMatch = title.match(/\(([^)]+)\s+#?(\d+)\)$/i) ||
                         title.match(/:\s*([^:]+)\s+(?:Book|Vol\.?)\s+(\d+)$/i);

      if (seriesMatch) {
        series = seriesMatch[1].trim();
        seriesNumber = parseInt(seriesMatch[2], 10);
      }

      return {
        title: title,
        author,
        isbn,
        genre: normalizedGenres || '',
        description,
        coverUrl: coverUrl.replace('http:', 'https:'), // Force HTTPS
        publisher: volumeInfo.publisher || '',
        publishedDate: volumeInfo.publishedDate || '',
        totalPages: volumeInfo.pageCount || null,
        series,
        seriesNumber,
      };
    });

    console.log(`Google Books: Found ${books.length} results`);
    return books;
  } catch (error) {
    console.error('Google Books API error:', error);
    return [];
  }
}

/**
 * Get book details by ISBN
 * @param isbn - ISBN-10 or ISBN-13
 * @returns Book object or null if not found
 */
export async function getBookByISBN(isbn: string): Promise<GoogleBook | null> {
  const results = await searchGoogleBooks(`isbn:${isbn}`, 1);
  return results.length > 0 ? results[0] : null;
}
