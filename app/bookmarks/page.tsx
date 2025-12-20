'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiBookmark, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { formatDate, formatCurrency, calculateDDay } from '@/lib/utils';

async function fetchBookmarkedPolicies() {
  const userId = localStorage.getItem('userId') || 'default-user';
  const response = await fetch(`/api/bookmarks?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bookmarked policies');
  }
  const data = await response.json();
  return data.policies || [];
}

export default function BookmarksPage() {
  const [bookmarkedPolicies, setBookmarkedPolicies] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookmarkedPolicies'],
    queryFn: fetchBookmarkedPolicies,
    retry: 1,
  });

  const toggleBookmark = async (policyId: string) => {
    const userId = localStorage.getItem('userId') || 'default-user';
    
    try {
      const response = await fetch('/api/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, policyId }),
      });

      if (response.ok) {
        refetch(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="mr-4">
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">즐겨찾기</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">즐겨찾기를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        )}

        {!isLoading && !error && data && data.length === 0 && (
          <div className="text-center py-12">
            <FiBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">즐겨찾기한 정책이 없습니다</p>
            <p className="text-sm text-gray-400">
              정책 목록에서 관심 있는 정책을 즐겨찾기로 추가해보세요
            </p>
            <Link
              href="/policies"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              정책 찾아보기
            </Link>
          </div>
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div className="space-y-4">
            {data.map((policy: any) => {
              const dDay = policy.applicationEnd ? calculateDDay(policy.applicationEnd) : null;
              
              return (
                <div
                  key={policy.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/policy/${policy.id}`} className="flex-1">
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
                    </Link>
                    <button
                      onClick={() => toggleBookmark(policy.id)}
                      className="ml-2 text-yellow-500 hover:text-yellow-600 transition-colors"
                      title="즐겨찾기 해제"
                    >
                      <FiBookmark className="w-5 h-5 fill-current" />
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

                    <div className="flex items-center gap-2">
                      {dDay !== null && (
                        <div className={`text-sm font-medium ${
                          dDay < 0 ? 'text-red-600' : dDay <= 7 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {dDay < 0 ? `마감됨` : dDay === 0 ? '오늘 마감' : `D-${dDay}`}
                        </div>
                      )}

                      {policy.applicationUrl && (
                        <a
                          href={policy.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

