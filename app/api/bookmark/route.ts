import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, policyId } = body;

    if (!userId || !policyId) {
      return NextResponse.json(
        { error: 'UserId and policyId are required' },
        { status: 400 }
      );
    }

    // UserPolicy 레코드 찾기 또는 생성
    const userPolicy = await prisma.userPolicy.findUnique({
      where: {
        userId_policyId: {
          userId,
          policyId,
        },
      },
    });

    if (userPolicy) {
      // 기존 레코드가 있으면 북마크 상태 토글
      const updated = await prisma.userPolicy.update({
        where: {
          userId_policyId: {
            userId,
            policyId,
          },
        },
        data: {
          isBookmarked: !userPolicy.isBookmarked,
        },
      });
      return NextResponse.json({ 
        success: true, 
        isBookmarked: updated.isBookmarked 
      });
    } else {
      // 레코드가 없으면 생성 (기본적으로 북마크 true)
      const created = await prisma.userPolicy.create({
        data: {
          userId,
          policyId,
          isBookmarked: true,
          isEligible: true,
          matchScore: 100,
        },
      });
      return NextResponse.json({ 
        success: true, 
        isBookmarked: created.isBookmarked 
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const policyId = searchParams.get('policyId');

    if (!userId || !policyId) {
      return NextResponse.json(
        { error: 'UserId and policyId are required' },
        { status: 400 }
      );
    }

    const userPolicy = await prisma.userPolicy.findUnique({
      where: {
        userId_policyId: {
          userId,
          policyId,
        },
      },
    });

    return NextResponse.json({ 
      isBookmarked: userPolicy?.isBookmarked || false 
    });
  } catch (error) {
    console.error('Error fetching bookmark status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark status' },
      { status: 500 }
    );
  }
}

