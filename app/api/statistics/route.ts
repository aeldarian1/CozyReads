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

// GET statistics
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

    // Fetch all books for the user
    const books = await prisma.book.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        readingStatus: true,
        rating: true,
        genre: true,
        totalPages: true,
        dateAdded: true,
        dateFinished: true,
      },
    });

    // Calculate overall statistics
    const totalBooks = books.length;
    const wantToRead = books.filter(b => b.readingStatus === 'Want to Read').length;
    const currentlyReading = books.filter(b => b.readingStatus === 'Currently Reading').length;
    const finished = books.filter(b => b.readingStatus === 'Finished').length;

    // Calculate average rating (only for rated books)
    const ratedBooks = books.filter(b => b.rating > 0);
    const averageRating = ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length
      : 0;

    // Calculate total pages read (only finished books)
    const finishedBooks = books.filter(b => b.readingStatus === 'Finished');
    const totalPagesRead = finishedBooks.reduce((sum, b) => sum + (b.totalPages || 0), 0);

    // Books finished this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const booksFinishedThisMonth = books.filter(b =>
      b.dateFinished && new Date(b.dateFinished) >= startOfMonth
    ).length;

    // Books finished this year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const booksFinishedThisYear = books.filter(b =>
      b.dateFinished && new Date(b.dateFinished) >= startOfYear
    ).length;

    // Genre distribution
    const genreMap = new Map<string, number>();
    books.forEach(book => {
      if (book.genre) {
        genreMap.set(book.genre, (genreMap.get(book.genre) || 0) + 1);
      }
    });
    const genreDistribution = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: books.filter(b => b.rating === rating).length,
    }));

    // Monthly reading trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = books.filter(b => {
        if (!b.dateFinished) return false;
        const finishedDate = new Date(b.dateFinished);
        return finishedDate >= date && finishedDate < nextMonth;
      }).length;

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    // Top rated books (5 stars)
    const topRatedBooks = await prisma.book.findMany({
      where: {
        userId: user.id,
        rating: 5,
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        genre: true,
      },
      orderBy: { dateAdded: 'desc' },
      take: 10,
    });

    // Recently finished books
    const recentlyFinished = await prisma.book.findMany({
      where: {
        userId: user.id,
        readingStatus: 'Finished',
        dateFinished: { not: null },
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        rating: true,
        dateFinished: true,
      },
      orderBy: { dateFinished: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      overview: {
        totalBooks,
        wantToRead,
        currentlyReading,
        finished,
        averageRating: Math.round(averageRating * 10) / 10,
        totalPagesRead,
        booksFinishedThisMonth,
        booksFinishedThisYear,
      },
      genreDistribution,
      ratingDistribution,
      monthlyTrend,
      topRatedBooks,
      recentlyFinished,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
