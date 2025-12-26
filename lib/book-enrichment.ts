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
    // Try Hardcover first (fastest, best quality for modern books)
    const hardcover = await fetchFromHardcover(isbn, title, author);

    // If Hardcover found the book with good data, use it and skip other sources
    const hardcoverFoundBook = hardcover && (hardcover.coverUrl || hardcover.description);

    let google = null;
    let openLib = null;
    let worldCat = null;

    // Only query other sources if Hardcover didn't find the book
    if (!hardcoverFoundBook) {
      // Fallback to other sources in parallel
      const [googleResult, openLibraryResult, worldCatResult] = await Promise.allSettled([
        fetchFromGoogleBooks(isbn, title, author),
        fetchFromOpenLibrary(isbn, title, author),
        fetchFromWorldCat(isbn, title, author)
      ]);

      google = googleResult.status === 'fulfilled' ? googleResult.value : null;
      openLib = openLibraryResult.status === 'fulfilled' ? openLibraryResult.value : null;
      worldCat = worldCatResult.status === 'fulfilled' ? worldCatResult.value : null;
    }

    // Cover URL: Prefer Hardcover for highest quality, fallback to Google Books
    result.coverUrl = hardcover?.coverUrl || google?.coverUrl || openLib?.coverUrl || worldCat?.coverUrl || null;

    // Description: Always pick the longest (most detailed) from any source
    const googleDesc = google?.description || '';
    const openLibDesc = openLib?.description || '';
    const worldCatDesc = worldCat?.description || '';
    const hardcoverDesc = hardcover?.description || '';
    const descriptions = [googleDesc, openLibDesc, worldCatDesc, hardcoverDesc].sort((a, b) => b.length - a.length);
    result.description = descriptions[0] || null;

    // Genre: Combine unique genres from all sources
    const genres = new Set<string>();
    if (google?.genre) {
      google.genre.split(',').forEach(g => genres.add(g.trim()));
    }
    if (hardcover?.genre) {
      hardcover.genre.split(',').forEach(g => genres.add(g.trim()));
    }
    if (openLib?.genre) {
      openLib.genre.split(',').forEach(g => genres.add(g.trim()));
    }
    if (worldCat?.genre) {
      worldCat.genre.split(',').forEach(g => genres.add(g.trim()));
    }
    result.genre = genres.size > 0 ? Array.from(genres).slice(0, 3).join(', ') : null;

    // Metadata: Prefer Google Books (most reliable), fallback to Hardcover, then others
    result.publisher = google?.publisher || hardcover?.publisher || worldCat?.publisher || openLib?.publisher || null;
    result.publishedDate = google?.publishedDate || hardcover?.publishedDate || worldCat?.publishedDate || openLib?.publishedDate || null;
    result.pageCount = google?.pageCount || hardcover?.pageCount || worldCat?.pageCount || openLib?.pageCount || null;

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

    // Strategy 4: Remove subtitle from title (before colon or dash)
    const mainTitle = cleanTitle.split(':')[0].split('-')[0].trim();
    if (mainTitle !== cleanTitle && mainTitle.length > 3) {
      searchStrategies.push(`intitle:"${mainTitle}"+inauthor:"${cleanAuthor}"`);
    }

    // Strategy 5: Remove series info (anything in parentheses)
    const titleWithoutSeries = cleanTitle.replace(/\([^)]*\)/g, '').trim();
    if (titleWithoutSeries !== cleanTitle && titleWithoutSeries.length > 3) {
      searchStrategies.push(`intitle:"${titleWithoutSeries}"+inauthor:"${cleanAuthor}"`);
    }

    // Strategy 6: First significant word of title + full author
    const firstWords = cleanTitle.split(' ').slice(0, 3).join(' ');
    if (firstWords.length > 5) {
      searchStrategies.push(`intitle:${firstWords}+inauthor:"${cleanAuthor}"`);
    }

    // Strategy 7: Fallback without quotes (broader search)
    searchStrategies.push(`intitle:${cleanTitle}+inauthor:${cleanAuthor}`);

    // Strategy 8: Just title if all else fails
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

    // Fallback to title/author search with multiple strategies
    const searchStrategies = [
      // Strategy 1: Exact title and author
      { title, author },
      // Strategy 2: Remove subtitle (before colon)
      { title: title.split(':')[0].trim(), author },
      // Strategy 3: Remove series info (parentheses)
      { title: title.replace(/\([^)]*\)/g, '').trim(), author },
      // Strategy 4: Author last name only
      { title, author: author.split(' ').pop() || author },
    ];

    for (const { title: searchTitle, author: searchAuthor } of searchStrategies) {
      if (!searchTitle || searchTitle.length < 3) continue;

      try {
        const searchResponse = await fetchWithRetry(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(searchTitle)}&author=${encodeURIComponent(searchAuthor)}&limit=10`
        );

        if (!searchResponse.ok) continue;

        const searchData = await searchResponse.json();

        if (!searchData.docs || searchData.docs.length === 0) continue;

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

        // If we found good data, break out of search strategies loop
        if (result.coverUrl || result.description) {
          break;
        }
      } catch (error) {
        // This strategy failed, try next one
        continue;
      }
    }

  } catch (error) {
    console.error('Error fetching from Open Library:', error);
  }

  return result;
}

async function fetchFromWorldCat(isbn: string | null, title: string, author: string) {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
    publisher: null as string | null,
    publishedDate: null as string | null,
    pageCount: null as number | null,
  };

  try {
    // WorldCat Search API endpoint
    const searchStrategies = [];

    // Try ISBN first if available
    if (isbn) {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      searchStrategies.push(`srw.isbn="${cleanISBN}"`);
    }

    // Try title + author
    const cleanTitle = title.trim().replace(/[:"]/g, '');
    const cleanAuthor = author.trim();
    searchStrategies.push(`srw.ti="${cleanTitle}" and srw.au="${cleanAuthor}"`);

    // Try just title if author fails
    searchStrategies.push(`srw.ti="${cleanTitle}"`);

    for (const query of searchStrategies) {
      try {
        // WorldCat SRU API (free, no key required)
        const response = await fetchWithRetry(
          `http://www.worldcat.org/webservices/catalog/search/sru?query=${encodeURIComponent(query)}&maximumRecords=5&recordSchema=info:srw/schema/1/dc`
        );

        if (!response.ok) continue;

        const xmlText = await response.text();

        // Parse XML response (simplified - looking for key fields)
        // Extract title
        const titleMatch = xmlText.match(/<dc:title[^>]*>(.*?)<\/dc:title>/);
        if (!titleMatch) continue;

        // Extract description/summary
        const descMatch = xmlText.match(/<dc:description[^>]*>(.*?)<\/dc:description>/);
        if (descMatch && descMatch[1]) {
          result.description = descMatch[1].replace(/<[^>]*>/g, '').trim();
        }

        // Extract publisher
        const publisherMatch = xmlText.match(/<dc:publisher[^>]*>(.*?)<\/dc:publisher>/);
        if (publisherMatch && publisherMatch[1]) {
          result.publisher = publisherMatch[1].replace(/<[^>]*>/g, '').trim();
        }

        // Extract date
        const dateMatch = xmlText.match(/<dc:date[^>]*>(.*?)<\/dc:date>/);
        if (dateMatch && dateMatch[1]) {
          result.publishedDate = dateMatch[1].replace(/<[^>]*>/g, '').trim();
        }

        // Extract subjects (genres)
        const subjectMatches = xmlText.match(/<dc:subject[^>]*>(.*?)<\/dc:subject>/g);
        if (subjectMatches && subjectMatches.length > 0) {
          const subjects = subjectMatches
            .map(s => s.replace(/<[^>]*>/g, '').trim())
            .filter(s => s.length > 0)
            .slice(0, 3);
          if (subjects.length > 0) {
            result.genre = subjects.join(', ');
          }
        }

        // If we found some data, return it
        if (result.description || result.publisher) {
          break;
        }
      } catch (error) {
        // This strategy failed, try next one
        continue;
      }
    }
  } catch (error) {
    console.error('Error fetching from WorldCat:', error);
  }

  return result;
}

async function fetchFromHardcover(isbn: string | null, title: string, author: string) {
  const result = {
    coverUrl: null as string | null,
    genre: null as string | null,
    description: null as string | null,
    publisher: null as string | null,
    publishedDate: null as string | null,
    pageCount: null as number | null,
  };

  try {
    // Hardcover GraphQL API
    const query = `
      query SearchBooks($query: String!) {
        books(where: { query: $query }, limit: 5) {
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
          }
          book_series {
            series {
              name
            }
          }
        }
      }
    `;

    // Try different search strategies
    const searchStrategies = [];

    if (isbn) {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      searchStrategies.push(cleanISBN);
      // Try both ISBN-13 and ISBN-10 variants
      const isbnVariants = getISBNVariants(cleanISBN);
      isbnVariants.forEach(variant => {
        if (variant !== cleanISBN) {
          searchStrategies.push(variant);
        }
      });
    }

    // Remove series info from title (content in parentheses)
    const titleWithoutSeries = title.replace(/\s*\([^)]*\)\s*/g, '').trim();

    // Try title variations
    searchStrategies.push(`${title} ${author}`);
    if (titleWithoutSeries !== title) {
      searchStrategies.push(`${titleWithoutSeries} ${author}`);
    }
    searchStrategies.push(title);
    if (titleWithoutSeries !== title) {
      searchStrategies.push(titleWithoutSeries);
    }

    for (const searchQuery of searchStrategies) {
      try {
        const response = await fetch('https://hardcover.app/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { query: searchQuery },
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();

        if (!data.data?.books || data.data.books.length === 0) continue;

        // Find best match
        const book = data.data.books[0]; // Use first result for now

        // Extract cover image
        if (book.image) {
          result.coverUrl = book.image;
        }

        // Extract description
        if (book.description) {
          result.description = book.description;
        }

        // Extract page count
        if (book.pages && book.pages > 0) {
          result.pageCount = book.pages;
        }

        // Extract published date
        if (book.release_date) {
          result.publishedDate = book.release_date;
        }

        // Extract genre from series if available
        if (book.book_series && book.book_series.length > 0) {
          const seriesNames = book.book_series.map((bs: any) => bs.series?.name).filter(Boolean);
          if (seriesNames.length > 0) {
            result.genre = seriesNames.slice(0, 3).join(', ');
          }
        }

        // If we found good data, break
        if (result.coverUrl || result.description) {
          break;
        }
      } catch (error) {
        // This strategy failed, try next one
        continue;
      }
    }
  } catch (error) {
    console.error('Error fetching from Hardcover:', error);
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
