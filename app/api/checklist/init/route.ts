import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateMonthsOld } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    // 사용자 프로필 가져오기
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

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = user.profile;
    const existingChecklist = await prisma.checklist.findMany({
      where: { userId },
    });

    // 이미 체크리스트가 있으면 생성하지 않음
    if (existingChecklist.length > 0) {
      return NextResponse.json({ success: true, message: 'Checklist already exists' });
    }

    const checklistItems = [];

    // 임신 중인 경우
    if (profile.isPregnant) {
      const week = profile.pregnancyWeek || 0;
      
      // 임신 초기 (1-12주)
      if (week <= 12) {
        checklistItems.push(
          {
            type: 'pregnancy',
            title: '산전 진료 예약',
            description: '산부인과 첫 진료 예약 및 초음파 검사',
            category: '의료',
            priority: 'high',
          },
          {
            type: 'pregnancy',
            title: '엽산 복용 시작',
            description: '임신 초기 엽산 보충제 복용 (하루 400-800mcg)',
            category: '건강',
            priority: 'high',
          },
          {
            type: 'pregnancy',
            title: '임신 신고',
            description: '보건소 또는 동사무소에 임신 신고',
            category: '행정',
            priority: 'medium',
          }
        );
      }
      
      // 임신 중기 (13-27주)
      if (week >= 13 && week <= 27) {
        checklistItems.push(
          {
            type: 'pregnancy',
            title: '산전 검사 (다운증후군 등)',
            description: '선택적 산전 검사 실시',
            category: '의료',
            priority: 'medium',
          },
          {
            type: 'pregnancy',
            title: '출산 준비물 준비 시작',
            description: '아기 옷, 기저귀, 목욕용품 등 준비',
            category: '준비물',
            priority: 'low',
          }
        );
      }
      
      // 임신 후기 (28주 이상)
      if (week >= 28) {
        checklistItems.push(
          {
            type: 'pregnancy',
            title: '출산 병원 확정',
            description: '출산 예정 병원 선택 및 예약',
            category: '의료',
            priority: 'high',
          },
          {
            type: 'pregnancy',
            title: '출산 준비물 완료',
            description: '산모용품 및 신생아용품 준비 완료',
            category: '준비물',
            priority: 'high',
          },
          {
            type: 'pregnancy',
            title: '육아휴직 신청 준비',
            description: '회사에 육아휴직 신청서 제출 준비',
            category: '행정',
            priority: 'medium',
          }
        );
      }
    }

    // 출산 후인 경우
    if (profile.hasChildren && profile.children && profile.children.length > 0) {
      const childrenWithDates = profile.children.map((child: any) => ({
        ...child,
        birthDate: child.birthDate instanceof Date ? child.birthDate : new Date(child.birthDate),
      }));
      
      const youngestChild = childrenWithDates.reduce((youngest: any, child: any) => {
        const youngestMonths = calculateMonthsOld(youngest.birthDate);
        const childMonths = calculateMonthsOld(child.birthDate);
        return childMonths < youngestMonths ? child : youngest;
      });
      
      const monthsOld = calculateMonthsOld(youngestChild.birthDate);

      // 신생아 (0-3개월)
      if (monthsOld <= 3) {
        checklistItems.push(
          {
            type: 'postpartum',
            title: '출생 신고',
            description: '출생 후 1개월 이내 출생 신고 (구청 또는 동사무소)',
            category: '행정',
            priority: 'high',
          },
          {
            type: 'postpartum',
            title: '건강보험 자녀 등록',
            description: '건강보험공단에 자녀 등록',
            category: '행정',
            priority: 'high',
          },
          {
            type: 'postpartum',
            title: '예방접종 스케줄 확인',
            description: 'BCG, B형간염 등 신생아 예방접종 일정 확인',
            category: '의료',
            priority: 'high',
          },
          {
            type: 'postpartum',
            title: '아동수당 신청',
            description: '정부24 또는 구청에서 아동수당 신청',
            category: '행정',
            priority: 'medium',
          }
        );
      }

      // 영유아 (4-12개월)
      if (monthsOld >= 4 && monthsOld <= 12) {
        checklistItems.push(
          {
            type: 'postpartum',
            title: '이유식 시작 준비',
            description: '이유식 재료 및 도구 준비',
            category: '건강',
            priority: 'medium',
          },
          {
            type: 'postpartum',
            title: '영유아 건강검진',
            description: '4개월, 6개월, 9개월, 12개월 건강검진',
            category: '의료',
            priority: 'high',
          }
        );
      }

      // 유아 (13-36개월)
      if (monthsOld >= 13 && monthsOld <= 36) {
        checklistItems.push(
          {
            type: 'postpartum',
            title: '어린이집 입소 신청',
            description: '지역 어린이집 입소 신청 (보통 분기별 모집)',
            category: '행정',
            priority: 'medium',
          },
          {
            type: 'postpartum',
            title: '영유아 건강검진',
            description: '18개월, 24개월, 30개월, 36개월 건강검진',
            category: '의료',
            priority: 'high',
          }
        );
      }
    }

    // 체크리스트 생성
    if (checklistItems.length > 0) {
      await prisma.checklist.createMany({
        data: checklistItems.map(item => ({
          userId,
          ...item,
        })),
      });
    }

    return NextResponse.json({ success: true, count: checklistItems.length });
  } catch (error) {
    console.error('Error initializing checklist:', error);
    return NextResponse.json({ error: 'Failed to initialize checklist' }, { status: 500 });
  }
}

