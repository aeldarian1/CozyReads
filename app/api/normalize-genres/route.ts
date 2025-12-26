import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeGenres } from '@/lib/genre-mapper';

/**
 * POST /api/normalize-genres
 * Normalizes all existing book genres in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get all books with genres
    const books = await prisma.book.findMany({
      where: {
        genre: {
          not: null,
        },
      },
      select: {
        id: true,
        genre: true,
      },
    });

    let updatedCount = 0;
    let unchangedCount = 0;
    const updates: Array<{ id: string; old: string; new: string }> = [];

    // Process each book
    for (const book of books) {
      if (!book.genre) continue;

      // Normalize the genre
      const normalizedGenre = normalizeGenres(book.genre, 3);

      // Only update if the genre changed
      if (normalizedGenre && normalizedGenre !== book.genre) {
        await prisma.book.update({
          where: { id: book.id },
          data: { genre: normalizedGenre },
        });

        updates.push({
          id: book.id,
          old: book.genre,
          new: normalizedGenre,
        });

        updatedCount++;
      } else {
        unchangedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Normalized ${updatedCount} book genres`,
      stats: {
        total: books.length,
        updated: updatedCount,
        unchanged: unchangedCount,
      },
      updates: updates.slice(0, 20), // Return first 20 updates as examples
    });
  } catch (error) {
    console.error('Error normalizing genres:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to normalize genres',
      },
      { status: 500 }
    );
  }
}
