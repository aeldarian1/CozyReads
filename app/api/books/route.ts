import { NextRequest, NextResponse } from 'next/server';
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

// GET all books with pagination and filters
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const rating = searchParams.get('rating') || '';
    const genre = searchParams.get('genre') || '';
    const collection = searchParams.get('collection') || '';

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = { userId: user.id };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { genre: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.readingStatus = status;
    }

    if (rating) {
      where.rating = { gte: parseInt(rating) };
    }

    if (genre) {
      where.genre = { contains: genre, mode: 'insensitive' };
    }

    if (collection) {
      where.collections = {
        some: {
          collectionId: collection,
        },
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.book.count({ where });

    // Build orderBy based on sortBy parameter
    const orderBy: any = {};
    if (sortBy === 'title' || sortBy === 'author' || sortBy === 'rating') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.dateAdded = sortOrder;
    }

    const books = await prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + books.length < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST - Create a new book
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      author,
      isbn,
      genre,
      description,
      coverUrl,
      readingStatus,
      rating,
      review,
      notes,
      series,
      seriesNumber,
    } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        userId: user.id,
        title,
        author,
        isbn: isbn || null,
        genre: genre || null,
        description: description || null,
        coverUrl: coverUrl || null,
        readingStatus: readingStatus || 'Want to Read',
        rating: rating || 0,
        review: review || null,
        notes: notes || null,
        series: series || null,
        seriesNumber: seriesNumber || null,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
