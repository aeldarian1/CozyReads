import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';

// GET single book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: { id, userId: user.id },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// PUT - Update book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();

    // Handle date_finished for status changes
    if (body.readingStatus === 'Finished') {
      const existingBook = await prisma.book.findFirst({
        where: { id, userId: user.id },
      });

      if (existingBook && existingBook.readingStatus !== 'Finished') {
        body.dateFinished = new Date();
      }
    } else if (body.readingStatus && body.readingStatus !== 'Finished') {
      body.dateFinished = null;
    }

    const book = await prisma.book.updateMany({
      where: { id, userId: user.id },
      data: body,
    });

    if (book.count === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const updatedBook = await prisma.book.findFirst({
      where: { id, userId: user.id },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const result = await prisma.book.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
