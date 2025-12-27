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

// Check if book with ISBN already exists
export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);
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
