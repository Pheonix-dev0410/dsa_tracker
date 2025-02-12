import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

const DSA_CATEGORIES = [
  'Arrays',
  'Strings',
  'LinkedList',
  'Stack',
  'Queue',
  'Tree',
  'Graph',
  'DynamicProgramming',
  'Recursion',
  'Sorting',
  'Searching',
  'Greedy',
];

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { duration, focusCategories, difficulty } = await request.json();

    // Get user's problem stats
    const userStats = await prisma.problemStats.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate recommended categories based on user's weak areas
    const weakCategories = DSA_CATEGORIES.filter(category => {
      const categoryStats = userStats.find(stat => stat.category === category);
      return !categoryStats || categoryStats.solved < 10; // Threshold for weak areas
    });

    // Combine user's focus categories with weak areas
    const targetCategories = [...new Set([...focusCategories, ...weakCategories])];

    // Create a study plan
    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId: session.user.id,
        title: `${duration} Days DSA Study Plan`,
        description: `Focused on ${targetCategories.join(', ')}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        categories: targetCategories,
        difficulty,
        problems: {
          create: generateProblems(targetCategories, difficulty, duration),
        },
      },
      include: {
        problems: true,
      },
    });

    return NextResponse.json(studyPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json(
      { message: 'Error creating study plan' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const studyPlans = await prisma.studyPlan.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        problems: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(studyPlans);
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json(
      { message: 'Error fetching study plans' },
      { status: 500 }
    );
  }
}

function generateProblems(categories: string[], difficulty: string, duration: number) {
  const problems = [];
  const problemsPerDay = 3;
  const totalProblems = duration * problemsPerDay;

  // Sample problem templates (in real app, these would come from the platforms' APIs)
  const problemTemplates = {
    Arrays: [
      { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum' },
      { name: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water' },
    ],
    Tree: [
      { name: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal' },
      { name: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree' },
    ],
    // Add more templates for other categories
  };

  for (let i = 0; i < totalProblems; i++) {
    const category = categories[i % categories.length];
    const template = problemTemplates[category]?.[0] || {
      name: `${category} Problem ${i + 1}`,
      url: `https://leetcode.com/problems/${category.toLowerCase()}-problem-${i + 1}`,
    };

    problems.push({
      platform: 'LeetCode',
      problemId: `PROB_${i}`,
      name: template.name,
      difficulty,
      category,
      url: template.url,
    });
  }

  return problems;
} 