/**
 * Example API Route: GET /api/books
 * 
 * This demonstrates:
 * - Authentication middleware
 * - Prisma queries
 * - Query parameters
 * - Error handling
 * - Response formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { bookSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = { userId: user.id };

    if (status) {
      where.readingStatus = status;
    }

    if (genre) {
      where.genre = genre;
    }

    // Query books with pagination
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          collections: {
            include: {
              collection: true,
            },
          },
        },
        orderBy: { dateAdded: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch books',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Example API Route: POST /api/books
 * 
 * This demonstrates:
 * - Request validation with Zod
 * - Creating records with Prisma
 * - Returning created data
 * - Error handling
 */

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = bookSchema.parse(body);

    // Create book in database
    const book = await prisma.book.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: book,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating book:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid book data',
        },
      },
      { status: 400 }
    );
  }
}

/**
 * Example: Custom hook for fetching books
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useBooks = (filters?: { status?: string; genre?: string }) => {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.genre) params.append('genre', filters.genre);

      const response = await fetch(`/api/books?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      return response.json();
    },
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create book');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

/**
 * Example: Using the hook in a component
 */

export function BookList() {
  const { data, isLoading, error } = useBooks();
  const { mutate: createBook } = useCreateBook();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => createBook({ title: 'New Book' })}>
        Add Book
      </button>

      <ul>
        {data?.data?.map((book: any) => (
          <li key={book.id}>{book.title}</li>
        ))}
      </ul>
    </div>
  );
}
