import { NextResponse } from 'next/server';
import { enrichBookFromGoogleBooks } from '@/lib/book-enrichment';

export async function POST(request: Request) {
  try {
    const { title, author, isbn } = await request.json();

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Use fast mode for quick enrichment
    const enrichedData = await enrichBookFromGoogleBooks(
      isbn,
      title,
      author,
      false, // Not hardcover-only
      true   // Fast mode enabled
    );

    return NextResponse.json({
      coverUrl: enrichedData.coverUrl,
      description: enrichedData.description,
      genre: enrichedData.genre,
      totalPages: enrichedData.pageCount,
      publisher: enrichedData.publisher,
      publishedDate: enrichedData.publishedDate,
    });
  } catch (error) {
    console.error('Enrichment API error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich book data' },
      { status: 500 }
    );
  }
}
