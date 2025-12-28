import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';

// Check if book with ISBN already exists
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { isbn, excludeId } = await request.json();

    if (!isbn) {
      return NextResponse.json({ exists: false, book: null });
    }

    // Clean ISBN (remove dashes and spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, '');

    // Find existing book with this ISBN
    const existingBook = await prisma.book.findFirst({
      where: {
        userId: user.id,
        isbn: {
          contains: cleanIsbn,
        },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
      },
    });

    if (existingBook) {
      return NextResponse.json({
        exists: true,
        book: existingBook,
      });
    }

    return NextResponse.json({ exists: false, book: null });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return NextResponse.json(
      { error: 'Failed to check duplicate' },
      { status: 500 }
    );
  }
}
