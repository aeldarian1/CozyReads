import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get or create user
export async function getOrCreateUser(clerkUser: any): Promise<User> {
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

// Middleware wrapper for authenticated routes
export async function withAuth<T>(
  handler: (request: NextRequest, user: User) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    try {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any;
      }

      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any;
      }

      const user = await getOrCreateUser(clerkUser);
      return await handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ) as any;
    }
  };
}

// Type-safe error response
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Type-safe success response
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
