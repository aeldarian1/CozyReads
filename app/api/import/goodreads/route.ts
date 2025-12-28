import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';
import { parseGoodreadsCSV } from '@/lib/csv-parser';
import { importGoodreadsBooks } from '@/lib/import-service';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getAuthenticatedUser();

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const previewOnly = formData.get('previewOnly') === 'true';
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const createCollections = formData.get('createCollections') === 'true';
    const enrichFromGoogle = formData.get('enrichFromGoogle') === 'true';
    const fastMode = formData.get('fastMode') === 'true'; // Use fast Google Books enrichment
    const selectedIndicesStr = formData.get('selectedIndices') as string | null;
    const manuallySelectedBooksStr = formData.get('manuallySelectedBooks') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file type and size
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // 4. Read file content
    const fileContent = await file.text();

    // 5. Parse CSV
    const { books, errors: parseErrors, warnings: parseWarnings } = await parseGoodreadsCSV(fileContent);

    // Count skipped books due to missing required fields
    const skippedDueToMissingFields = parseErrors.filter(error =>
      error.includes('Missing required field')
    ).length;

    // Count books without ISBN (warnings)
    const booksWithoutISBN = parseWarnings.filter(warning =>
      warning.includes('No ISBN found')
    ).length;

    if (books.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid books found in CSV',
          parseErrors,
          skippedDueToMissingFields,
          message: skippedDueToMissingFields > 0
            ? `All ${skippedDueToMissingFields} book(s) were skipped due to missing required fields (title or author)`
            : 'No valid books found in the CSV file'
        },
        { status: 400 }
      );
    }

    // 6. If preview only, return parsed books
    if (previewOnly) {
      return NextResponse.json({
        success: true,
        books,
        parseErrors,
        parseWarnings,
        totalBooks: books.length,
        skippedDueToMissingFields,
        booksWithoutISBN,
        message: skippedDueToMissingFields > 0
          ? `${skippedDueToMissingFields} book(s) skipped due to missing required fields (title or author)`
          : undefined,
        warningMessage: booksWithoutISBN > 0
          ? `${booksWithoutISBN} book(s) imported without ISBN - enrichment may be limited`
          : undefined
      });
    }

    // 7. Parse manually selected books data
    let manuallySelectedBooks: Record<string, any> = {};
    if (manuallySelectedBooksStr) {
      try {
        manuallySelectedBooks = JSON.parse(manuallySelectedBooksStr);
      } catch (e) {
        console.error('Error parsing manuallySelectedBooks:', e);
      }
    }

    // 8. Filter by selected indices and track original indices
    let booksToImport: Array<{ book: any; originalIndex: number }> = [];
    if (selectedIndicesStr) {
      try {
        const selectedIndices = JSON.parse(selectedIndicesStr) as number[];
        booksToImport = books
          .map((book, index) => ({ book, originalIndex: index }))
          .filter(({ originalIndex }) => selectedIndices.includes(originalIndex));
      } catch (e) {
        console.error('Error parsing selectedIndices:', e);
        booksToImport = books.map((book, index) => ({ book, originalIndex: index }));
      }
    } else {
      booksToImport = books.map((book, index) => ({ book, originalIndex: index }));
    }

    // 8. Stream import progress
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let processed = 0;
          const total = booksToImport.length;

          // Import books one by one and stream progress
          const results = {
            totalProcessed: 0,
            imported: 0,
            skipped: 0,
            skippedDueToMissingFields,
            booksWithoutISBN,
            failed: 0,
            errors: [] as any[],
            collectionsCreated: [] as string[],
          };

          for (const { book, originalIndex } of booksToImport) {
            processed++;

            // Merge manually selected book data if available
            let bookToImport = book;
            if (manuallySelectedBooks[originalIndex]) {
              const selectedData = manuallySelectedBooks[originalIndex];
              const volumeInfo = selectedData.volumeInfo;

              // Merge Google Books data with CSV data
              bookToImport = {
                ...book,
                isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || book.isbn,
                description: volumeInfo.description || book.description,
                coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || book.coverUrl,
                genre: volumeInfo.categories?.join(', ') || book.genre,
                publisher: volumeInfo.publisher || book.publisher,
                publishedDate: volumeInfo.publishedDate || book.publishedDate,
                totalPages: volumeInfo.pageCount || book.totalPages,
              };
            }

            // Send progress update
            const progressData = {
              type: 'progress',
              current: processed,
              total,
              currentBook: bookToImport.title,
            };
            controller.enqueue(encoder.encode(JSON.stringify(progressData) + '\n'));

            // Import single book
            try {
              const singleResult = await importGoodreadsBooks(user.id, [bookToImport], {
                skipDuplicates,
                createCollections,
                enrichFromGoogle,
                fastMode,
              });

              results.totalProcessed += singleResult.totalProcessed;
              results.imported += singleResult.imported;
              results.skipped += singleResult.skipped;
              results.failed += singleResult.failed;
              results.errors.push(...singleResult.errors);

              // Track unique collections
              singleResult.collectionsCreated.forEach((col: string) => {
                if (!results.collectionsCreated.includes(col)) {
                  results.collectionsCreated.push(col);
                }
              });
            } catch (error) {
              results.failed++;
              results.totalProcessed++;
              results.errors.push({
                book: bookToImport.title,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }

          // Save import history
          await prisma.importHistory.create({
            data: {
              userId: user.id,
              source: 'goodreads-csv',
              fileName: file.name,
              totalRows: booksToImport.length,
              successCount: results.imported,
              skipCount: results.skipped,
              errorCount: results.failed,
              errors: results.errors,
            },
          });

          // Send final result
          const finalData = {
            type: 'complete',
            result: results,
          };
          controller.enqueue(encoder.encode(JSON.stringify(finalData) + '\n'));
          controller.close();
        } catch (error) {
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error importing Goodreads CSV:', error);
    return NextResponse.json(
      {
        error: 'Failed to import CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve import history
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const history = await prisma.importHistory.findMany({
      where: { userId: user.id },
      orderBy: { importedAt: 'desc' },
      take: 10, // Last 10 imports
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import history' },
      { status: 500 }
    );
  }
}
