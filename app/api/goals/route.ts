import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-middleware';
import { readingGoalSchema } from '@/lib/schemas';

// GET all goals for user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const goals = await prisma.readingGoal.findMany({
      where: { userId: user.id },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST - Create or update a goal
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();

    // Validate input with Zod
    const validation = readingGoalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Upsert goal (create or update if exists)
    const goal = await prisma.readingGoal.upsert({
      where: {
        userId_year: {
          userId: user.id,
          year: data.year,
        },
      },
      update: {
        targetBooks: data.targetBooks,
        targetPages: data.targetPages || null,
        description: data.description || null,
      },
      create: {
        userId: user.id,
        year: data.year,
        targetBooks: data.targetBooks,
        targetPages: data.targetPages || null,
        description: data.description || null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create/update goal' },
      { status: 500 }
    );
  }
}

// DELETE goal
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { error: 'Year is required' },
        { status: 400 }
      );
    }

    await prisma.readingGoal.delete({
      where: {
        userId_year: {
          userId: user.id,
          year: parseInt(year),
        },
      },
    });

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
