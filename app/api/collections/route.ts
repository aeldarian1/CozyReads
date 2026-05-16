import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';
import { collectionSchema } from '@/lib/schemas';

// GET all collections
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include book count
    const collectionsWithCount = collections.map((collection) => ({
      ...collection,
      bookCount: collection.books.length,
    }));

    return NextResponse.json(collectionsWithCount);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST create new collection
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();

    // Validate input with Zod
    const validation = collectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        color: data.color,
        icon: data.icon,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
