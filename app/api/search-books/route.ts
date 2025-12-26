import { NextRequest, NextResponse } from 'next/server';
import { normalizeGenres } from '@/lib/genre-mapper';

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
          books = hardcoverData.data.search.results.hits.map((hit: any) => {
            const book = hit.document;

            // Extract author names
            const authors = book.author_names || [];

            // Extract ISBNs (prefer ISBN-13)
            const isbns = book.isbns || [];
            const isbn = isbns.find((i: string) => i.length === 13) || isbns[0] || '';

            // Extract and normalize genres
            const genres = book.genres || [];
            const normalizedGenres = normalizeGenres(genres.join(', '), 3);

            return {
              title: book.title || '',
              author: authors.join(', '),
              isbn,
              genre: normalizedGenres || '',
              description: book.description || '',
              coverUrl: book.image?.url || '',
              publisher: '',
              publishedDate: '',
              totalPages: book.pages || null,
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
