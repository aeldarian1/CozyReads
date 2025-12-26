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
    const skipDuplicates = formData.get('skipDuplicates') === 'true';
    const createCollections = formData.get('createCollections') === 'true';
    const enrichFromGoogle = formData.get('enrichFromGoogle') === 'true';

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

    // 6. Import books
    const importResult = await importGoodreadsBooks(user.id, books, {
      skipDuplicates,
      createCollections,
      enrichFromGoogle,
    });

    // 7. Save import history
    await prisma.importHistory.create({
      data: {
        userId: user.id,
        source: 'goodreads-csv',
        fileName: file.name,
        totalRows: books.length,
        successCount: importResult.imported,
        skipCount: importResult.skipped,
        errorCount: importResult.failed,
        errors: importResult.errors,
      },
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: `Import completed successfully`,
      result: {
        totalProcessed: importResult.totalProcessed,
        imported: importResult.imported,
        skipped: importResult.skipped,
        failed: importResult.failed,
        errors: importResult.errors,
        collectionsCreated: importResult.collectionsCreated,
      },
    }, { status: 200 });

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
