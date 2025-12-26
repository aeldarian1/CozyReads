/**
 * Enriches book data by fetching missing information from Google Books API
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
    // Try ISBN first if available
    let searchQuery = isbn || `${title} ${author}`;

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1`
    );

    if (!response.ok) return result;

    const data = await response.json();

    if (!data.items || data.items.length === 0) return result;

    const book = data.items[0];
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

    // Extract description if not already present
    if (volumeInfo.description) {
      result.description = volumeInfo.description;
    }

  } catch (error) {
    // Silently fail - enrichment is optional
    console.error('Error enriching book data:', error);
  }

  return result;
}
