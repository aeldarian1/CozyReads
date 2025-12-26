import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { parseGoodreadsCSV } from '@/lib/csv-parser';
import { importGoodreadsBooks } from '@/lib/import-service';

// Helper function to get or create user (same as in books/route.ts)
async function getOrCreateUser(clerkUser: any) {
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const previewOnly = formData.get('previewOnly') === 'true';
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const createCollections = formData.get('createCollections') === 'true';
    const enrichFromGoogle = formData.get('enrichFromGoogle') === 'true';
    const selectedIndicesStr = formData.get('selectedIndices') as string | null;

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
    const { books, errors: parseErrors } = await parseGoodreadsCSV(fileContent);

    if (books.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid books found in CSV',
          parseErrors
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
        totalBooks: books.length,
      });
    }

    // 7. Filter by selected indices if provided
    let booksToImport = books;
    if (selectedIndicesStr) {
      try {
        const selectedIndices = JSON.parse(selectedIndicesStr) as number[];
        booksToImport = books.filter((_, index) => selectedIndices.includes(index));
      } catch (e) {
        console.error('Error parsing selectedIndices:', e);
      }
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
            failed: 0,
            errors: [] as any[],
            collectionsCreated: [] as string[],
          };

          for (const book of booksToImport) {
            processed++;

            // Send progress update
            const progressData = {
              type: 'progress',
              current: processed,
              total,
              currentBook: book.title,
            };
            controller.enqueue(encoder.encode(JSON.stringify(progressData) + '\n'));

            // Import single book
            try {
              const singleResult = await importGoodreadsBooks(user.id, [book], {
                skipDuplicates,
                createCollections,
                enrichFromGoogle,
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
                book: book.title,
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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);

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
