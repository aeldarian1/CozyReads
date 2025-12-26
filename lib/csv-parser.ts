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
): Promise<{ books: ParsedBook[]; errors: string[] }> {
  const errors: string[] = [];
  const books: ParsedBook[] = [];

  return new Promise((resolve) => {
    Papa.parse<GoodreadsCSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row, index) => {
          try {
            // Skip rows without essential data
            if (!row['Title'] || !row['Author']) {
              errors.push(`Row ${index + 1}: Missing title or author`);
              return;
            }

            const parsedBook = mapGoodreadsToCozyReads(row);
            books.push(parsedBook);
          } catch (error) {
            errors.push(
              `Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        });

        resolve({ books, errors });
      },
      error: (error: Error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({ books, errors });
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

  // Get ISBN (prefer ISBN13 over ISBN)
  const isbn = row['ISBN13'] && row['ISBN13'].trim() !== ''
    ? row['ISBN13']
    : (row['ISBN'] && row['ISBN'].trim() !== '' ? row['ISBN'] : null);

  // Parse rating
  const rating = parseInt(row['My Rating']) || 0;

  // Parse total pages
  const totalPages = row['Number of Pages'] && row['Number of Pages'].trim() !== ''
    ? parseInt(row['Number of Pages']) || null
    : null;

  // Get reading status
  const exclusiveShelf = row['Exclusive Shelf']?.toLowerCase().trim() || 'to-read';
  const readingStatus = shelfMapping[exclusiveShelf] || 'Want to Read';

  // Parse dates
  const dateAdded = parseDate(row['Date Added']) || new Date();
  const dateFinished = readingStatus === 'Finished' ? parseDate(row['Date Read']) : null;

  return {
    goodreadsId: row['Book Id'],
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
