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

// Export library data
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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Get all books with collections
    const books = await prisma.book.findMany({
      where: { userId: user.id },
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
      },
      orderBy: { dateAdded: 'desc' },
    });

    // Get collections
    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
    });

    // Get reading goals
    const goals = await prisma.readingGoal.findMany({
      where: { userId: user.id },
      orderBy: { year: 'desc' },
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Title',
        'Author',
        'ISBN',
        'Genre',
        'Reading Status',
        'Rating',
        'Series',
        'Series Number',
        'Current Page',
        'Total Pages',
        'Date Added',
        'Date Finished',
        'Collections',
      ];

      const rows = books.map(book => [
        `"${book.title.replace(/"/g, '""')}"`,
        `"${book.author.replace(/"/g, '""')}"`,
        book.isbn || '',
        book.genre || '',
        book.readingStatus,
        book.rating,
        book.series || '',
        book.seriesNumber || '',
        book.currentPage || '',
        book.totalPages || '',
        new Date(book.dateAdded).toISOString().split('T')[0],
        book.dateFinished ? new Date(book.dateFinished).toISOString().split('T')[0] : '',
        book.collections.map(c => c.collection.name).join(';'),
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="cozyreads-library-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      // Generate JSON export
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        statistics: {
          totalBooks: books.length,
          totalCollections: collections.length,
          totalGoals: goals.length,
        },
        books: books.map(book => ({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          genre: book.genre,
          description: book.description,
          coverUrl: book.coverUrl,
          readingStatus: book.readingStatus,
          rating: book.rating,
          review: book.review,
          notes: book.notes,
          currentPage: book.currentPage,
          totalPages: book.totalPages,
          series: book.series,
          seriesNumber: book.seriesNumber,
          dateAdded: book.dateAdded,
          dateFinished: book.dateFinished,
          collections: book.collections.map(c => ({
            name: c.collection.name,
            icon: c.collection.icon,
            color: c.collection.color,
          })),
        })),
        collections: collections.map(col => ({
          name: col.name,
          description: col.description,
          icon: col.icon,
          color: col.color,
          bookCount: books.filter(b =>
            b.collections.some(c => c.collection.id === col.id)
          ).length,
        })),
        goals: goals.map(goal => ({
          year: goal.year,
          targetBooks: goal.targetBooks,
          targetPages: goal.targetPages,
          description: goal.description,
        })),
      };

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="cozyreads-backup-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or json.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
