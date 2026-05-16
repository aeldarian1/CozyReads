import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';
import { bookSchema, paginationSchema, bookFilterSchema } from '@/lib/schemas';
import { PaginatedResponse, Book } from '@/types';

// GET all books with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
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
    const user = await getAuthenticatedUser();
    const body = await request.json();

    // Validate input with Zod
    const validation = bookSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const book = await prisma.book.create({
      data: {
        userId: user.id,
        title: data.title,
        author: data.author,
        isbn: data.isbn || null,
        genre: data.genre || null,
        description: data.description || null,
        coverUrl: data.coverUrl || null,
        readingStatus: data.readingStatus,
        rating: data.rating,
        review: data.review || null,
        notes: data.notes || null,
        currentPage: data.currentPage || null,
        totalPages: data.totalPages || null,
        series: data.series || null,
        seriesNumber: data.seriesNumber || null,
        dateFinished: data.dateFinished || null,
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
