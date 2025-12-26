import { prisma } from '@/lib/prisma';
import { ParsedBook } from './csv-parser';

export interface ImportResult {
  totalProcessed: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; book: string; error: string }>;
  collectionsCreated: string[];
}

export async function importGoodreadsBooks(
  userId: string,
  books: ParsedBook[],
  options: {
    skipDuplicates: boolean;
    createCollections: boolean;
  }
): Promise<ImportResult> {
  const result: ImportResult = {
    totalProcessed: books.length,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    collectionsCreated: [],
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
  const BATCH_SIZE = 50;
  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);

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

          // Use transaction to ensure atomicity
          await prisma.$transaction(async (tx) => {
            // Create book
            const createdBook = await tx.book.create({
              data: {
                userId,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                rating: book.rating,
                review: book.review,
                readingStatus: book.readingStatus,
                totalPages: book.totalPages,
                dateAdded: book.dateAdded,
                dateFinished: book.dateFinished,
                goodreadsId: book.goodreadsId,
                externalSource: 'goodreads',
                importedAt: new Date(),
                externalMetadata: {
                  originalShelves: book.shelves,
                },
              },
            });

            // Add to collections
            if (options.createCollections && book.shelves.length > 0) {
              const collectionLinks = book.shelves
                .filter(shelf => collectionMap.has(shelf))
                .map(shelf => ({
                  bookId: createdBook.id,
                  collectionId: collectionMap.get(shelf)!,
                }));

              if (collectionLinks.length > 0) {
                await tx.bookCollection.createMany({
                  data: collectionLinks,
                  skipDuplicates: true,
                });
              }
            }
          });

          result.imported++;
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
