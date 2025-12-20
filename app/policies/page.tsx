'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiSearch, FiFilter, FiBookmark, FiExternalLink } from 'react-icons/fi';
import { formatDate, formatCurrency, calculateDDay } from '@/lib/utils';

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 샘플 정책 데이터
  const policies = [
    {
      id: '1',
      title: '아동수당',
      description: '0~7세 아동에게 월 20만원 지급',
      category: '육아',
      benefitAmount: 200000,
      benefitType: '현금',
      isCentralGov: true,
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: 'https://www.gov.kr',
      matchScore: 100,
    },
    {
      id: '2',
      title: '출산 축하금',
      description: '첫째 50만원, 둘째 100만원, 셋째 이상 200만원',
      category: '출산',
      benefitAmount: 500000,
      benefitType: '현금',
      isCentralGov: false,
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: null,
      matchScore: 95,
    },
    {
      id: '3',
      title: '육아휴직 급여',
      description: '육아휴직 기간 중 급여 지급',
      category: '육아',
      benefitAmount: null,
      benefitType: '급여',
      isCentralGov: true,
      applicationStart: null,
      applicationEnd: null,
      applicationUrl: null,
      matchScore: 90,
    },
  ];

  const categories = ['전체', '출산', '육아', '교육', '돌봄'];

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === '전체' || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center mb-4">
            <Link href="/" className="mr-4">
              <FiArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">정책 찾기</h1>
          </div>

          {/* 검색 바 */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="정책명 또는 키워드로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === '전체' ? null : category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                (category === '전체' && !selectedCategory) || selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 정책 목록 */}
        <div className="space-y-4">
          {filteredPolicies.map((policy) => {
            const dDay = policy.applicationEnd ? calculateDDay(policy.applicationEnd) : null;
            
            return (
              <Link
                key={policy.id}
                href={`/policy/${policy.id}`}
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{policy.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        policy.isCentralGov
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {policy.isCentralGov ? '중앙정부' : '지자체'}
                      </span>
                      {policy.matchScore >= 90 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          높은 적합도
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // 북마크 토글
                    }}
                    className="ml-2 text-gray-400 hover:text-yellow-500"
                  >
                    <FiBookmark className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {policy.benefitAmount && (
                      <span className="text-blue-600 font-semibold">
                        {formatCurrency(policy.benefitAmount)}
                      </span>
                    )}
                    <span className="text-gray-500">{policy.category}</span>
                  </div>

                  {dDay !== null && (
                    <div className={`text-sm font-medium ${
                      dDay < 0 ? 'text-red-600' : dDay <= 7 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {dDay < 0 ? `마감됨` : dDay === 0 ? '오늘 마감' : `D-${dDay}`}
                    </div>
                  )}

                  {policy.applicationUrl && (
                    <FiExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

