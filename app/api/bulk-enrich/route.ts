import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { enrichBookFromGoogleBooks } from '@/lib/book-enrichment';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all books for this user that don't have cover images
    const booksToEnrich = await prisma.book.findMany({
      where: {
        userId,
        OR: [
          { coverUrl: null },
          { coverUrl: '' },
          { description: null },
          { description: '' },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
      },
    });

    if (booksToEnrich.length === 0) {
      return NextResponse.json({
        message: 'No books need enrichment',
        enriched: 0,
        total: 0,
      });
    }

    let enrichedCount = 0;
    const results = [];

    // Enrich books one by one (with fast mode for speed)
    for (const book of booksToEnrich) {
      try {
        const enrichedData = await enrichBookFromGoogleBooks(
          book.isbn || undefined,
          book.title,
          book.author,
          false, // Not hardcover-only
          true   // Fast mode enabled
        );

        // Update book with enriched data (only if we got new data)
        const updateData: any = {};
        if (enrichedData.coverUrl) updateData.coverUrl = enrichedData.coverUrl;
        if (enrichedData.description) updateData.description = enrichedData.description;
        if (enrichedData.genre) updateData.genre = enrichedData.genre;
        if (enrichedData.pageCount) updateData.totalPages = enrichedData.pageCount;
        if (enrichedData.publisher) updateData.publisher = enrichedData.publisher;
        if (enrichedData.publishedDate) updateData.publishedDate = enrichedData.publishedDate;

        if (Object.keys(updateData).length > 0) {
          await prisma.book.update({
            where: { id: book.id },
            data: updateData,
          });
          enrichedCount++;
          results.push({ id: book.id, title: book.title, success: true });
        } else {
          results.push({ id: book.id, title: book.title, success: false, reason: 'No data found' });
        }
      } catch (error) {
        console.error(`Failed to enrich book ${book.id}:`, error);
        results.push({
          id: book.id,
          title: book.title,
          success: false,
          reason: 'Enrichment failed'
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      message: `Successfully enriched ${enrichedCount} out of ${booksToEnrich.length} books`,
      enriched: enrichedCount,
      total: booksToEnrich.length,
      results,
    });
  } catch (error) {
    console.error('Bulk enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk enrichment' },
      { status: 500 }
    );
  }
}
