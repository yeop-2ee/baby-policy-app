import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    // 정책 조회
    let policies = await prisma.policy.findMany({
      where: category ? { category } : undefined,
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 사용자 프로필이 있으면 매칭 점수 계산
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: {
              children: true,
            },
          },
        },
      });

      if (user?.profile) {
        policies = await Promise.all(
          policies.map(async (policy) => {
            const matchScore = calculateMatchScore(
              {
                city: user.profile!.city,
                district: user.profile!.district,
                incomeLevel: user.profile!.incomeLevel,
                childCount: user.profile!.childCount,
                dualIncome: user.profile!.dualIncome,
                multiChild: user.profile!.multiChild,
                children: user.profile!.children.map(c => ({ age: c.age })),
              },
              {
                targetCity: policy.targetCity,
                targetDistrict: policy.targetDistrict,
                minIncomeLevel: policy.minIncomeLevel,
                maxIncomeLevel: policy.maxIncomeLevel,
                minChildCount: policy.minChildCount,
                maxChildCount: policy.maxChildCount,
                minChildAge: policy.minChildAge,
                maxChildAge: policy.maxChildAge,
                requiresDualIncome: policy.requiresDualIncome,
                requiresMultiChild: policy.requiresMultiChild,
              }
            );

            // UserPolicy 레코드 확인/생성
            const userPolicy = await prisma.userPolicy.upsert({
              where: {
                userId_policyId: {
                  userId: userId,
                  policyId: policy.id,
                },
              },
              update: {
                matchScore,
                isEligible: matchScore > 0,
              },
              create: {
                userId: userId,
                policyId: policy.id,
                matchScore,
                isEligible: matchScore > 0,
              },
            });

            return {
              ...policy,
              matchScore: userPolicy.matchScore,
              isEligible: userPolicy.isEligible,
              isBookmarked: userPolicy.isBookmarked,
            };
          })
        );
      }
    }

    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

