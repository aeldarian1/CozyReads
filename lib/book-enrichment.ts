import { normalizeGenre } from './genre-mapper';
import { searchGoogleBooks } from './google-books';

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
 * Checks if a title indicates a summary, study guide, or book about another book
 */
function isSummaryOrStudyGuide(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  const summaryIndicators = [
    'summary',
    'summary:',
    'study guide',
    'instaread',
    'sparknotes',
    'cliffsnotes',
    'book summary',
    'analysis',
    'interpretation',
    'lektürehilfen', // German study guides
    'lektüreschlüssel', // German study keys
    'erläuterungen', // German explanations
    'guide to',
    'companion',
    'workbook',
    'discussion guide',
  ];

  return summaryIndicators.some(indicator => lowerTitle.includes(indicator));
}

/**
 * Detects if a description is likely in German (or other non-English languages)
 * Returns true if the text appears to be non-English
 */
function isNonEnglishDescription(description: string): boolean {
  if (!description || description.length < 50) return false;

  const lowerDesc = description.toLowerCase();

  // German indicators
  const germanIndicators = [
    'sie möchten',
    'können',
    'literatur verstehen',
    'klausur',
    'erläuterungen',
    'lektürehilfe',
    'interpretationen',
    'schullektüren',
    'verständlich',
    'prägnant',
    'schüler',
    'lehrer',
    'über',
    'für',
    'vorbereitung', // preparation
    'helfer', // helper
    'unterrichtsstunden', // lessons
    'referate', // presentations
    'abitur', // final exams
    'bewährten', // proven
  ];

  const germanMatches = germanIndicators.filter(indicator =>
    lowerDesc.includes(indicator)
  ).length;

  // If 3+ German indicators found, likely German text
  if (germanMatches >= 3) return true;

  // Could add more language detection here (French, Spanish, etc.) if needed

  return false;
}

/**
 * Smart algorithm to select the best cover URL from multiple sources
 * Considers image quality, size, and source reliability
 */
function selectBestCover(covers: Array<{ url: string | null; source: string }>): string | null {
  const validCovers = covers.filter(c => c.url && c.url.length > 0);
  if (validCovers.length === 0) return null;

  // Score each cover
  const scored = validCovers.map(cover => {
    let score = 0;

    // Source reliability (Google Books is most reliable for covers)
    if (cover.source === 'google') score += 40;
    else if (cover.source === 'hardcover') score += 30;
    else if (cover.source === 'worldcat') score += 20;
    else if (cover.source === 'openlibrary') score += 10;

    // URL quality indicators
    const url = cover.url!.toLowerCase();

    // Prefer HTTPS
    if (url.startsWith('https://')) score += 10;

    // Prefer larger images (look for size indicators in URL)
    if (url.includes('large') || url.includes('zoom=1')) score += 15;
    if (url.includes('medium')) score += 10;
    if (url.includes('small') || url.includes('thumbnail')) score -= 5;

    // Avoid placeholder/default images
    if (url.includes('no-cover') || url.includes('default') || url.includes('placeholder')) score -= 50;

    // Google Books specific quality indicators
    if (cover.source === 'google' && url.includes('zoom=')) {
      // Extract zoom level (higher is better)
      const zoomMatch = url.match(/zoom=(\d)/);
      if (zoomMatch) {
        const zoomLevel = parseInt(zoomMatch[1]);
        score += zoomLevel * 3;
      }
    }

    return { ...cover, score };
  });

  // Sort by score and return best
  scored.sort((a, b) => b.score - a.score);
  return scored[0].url;
}

/**
 * Smart algorithm to select the best description from multiple sources
 * Considers length, quality, and language
 */
function selectBestDescription(descriptions: Array<{ text: string | null; source: string }>): string | null {
  const validDescs = descriptions.filter(d => d.text && d.text.length >= 50);
  if (validDescs.length === 0) return null;

  // Score each description
  const scored = validDescs.map(desc => {
    let score = 0;
    const text = desc.text!;

    // Length score (longer is generally better, up to a point)
    const length = text.length;
    if (length >= 200 && length <= 1000) score += 30; // Sweet spot
    else if (length > 1000 && length <= 2000) score += 25;
    else if (length < 200) score += 10;

    // Reject non-English descriptions
    if (isNonEnglishDescription(text)) {
      score -= 100;
    }

    // Source reliability for descriptions
    if (desc.source === 'google') score += 25; // Google Books usually has good descriptions
    else if (desc.source === 'hardcover') score += 20;
    else if (desc.source === 'worldcat') score += 15;
    else if (desc.source === 'openlibrary') score += 10;

    // Quality indicators
    if (text.includes('ISBN') || text.includes('copyright')) score -= 5; // Metadata pollution
    if (text.match(/\d{3}-\d{3}/)) score -= 5; // Phone numbers/technical IDs

    // Prefer descriptions that seem editorial
    if (text.toLowerCase().includes('masterpiece') ||
        text.toLowerCase().includes('acclaimed') ||
        text.toLowerCase().includes('bestseller')) {
      score += 5;
    }

    return { ...desc, score };
  });

  // Sort by score and return best
  scored.sort((a, b) => b.score - a.score);
  return scored[0].text;
}

/**
 * Cross-validate data from multiple sources to confirm accuracy
 * Returns validated and consensus-based data
 */
function crossValidateData(
  google: any,
  hardcover: any,
  worldCat: any,
  openLib: any,
  expectedTitle: string,
  expectedAuthor: string
): {
  titleConfidence: number;
  authorConfidence: number;
  publisherConsensus: string | null;
  dateConsensus: string | null;
  pageCountConsensus: number | null;
} {
  const sources = [google, hardcover, worldCat, openLib].filter(s => s !== null);

  // Title validation - check if sources agree on the title
  let titleMatches = 0;
  sources.forEach(source => {
    if (source.title) {
      const similarity = calculateSimilarity(source.title, expectedTitle);
      if (similarity >= 0.8) titleMatches++;
    }
  });
  const titleConfidence = sources.length > 0 ? titleMatches / sources.length : 0;

  // Author validation - check if sources agree on the author
  let authorMatches = 0;
  sources.forEach(source => {
    if (source.author) {
      const similarity = calculateSimilarity(source.author, expectedAuthor);
      if (similarity >= 0.7) authorMatches++;
    }
  });
  const authorConfidence = sources.length > 0 ? authorMatches / sources.length : 0;

  // Publisher consensus - use most common publisher
  const publishers = [google?.publisher, hardcover?.publisher, worldCat?.publisher, openLib?.publisher]
    .filter(p => p && p.length > 0);
  const publisherConsensus = getMostCommon(publishers);

  // Publication date consensus - use most common date
  const dates = [google?.publishedDate, hardcover?.publishedDate, worldCat?.publishedDate, openLib?.publishedDate]
    .filter(d => d && d.length > 0);
  const dateConsensus = getMostCommon(dates);

  // Page count consensus - use median if multiple sources agree
  const pageCounts = [google?.pageCount, hardcover?.pageCount, worldCat?.pageCount, openLib?.pageCount]
    .filter(p => p && p > 0) as number[];
  const pageCountConsensus = pageCounts.length >= 2 ? getMedian(pageCounts) : pageCounts[0] || null;

  return {
    titleConfidence,
    authorConfidence,
    publisherConsensus,
    dateConsensus,
    pageCountConsensus,
  };
}

/**
 * Get the most common value from an array
 */
function getMostCommon(arr: string[]): string | null {
  if (arr.length === 0) return null;

  const frequency: Record<string, number> = {};
  arr.forEach(item => {
    const normalized = item.toLowerCase().trim();
    frequency[normalized] = (frequency[normalized] || 0) + 1;
  });

  let maxCount = 0;
  let mostCommon: string | null = null;
  Object.entries(frequency).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value;
    }
  });

  // Return original casing from the array
  if (!mostCommon) return null;
  return arr.find(item => item.toLowerCase().trim() === mostCommon) || null;
}

/**
 * Get median value from array of numbers
 */
function getMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

/**
 * Score a book result based on how well it matches expected title/author
 * Returns a score from 0-100 (higher is better)
 */
function scoreBookMatch(
  document: any,
  expectedTitle: string,
  expectedAuthor: string,
  expectedISBN?: string | null
): number {
  let score = 0;

  // ISBN exact match is worth 50 points (very strong signal)
  if (expectedISBN && document.isbns && Array.isArray(document.isbns)) {
    const cleanExpectedISBN = expectedISBN.replace(/[-\s]/g, '');
    const hasISBNMatch = document.isbns.some((isbn: string) => {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      return cleanISBN === cleanExpectedISBN;
    });
    if (hasISBNMatch) score += 50;
  }

  // Title similarity (up to 30 points)
  const titleSimilarity = calculateSimilarity(document.title || '', expectedTitle);
  score += titleSimilarity * 30;

  // Author similarity (up to 20 points)
  const authorNames = document.author_names || [];
  const bookAuthors = authorNames.join(' ');
  const authorSimilarity = calculateSimilarity(bookAuthors, expectedAuthor);
  score += authorSimilarity * 20;

  // Bonus points for having cover and description
  if (document.image?.url) score += 5;
  if (document.description) score += 5;

  // Penalty for being a summary/study guide (even if other criteria match)
  if (isSummaryOrStudyGuide(document.title || '')) {
    score -= 50;
  }

  // HEAVY penalty for non-English descriptions (study guides in other languages)
  if (document.description && isNonEnglishDescription(document.description)) {
    score -= 60;
  }

  return score;
}

/**
 * Validates if a Hardcover result matches the expected book
 * More strict than search validation - requires good title/author match
 */
function isMatchingBook(
  hit: any,
  expectedTitle: string,
  expectedAuthor: string,
  expectedISBN?: string | null
): boolean {
  const document = hit.document;

  // Reject summary books and study guides
  if (isSummaryOrStudyGuide(document.title || '')) {
    return false;
  }

  // Reject books with non-English descriptions (likely foreign study guides)
  if (document.description && isNonEnglishDescription(document.description)) {
    return false;
  }

  // If we have an ISBN and the result has ISBNs, check for exact match
  if (expectedISBN && document.isbns && Array.isArray(document.isbns)) {
    const cleanExpectedISBN = expectedISBN.replace(/[-\s]/g, '');
    const hasISBNMatch = document.isbns.some((isbn: string) => {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      return cleanISBN === cleanExpectedISBN;
    });

    // If ISBN matches, it's definitely the right book (even if title/author differ)
    if (hasISBNMatch) return true;
  }

  // Calculate title similarity
  const titleSimilarity = calculateSimilarity(document.title || '', expectedTitle);

  // Require high title similarity (at least 70% match)
  if (titleSimilarity < 0.7) return false;

  // STRICT AUTHOR CHECK: If we're searching with an author, the result must have matching author
  const authorNames = document.author_names || [];
  const bookAuthors = authorNames.join(' ');
  const authorSimilarity = calculateSimilarity(bookAuthors, expectedAuthor);

  // Require at least 50% author match (stricter than before)
  // This prevents accepting "Summary: Atomic Habits" by a different author
  if (authorSimilarity >= 0.5) return true;

  // Edge case: If title match is very high (95%+) and author is similar (30%+), accept
  // This handles cases where author formatting differs significantly
  if (titleSimilarity >= 0.95 && authorSimilarity >= 0.3) return true;

  return false;
}

/**
 * Enriches book data by fetching missing information from Hardcover API (primary) or multiple sources
 * Uses a smart merging strategy to get the best data from all sources
 *
 * @param isbn - Book ISBN (if available)
 * @param title - Book title
 * @param author - Book author
 * @param hardcoverOnly - If true, only use Hardcover API (faster but less comprehensive)
 * @param fastMode - If true, use optimized Google Books service for speed (recommended for bulk imports)
 */
export async function enrichBookFromGoogleBooks(
  isbn: string | null,
  title: string,
  author: string,
  hardcoverOnly: boolean = false,
  fastMode: boolean = false
): Promise<{
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

  // Fast Mode: Use optimized Google Books service for bulk imports
  if (fastMode) {
    try {
      const searchQuery = isbn || `${title} ${author}`;
      const googleResults = await searchGoogleBooks(searchQuery, 3);

      if (googleResults.length > 0) {
        // Use first result (usually most relevant)
        const book = googleResults[0];

        result.coverUrl = book.coverUrl || null;
        result.description = book.description || null;
        result.genre = book.genre || null;
        result.publisher = book.publisher || null;
        result.publishedDate = book.publishedDate || null;
        result.pageCount = book.totalPages || null;

        console.log(`Fast mode: Enriched "${title}" from Google Books`);
      }

      return result;
    } catch (error) {
      console.error('Fast mode enrichment failed:', error);
      return result;
    }
  }

  try {
    // Try Hardcover first (fastest, best quality for modern books)
    const hardcover = await fetchFromHardcover(isbn, title, author);

    // If Hardcover-only mode, skip other sources entirely
    if (hardcoverOnly) {
      result.coverUrl = hardcover?.coverUrl || null;
      result.description = hardcover?.description || null;
      result.publisher = hardcover?.publisher || null;
      result.publishedDate = hardcover?.publishedDate || null;
      result.pageCount = hardcover?.pageCount || null;

      // Normalize genres from Hardcover
      const genres = new Set<string>();
      const addNormalizedGenres = (rawGenre: string | null | undefined) => {
        if (!rawGenre) return;
        rawGenre.split(',').forEach(g => {
          const normalized = normalizeGenre(g.trim());
          if (normalized) {
            genres.add(normalized);
          }
        });
      };
      addNormalizedGenres(hardcover?.genre);
      result.genre = genres.size > 0 ? Array.from(genres).slice(0, 3).join(', ') : null;

      return result;
    }

    // ALWAYS query Google Books for critical data validation
    // Google Books is very reliable and helps catch incorrect Hardcover data
    let google = null;
    let openLib = null;
    let worldCat = null;

    // Strategy: Always fetch from Google Books (most reliable)
    // Only fetch from OpenLibrary/WorldCat if we're missing critical data
    const hardcoverHasGoodData = hardcover && hardcover.coverUrl && hardcover.description;

    if (!hardcoverHasGoodData) {
      // If Hardcover is missing data, query all sources
      const [googleResult, openLibraryResult, worldCatResult] = await Promise.allSettled([
        fetchFromGoogleBooks(isbn, title, author),
        fetchFromOpenLibrary(isbn, title, author),
        fetchFromWorldCat(isbn, title, author)
      ]);

      google = googleResult.status === 'fulfilled' ? googleResult.value : null;
      openLib = openLibraryResult.status === 'fulfilled' ? openLibraryResult.value : null;
      worldCat = worldCatResult.status === 'fulfilled' ? worldCatResult.value : null;
    } else {
      // Hardcover has data, but still check Google Books for validation/better data
      try {
        google = await fetchFromGoogleBooks(isbn, title, author);
      } catch (error) {
        // Google Books failed, continue with Hardcover data
      }
    }

    // Smart cover selection: Score each source and pick the best quality
    const coverCandidates = [
      { url: google?.coverUrl || null, source: 'google' },
      { url: hardcover?.coverUrl || null, source: 'hardcover' },
      { url: worldCat?.coverUrl || null, source: 'worldcat' },
      { url: openLib?.coverUrl || null, source: 'openlibrary' },
    ];
    result.coverUrl = selectBestCover(coverCandidates);

    // Smart description selection: Score based on length, quality, and language
    const descriptionCandidates = [
      { text: google?.description || null, source: 'google' },
      { text: hardcover?.description || null, source: 'hardcover' },
      { text: worldCat?.description || null, source: 'worldcat' },
      { text: openLib?.description || null, source: 'openlibrary' },
    ];
    result.description = selectBestDescription(descriptionCandidates);

    // Genre: Combine and normalize unique genres from all sources
    const genres = new Set<string>();

    // Normalize and add genres from each source
    const addNormalizedGenres = (rawGenre: string | null | undefined) => {
      if (!rawGenre) return;
      rawGenre.split(',').forEach(g => {
        const normalized = normalizeGenre(g.trim());
        if (normalized) {
          genres.add(normalized);
        }
      });
    };

    addNormalizedGenres(google?.genre);
    addNormalizedGenres(hardcover?.genre);
    addNormalizedGenres(openLib?.genre);
    addNormalizedGenres(worldCat?.genre);

    result.genre = genres.size > 0 ? Array.from(genres).slice(0, 3).join(', ') : null;

    // Cross-validate metadata from all sources for accuracy
    const validation = crossValidateData(google, hardcover, worldCat, openLib, title, author);

    // Use consensus-based metadata (more reliable than single source)
    result.publisher = validation.publisherConsensus || google?.publisher || hardcover?.publisher || null;
    result.publishedDate = validation.dateConsensus || google?.publishedDate || hardcover?.publishedDate || null;
    result.pageCount = validation.pageCountConsensus || google?.pageCount || hardcover?.pageCount || null;

    // Log confidence levels for debugging (low confidence = potential data quality issue)
    if (validation.titleConfidence < 0.5) {
      console.warn(`Low title confidence (${(validation.titleConfidence * 100).toFixed(0)}%) for: ${title}`);
    }
    if (validation.authorConfidence < 0.5) {
      console.warn(`Low author confidence (${(validation.authorConfidence * 100).toFixed(0)}%) for: ${author}`);
    }

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

    // Clean title variations
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const titleWithoutSeries = cleanTitle.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const titleBeforeColon = cleanTitle.split(':')[0].trim();
    const titleBeforeColonNoSeries = titleBeforeColon.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const authorLastName = cleanAuthor.split(' ').pop();

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

    // Strategy 2: Title variations + author
    searchStrategies.push(`intitle:"${cleanTitle}"+inauthor:"${cleanAuthor}"`);

    if (titleBeforeColon !== cleanTitle) {
      searchStrategies.push(`intitle:"${titleBeforeColon}"+inauthor:"${cleanAuthor}"`);
    }

    if (titleWithoutSeries !== cleanTitle) {
      searchStrategies.push(`intitle:"${titleWithoutSeries}"+inauthor:"${cleanAuthor}"`);
    }

    if (titleBeforeColonNoSeries !== cleanTitle && titleBeforeColonNoSeries !== titleBeforeColon) {
      searchStrategies.push(`intitle:"${titleBeforeColonNoSeries}"+inauthor:"${cleanAuthor}"`);
    }

    // Strategy 3: Title variations with author last name
    if (authorLastName && authorLastName.length > 2) {
      searchStrategies.push(`intitle:"${cleanTitle}"+inauthor:${authorLastName}`);

      if (titleBeforeColon !== cleanTitle) {
        searchStrategies.push(`intitle:"${titleBeforeColon}"+inauthor:${authorLastName}`);
      }
    }

    // Strategy 4: Fallback without quotes (broader search)
    searchStrategies.push(`intitle:${cleanTitle}+inauthor:${cleanAuthor}`);

    if (titleBeforeColon !== cleanTitle) {
      searchStrategies.push(`intitle:${titleBeforeColon}+inauthor:${cleanAuthor}`);
    }

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

    // Fallback to title/author search with multiple strategies
    // Clean title variations
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const titleWithoutSeries = cleanTitle.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const titleBeforeColon = cleanTitle.split(':')[0].trim();
    const titleBeforeColonNoSeries = titleBeforeColon.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const authorLastName = cleanAuthor.split(' ').pop() || cleanAuthor;

    const searchStrategies = [
      // Strategy 1: Exact title and author
      { title: cleanTitle, author: cleanAuthor },
      // Strategy 2: Title before colon (handles long subtitles)
      ...(titleBeforeColon !== cleanTitle ? [{ title: titleBeforeColon, author: cleanAuthor }] : []),
      // Strategy 3: Title without series info (handles parentheses)
      ...(titleWithoutSeries !== cleanTitle ? [{ title: titleWithoutSeries, author: cleanAuthor }] : []),
      // Strategy 4: Title before colon without series
      ...(titleBeforeColonNoSeries !== cleanTitle && titleBeforeColonNoSeries !== titleBeforeColon
        ? [{ title: titleBeforeColonNoSeries, author: cleanAuthor }] : []),
      // Strategy 5: Author last name only with full title
      { title: cleanTitle, author: authorLastName },
      // Strategy 6: Title before colon with author last name
      ...(titleBeforeColon !== cleanTitle ? [{ title: titleBeforeColon, author: authorLastName }] : []),
      // Strategy 7: Title without series with author last name
      ...(titleWithoutSeries !== cleanTitle ? [{ title: titleWithoutSeries, author: authorLastName }] : []),
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

      // Try ISBN variants (ISBN-10 and ISBN-13)
      const isbnVariants = getISBNVariants(cleanISBN);
      isbnVariants.forEach(variant => {
        if (variant !== cleanISBN) {
          searchStrategies.push(`srw.isbn="${variant}"`);
        }
      });
    }

    // Clean title variations
    const cleanTitle = title.trim().replace(/[:"]/g, '');
    const cleanAuthor = author.trim();
    const titleWithoutSeries = title.replace(/\s*\([^)]*\)\s*/g, '').trim().replace(/[:"]/g, '');
    const titleBeforeColon = title.split(':')[0].trim().replace(/[:"]/g, '');
    const titleBeforeColonNoSeries = titleBeforeColon.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const authorLastName = cleanAuthor.split(' ').pop() || cleanAuthor;

    // Strategy 1: Full title + author
    searchStrategies.push(`srw.ti="${cleanTitle}" and srw.au="${cleanAuthor}"`);

    // Strategy 2: Title before colon + author (handles long subtitles)
    if (titleBeforeColon !== cleanTitle) {
      searchStrategies.push(`srw.ti="${titleBeforeColon}" and srw.au="${cleanAuthor}"`);
    }

    // Strategy 3: Title without series + author (handles parentheses)
    if (titleWithoutSeries !== cleanTitle) {
      searchStrategies.push(`srw.ti="${titleWithoutSeries}" and srw.au="${cleanAuthor}"`);
    }

    // Strategy 4: Title before colon without series + author
    if (titleBeforeColonNoSeries !== cleanTitle && titleBeforeColonNoSeries !== titleBeforeColon) {
      searchStrategies.push(`srw.ti="${titleBeforeColonNoSeries}" and srw.au="${cleanAuthor}"`);
    }

    // Strategy 5: Full title + author last name
    searchStrategies.push(`srw.ti="${cleanTitle}" and srw.au="${authorLastName}"`);

    // Strategy 6: Title before colon + author last name
    if (titleBeforeColon !== cleanTitle) {
      searchStrategies.push(`srw.ti="${titleBeforeColon}" and srw.au="${authorLastName}"`);
    }

    // Strategy 7: Just title variations as fallback
    searchStrategies.push(`srw.ti="${cleanTitle}"`);
    if (titleBeforeColon !== cleanTitle) {
      searchStrategies.push(`srw.ti="${titleBeforeColon}"`);
    }

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
    // Hardcover GraphQL API - using search API
    const query = `
      query SearchBooks($query: String!) {
        search(query: $query, query_type: "books", per_page: 5) {
          results
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

    // Clean title variations
    const titleWithoutSeries = title.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const titleBeforeColon = title.split(':')[0].trim(); // "The Gifts of Imperfection: Long Subtitle" -> "The Gifts of Imperfection"
    const titleBeforeColonNoSeries = titleBeforeColon.replace(/\s*\([^)]*\)\s*/g, '').trim();

    // Try title variations (most specific first)
    searchStrategies.push(`${title} ${author}`);
    if (titleWithoutSeries !== title) {
      searchStrategies.push(`${titleWithoutSeries} ${author}`);
    }
    if (titleBeforeColon !== title) {
      searchStrategies.push(`${titleBeforeColon} ${author}`);
    }
    if (titleBeforeColonNoSeries !== title && titleBeforeColonNoSeries !== titleBeforeColon) {
      searchStrategies.push(`${titleBeforeColonNoSeries} ${author}`);
    }
    searchStrategies.push(title);
    if (titleBeforeColon !== title) {
      searchStrategies.push(titleBeforeColon);
    }

    for (const searchQuery of searchStrategies) {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add authentication token if available
        const hardcoverToken = process.env.HARDCOVER_API_TOKEN;
        if (hardcoverToken) {
          headers['Authorization'] = `Bearer ${hardcoverToken}`;
        }

        const response = await fetch('https://api.hardcover.app/v1/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            variables: { query: searchQuery },
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();

        if (!data.data?.search?.results?.hits || data.data.search.results.hits.length === 0) continue;

        // Filter results to find matching books
        const matchingHits = data.data.search.results.hits.filter((hit: any) =>
          isMatchingBook(hit, title, author, isbn)
        );

        // If no matching results, try next search strategy
        if (matchingHits.length === 0) continue;

        // Score all matching results and pick the best one
        const scoredHits = matchingHits.map((hit: any) => ({
          hit,
          score: scoreBookMatch(hit.document, title, author, isbn)
        }));

        // Sort by score (descending) and pick the best match
        scoredHits.sort((a: any, b: any) => b.score - a.score);
        const book = scoredHits[0].hit.document;

        // Extract cover image
        if (book.image?.url) {
          result.coverUrl = book.image.url;
        }

        // Extract description
        if (book.description) {
          result.description = book.description;
        }

        // Extract page count
        if (book.pages && book.pages > 0) {
          result.pageCount = book.pages;
        }

        // Extract release date
        if (book.release_date) {
          result.publishedDate = book.release_date;
        }

        // Extract genres
        if (book.genres && Array.isArray(book.genres)) {
          result.genre = book.genres.slice(0, 3).join(', ');
        }

        // Extract publisher (if available)
        if (book.publisher) {
          result.publisher = book.publisher;
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
