import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/quotes/[id] - Get a specific quote
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// PUT /api/quotes/[id] - Update a quote
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, pageNumber, notes, isFavorite } = body;

    // Verify quote belongs to user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Update quote
    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: {
        ...(text !== undefined && { text: text.trim() }),
        ...(pageNumber !== undefined && { pageNumber }),
        ...(notes !== undefined && { notes }),
        ...(isFavorite !== undefined && { isFavorite }),
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotes/[id] - Delete a quote
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify quote belongs to user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Delete quote
    await prisma.quote.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
