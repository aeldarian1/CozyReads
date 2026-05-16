import { prisma } from '@/lib/prisma';
import { ParsedBook } from './csv-parser';
import { enrichBookFromGoogleBooks } from './book-enrichment';
import { standardizeAuthors, standardizeTitle, standardizeReadingStatus } from './standardization';

export interface ImportResult {
  totalProcessed: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; book: string; error: string }>;
  collectionsCreated: string[];
  needsVerification: Array<{
    bookId: string;
    title: string;
    author: string;
    isbn: string | null;
    reason: string;
  }>;
}

export async function importGoodreadsBooks(
  userId: string,
  books: ParsedBook[],
  options: {
    skipDuplicates: boolean;
    createCollections: boolean;
    enrichFromGoogle: boolean;
    fastMode?: boolean; // Use fast Google Books enrichment (faster but single source)
  }
): Promise<ImportResult> {
  const result: ImportResult = {
    totalProcessed: books.length,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    collectionsCreated: [],
    needsVerification: [],
  };

  // Get all existing books for duplicate detection
  const existingBooks = await prisma.book.findMany({
    where: { userId },
    select: { id: true, title: true, author: true, goodreadsId: true, isbn: true },
  });

  // Create a Map for fast duplicate checking
  const existingBooksMap = new Map<string, boolean>();
  existingBooks.forEach(book => {
    if (book.goodreadsId) existingBooksMap.set(`gr:${book.goodreadsId}`, true);
    if (book.isbn) existingBooksMap.set(`isbn:${book.isbn}`, true);
    existingBooksMap.set(`title-author:${book.title.toLowerCase()}:${book.author.toLowerCase()}`, true);
  });

  // Collect all unique shelf names for collection creation
  const allShelves = new Set<string>();
  if (options.createCollections) {
    books.forEach(book => {
      book.shelves.forEach(shelf => {
        // Exclude default Goodreads shelves
        if (!['read', 'currently-reading', 'to-read'].includes(shelf.toLowerCase())) {
          allShelves.add(shelf);
        }
      });
    });
  }

  // Get or create collections
  const collectionMap = new Map<string, string>(); // shelf name -> collection id
  if (allShelves.size > 0) {
    const existingCollections = await prisma.collection.findMany({
      where: {
        userId,
        name: { in: Array.from(allShelves) },
      },
    });

    existingCollections.forEach(col => {
      collectionMap.set(col.name, col.id);
    });

    // Create new collections for shelves that don't exist
    for (const shelfName of allShelves) {
      if (!collectionMap.has(shelfName)) {
        const newCollection = await prisma.collection.create({
          data: {
            userId,
            name: shelfName,
            description: `Imported from Goodreads`,
            color: getRandomColor(),
            icon: '📚',
          },
        });
        collectionMap.set(shelfName, newCollection.id);
        result.collectionsCreated.push(shelfName);
      }
    }
  }

  // Process books in batches for better performance
  // Smaller batch size to avoid API rate limiting
  const BATCH_SIZE = 10;

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(books.length / BATCH_SIZE);

    console.log(`Processing batch ${batchNumber}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, books.length)} of ${books.length} books)...`);

    await Promise.all(
      batch.map(async (book, idx) => {
        const rowNumber = i + idx + 1;
        try {
          // Check for duplicates
          const isDuplicate =
            (book.goodreadsId && existingBooksMap.has(`gr:${book.goodreadsId}`)) ||
            (book.isbn && existingBooksMap.has(`isbn:${book.isbn}`)) ||
            existingBooksMap.has(`title-author:${book.title.toLowerCase()}:${book.author.toLowerCase()}`);

          if (isDuplicate && options.skipDuplicates) {
            result.skipped++;
            return;
          }

          // ISBN is optional - enrichment will try to find data using title + author if missing

          // Enrich book data from Google Books if enabled
          let enrichedData: {
            coverUrl: string | null;
            genre: string | null;
            description: string | null;
            publisher?: string | null;
            publishedDate?: string | null;
            pageCount?: number | null;
          } = {
            coverUrl: null,
            genre: null,
            description: null,
          };

          if (options.enrichFromGoogle) {
            try {
              // Choose enrichment strategy based on options
              // Fast mode: Single Google Books call (fastest)
              // Hardcover-only: Single Hardcover call (fast, modern books)
              // Full mode: Multi-source validation (slowest, most accurate)
              const useFastMode = options.fastMode === true;
              const useHardcoverOnly = !useFastMode; // Default to Hardcover-only for speed

              enrichedData = await enrichBookFromGoogleBooks(
                book.isbn,
                book.title,
                book.author,
                useHardcoverOnly, // hardcoverOnly
                useFastMode       // fastMode
              );
            } catch (error) {
              // Continue without enrichment if it fails
              console.error(`Failed to enrich book: ${book.title}`, error);
            }
          }

          // Check if description is available after enrichment
          const finalDescription = enrichedData.description || book.review;
          const missingDescription = !finalDescription || finalDescription.trim() === '';
          const missingCover = !enrichedData.coverUrl;

          // Track what information is missing for potential manual verification
          const verificationReasons = [];
          if (missingDescription) verificationReasons.push('description');
          if (missingCover) verificationReasons.push('cover');

          // Use fallback values if missing (import anyway, let user fix later)
          const descriptionToUse = finalDescription || 'No description available. Please update manually.';
          const needsManualVerification = verificationReasons.length > 0;

          // Use enriched page count if available and more reliable than Goodreads data
          const finalTotalPages = enrichedData.pageCount || book.totalPages;

          // Prepare external metadata with enrichment info
          const externalMetadata: any = {
            originalShelves: book.shelves,
          };

          // Add enriched metadata if available
          if (enrichedData.publisher) {
            externalMetadata.publisher = enrichedData.publisher;
          }
          if (enrichedData.publishedDate) {
            externalMetadata.publishedDate = enrichedData.publishedDate;
          }
          if (enrichedData.pageCount) {
            externalMetadata.enrichedPageCount = enrichedData.pageCount;
          }

          // Standardize book data before saving
          const standardizedAuthor = standardizeAuthors(book.author);
          const { title: standardizedTitle, series, seriesNumber } = standardizeTitle(book.title);
          const standardizedStatus = standardizeReadingStatus(book.readingStatus);

          // Use transaction to ensure atomicity
          const createdBook = await prisma.$transaction(async (tx) => {
            // Create book
            const newBook = await tx.book.create({
              data: {
                userId,
                title: standardizedTitle,
                author: standardizedAuthor,
                isbn: book.isbn || null,
                genre: enrichedData.genre || book.genre,
                description: descriptionToUse,
                coverUrl: enrichedData.coverUrl,
                rating: book.rating || 0,
                review: book.review,
                readingStatus: standardizedStatus,
                totalPages: finalTotalPages,
                series: series,
                seriesNumber: seriesNumber,
                dateAdded: book.dateAdded,
                dateFinished: book.dateFinished,
                goodreadsId: book.goodreadsId,
                externalSource: 'goodreads',
                importedAt: new Date(),
                externalMetadata,
              },
            });

            // Add to collections
            if (options.createCollections && book.shelves.length > 0) {
              const collectionLinks = book.shelves
                .filter(shelf => collectionMap.has(shelf))
                .map(shelf => ({
                  bookId: newBook.id,
                  collectionId: collectionMap.get(shelf)!,
                }));

              if (collectionLinks.length > 0) {
                await tx.bookCollection.createMany({
                  data: collectionLinks,
                  skipDuplicates: true,
                });
              }
            }

            return newBook;
          });

          result.imported++;

          // Add to verification list if enrichment was incomplete
          if (needsManualVerification) {
            result.needsVerification.push({
              bookId: createdBook.id,
              title: standardizedTitle,
              author: standardizedAuthor,
              isbn: book.isbn,
              reason: `Missing ${verificationReasons.join(' and ')}`,
            });
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            book: `${book.title} by ${book.author}`,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })
    );

    // Small delay between batches to respect API rate limits
    if (i + BATCH_SIZE < books.length) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
    }
  }

  return result;
}

function getRandomColor(): string {
  const colors = [
    '#8b6f47', '#c89b65', '#a0826d', '#6b5d4f', '#9d8b7a',
    '#7a6551', '#b89968', '#8d7456', '#a68b5b', '#715c3e',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
