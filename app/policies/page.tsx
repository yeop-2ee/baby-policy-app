'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiSearch, FiFilter, FiBookmark, FiExternalLink } from 'react-icons/fi';
import { formatDate, formatCurrency, calculateDDay } from '@/lib/utils';

async function fetchPolicies(category?: string | null) {
  const url = category && category !== '전체'
    ? `/api/policies?category=${encodeURIComponent(category)}`
    : '/api/policies';
  
  console.log('[fetchPolicies] Fetching from:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[fetchPolicies] Error response:', response.status, errorText);
    throw new Error(`Failed to fetch policies: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  console.log('[fetchPolicies] Received data:', data);
  return data.policies || [];
}

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['policies', selectedCategory],
    queryFn: () => fetchPolicies(selectedCategory),
    retry: 1,
  });

  // 디버깅용
  if (data) {
    console.log('[PoliciesPage] Data received:', data.length, 'policies');
  }
  if (error) {
    console.error('[PoliciesPage] Error:', error);
  }

  const policies = data || [];

  const categories = ['전체', '출산', '육아', '교육', '돌봄', '주거'];

  const filteredPolicies = policies.filter((policy: any) => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (policy.description || '').toLowerCase().includes(searchQuery.toLowerCase());
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
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">정책을 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm text-gray-500">{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredPolicies.map((policy: any) => {
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
        )}

        {!isLoading && !error && filteredPolicies.length === 0 && policies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">정책이 없습니다</p>
            <p className="text-sm text-gray-400">데이터베이스에 정책이 없습니다. 시드 스크립트를 실행해주세요.</p>
          </div>
        )}

        {!isLoading && !error && policies.length > 0 && filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">다른 검색어나 카테고리를 시도해보세요.</p>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

