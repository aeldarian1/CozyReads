import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';

// Calculate reading streaks from finished books
function calculateStreaks(finishedDates: Date[]) {
  if (finishedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
  }

  // Sort dates in descending order (most recent first)
  const sortedDates = finishedDates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Group by date (ignore time)
  const uniqueDates = sortedDates
    .map(d => d.toISOString().split('T')[0])
    .filter((date, index, self) => self.indexOf(date) === index)
    .map(dateStr => new Date(dateStr));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDate = uniqueDates[0];
  mostRecentDate.setHours(0, 0, 0, 0);

  // Check if current streak is active (read today or yesterday)
  if (mostRecentDate.getTime() === today.getTime() || mostRecentDate.getTime() === yesterday.getTime()) {
    currentStreak = 1;

    // Calculate current streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const current = uniqueDates[i];
      current.setHours(0, 0, 0, 0);

      const previous = uniqueDates[i - 1];
      previous.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = uniqueDates[i];
    current.setHours(0, 0, 0, 0);

    const previous = uniqueDates[i - 1];
    previous.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastReadDate: mostRecentDate,
  };
}

// GET reading streaks
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    // Get all books with finish dates
    const finishedBooks = await prisma.book.findMany({
      where: {
        userId: user.id,
        dateFinished: { not: null },
      },
      select: {
        dateFinished: true,
      },
      orderBy: {
        dateFinished: 'desc',
      },
    });

    const finishedDates = finishedBooks
      .map(book => book.dateFinished)
      .filter((date): date is Date => date !== null);

    const streaks = calculateStreaks(finishedDates);

    // Calculate additional stats
    const totalBooksFinished = finishedBooks.length;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const booksThisMonth = finishedBooks.filter(
      book => book.dateFinished && new Date(book.dateFinished) >= thisMonth
    ).length;

    const thisYear = new Date(new Date().getFullYear(), 0, 1);
    const booksThisYear = finishedBooks.filter(
      book => book.dateFinished && new Date(book.dateFinished) >= thisYear
    ).length;

    return NextResponse.json({
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      lastReadDate: streaks.lastReadDate,
      totalBooksFinished,
      booksThisMonth,
      booksThisYear,
    });
  } catch (error) {
    console.error('Error calculating streaks:', error);
    return NextResponse.json(
      { error: 'Failed to calculate streaks' },
      { status: 500 }
    );
  }
}
