import Papa from 'papaparse';

export interface GoodreadsCSVRow {
  'Book Id': string;
  'Title': string;
  'Author': string;
  'Author l-f': string;
  'Additional Authors': string;
  'ISBN': string;
  'ISBN13': string;
  'My Rating': string;
  'Average Rating': string;
  'Publisher': string;
  'Binding': string;
  'Number of Pages': string;
  'Year Published': string;
  'Original Publication Year': string;
  'Date Read': string;
  'Date Added': string;
  'Bookshelves': string;
  'Bookshelves with positions': string;
  'Exclusive Shelf': string; // read, currently-reading, to-read
  'My Review': string;
  'Spoiler': string;
  'Private Notes': string;
  'Read Count': string;
  'Recommended For': string;
  'Recommended By': string;
  'Owned Copies': string;
  'Original Purchase Date': string;
  'Original Purchase Location': string;
  'Condition': string;
  'Condition Description': string;
  'BCID': string;
}

export interface ParsedBook {
  goodreadsId: string;
  title: string;
  author: string;
  isbn: string | null;
  rating: number;
  review: string | null;
  readingStatus: 'Want to Read' | 'Currently Reading' | 'Finished';
  totalPages: number | null;
  dateAdded: Date;
  dateFinished: Date | null;
  shelves: string[]; // Custom shelves to become Collections
  genre: string | null;
}

export async function parseGoodreadsCSV(
  fileContent: string
): Promise<{ books: ParsedBook[]; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const books: ParsedBook[] = [];

  return new Promise((resolve) => {
    Papa.parse<GoodreadsCSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row, index) => {
          try {
            // Helper to clean Excel text formatting
            const cleanExcelText = (value: string): string => {
              if (!value) return '';
              const trimmed = value.trim();
              if (trimmed.startsWith('="') && trimmed.endsWith('"')) {
                return trimmed.slice(2, -1);
              }
              return trimmed;
            };

            // Check for REQUIRED fields (blocking)
            const missingRequiredFields: string[] = [];

            if (!row['Title'] || row['Title'].trim() === '') {
              missingRequiredFields.push('title');
            }

            if (!row['Author'] || row['Author'].trim() === '') {
              missingRequiredFields.push('author');
            }

            // Skip rows without required fields
            if (missingRequiredFields.length > 0) {
              errors.push(
                `Row ${index + 1}: Missing required field${missingRequiredFields.length > 1 ? 's' : ''}: ${missingRequiredFields.join(', ')} - Skipped`
              );
              return;
            }

            // Check for ISBN (optional but recommended)
            const isbn13 = row['ISBN13'] ? cleanExcelText(row['ISBN13']) : '';
            const isbn10 = row['ISBN'] ? cleanExcelText(row['ISBN']) : '';
            const hasISBN = isbn13 !== '' || isbn10 !== '';

            if (!hasISBN) {
              warnings.push(
                `Row ${index + 1}: "${row['Title']}" by ${row['Author']} - No ISBN found (data enrichment may be limited)`
              );
            }

            const parsedBook = mapGoodreadsToCozyReads(row);
            books.push(parsedBook);
          } catch (error) {
            errors.push(
              `Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        });

        resolve({ books, errors, warnings });
      },
      error: (error: Error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({ books, errors, warnings });
      },
    });
  });
}

export function mapGoodreadsToCozyReads(row: GoodreadsCSVRow): ParsedBook {
  // Map Goodreads exclusive shelf to CozyReads reading status
  const shelfMapping: Record<string, 'Want to Read' | 'Currently Reading' | 'Finished'> = {
    'read': 'Finished',
    'currently-reading': 'Currently Reading',
    'to-read': 'Want to Read',
  };

  // Clean Excel text formatting (="value") used to preserve ISBNs as text
  const cleanExcelText = (value: string): string => {
    if (!value) return value;
    const trimmed = value.trim();
    // Check for Excel's text format: ="..."
    if (trimmed.startsWith('="') && trimmed.endsWith('"')) {
      return trimmed.slice(2, -1);
    }
    return trimmed;
  };

  // Parse custom shelves (comma-separated)
  const shelves = row['Bookshelves']
    ? row['Bookshelves'].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Parse dates
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Get ISBN (prefer ISBN13 over ISBN) and clean Excel formatting
  const isbn13 = row['ISBN13'] ? cleanExcelText(row['ISBN13']) : '';
  const isbn10 = row['ISBN'] ? cleanExcelText(row['ISBN']) : '';
  const isbn = isbn13 !== '' ? isbn13 : (isbn10 !== '' ? isbn10 : null);

  // Parse rating
  const rating = parseInt(row['My Rating']) || 0;

  // Parse total pages (clean Excel formatting)
  const pagesStr = row['Number of Pages'] ? cleanExcelText(row['Number of Pages']) : '';
  const totalPages = pagesStr !== '' ? parseInt(pagesStr) || null : null;

  // Get reading status
  const exclusiveShelf = row['Exclusive Shelf']?.toLowerCase().trim() || 'to-read';
  const readingStatus = shelfMapping[exclusiveShelf] || 'Want to Read';

  // Parse dates
  const dateAdded = parseDate(row['Date Added']) || new Date();
  const dateFinished = readingStatus === 'Finished' ? parseDate(row['Date Read']) : null;

  return {
    goodreadsId: cleanExcelText(row['Book Id']),
    title: row['Title'].trim(),
    author: (row['Author'] || row['Author l-f']).trim(),
    isbn,
    rating,
    review: row['My Review'] && row['My Review'].trim() !== '' ? row['My Review'].trim() : null,
    readingStatus,
    totalPages,
    dateAdded,
    dateFinished,
    shelves,
    genre: null, // Goodreads doesn't export genre in CSV
  };
}
