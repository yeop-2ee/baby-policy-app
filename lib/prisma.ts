import { PrismaClient } from './prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL이 상대 경로인 경우 절대 경로로 변환
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '');
  const absolutePath = path.join(process.cwd(), relativePath);
  process.env.DATABASE_URL = `file:${absolutePath}`;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

