/**
 * Data standardization utilities for books
 * Normalizes authors, titles, and reading status
 */

// ============================================================================
// AUTHOR STANDARDIZATION
// ============================================================================

// Common author name abbreviations and their full forms
const AUTHOR_NAME_EXPANSIONS: Record<string, string> = {
  'alex.': 'Alexandre',
  'alex': 'Alexandre',
  'thos.': 'Thomas',
  'thos': 'Thomas',
  'wm.': 'William',
  'wm': 'William',
  'chas.': 'Charles',
  'chas': 'Charles',
  'robt.': 'Robert',
  'robt': 'Robert',
  'geo.': 'George',
  'geo': 'George',
  'edw.': 'Edward',
  'edw': 'Edward',
  'fran.': 'Francis',
  'fran': 'Francis',
};

/**
 * Standardizes author name to "FirstName LastName" format
 */
export function standardizeAuthor(author: string | null | undefined): string {
  if (!author || author.trim() === '') return 'Unknown Author';

  let cleaned = author.trim();

  // Remove common suffixes
  cleaned = cleaned.replace(/\s*\(.*?\)\s*/g, ''); // Remove parenthetical info
  cleaned = cleaned.replace(/\s*,\s*(Jr|Sr|III|II|IV)\.?$/i, ''); // Keep these for now, will add back

  // Handle "LastName, FirstName" format
  if (cleaned.includes(',') && !cleaned.includes(' and ') && !cleaned.includes(' & ')) {
    const parts = cleaned.split(',').map(p => p.trim());
    if (parts.length === 2) {
      // "Rowling, J.K." -> "J.K. Rowling"
      cleaned = `${parts[1]} ${parts[0]}`;
    }
  }

  // Fix "Alex. Re Dumas" → "Alexandre Dumas" type issues
  // Remove errant "Re" that appears after abbreviated first names
  cleaned = cleaned.replace(/\b(Alex\.|Thos\.|Wm\.|Chas\.|Robt\.|Geo\.|Edw\.|Fran\.)\s+Re\s+/gi, '$1 ');

  // Normalize spacing around initials (J.K. vs J. K. vs JK)
  cleaned = cleaned.replace(/\b([A-Z])\.?\s*([A-Z])\.?\b/g, '$1.$2.');

  // Fix multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Title case and expand abbreviations for each part
  cleaned = cleaned
    .split(' ')
    .map((word, index) => {
      // Keep initials uppercase (J.K.)
      if (/^[A-Z]\.?$/.test(word) || /^[A-Z]\.[A-Z]\.?$/.test(word)) {
        return word;
      }

      const lowerWord = word.toLowerCase();

      // Expand common abbreviations (only for first names, not last names)
      if (index === 0 && AUTHOR_NAME_EXPANSIONS[lowerWord]) {
        return AUTHOR_NAME_EXPANSIONS[lowerWord];
      }

      // Title case regular words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return cleaned;
}

/**
 * Standardizes multiple authors (comma or "and" separated)
 */
export function standardizeAuthors(authors: string | null | undefined): string {
  if (!authors || authors.trim() === '') return 'Unknown Author';

  // Split by common separators
  const authorList = authors
    .split(/\s*(?:,|and|&)\s*/)
    .map(a => standardizeAuthor(a.trim()))
    .filter(a => a && a !== 'Unknown Author');

  if (authorList.length === 0) return 'Unknown Author';
  if (authorList.length === 1) return authorList[0];

  // Return as comma-separated list
  return authorList.join(', ');
}

// ============================================================================
// TITLE STANDARDIZATION
// ============================================================================

/**
 * Converts a string to Title Case
 */
function toTitleCase(str: string): string {
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return str
    .split(' ')
    .map((word, index, array) => {
      // Always capitalize first and last word
      if (index === 0 || index === array.length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Keep acronyms uppercase (e.g., "USA", "FBI")
      if (word === word.toUpperCase() && word.length <= 4) {
        return word;
      }

      // Don't capitalize small words unless they're the first word
      if (smallWords.test(word)) {
        return word.toLowerCase();
      }

      // Capitalize everything else
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Extracts series information from title
 * Returns { title, series, seriesNumber }
 */
export function extractSeriesInfo(title: string): {
  title: string;
  series: string | null;
  seriesNumber: number | null;
} {
  if (!title) {
    return { title: '', series: null, seriesNumber: null };
  }

  let cleanTitle = title.trim();
  let series: string | null = null;
  let seriesNumber: number | null = null;

  // Pattern 1: "Title (Series Name, #3)" or "Title (Series Name #3)"
  const pattern1 = /^(.+?)\s*\(([^)]+?)(?:,\s*#|\s+#)(\d+)\)$/;
  const match1 = cleanTitle.match(pattern1);

  if (match1) {
    cleanTitle = match1[1].trim();
    series = match1[2].trim();
    seriesNumber = parseInt(match1[3]);
    return { title: cleanTitle, series, seriesNumber };
  }

  // Pattern 2: "Title (Series Name)"
  const pattern2 = /^(.+?)\s*\(([^)]+)\)$/;
  const match2 = cleanTitle.match(pattern2);

  if (match2) {
    cleanTitle = match2[1].trim();
    const potentialSeries = match2[2].trim();

    // Only treat as series if it doesn't look like a year or other metadata
    if (!/^\d{4}$/.test(potentialSeries) && potentialSeries.length > 3) {
      series = potentialSeries;
    }
  }

  // Pattern 3: "Title, Book 3" or "Title: Book Three"
  const pattern3 = /^(.+?)(?:,|:)\s*(?:Book|Vol|Volume)\s+(\d+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)/i;
  const match3 = cleanTitle.match(pattern3);

  if (match3) {
    cleanTitle = match3[1].trim();
    const numberWord = match3[2];

    // Convert word numbers to digits
    const wordToNumber: { [key: string]: number } = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };

    seriesNumber = parseInt(numberWord) || wordToNumber[numberWord.toLowerCase()] || null;
  }

  return { title: cleanTitle, series, seriesNumber };
}

/**
 * Standardizes book title to Title Case and extracts series info
 */
export function standardizeTitle(title: string | null | undefined): {
  title: string;
  series: string | null;
  seriesNumber: number | null;
} {
  if (!title || title.trim() === '') {
    return { title: 'Untitled', series: null, seriesNumber: null };
  }

  // Extract series info first
  const { title: baseTitle, series, seriesNumber } = extractSeriesInfo(title);

  // Clean up the title
  let cleaned = baseTitle
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();

  // Apply title case
  cleaned = toTitleCase(cleaned);

  return { title: cleaned, series, seriesNumber };
}

// ============================================================================
// READING STATUS STANDARDIZATION
// ============================================================================

const STANDARD_STATUSES = {
  WANT_TO_READ: 'Want to Read',
  CURRENTLY_READING: 'Currently Reading',
  FINISHED: 'Finished',
} as const;

// Mapping of common variations to standard status
const STATUS_MAPPINGS: Record<string, string> = {
  // Want to Read variations
  'want to read': STANDARD_STATUSES.WANT_TO_READ,
  'to read': STANDARD_STATUSES.WANT_TO_READ,
  'to-read': STANDARD_STATUSES.WANT_TO_READ,
  'wishlist': STANDARD_STATUSES.WANT_TO_READ,
  'planned': STANDARD_STATUSES.WANT_TO_READ,
  'tbr': STANDARD_STATUSES.WANT_TO_READ,
  'unread': STANDARD_STATUSES.WANT_TO_READ,

  // Currently Reading variations
  'currently reading': STANDARD_STATUSES.CURRENTLY_READING,
  'currently-reading': STANDARD_STATUSES.CURRENTLY_READING,
  'reading': STANDARD_STATUSES.CURRENTLY_READING,
  'in progress': STANDARD_STATUSES.CURRENTLY_READING,
  'in-progress': STANDARD_STATUSES.CURRENTLY_READING,
  'started': STANDARD_STATUSES.CURRENTLY_READING,

  // Finished variations
  'finished': STANDARD_STATUSES.FINISHED,
  'read': STANDARD_STATUSES.FINISHED,
  'completed': STANDARD_STATUSES.FINISHED,
  'done': STANDARD_STATUSES.FINISHED,
};

/**
 * Standardizes reading status to one of the three canonical values
 */
export function standardizeReadingStatus(status: string | null | undefined): string {
  if (!status || status.trim() === '') {
    return STANDARD_STATUSES.WANT_TO_READ; // Default
  }

  const normalized = status.toLowerCase().trim();

  // Check if it's already a standard status
  if (Object.values(STANDARD_STATUSES).map(s => s.toLowerCase()).includes(normalized)) {
    return Object.values(STANDARD_STATUSES).find(s => s.toLowerCase() === normalized)!;
  }

  // Map from variations
  if (STATUS_MAPPINGS[normalized]) {
    return STATUS_MAPPINGS[normalized];
  }

  // If no mapping found, return Want to Read as safe default
  console.warn(`Unknown reading status: "${status}", defaulting to Want to Read`);
  return STANDARD_STATUSES.WANT_TO_READ;
}

/**
 * Get all valid reading statuses
 */
export function getValidReadingStatuses(): string[] {
  return Object.values(STANDARD_STATUSES);
}
