import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get all users from DB
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
          role: (session.user as any)?.role,
        },
        isAdmin: (session.user as any)?.role === 'ADMIN',
      } : null,
      allUsers: users,
      message: 'Debug info: Check if your user has ADMIN role',
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
