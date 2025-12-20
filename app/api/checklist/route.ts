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
    const { userId, itemId, isCompleted } = await request.json();

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'UserId and itemId are required' }, { status: 400 });
    }

    const checklist = await prisma.checklist.update({
      where: { id: itemId },
      data: { isCompleted },
    });

    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
}

