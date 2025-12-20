import { PrismaClient } from '../lib/prisma/client';
import { config } from 'dotenv';
import path from 'path';

config();

// DATABASE_URL 경로 변환
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '');
  const absolutePath = path.join(process.cwd(), relativePath);
  process.env.DATABASE_URL = `file:${absolutePath}`;
  console.log('📁 Using database:', process.env.DATABASE_URL);
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 정책 데이터 시딩 시작...');
  
  // 기존 정책 개수 확인
  const existingCount = await prisma.policy.count();
  console.log(`📊 현재 데이터베이스에 ${existingCount}개의 정책이 있습니다.`);

  const policies = [
    {
      title: '아동수당',
      description: '0~7세 아동에게 월 20만원을 지급하는 정책입니다. 소득 수준과 관계없이 모든 가구가 신청할 수 있습니다.',
      category: '육아',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: 0,
      maxChildAge: 7,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 200000,
      benefitType: '현금',
      benefitDescription: '월 20만원씩 매달 지급되며, 아동이 8세가 되는 달까지 지급됩니다.',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '가족관계증명서', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '출산 축하금',
      description: '첫째 50만원, 둘째 100만원, 셋째 이상 200만원을 지급하는 지자체 정책입니다.',
      category: '출산',
      targetCity: '서울특별시',
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: null,
      maxChildAge: null,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 500000,
      benefitType: '현금',
      benefitDescription: '출생 후 1년 이내 신청 가능. 첫째 50만원, 둘째 100만원, 셋째 이상 200만원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: null,
      requiredDocuments: JSON.stringify(['출생증명서', '주민등록등본', '신청서']),
      isCentralGov: false,
      govLevel: '시',
    },
    {
      title: '임신·출산 진료비 지원',
      description: '임신·출산 관련 의료비를 지원하는 정책입니다.',
      category: '출산',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: '하위50%',
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: null,
      maxChildAge: null,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 1000000,
      benefitType: '현금',
      benefitDescription: '임신·출산 진료비 최대 100만원 지원 (소득 하위 50% 가구)',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['소득증명원', '의료비 영수증', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '다자녀 가구 주거 지원',
      description: '3자녀 이상 가구를 위한 주거비 지원 정책입니다.',
      category: '주거',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: '중위50-100%',
      minChildCount: 3,
      maxChildCount: null,
      minChildAge: null,
      maxChildAge: null,
      requiresDualIncome: false,
      requiresMultiChild: true,
      benefitAmount: 500000,
      benefitType: '현금',
      benefitDescription: '월 50만원 주거비 지원 (최대 2년)',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '소득증명원', '주거 관련 서류', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '어린이집·유치원 지원',
      description: '어린이집 및 유치원 이용료를 지원하는 정책입니다.',
      category: '교육',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: 0,
      maxChildAge: 6,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: null,
      benefitType: '서비스',
      benefitDescription: '어린이집·유치원 이용료 전액 또는 일부 지원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '소득증명원', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '돌봄 서비스 지원',
      description: '방과후 돌봄 서비스를 지원하는 정책입니다.',
      category: '돌봄',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: '하위50%',
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: 6,
      maxChildAge: 12,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: null,
      benefitType: '서비스',
      benefitDescription: '초등학생 방과후 돌봄 서비스 무료 또는 저렴한 비용으로 이용',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '소득증명원', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '출산 전후 휴가 급여',
      description: '출산 전후 휴가 기간 중 급여를 지원하는 정책입니다.',
      category: '출산',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: null,
      maxChildAge: null,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: null,
      benefitType: '급여',
      benefitDescription: '출산 전 90일, 출산 후 90일 휴가 기간 중 평균임금의 100% 지급',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['출생증명서', '고용보험 가입증명서', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '아동 급식 지원',
      description: '저소득 가구 아동의 급식비를 지원하는 정책입니다.',
      category: '육아',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: '하위50%',
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: 0,
      maxChildAge: 18,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 100000,
      benefitType: '현금',
      benefitDescription: '월 10만원 급식비 지원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '소득증명원', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '다문화 가정 지원',
      description: '다문화 가정을 위한 다양한 지원 정책입니다.',
      category: '육아',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: null,
      maxChildAge: null,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 300000,
      benefitType: '현금',
      benefitDescription: '다문화 가정 자녀 양육비 월 30만원 지원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '결혼증명서', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '한부모 가정 지원',
      description: '한부모 가정을 위한 양육비 지원 정책입니다.',
      category: '육아',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: '중위50-100%',
      minChildCount: null,
      maxChildCount: null,
      minChildAge: 0,
      maxChildAge: 18,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 200000,
      benefitType: '현금',
      benefitDescription: '한부모 가정 자녀 양육비 월 20만원 지원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '한부모 가정 증명서', '소득증명원', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '장애아동 양육 지원',
      description: '장애아동을 양육하는 가정을 위한 지원 정책입니다.',
      category: '육아',
      targetCity: null,
      targetDistrict: null,
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: 0,
      maxChildAge: 18,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 500000,
      benefitType: '현금',
      benefitDescription: '장애아동 양육비 월 50만원 지원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      requiredDocuments: JSON.stringify(['주민등록등본', '장애인증명서', '신청서']),
      isCentralGov: true,
      govLevel: '중앙',
    },
    {
      title: '강남구 출산 지원금',
      description: '강남구 거주 가구를 위한 출산 지원금입니다.',
      category: '출산',
      targetCity: '서울특별시',
      targetDistrict: '강남구',
      minIncomeLevel: null,
      maxIncomeLevel: null,
      minChildCount: null,
      maxChildCount: null,
      minChildAge: null,
      maxChildAge: null,
      requiresDualIncome: false,
      requiresMultiChild: false,
      benefitAmount: 1000000,
      benefitType: '현금',
      benefitDescription: '강남구 거주 가구 출산 시 100만원 지원',
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: null,
      requiredDocuments: JSON.stringify(['주민등록등본', '출생증명서', '신청서']),
      isCentralGov: false,
      govLevel: '구',
    },
  ];

  // 기존 정책 모두 삭제 (선택사항 - 주석 처리하면 중복 방지)
  // await prisma.policy.deleteMany({});
  // console.log('🗑️  기존 정책 삭제됨');

  for (const policy of policies) {
    const existing = await prisma.policy.findFirst({
      where: { title: policy.title },
    });

    if (!existing) {
      await prisma.policy.create({
        data: policy,
      });
      console.log(`✅ ${policy.title} 추가됨`);
    } else {
      console.log(`⏭️  ${policy.title} 이미 존재함`);
    }
  }
  
  // 최종 개수 확인
  const finalCount = await prisma.policy.count();
  console.log(`📊 시딩 완료 후 총 ${finalCount}개의 정책이 있습니다.`);

  console.log('🎉 정책 데이터 시딩 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

