import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// POST - Import books from CSV
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const titleIndex = headers.findIndex(h => h.includes('title'));
    const authorIndex = headers.findIndex(h => h.includes('author'));

    if (titleIndex === -1 || authorIndex === -1) {
      return NextResponse.json(
        { error: 'CSV must have Title and Author columns' },
        { status: 400 }
      );
    }

    const isbnIndex = headers.findIndex(h => h.includes('isbn'));
    const genreIndex = headers.findIndex(h => h.includes('genre'));
    const statusIndex = headers.findIndex(h => h.includes('status'));
    const ratingIndex = headers.findIndex(h => h.includes('rating'));
    const seriesIndex = headers.findIndex(h => h.includes('series') && !h.includes('number'));
    const seriesNumberIndex = headers.findIndex(h => h.includes('series') && h.includes('number'));

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const title = values[titleIndex]?.replace(/^"|"$/g, '');
        const author = values[authorIndex]?.replace(/^"|"$/g, '');

        if (!title || !author) {
          skipCount++;
          continue;
        }

        // Check for duplicates
        const existing = await prisma.book.findFirst({
          where: {
            userId: user.id,
            title: { equals: title, mode: 'insensitive' },
            author: { equals: author, mode: 'insensitive' },
          },
        });

        if (existing) {
          skipCount++;
          continue;
        }

        await prisma.book.create({
          data: {
            userId: user.id,
            title,
            author,
            isbn: isbnIndex !== -1 ? values[isbnIndex] || null : null,
            genre: genreIndex !== -1 ? values[genreIndex] || null : null,
            readingStatus: statusIndex !== -1 ? values[statusIndex] || 'Want to Read' : 'Want to Read',
            rating: ratingIndex !== -1 ? parseInt(values[ratingIndex]) || 0 : 0,
            series: seriesIndex !== -1 ? values[seriesIndex] || null : null,
            seriesNumber: seriesNumberIndex !== -1 ? parseInt(values[seriesNumberIndex]) || null : null,
            externalSource: 'csv-import',
          },
        });

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({
          row: i + 1,
          error: error.message,
        });
      }
    }

    // Create import history
    await prisma.importHistory.create({
      data: {
        userId: user.id,
        source: 'csv',
        fileName: file.name,
        totalRows: lines.length - 1,
        successCount,
        skipCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      totalRows: lines.length - 1,
      successCount,
      skipCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
