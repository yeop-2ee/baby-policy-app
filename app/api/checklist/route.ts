import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const checklist = await prisma.checklist.findMany({
      where: { userId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, itemId, isCompleted, type, title, description, category, priority, dueDate } = body;

    // 체크리스트 항목 추가
    if (type && title) {
      if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
      }

      const checklist = await prisma.checklist.create({
        data: {
          userId,
          type,
          title,
          description: description || null,
          category: category || null,
          priority: priority || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          isCompleted: false,
        },
      });

      return NextResponse.json({ success: true, checklist });
    }

    // 체크리스트 항목 완료 상태 토글
    if (itemId !== undefined) {
      if (!userId || !itemId) {
        return NextResponse.json({ error: 'UserId and itemId are required' }, { status: 400 });
      }

      const checklist = await prisma.checklist.update({
        where: { id: itemId },
        data: { isCompleted },
      });

      return NextResponse.json({ success: true, checklist });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error in checklist POST:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

