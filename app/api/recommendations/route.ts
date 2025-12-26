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

// GET recommendations based on user's reading history
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

    // Get user's books
    const userBooks = await prisma.book.findMany({
      where: { userId: user.id },
      select: {
        genre: true,
        rating: true,
        author: true,
        series: true,
      },
    });

    if (userBooks.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'Start adding books to get personalized recommendations',
      });
    }

    // Analyze user preferences
    const genreCounts = new Map<string, number>();
    const genreRatings = new Map<string, number[]>();
    const authorCounts = new Map<string, number>();
    const seriesMap = new Map<string, boolean>();

    userBooks.forEach(book => {
      // Genre analysis
      if (book.genre) {
        genreCounts.set(book.genre, (genreCounts.get(book.genre) || 0) + 1);
        if (book.rating > 0) {
          if (!genreRatings.has(book.genre)) {
            genreRatings.set(book.genre, []);
          }
          genreRatings.get(book.genre)!.push(book.rating);
        }
      }

      // Author analysis
      if (book.author) {
        authorCounts.set(book.author, (authorCounts.get(book.author) || 0) + 1);
      }

      // Series analysis
      if (book.series) {
        seriesMap.set(book.series, true);
      }
    });

    // Find favorite genres (high rating + count)
    const favoriteGenres = Array.from(genreRatings.entries())
      .map(([genre, ratings]) => ({
        genre,
        avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        count: genreCounts.get(genre) || 0,
      }))
      .filter(g => g.avgRating >= 4) // Only genres rated 4+ stars
      .sort((a, b) => b.avgRating * b.count - a.avgRating * a.count)
      .slice(0, 3)
      .map(g => g.genre);

    // Find favorite authors (read multiple books)
    const favoriteAuthors = Array.from(authorCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([author]) => author);

    // Build recommendations
    const recommendations = [];

    // Recommendation 1: More from favorite authors
    if (favoriteAuthors.length > 0) {
      recommendations.push({
        type: 'favorite_authors',
        title: 'More from Authors You Love',
        description: `You've read multiple books by these authors`,
        items: favoriteAuthors.slice(0, 3),
      });
    }

    // Recommendation 2: Similar genres
    if (favoriteGenres.length > 0) {
      recommendations.push({
        type: 'favorite_genres',
        title: 'Based on Your Favorite Genres',
        description: `You rated ${favoriteGenres.join(', ')} highly`,
        items: favoriteGenres,
      });
    }

    // Recommendation 3: Complete series
    const incompleteSeries = Array.from(seriesMap.keys()).slice(0, 5);
    if (incompleteSeries.length > 0) {
      recommendations.push({
        type: 'incomplete_series',
        title: 'Continue Your Series',
        description: 'You started these series',
        items: incompleteSeries,
      });
    }

    // Recommendation 4: Highly rated genre you haven't explored
    const unexploredGenres = ['Mystery', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Romance', 'Thriller']
      .filter(g => !genreCounts.has(g));
    if (unexploredGenres.length > 0) {
      recommendations.push({
        type: 'explore_new',
        title: 'Try Something New',
        description: 'Expand your reading horizons',
        items: unexploredGenres.slice(0, 3),
      });
    }

    // Recommendation 5: Reading challenge
    const currentYear = new Date().getFullYear();
    const finishedThisYear = userBooks.filter((b: any) =>
      b.dateFinished && new Date(b.dateFinished).getFullYear() === currentYear
    ).length;

    if (finishedThisYear < 52) {
      recommendations.push({
        type: 'reading_challenge',
        title: 'Reading Challenge',
        description: `You've read ${finishedThisYear} books this year. Can you reach 52?`,
        items: ['52 Books Challenge'],
      });
    }

    return NextResponse.json({
      recommendations,
      stats: {
        totalBooks: userBooks.length,
        favoriteGenres: favoriteGenres.slice(0, 3),
        favoriteAuthors: favoriteAuthors.slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
