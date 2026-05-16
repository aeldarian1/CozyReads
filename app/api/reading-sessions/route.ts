import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/reading-sessions - Get all reading sessions for the user
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const limit = searchParams.get('limit');

    const where: any = { userId };

    if (bookId) {
      where.bookId = bookId;
    }

    // Get reading sessions
    const sessions = await prisma.readingSession.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
      orderBy: {
        sessionDate: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
    });

    // Calculate stats
    const stats = {
      totalSessions: sessions.length,
      totalPages: sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0),
      totalMinutes: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      booksRead: new Set(sessions.map(s => s.bookId)).size,
    };

    return NextResponse.json({ sessions, stats });
  } catch (error) {
    console.error('Error fetching reading sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading sessions' },
      { status: 500 }
    );
  }
}

// POST /api/reading-sessions - Create a new reading session
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId, startPage, endPage, pagesRead, duration, sessionDate, notes } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Verify book belongs to user
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Create reading session
    const session = await prisma.readingSession.create({
      data: {
        userId,
        bookId,
        startPage: startPage || null,
        endPage: endPage || null,
        pagesRead: pagesRead || (endPage && startPage ? endPage - startPage + 1 : null),
        duration: duration || null,
        sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
        notes: notes || null,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating reading session:', error);
    return NextResponse.json(
      { error: 'Failed to create reading session' },
      { status: 500 }
    );
  }
}
