import { PrismaClient } from '../lib/prisma/client';
import { config } from 'dotenv';
import path from 'path';

config();

const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.policy.count();
    console.log(`✅ 데이터베이스에 ${count}개의 정책이 있습니다.`);
    
    if (count > 0) {
      const policies = await prisma.policy.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
        },
      });
      console.log('\n정책 목록:');
      policies.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title} (${p.category})`);
      });
    }
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();

