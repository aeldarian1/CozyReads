/**
 * Enriches book data by fetching missing information from Google Books API and Open Library
 * Uses a smart merging strategy to get the best data from both sources
 */
export async function enrichBookFromGoogleBooks(isbn: string | null, title: string, author: string): Promise<{
  coverUrl: string | null;
  genre: string | null;
  description: string | null;
  publisher?: string | null;
  publishedDate?: string | null;
  pageCount?: number | null;
}> {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
    publisher: null as string | null,
    publishedDate: null as string | null,
    pageCount: null as number | null,
  };

  try {
    // Fetch from both sources in parallel for better performance
    const [googleResult, openLibraryResult] = await Promise.allSettled([
      fetchFromGoogleBooks(isbn, title, author),
      fetchFromOpenLibrary(isbn, title, author)
    ]);

    // Merge results, preferring Google Books for most fields but OpenLibrary for covers
    const google = googleResult.status === 'fulfilled' ? googleResult.value : null;
    const openLib = openLibraryResult.status === 'fulfilled' ? openLibraryResult.value : null;

    // Cover URL: Prefer high-quality Google Books covers, fallback to OpenLibrary
    result.coverUrl = google?.coverUrl || openLib?.coverUrl || null;

    // Description: Prefer longer, more detailed descriptions
    const googleDesc = google?.description || '';
    const openLibDesc = openLib?.description || '';
    if (googleDesc.length > openLibDesc.length) {
      result.description = googleDesc || null;
    } else {
      result.description = openLibDesc || googleDesc || null;
    }

    // Genre: Combine unique genres from both sources
    const genres = new Set<string>();
    if (google?.genre) {
      google.genre.split(',').forEach(g => genres.add(g.trim()));
    }
    if (openLib?.genre) {
      openLib.genre.split(',').forEach(g => genres.add(g.trim()));
    }
    result.genre = genres.size > 0 ? Array.from(genres).slice(0, 3).join(', ') : null;

    // Additional metadata from Google Books (usually more reliable for these fields)
    result.publisher = google?.publisher || openLib?.publisher || null;
    result.publishedDate = google?.publishedDate || openLib?.publishedDate || null;
    result.pageCount = google?.pageCount || openLib?.pageCount || null;

  } catch (error) {
    console.error('Error enriching book data:', error);
  }

  return result;
}

async function fetchFromGoogleBooks(isbn: string | null, title: string, author: string) {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
    publisher: null as string | null,
    publishedDate: null as string | null,
    pageCount: null as number | null,
  };

  try {
    // Normalize and clean ISBN (support both ISBN-10 and ISBN-13)
    const cleanISBN = isbn ? isbn.replace(/[-\s='"]/g, '') : null;

    // Try multiple search strategies for better accuracy
    const searchStrategies = [];

    if (cleanISBN) {
      // Strategy 1: ISBN search (most accurate)
      searchStrategies.push(`isbn:${cleanISBN}`);

      // Strategy 1b: Try ISBN variants (10 vs 13)
      const isbnVariants = getISBNVariants(cleanISBN);
      isbnVariants.forEach(variant => {
        if (variant !== cleanISBN) {
          searchStrategies.push(`isbn:${variant}`);
        }
      });
    }

    // Strategy 2: Combined title and author search (exact match)
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    searchStrategies.push(`intitle:"${cleanTitle}"+inauthor:"${cleanAuthor}"`);

    // Strategy 3: Title only with partial author (helps with middle names/initials)
    const authorLastName = cleanAuthor.split(' ').pop();
    if (authorLastName && authorLastName.length > 2) {
      searchStrategies.push(`intitle:"${cleanTitle}"+inauthor:${authorLastName}`);
    }

    // Strategy 4: Fallback without quotes (broader search)
    searchStrategies.push(`intitle:${cleanTitle}+inauthor:${cleanAuthor}`);

    // Strategy 5: Just title if all else fails
    searchStrategies.push(`intitle:"${cleanTitle}"`);

    // Try each strategy until we get results
    for (const searchQuery of searchStrategies) {
      try {
        const response = await fetchWithRetry(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`
        );

        if (!response.ok) continue;

        const data = await response.json();

        if (!data.items || data.items.length === 0) continue;

        // Find the best match from results
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

          // Upgrade to HTTPS and remove parameters for better quality
          if (coverUrl) {
            coverUrl = coverUrl.replace('http://', 'https://');
            coverUrl = coverUrl.replace('&zoom=1', '');
            coverUrl = coverUrl.replace('&edge=curl', '');
            // Increase image size by replacing size parameter
            coverUrl = coverUrl.replace('zoom=1', 'zoom=0');
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

        // Extract publisher
        if (volumeInfo.publisher) {
          result.publisher = volumeInfo.publisher;
        }

        // Extract published date
        if (volumeInfo.publishedDate) {
          result.publishedDate = volumeInfo.publishedDate;
        }

        // Extract page count
        if (volumeInfo.pageCount && volumeInfo.pageCount > 0) {
          result.pageCount = volumeInfo.pageCount;
        }

        // If we found good results, break out of the loop
        if (result.coverUrl || result.description) {
          break;
        }
      } catch (strategyError) {
        console.error(`Google Books strategy "${searchQuery}" failed:`, strategyError);
        continue;
      }
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
    publisher: null as string | null,
    publishedDate: null as string | null,
    pageCount: null as number | null,
  };

  try {
    // Clean ISBN
    const cleanISBN = isbn ? isbn.replace(/[-\s]/g, '') : null;

    // Try ISBN lookup first (most reliable)
    if (cleanISBN) {
      try {
        // Try both ISBN-13 and ISBN-10 formats
        const isbnVariants = getISBNVariants(cleanISBN);
        for (const isbnVariant of isbnVariants) {
          const response = await fetchWithRetry(`https://openlibrary.org/isbn/${isbnVariant}.json`);
          if (response.ok) {
            const data = await response.json();

            // Extract cover image (high quality)
            if (data.covers && data.covers[0]) {
              result.coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
            }

            // Extract description
            if (data.description) {
              result.description = typeof data.description === 'string'
                ? data.description
                : data.description.value;
            }

            // Extract publishers
            if (data.publishers && data.publishers.length > 0) {
              result.publisher = data.publishers[0];
            }

            // Extract publish date
            if (data.publish_date) {
              result.publishedDate = data.publish_date;
            }

            // Extract page count
            if (data.number_of_pages && data.number_of_pages > 0) {
              result.pageCount = data.number_of_pages;
            }

            // Fetch work details for more complete information
            if (data.works && data.works[0]?.key) {
              try {
                const workResponse = await fetchWithRetry(`https://openlibrary.org${data.works[0].key}.json`);
                if (workResponse.ok) {
                  const workData = await workResponse.json();

                  // Get description from work if not in edition
                  if (!result.description && workData.description) {
                    result.description = typeof workData.description === 'string'
                      ? workData.description
                      : workData.description.value;
                  }

                  // Get subjects/genres
                  if (workData.subjects && workData.subjects.length > 0) {
                    result.genre = workData.subjects.slice(0, 3).join(', ');
                  }
                }
              } catch (workError) {
                // Continue without work data
              }
            }

            // If we got some data, return it
            if (result.coverUrl || result.description) {
              return result;
            }
          }
        }
      } catch (isbnError) {
        console.error('OpenLibrary ISBN lookup failed:', isbnError);
      }
    }

    // Fallback to title/author search
    const searchResponse = await fetchWithRetry(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=5`
    );

    if (!searchResponse.ok) return result;

    const searchData = await searchResponse.json();

    if (!searchData.docs || searchData.docs.length === 0) return result;

    const book = findBestMatch(searchData.docs, title, author);

    // Get cover image (high quality)
    if (book.cover_i) {
      result.coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    } else if (book.isbn && book.isbn[0]) {
      result.coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-L.jpg`;
    }

    // Get genres from subjects
    if (book.subject && book.subject.length > 0) {
      result.genre = book.subject.slice(0, 3).join(', ');
    }

    // Get publisher
    if (book.publisher && book.publisher.length > 0) {
      result.publisher = book.publisher[0];
    }

    // Get publish date
    if (book.first_publish_year) {
      result.publishedDate = book.first_publish_year.toString();
    }

    // Get page count
    if (book.number_of_pages_median && book.number_of_pages_median > 0) {
      result.pageCount = book.number_of_pages_median;
    }

    // Fetch description from work if available
    if (book.key) {
      try {
        const workResponse = await fetchWithRetry(`https://openlibrary.org${book.key}.json`);
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

// Helper function to convert between ISBN-10 and ISBN-13
function getISBNVariants(isbn: string): string[] {
  const variants = [isbn];

  // Remove any remaining non-digit characters
  const digits = isbn.replace(/\D/g, '');

  if (digits.length === 10) {
    // Convert ISBN-10 to ISBN-13
    const isbn13 = '978' + digits.substring(0, 9);
    const checksum = calculateISBN13Checksum(isbn13);
    variants.push(isbn13 + checksum);
  } else if (digits.length === 13 && digits.startsWith('978')) {
    // Convert ISBN-13 to ISBN-10
    const isbn10Base = digits.substring(3, 12);
    const checksum = calculateISBN10Checksum(isbn10Base);
    if (checksum !== 'X' && checksum !== '') {
      variants.push(isbn10Base + checksum);
    }
  }

  return variants;
}

function calculateISBN13Checksum(isbn12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn12[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum.toString();
}

function calculateISBN10Checksum(isbn9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn9[i]) * (10 - i);
  }
  const checksum = (11 - (sum % 11)) % 11;
  return checksum === 10 ? 'X' : checksum.toString();
}

// Helper function to retry failed fetch requests with improved backoff
async function fetchWithRetry(url: string, retries = 3, delay = 800): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CozyReads/1.0 (Book enrichment service)',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error (5xx) - retry with exponential backoff
      if (i < retries) {
        const backoffDelay = delay * Math.pow(1.5, i);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }

      return response;
    } catch (error) {
      // Network error or timeout - retry with exponential backoff
      if (i < retries) {
        const backoffDelay = delay * Math.pow(1.5, i);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to fetch after ${retries} retries`);
}

// Find the best match from search results using fuzzy matching
function findBestMatch(items: any[], targetTitle: string, targetAuthor: string): any {
  if (!items || items.length === 0) return items[0];
  if (items.length === 1) return items[0];

  // Normalize strings for comparison - more aggressive normalization
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')       // Collapse multiple spaces
      .trim();
  };

  // Remove common subtitle patterns and extra info
  const cleanTitle = (title: string) => {
    let cleaned = normalize(title);
    // Remove common patterns like "book 1", "volume 1", "a novel", etc.
    cleaned = cleaned.replace(/\b(book|vol|volume|part|a novel|the novel)\s*\d*\b/gi, '');
    // Remove parenthetical information
    cleaned = cleaned.replace(/\([^)]*\)/g, '');
    return cleaned.trim();
  };

  const normalizedTitle = cleanTitle(targetTitle);
  const normalizedAuthor = normalize(targetAuthor);

  // Split into words for token-based matching
  const titleWords = new Set(normalizedTitle.split(' ').filter(w => w.length > 2));
  const authorWords = new Set(normalizedAuthor.split(' ').filter(w => w.length > 1));

  // Score each item
  const scored = items.map(item => {
    const itemTitle = cleanTitle(item.title || item.volumeInfo?.title || '');
    const itemAuthor = normalize(
      item.author_name?.[0] ||
      item.volumeInfo?.authors?.[0] ||
      ''
    );

    const itemTitleWords = new Set(itemTitle.split(' ').filter(w => w.length > 2));
    const itemAuthorWords = new Set(itemAuthor.split(' ').filter(w => w.length > 1));

    let score = 0;

    // Exact substring match (highest score)
    if (itemTitle.includes(normalizedTitle) || normalizedTitle.includes(itemTitle)) {
      score += 5;
    }

    // Calculate word overlap for title (flexible matching)
    const titleOverlap = [...titleWords].filter(word => itemTitleWords.has(word)).length;
    const titleTotal = Math.max(titleWords.size, itemTitleWords.size);
    if (titleTotal > 0) {
      score += (titleOverlap / titleTotal) * 4;  // Up to 4 points for title similarity
    }

    // Author matching
    if (itemAuthor.includes(normalizedAuthor) || normalizedAuthor.includes(itemAuthor)) {
      score += 3;
    } else {
      // Check author word overlap
      const authorOverlap = [...authorWords].filter(word => itemAuthorWords.has(word)).length;
      if (authorOverlap > 0) {
        score += (authorOverlap / authorWords.size) * 2;
      }
    }

    // Bonus for first word match (often the main title)
    const firstWordTarget = normalizedTitle.split(' ')[0];
    const firstWordItem = itemTitle.split(' ')[0];
    if (firstWordTarget === firstWordItem && firstWordTarget.length > 3) {
      score += 1;
    }

    return { item, score };
  });

  // Sort by score and return best match
  scored.sort((a, b) => b.score - a.score);
  return scored[0].item;
}
