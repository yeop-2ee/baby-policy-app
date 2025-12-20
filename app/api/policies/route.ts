import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const filterByLocation = searchParams.get('filterByLocation') === 'true';

    console.log('[API] DATABASE_URL:', process.env.DATABASE_URL);
    console.log('[API] Category filter:', category);
    console.log('[API] Filter by location:', filterByLocation);

    // 사용자 프로필 조회 (지역 필터링을 위해)
    let userProfile = null;
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
      userProfile = user?.profile || null;
    }

    // 지역 필터링 조건 생성
    let locationFilter: any = undefined;
    if (filterByLocation && userProfile?.city) {
      locationFilter = {
        OR: [
          { targetCity: null }, // 전국 정책
          { targetCity: userProfile.city, targetDistrict: null }, // 해당 시 전체 정책
          { targetCity: userProfile.city, targetDistrict: userProfile.district }, // 해당 구/군 정책
        ],
      };
    }

    // 정책 조회 조건 생성
    const whereClause: any = {};
    if (category && category !== '전체') {
      whereClause.category = category;
    }
    if (locationFilter) {
      whereClause.AND = [locationFilter];
    }

    // 정책 조회
    let policies = await prisma.policy.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`[API] Found ${policies.length} policies`);

    // 사용자 프로필이 있으면 매칭 점수 계산
    if (userId && userProfile) {
      policies = await Promise.all(
        policies.map(async (policy) => {
          const matchScore = calculateMatchScore(
            {
              city: userProfile!.city,
              district: userProfile!.district,
              incomeLevel: userProfile!.incomeLevel,
              childCount: userProfile!.childCount,
              dualIncome: userProfile!.dualIncome,
              multiChild: userProfile!.multiChild,
              children: userProfile!.children.map(c => ({ age: c.age })),
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
              isBookmarked: userPolicy.isBookmarked || false,
            };
        })
      );
    }

    console.log(`[API] Returning ${policies.length} policies`);
    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch policies',
        message: error instanceof Error ? error.message : 'Unknown error',
        policies: [] 
      },
      { status: 500 }
    );
  }
}

