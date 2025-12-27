import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Helper function to get or create user
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

// GET /api/books/[id]/quotes - Get all quotes for a book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(clerkUser);
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
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(clerkUser);
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
