/**
 * CSV Format Detection Utility
 * Detects whether a CSV file is a Goodreads export or a generic CSV
 */

export type CSVFormat = 'goodreads' | 'generic';

export interface FormatDetectionResult {
  format: CSVFormat;
  confidence: number; // 0-1
  detectedHeaders: string[];
}

/**
 * Detect the format of a CSV file based on its headers
 */
export async function detectCSVFormat(file: File): Promise<FormatDetectionResult> {
  const text = await file.text();
  const firstLine = text.split('\n')[0];

  if (!firstLine) {
    return {
      format: 'generic',
      confidence: 0,
      detectedHeaders: [],
    };
  }

  // Parse headers (simple CSV parsing for first line)
  const headers = firstLine
    .split(',')
    .map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

  // Goodreads-specific headers
  const goodreadsHeaders = [
    'book id',
    'my rating',
    'exclusive shelf',
    'bookshelves',
    'date read',
    'author l-f',
  ];

  // Check how many Goodreads-specific headers are present
  const goodreadsMatches = goodreadsHeaders.filter(gh =>
    headers.some(h => h.includes(gh))
  );

  // If we find 3 or more Goodreads-specific headers, it's likely a Goodreads export
  if (goodreadsMatches.length >= 3) {
    return {
      format: 'goodreads',
      confidence: goodreadsMatches.length / goodreadsHeaders.length,
      detectedHeaders: headers,
    };
  }

  // Otherwise, treat it as a generic CSV
  return {
    format: 'generic',
    confidence: 1 - (goodreadsMatches.length / goodreadsHeaders.length),
    detectedHeaders: headers,
  };
}

/**
 * Get user-friendly description of the detected format
 */
export function getFormatDescription(result: FormatDetectionResult): string {
  if (result.format === 'goodreads') {
    return `Goodreads CSV detected (${Math.round(result.confidence * 100)}% confidence)`;
  } else {
    return 'Generic CSV format detected';
  }
}
