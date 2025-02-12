import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        leetcode: true,
        codechef: true,
        hackerrank: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      leetcode: user.leetcode || '',
      codechef: user.codechef || '',
      hackerrank: user.hackerrank || '',
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return NextResponse.json(
      { message: 'Error fetching user profiles' },
      { status: 500 }
    );
  }
} 