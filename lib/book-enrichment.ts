/**
 * Enriches book data by fetching missing information from Google Books API and Open Library
 */
export async function enrichBookFromGoogleBooks(isbn: string | null, title: string, author: string): Promise<{
  coverUrl: string | null;
  genre: string | null;
  description: string | null;
}> {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
  };

  try {
    // Try Google Books first
    const googleResult = await fetchFromGoogleBooks(isbn, title, author);
    if (googleResult.coverUrl || googleResult.genre || googleResult.description) {
      return googleResult;
    }

    // Fallback to Open Library if Google Books fails
    const openLibraryResult = await fetchFromOpenLibrary(isbn, title, author);
    return openLibraryResult;
  } catch (error) {
    console.error('Error enriching book data:', error);
    return result;
  }
}

async function fetchFromGoogleBooks(isbn: string | null, title: string, author: string) {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
  };

  try {
    // Try ISBN first if available (most accurate)
    let searchQuery = isbn ? `isbn:${isbn}` : `intitle:${title}+inauthor:${author}`;

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=3`
    );

    if (!response.ok) return result;

    const data = await response.json();

    if (!data.items || data.items.length === 0) return result;

    // Try to find the best match from multiple results
    const book = findBestMatch(data.items, title, author);
    const volumeInfo = book.volumeInfo;

    // Extract cover URL (prefer high quality)
    if (volumeInfo.imageLinks) {
      let coverUrl =
        volumeInfo.imageLinks.extraLarge ||
        volumeInfo.imageLinks.large ||
        volumeInfo.imageLinks.medium ||
        volumeInfo.imageLinks.thumbnail ||
        volumeInfo.imageLinks.smallThumbnail;

      // Upgrade to HTTPS and remove zoom parameter for better quality
      if (coverUrl) {
        coverUrl = coverUrl.replace('http://', 'https://');
        coverUrl = coverUrl.replace('&zoom=1', '');
        coverUrl = coverUrl.replace('&edge=curl', '');
        result.coverUrl = coverUrl;
      }
    }

    // Extract genre (categories)
    if (volumeInfo.categories && volumeInfo.categories.length > 0) {
      result.genre = volumeInfo.categories.join(', ');
    }

    // Extract description
    if (volumeInfo.description) {
      result.description = volumeInfo.description;
    }

  } catch (error) {
    console.error('Error fetching from Google Books:', error);
  }

  return result;
}

async function fetchFromOpenLibrary(isbn: string | null, title: string, author: string) {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
  };

  try {
    // Try ISBN first
    if (isbn) {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      if (response.ok) {
        const data = await response.json();
        if (data.covers && data.covers[0]) {
          result.coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
        }
        if (data.description) {
          result.description = typeof data.description === 'string'
            ? data.description
            : data.description.value;
        }
        return result;
      }
    }

    // Fallback to title/author search
    const searchResponse = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=3`
    );

    if (!searchResponse.ok) return result;

    const searchData = await searchResponse.json();

    if (!searchData.docs || searchData.docs.length === 0) return result;

    const book = findBestMatch(searchData.docs, title, author);

    // Get cover image
    if (book.cover_i) {
      result.coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    }

    // Get genres from subjects
    if (book.subject && book.subject.length > 0) {
      result.genre = book.subject.slice(0, 3).join(', ');
    }

    // Fetch description from work if available
    if (book.key) {
      try {
        const workResponse = await fetch(`https://openlibrary.org${book.key}.json`);
        if (workResponse.ok) {
          const workData = await workResponse.json();
          if (workData.description) {
            result.description = typeof workData.description === 'string'
              ? workData.description
              : workData.description.value;
          }
        }
      } catch (error) {
        // Description fetch failed, continue without it
      }
    }

  } catch (error) {
    console.error('Error fetching from Open Library:', error);
  }

  return result;
}

// Find the best match from search results using fuzzy matching
function findBestMatch(items: any[], targetTitle: string, targetAuthor: string): any {
  if (!items || items.length === 0) return items[0];
  if (items.length === 1) return items[0];

  // Normalize strings for comparison
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const normalizedTitle = normalize(targetTitle);
  const normalizedAuthor = normalize(targetAuthor);

  // Score each item
  const scored = items.map(item => {
    const itemTitle = normalize(item.title || item.volumeInfo?.title || '');
    const itemAuthor = normalize(
      item.author_name?.[0] ||
      item.volumeInfo?.authors?.[0] ||
      ''
    );

    // Calculate similarity scores (simple substring matching)
    const titleMatch = itemTitle.includes(normalizedTitle) || normalizedTitle.includes(itemTitle);
    const authorMatch = itemAuthor.includes(normalizedAuthor) || normalizedAuthor.includes(itemAuthor);

    let score = 0;
    if (titleMatch) score += 2;
    if (authorMatch) score += 1;

    return { item, score };
  });

  // Sort by score and return best match
  scored.sort((a, b) => b.score - a.score);
  return scored[0].item;
}
