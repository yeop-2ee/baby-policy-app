import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAge } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      city,
      district,
      neighborhood,
      incomeLevel,
      childCount,
      dualIncome,
      children,
    } = body;

    // 사용자 찾기 또는 생성
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
        },
      });
    }

    // 프로필 업데이트 또는 생성
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        city,
        district,
        neighborhood,
        incomeLevel,
        childCount,
        dualIncome,
        multiChild: childCount >= 3,
      },
      create: {
        userId: user.id,
        city,
        district,
        neighborhood,
        incomeLevel,
        childCount,
        dualIncome,
        multiChild: childCount >= 3,
      },
    });

    // 기존 자녀 삭제 후 새로 추가
    await prisma.child.deleteMany({
      where: { profileId: profile.id },
    });

    if (children && children.length > 0) {
      await prisma.child.createMany({
        data: children.map((child: { name: string; birthDate: string }) => ({
          profileId: profile.id,
          name: child.name || null,
          birthDate: new Date(child.birthDate),
          age: calculateAge(new Date(child.birthDate)),
        })),
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    // 사용자 프로필 찾기
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
      // 자녀 정보 삭제
      await prisma.child.deleteMany({
        where: { profileId: user.profile.id },
      });

      // 프로필 삭제
      await prisma.userProfile.delete({
        where: { id: user.profile.id },
      });
    }

    return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

