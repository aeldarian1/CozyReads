import { NextRequest, NextResponse } from 'next/server';

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

    // Try Google Books API first
    let books: any[] = [];

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

            // Extract cover image - use highest quality available
            let coverUrl = '';
            if (volumeInfo.imageLinks) {
              coverUrl =
                volumeInfo.imageLinks.extraLarge ||
                volumeInfo.imageLinks.large ||
                volumeInfo.imageLinks.medium ||
                volumeInfo.imageLinks.thumbnail ||
                '';
              if (coverUrl) {
                // Upgrade to HTTPS and remove zoom parameter for full size
                coverUrl = coverUrl.replace('http://', 'https://');
                // Remove &zoom=1 to get larger images
                coverUrl = coverUrl.replace('&zoom=1', '');
                // Try to get larger size by replacing thumbnail with larger size
                coverUrl = coverUrl.replace('&edge=curl', '');
              }
            }

            return {
              title: volumeInfo.title || '',
              author: (volumeInfo.authors || []).join(', '),
              isbn,
              genre: (volumeInfo.categories || []).join(', '),
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
      console.error('Google Books failed:', googleError);
    }

    // If Google Books didn't return results, try Open Library
    if (books.length === 0) {
      try {
        const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
        const openLibResponse = await fetch(openLibUrl);

        if (openLibResponse.ok) {
          const openLibData = await openLibResponse.json();

          if (openLibData.docs) {
            books = openLibData.docs.map((doc: any) => ({
              title: doc.title || '',
              author: doc.author_name?.join(', ') || '',
              isbn: doc.isbn?.[0] || '',
              genre: doc.subject?.slice(0, 2).join(', ') || '',
              description: doc.first_sentence?.join(' ') || '',
              coverUrl: doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                : '',
              publisher: doc.publisher?.[0] || '',
              publishedDate: doc.first_publish_year?.toString() || '',
              totalPages: doc.number_of_pages_median || doc.number_of_pages || null,
            }));
          }
        }
      } catch (openLibError) {
        console.error('Open Library failed:', openLibError);
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
