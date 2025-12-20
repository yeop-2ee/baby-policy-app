import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    // 즐겨찾기한 정책 조회
    const userPolicies = await prisma.userPolicy.findMany({
      where: {
        userId,
        isBookmarked: true,
      },
      include: {
        policy: {
          include: {
            reviews: {
              take: 3,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const policies = userPolicies.map(up => ({
      ...up.policy,
      matchScore: up.matchScore,
      isEligible: up.isEligible,
      isBookmarked: up.isBookmarked,
    }));

    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error fetching bookmarked policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarked policies' },
      { status: 500 }
    );
  }
}

