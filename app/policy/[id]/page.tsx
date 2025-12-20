'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiExternalLink, FiBookmark, FiCalendar, FiDollarSign, FiFileText, FiUsers } from 'react-icons/fi';
import { formatDate, formatCurrency, calculateDDay } from '@/lib/utils';
import { getUserId, getBookmarks, addBookmark, removeBookmark } from '@/lib/storage';

async function fetchPolicy(id: string) {
  const response = await fetch(`/api/policy/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch policy');
  }
  const data = await response.json();
  return data.policy;
}

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = params.id as string;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: policy, isLoading, error } = useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => fetchPolicy(policyId),
  });

  // 북마크 상태 확인 (localStorage와 API 모두 확인)
  useEffect(() => {
    if (policyId) {
      // 먼저 localStorage에서 확인
      const savedBookmarks = getBookmarks();
      setIsBookmarked(savedBookmarks.includes(policyId));
      
      // API에서도 확인 (더 정확한 정보)
      const userId = getUserId();
      fetch(`/api/bookmark?userId=${userId}&policyId=${policyId}`)
        .then(res => res.json())
        .then(data => {
          setIsBookmarked(data.isBookmarked || false);
          // localStorage 동기화
          if (data.isBookmarked && !savedBookmarks.includes(policyId)) {
            addBookmark(policyId);
          } else if (!data.isBookmarked && savedBookmarks.includes(policyId)) {
            removeBookmark(policyId);
          }
        })
        .catch(err => console.error('Error fetching bookmark status:', err));
    }
  }, [policyId]);

  const toggleBookmark = async () => {
    const userId = getUserId();
    
    try {
      const response = await fetch('/api/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, policyId }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsBookmarked(result.isBookmarked);
        
        // localStorage 동기화
        if (result.isBookmarked) {
          addBookmark(policyId);
        } else {
          removeBookmark(policyId);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <p className="text-red-500">정책을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  const requiredDocs = policy.requiredDocuments 
    ? JSON.parse(policy.requiredDocuments) 
    : [];

  const dDay = policy.applicationEnd ? calculateDDay(policy.applicationEnd) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/policies" className="flex items-center">
            <FiArrowLeft className="w-6 h-6 text-gray-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">정책 상세</h1>
          </Link>
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked ? 'text-yellow-500' : 'text-gray-400'
            } hover:bg-gray-100`}
            title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <FiBookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 정책 헤더 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  policy.isCentralGov
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {policy.isCentralGov ? '중앙정부' : '지자체'}
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {policy.category}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{policy.title}</h2>
              <p className="text-gray-600">{policy.description}</p>
            </div>
          </div>

          {/* D-Day 표시 */}
          {dDay !== null && (
            <div className={`mt-4 p-3 rounded-lg ${
              dDay < 0 
                ? 'bg-red-50 border border-red-200' 
                : dDay <= 7 
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <FiCalendar className={`w-5 h-5 ${
                  dDay < 0 ? 'text-red-600' : dDay <= 7 ? 'text-orange-600' : 'text-blue-600'
                }`} />
                <span className={`font-semibold ${
                  dDay < 0 ? 'text-red-700' : dDay <= 7 ? 'text-orange-700' : 'text-blue-700'
                }`}>
                  {dDay < 0 
                    ? '신청 마감됨' 
                    : dDay === 0 
                      ? '오늘 마감!' 
                      : `신청 마감까지 D-${dDay}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 혜택 정보 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-green-600" />
            혜택 정보
          </h3>
          <div className="space-y-3">
            {policy.benefitAmount && (
              <div>
                <div className="text-sm text-gray-600 mb-1">혜택 금액</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(policy.benefitAmount)}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 mb-1">혜택 유형</div>
              <div className="font-medium text-gray-900">{policy.benefitType}</div>
            </div>
            {policy.benefitDescription && (
              <div>
                <div className="text-sm text-gray-600 mb-1">상세 설명</div>
                <div className="text-gray-900">{policy.benefitDescription}</div>
              </div>
            )}
          </div>
        </div>

        {/* 대상 조건 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-blue-600" />
            대상 조건
          </h3>
          <div className="space-y-2 text-sm">
            {policy.minChildAge !== null && policy.maxChildAge !== null && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">자녀 나이</span>
                <span className="font-medium text-gray-900">
                  {policy.minChildAge}세 ~ {policy.maxChildAge}세
                </span>
              </div>
            )}
            {policy.targetCity && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">대상 지역</span>
                <span className="font-medium text-gray-900">
                  {policy.targetCity} {policy.targetDistrict || ''}
                </span>
              </div>
            )}
            {!policy.targetCity && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">대상 지역</span>
                <span className="font-medium text-gray-900">전국</span>
              </div>
            )}
          </div>
        </div>

        {/* 필요 서류 */}
        {requiredDocs.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-purple-600" />
              필요 서류
            </h3>
            <ul className="space-y-2">
              {requiredDocs.map((doc: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  {doc}
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 정부24에서 온라인으로 발급받을 수 있습니다
              </p>
              <a
                href="https://www.gov.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
              >
                정부24 바로가기 →
              </a>
            </div>
          </div>
        )}

        {/* 신청하기 버튼 */}
        {policy.applicationUrl && (
          <a
            href={policy.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors mb-6"
          >
            <FiExternalLink className="inline w-5 h-5 mr-2" />
            신청하기
          </a>
        )}

        {/* 관련 링크 */}
        <div className="space-y-3 mb-6">
          <Link
            href={`/reviews?policy=${policyId}`}
            className="block text-center text-blue-600 hover:text-blue-700 text-sm"
          >
            이 정책의 리뷰 보기 →
          </Link>
          <Link
            href="/documents"
            className="block text-center text-indigo-600 hover:text-indigo-700 text-sm"
          >
            서류 준비 가이드 보기 →
          </Link>
        </div>
      </main>

      <Navbar />
    </div>
  );
}

