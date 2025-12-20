import { PrismaClient } from '../lib/prisma/client';
import { config } from 'dotenv';
import path from 'path';

config();

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '');
  const absolutePath = path.join(process.cwd(), relativePath);
  process.env.DATABASE_URL = `file:${absolutePath}`;
}

const prisma = new PrismaClient();

async function addDeadlines() {
  try {
    // 오늘부터 7일 이내 마감일 추가
    const today = new Date();
    const deadlines = [
      { days: 2, title: '아동수당' },
      { days: 5, title: '출산 축하금' },
      { days: 7, title: '임신·출산 진료비 지원' },
      { days: 3, title: '다자녀 가구 주거 지원' },
    ];

    for (const { days, title } of deadlines) {
      const deadline = new Date(today);
      deadline.setDate(deadline.getDate() + days);
      
      await prisma.policy.updateMany({
        where: { title },
        data: {
          applicationEnd: deadline,
        },
      });
      
      console.log(`✅ ${title}: 마감일 ${deadline.toLocaleDateString('ko-KR')} (D-${days})`);
    }

    console.log('🎉 마감일 추가 완료!');
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDeadlines();

