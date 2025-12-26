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
          books(where: { query: $query }, limit: 15) {
            title
            description
            image
            pages
            release_date
            contributions {
              author {
                name
              }
            }
            editions {
              isbn_10
              isbn_13
              publisher_name
            }
            genres {
              name
            }
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

        if (hardcoverData.data?.books) {
          books = hardcoverData.data.books.map((book: any) => {
            // Extract author names
            const authors = book.contributions
              ?.map((c: any) => c.author?.name)
              .filter(Boolean) || [];

            // Extract ISBNs (prefer ISBN-13)
            const edition = book.editions?.[0];
            const isbn = edition?.isbn_13 || edition?.isbn_10 || '';

            // Extract and normalize genres
            const genreNames = book.genres?.map((g: any) => g.name).join(', ') || '';
            const normalizedGenres = normalizeGenres(genreNames, 3);

            return {
              title: book.title || '',
              author: authors.join(', '),
              isbn,
              genre: normalizedGenres || '',
              description: book.description || '',
              coverUrl: book.image || '',
              publisher: edition?.publisher_name || '',
              publishedDate: book.release_date || '',
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
