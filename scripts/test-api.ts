import { PrismaClient } from '../lib/prisma/client';
import { config } from 'dotenv';
import path from 'path';

config();

// DATABASE_URL 설정
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '');
  const absolutePath = path.join(process.cwd(), relativePath);
  process.env.DATABASE_URL = `file:${absolutePath}`;
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
}

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Prisma connection...');
    const count = await prisma.policy.count();
    console.log(`✅ Total policies: ${count}`);
    
    const policies = await prisma.policy.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        category: true,
      },
    });
    
    console.log('Sample policies:');
    policies.forEach(p => console.log(`  - ${p.title} (${p.category})`));
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

