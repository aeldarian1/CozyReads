import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeGenre } from '@/lib/genre-mapper';

/**
 * GET /api/debug-genres
 * Debug endpoint to see what genres look like before and after normalization
 */
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: {
        genre: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        genre: true,
      },
      take: 20,
    });

    const debug = books.map(book => {
      const rawGenre = book.genre || '';
      const parts = rawGenre.split(',').map(g => g.trim());

      const normalized = parts.map(part => ({
        raw: part,
        normalized: normalizeGenre(part),
      }));

      return {
        title: book.title,
        rawGenre,
        parts,
        normalized,
        final: normalized.map(n => n.normalized).filter(Boolean).join(', '),
      };
    });

    return NextResponse.json({ books: debug });
  } catch (error) {
    console.error('Error debugging genres:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to debug genres' },
      { status: 500 }
    );
  }
}
