import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/books/[bookId]/quotes - Get all quotes for a book
export async function GET(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookId = params.bookId;

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

    // Get all quotes for this book
    const quotes = await prisma.quote.findMany({
      where: {
        bookId,
        userId,
      },
      orderBy: [
        { isFavorite: 'desc' }, // Favorites first
        { pageNumber: 'asc' },  // Then by page number
        { createdAt: 'desc' },  // Then by creation date
      ],
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST /api/books/[bookId]/quotes - Create a new quote
export async function POST(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookId = params.bookId;
    const body = await request.json();
    const { text, pageNumber, notes, isFavorite } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Quote text is required' },
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

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        text: text.trim(),
        pageNumber: pageNumber || null,
        notes: notes || null,
        isFavorite: isFavorite || false,
        userId,
        bookId,
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
