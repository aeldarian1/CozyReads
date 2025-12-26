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

      const hardcoverResponse = await fetch('https://hardcover.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: hardcoverQuery,
          variables: { query },
        }),
      });

      if (hardcoverResponse.ok) {
        const hardcoverData = await hardcoverResponse.json();

        console.log('Hardcover API Response:', JSON.stringify(hardcoverData, null, 2));

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
      }
    } catch (hardcoverError) {
      console.error('Hardcover search failed:', hardcoverError);
    }

    // Fallback to Google Books if Hardcover didn't return results
    if (books.length === 0) {
      try {
        const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
        const googleResponse = await fetch(googleUrl);

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();

          if (googleData.items) {
            books = googleData.items.map((item: any) => {
              const volumeInfo = item.volumeInfo || {};

              // Extract ISBN
              let isbn = '';
              if (volumeInfo.industryIdentifiers) {
                for (const identifier of volumeInfo.industryIdentifiers) {
                  if (identifier.type === 'ISBN_13' || identifier.type === 'ISBN_10') {
                    isbn = identifier.identifier;
                    break;
                  }
                }
              }

              // Extract cover image
              let coverUrl = '';
              if (volumeInfo.imageLinks) {
                coverUrl =
                  volumeInfo.imageLinks.extraLarge ||
                  volumeInfo.imageLinks.large ||
                  volumeInfo.imageLinks.medium ||
                  volumeInfo.imageLinks.thumbnail ||
                  '';
                if (coverUrl) {
                  coverUrl = coverUrl.replace('http://', 'https://');
                  coverUrl = coverUrl.replace('&zoom=1', '');
                  coverUrl = coverUrl.replace('&edge=curl', '');
                }
              }

              // Normalize genres
              const genreNames = (volumeInfo.categories || []).join(', ');
              const normalizedGenres = normalizeGenres(genreNames, 3);

              return {
                title: volumeInfo.title || '',
                author: (volumeInfo.authors || []).join(', '),
                isbn,
                genre: normalizedGenres || '',
                description: volumeInfo.description || '',
                coverUrl,
                publisher: volumeInfo.publisher || '',
                publishedDate: volumeInfo.publishedDate || '',
                totalPages: volumeInfo.pageCount || null,
              };
            });
          }
        }
      } catch (googleError) {
        console.error('Google Books fallback failed:', googleError);
      }
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
