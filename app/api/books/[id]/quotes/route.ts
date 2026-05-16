import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';
import { quoteSchema } from '@/lib/schemas';

// GET /api/books/[id]/quotes - Get all quotes for a book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id: bookId } = await params;

    // Verify book belongs to user
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: user.id,
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
        userId: user.id,
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

// POST /api/books/[id]/quotes - Create a new quote
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id: bookId } = await params;
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
        userId: user.id,
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
        userId: user.id,
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
