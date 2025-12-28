import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';

// GET goal progress for a specific year
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Get goal for the year
    const goal = await prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year: parseInt(year),
        },
      },
    });

    if (!goal) {
      return NextResponse.json({
        hasGoal: false,
        year: parseInt(year),
      });
    }

    // Get books finished in the year
    const startOfYear = new Date(parseInt(year), 0, 1);
    const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);

    const finishedBooks = await prisma.book.findMany({
      where: {
        userId: user.id,
        readingStatus: 'Finished',
        dateFinished: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        totalPages: true,
        dateFinished: true,
        rating: true,
      },
      orderBy: { dateFinished: 'desc' },
    });

    // Calculate total pages read
    const totalPagesRead = finishedBooks.reduce(
      (sum, book) => sum + (book.totalPages || 0),
      0
    );

    // Calculate books read per month for the year
    const monthlyProgress = Array.from({ length: 12 }, (_, i) => {
      const month = i;
      const count = finishedBooks.filter(book => {
        if (!book.dateFinished) return false;
        const finishedDate = new Date(book.dateFinished);
        return finishedDate.getMonth() === month;
      }).length;
      return {
        month: new Date(parseInt(year), month).toLocaleDateString('en-US', {
          month: 'short',
        }),
        count,
      };
    });

    // Calculate days ahead/behind pace
    const today = new Date();
    const daysInYear = (new Date(parseInt(year), 11, 31).getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = parseInt(year) === today.getFullYear()
      ? (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      : daysInYear;

    const expectedBooks = (goal.targetBooks / daysInYear) * daysPassed;
    const booksAheadBehind = finishedBooks.length - Math.floor(expectedBooks);

    // Expected pages (if goal set)
    const expectedPages = goal.targetPages
      ? (goal.targetPages / daysInYear) * daysPassed
      : 0;
    const pagesAheadBehind = goal.targetPages
      ? totalPagesRead - Math.floor(expectedPages)
      : 0;

    return NextResponse.json({
      hasGoal: true,
      year: parseInt(year),
      goal: {
        targetBooks: goal.targetBooks,
        targetPages: goal.targetPages,
        description: goal.description,
      },
      progress: {
        booksRead: finishedBooks.length,
        pagesRead: totalPagesRead,
        percentageBooks: Math.round((finishedBooks.length / goal.targetBooks) * 100),
        percentagePages: goal.targetPages
          ? Math.round((totalPagesRead / goal.targetPages) * 100)
          : null,
        booksRemaining: Math.max(0, goal.targetBooks - finishedBooks.length),
        pagesRemaining: goal.targetPages
          ? Math.max(0, goal.targetPages - totalPagesRead)
          : null,
        booksAheadBehind,
        pagesAheadBehind,
        isPaceGood: booksAheadBehind >= 0,
      },
      monthlyProgress,
      recentBooks: finishedBooks.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal progress' },
      { status: 500 }
    );
  }
}
