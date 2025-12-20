import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 나이 계산
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// 생후 개월 수 계산
export function calculateMonthsOld(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  
  // 일자가 지나지 않았으면 1개월 빼기
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

// 날짜 포맷팅
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// D-Day 계산
export function calculateDDay(targetDate: Date | string | null | undefined): number | null {
  if (!targetDate) return null;
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// 금액 포맷팅
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '정보 없음';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

// 정책 매칭 점수 계산
export function calculateMatchScore(
  profile: {
    city?: string | null;
    district?: string | null;
    incomeLevel?: string | null;
    childCount: number;
    dualIncome: boolean;
    multiChild: boolean;
    children: { age: number }[];
  },
  policy: {
    targetCity?: string | null;
    targetDistrict?: string | null;
    minIncomeLevel?: string | null;
    maxIncomeLevel?: string | null;
    minChildCount?: number | null;
    maxChildCount?: number | null;
    minChildAge?: number | null;
    maxChildAge?: number | null;
    requiresDualIncome: boolean;
    requiresMultiChild: boolean;
  }
): number {
  let score = 100;

  // 지역 매칭
  if (policy.targetCity) {
    if (policy.targetCity !== profile.city) {
      return 0; // 지역 조건 불일치
    }
    if (policy.targetDistrict && policy.targetDistrict !== profile.district) {
      return 0; // 구/군 조건 불일치
    }
  }

  // 자녀 수 매칭
  if (policy.minChildCount !== null && profile.childCount < (policy.minChildCount || 0)) {
    return 0;
  }
  if (policy.maxChildCount !== null && profile.childCount > (policy.maxChildCount || 0)) {
    return 0;
  }

  // 자녀 나이 매칭
  if (policy.minChildAge !== null || policy.maxChildAge !== null) {
    const hasMatchingChild = profile.children.some(child => {
      const ageMatch = (!policy.minChildAge || child.age >= policy.minChildAge) &&
                       (!policy.maxChildAge || child.age <= policy.maxChildAge);
      return ageMatch;
    });
    if (!hasMatchingChild) {
      return 0;
    }
  }

  // 맞벌이 조건
  if (policy.requiresDualIncome && !profile.dualIncome) {
    return 0;
  }

  // 다자녀 조건
  if (policy.requiresMultiChild && !profile.multiChild) {
    return 0;
  }

  // 소득 수준 매칭 (점수 감점)
  if (policy.minIncomeLevel || policy.maxIncomeLevel) {
    // 소득 수준 매칭 로직 (간단한 예시)
    // 실제로는 더 정교한 로직이 필요
  }

  return score;
}

