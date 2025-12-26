import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { standardizeAuthors, standardizeTitle, standardizeReadingStatus } from '@/lib/standardization';

/**
 * POST /api/standardize-books
 * Standardizes all existing book data (authors, titles, reading status)
 */
export async function POST(request: NextRequest) {
  try {
    // Get all books
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        readingStatus: true,
        series: true,
        seriesNumber: true,
      },
    });

    let authorsUpdated = 0;
    let titlesUpdated = 0;
    let statusUpdated = 0;
    let seriesExtracted = 0;

    const updates: Array<{
      id: string;
      field: string;
      old: string;
      new: string;
    }> = [];

    // Process each book
    for (const book of books) {
      const updateData: any = {};
      let hasChanges = false;

      // Standardize author
      const standardizedAuthor = standardizeAuthors(book.author);
      if (standardizedAuthor !== book.author) {
        updateData.author = standardizedAuthor;
        hasChanges = true;
        authorsUpdated++;
        updates.push({
          id: book.id,
          field: 'author',
          old: book.author,
          new: standardizedAuthor,
        });
      }

      // Standardize title and extract series
      const { title: standardizedTitle, series, seriesNumber } = standardizeTitle(book.title);

      if (standardizedTitle !== book.title) {
        updateData.title = standardizedTitle;
        hasChanges = true;
        titlesUpdated++;
        updates.push({
          id: book.id,
          field: 'title',
          old: book.title,
          new: standardizedTitle,
        });
      }

      // Update series info if extracted and not already set
      if (series && !book.series) {
        updateData.series = series;
        hasChanges = true;
        seriesExtracted++;
        updates.push({
          id: book.id,
          field: 'series',
          old: 'none',
          new: series,
        });
      }

      if (seriesNumber && !book.seriesNumber) {
        updateData.seriesNumber = seriesNumber;
        hasChanges = true;
      }

      // Standardize reading status
      const standardizedStatus = standardizeReadingStatus(book.readingStatus);
      if (standardizedStatus !== book.readingStatus) {
        updateData.readingStatus = standardizedStatus;
        hasChanges = true;
        statusUpdated++;
        updates.push({
          id: book.id,
          field: 'readingStatus',
          old: book.readingStatus,
          new: standardizedStatus,
        });
      }

      // Apply updates if there are changes
      if (hasChanges) {
        await prisma.book.update({
          where: { id: book.id },
          data: updateData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Standardized ${authorsUpdated + titlesUpdated + statusUpdated} fields across ${books.length} books`,
      stats: {
        totalBooks: books.length,
        authorsUpdated,
        titlesUpdated,
        statusUpdated,
        seriesExtracted,
      },
      updates: updates.slice(0, 30), // Return first 30 updates as examples
    });
  } catch (error) {
    console.error('Error standardizing books:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to standardize books',
      },
      { status: 500 }
    );
  }
}
