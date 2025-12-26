import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Add book to collection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const { bookId } = await request.json();

    // Check if already exists
    const existing = await prisma.bookCollection.findUnique({
      where: {
        bookId_collectionId: {
          bookId,
          collectionId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Book already in collection' },
        { status: 400 }
      );
    }

    const bookCollection = await prisma.bookCollection.create({
      data: {
        bookId,
        collectionId,
      },
    });

    return NextResponse.json(bookCollection, { status: 201 });
  } catch (error) {
    console.error('Error adding book to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add book to collection' },
      { status: 500 }
    );
  }
}

// DELETE - Remove book from collection (by bookId in query)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId required' }, { status: 400 });
    }

    await prisma.bookCollection.deleteMany({
      where: {
        bookId,
        collectionId,
      },
    });

    return NextResponse.json({ message: 'Book removed from collection' });
  } catch (error) {
    console.error('Error removing book from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove book from collection' },
      { status: 500 }
    );
  }
}
