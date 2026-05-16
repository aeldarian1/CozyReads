import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';

// GET reading speed analytics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    // Get books with dateFinished
    const finishedBooks = await prisma.book.findMany({
      where: {
        userId: user.id,
        dateFinished: { not: null },
      },
      select: {
        totalPages: true,
        dateAdded: true,
        dateFinished: true,
      },
      orderBy: {
        dateFinished: 'desc',
      },
    });

    if (finishedBooks.length === 0) {
      return NextResponse.json({
        message: 'No finished books with date information found',
        averagePagesPerDay: 0,
        averageBooksPerMonth: 0,
        totalPagesRead: 0,
        estimatedHoursRead: 0,
        readingVelocity: 'Not enough data',
      });
    }

    // Calculate total pages read
    const totalPagesRead = finishedBooks.reduce((sum, book) => {
      return sum + (book.totalPages || 0);
    }, 0);

    // Calculate reading days (books with reading time data)
    const booksWithPages = finishedBooks.filter(book =>
      book.totalPages &&
      book.dateAdded &&
      book.dateFinished &&
      new Date(book.dateFinished) > new Date(book.dateAdded)
    );

    let totalReadingDays = 0;
    let totalPagesWithReadingTime = 0;

    booksWithPages.forEach(book => {
      const startDate = new Date(book.dateAdded!);
      const endDate = new Date(book.dateFinished!);
      const daysToRead = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      totalReadingDays += daysToRead;
      totalPagesWithReadingTime += book.totalPages || 0;
    });

    // Calculate pages per day (only from books with reading time data)
    const averagePagesPerDay = booksWithPages.length > 0
      ? Math.round(totalPagesWithReadingTime / totalReadingDays)
      : 0;

    // Calculate books per month (from all finished books)
    const oldestFinish = new Date(finishedBooks[finishedBooks.length - 1].dateFinished!);
    const newestFinish = new Date(finishedBooks[0].dateFinished!);
    const monthsReading = Math.max(1, (newestFinish.getTime() - oldestFinish.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const averageBooksPerMonth = parseFloat((finishedBooks.length / monthsReading).toFixed(1));

    // Estimate hours read (assuming 250 words/page and 250 words/minute reading speed)
    const estimatedHoursRead = Math.round((totalPagesRead * 250) / (250 * 60));

    // Determine reading velocity
    let readingVelocity = 'Casual Reader';
    if (averageBooksPerMonth >= 4) {
      readingVelocity = 'Speed Reader 🚀';
    } else if (averageBooksPerMonth >= 2) {
      readingVelocity = 'Avid Reader 📚';
    } else if (averageBooksPerMonth >= 1) {
      readingVelocity = 'Regular Reader 📖';
    }

    // Recent reading speed (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBooks = finishedBooks.filter(book =>
      book.dateFinished && new Date(book.dateFinished) >= thirtyDaysAgo
    );

    const recentPagesRead = recentBooks.reduce((sum, book) => sum + (book.totalPages || 0), 0);
    const recentBooksCount = recentBooks.length;

    // Monthly trend (comparing last 30 days to average)
    let monthlyTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentBooksCount > averageBooksPerMonth) {
      monthlyTrend = 'up';
    } else if (recentBooksCount < averageBooksPerMonth * 0.8) {
      monthlyTrend = 'down';
    }

    return NextResponse.json({
      averagePagesPerDay,
      averageBooksPerMonth,
      totalPagesRead,
      estimatedHoursRead,
      readingVelocity,
      recentBooksCount,
      recentPagesRead,
      monthlyTrend,
      totalBooksFinished: finishedBooks.length,
    });
  } catch (error) {
    console.error('Error calculating reading speed:', error);
    return NextResponse.json(
      { error: 'Failed to calculate reading speed' },
      { status: 500 }
    );
  }
}
