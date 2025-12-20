import { PrismaClient } from './prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL이 상대 경로인 경우 절대 경로로 변환
function getDatabaseUrl() {
  let dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  
  if (dbUrl.startsWith('file:./')) {
    const relativePath = dbUrl.replace('file:', '');
    const absolutePath = path.join(process.cwd(), relativePath);
    dbUrl = `file:${absolutePath}`;
    console.log('[Prisma] Converted DB URL to:', dbUrl);
  }
  
  return dbUrl;
}

// 환경 변수 설정
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:./')) {
  process.env.DATABASE_URL = getDatabaseUrl();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

