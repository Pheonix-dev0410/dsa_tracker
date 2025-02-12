import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { fetchAllStats } from '@/lib/api';

const prisma = new PrismaClient();

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

// Cache analytics data with TTL
const analyticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check cache
    const cachedData = analyticsCache.get(session.user.id);
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch user's platform usernames
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { leetcode: true, codechef: true, hackerrank: true },
    });

    // Fetch real-time platform stats
    const platformStats = await fetchAllStats(
      user?.leetcode || '',
      user?.codechef || '',
      user?.hackerrank || ''
    );

    // Fetch user's submissions grouped by difficulty
    const submissions = await prisma.submission.groupBy({
      by: ['difficulty'],
      where: {
        userId: session.user.id,
        status: 'ACCEPTED',
      },
      _count: {
        _all: true,
      },
    });

    // Fetch user's daily progress
    const dailyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'asc',
      },
      take: 30, // Last 30 days
    });

    // Create difficulty stats
    const difficultyStats = DIFFICULTY_LEVELS.map(difficulty => {
      const stats = submissions.find(s => s.difficulty === difficulty);
      return {
        difficulty,
        solved: stats?._count._all || 0,
        attempted: 0, // We'll update this next
      };
    });

    // Update with real-time platform stats
    if (platformStats.leetcode) {
      difficultyStats.forEach(stat => {
        if (stat.difficulty === 'Easy') {
          stat.solved = platformStats.leetcode.easy;
        } else if (stat.difficulty === 'Medium') {
          stat.solved = platformStats.leetcode.medium;
        } else if (stat.difficulty === 'Hard') {
          stat.solved = platformStats.leetcode.hard;
        }
      });
    }

    // Fetch attempted problems count
    const attemptedCounts = await prisma.submission.groupBy({
      by: ['difficulty'],
      where: {
        userId: session.user.id,
      },
      _count: {
        _all: true,
      },
    });

    // Update attempted counts
    difficultyStats.forEach(stat => {
      const attempted = attemptedCounts.find(a => a.difficulty === stat.difficulty);
      if (attempted) {
        stat.attempted = attempted._count._all;
      }
    });

    // Calculate total problems solved
    const totalSolved = difficultyStats.reduce((acc, curr) => acc + curr.solved, 0);

    // Calculate average time per problem
    const totalTime = dailyProgress.reduce((acc, curr) => acc + curr.timeSpent, 0);
    const averageTime = totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0;

    // Calculate success rates
    const successRates = difficultyStats.map(stat => ({
      difficulty: stat.difficulty,
      rate: stat.attempted > 0 ? (stat.solved / stat.attempted) * 100 : 0,
    }));

    // Find strongest and weakest difficulties based on success rate
    const sortedDifficulties = [...successRates].sort((a, b) => b.rate - a.rate);
    const strongestDifficulty = sortedDifficulties[0]?.difficulty || 'None';
    const weakestDifficulty = sortedDifficulties[sortedDifficulties.length - 1]?.difficulty || 'None';

    const analyticsData = {
      dailyProgress,
      difficultyStats,
      successRates,
      streak: user?.streak || 0,
      totalSolved,
      averageTime,
      strongestDifficulty,
      weakestDifficulty,
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    analyticsCache.set(session.user.id, {
      data: analyticsData,
      timestamp: now,
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { message: 'Error fetching analytics' },
      { status: 500 }
    );
  }
} 