'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiSearch, FiCalendar, FiTrendingUp, FiUsers, FiFileText, FiAlertCircle, FiExternalLink, FiBookmark } from 'react-icons/fi';
import { calculateDDay, formatCurrency } from '@/lib/utils';

async function fetchPolicies() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'default-user' : 'default-user';
  const response = await fetch(`/api/policies?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch policies');
  }
  const data = await response.json();
  return data.policies || [];
}

async function fetchBookmarkedPolicies() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'default-user' : 'default-user';
  const response = await fetch(`/api/bookmarks?userId=${userId}`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.policies || [];
}

export default function Home() {
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: fetchPolicies,
  });

  const { data: bookmarkedPolicies = [] } = useQuery({
    queryKey: ['bookmarkedPolicies'],
    queryFn: fetchBookmarkedPolicies,
  });

  // 가장 긴급한 D-Day 정책 하나만 찾기 (7일 이하)
  const urgentPolicy = policies
    .filter((policy: any) => {
      if (!policy.applicationEnd) return false;
      const dDay = calculateDDay(policy.applicationEnd);
      return dDay !== null && dDay >= 0 && dDay <= 7;
    })
    .sort((a: any, b: any) => {
      const dDayA = calculateDDay(a.applicationEnd) || 999;
      const dDayB = calculateDDay(b.applicationEnd) || 999;
      return dDayA - dDayB;
    })[0]; // 가장 임박한 것 하나만
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            우리 아이 정책 매칭
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            맞춤형 육아 정책을 찾아드립니다
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 긴급 D-Day 섹션 - 가장 임박한 것 하나만 */}
        {urgentPolicy && (() => {
          const dDay = calculateDDay(urgentPolicy.applicationEnd);
          const isUrgent = dDay !== null && dDay <= 3;
          
          return (
            <Link
              href={`/policy/${urgentPolicy.id}`}
              className="block bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white mb-6 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <FiAlertCircle className="w-6 h-6 animate-pulse" />
                <h2 className="text-xl font-bold">⚠️ 긴급! 마감 임박</h2>
                <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
                  isUrgent ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                }`}>
                  {dDay === 0 ? '오늘 마감!' : dDay === 1 ? '내일 마감!' : `D-${dDay}`}
                </span>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-2">{urgentPolicy.title}</h3>
                <p className="text-sm text-red-100 line-clamp-2 mb-3">
                  {urgentPolicy.description}
                </p>
                <div className="flex items-center justify-between">
                  {urgentPolicy.benefitAmount && (
                    <div>
                      <p className="text-xs text-red-200 mb-1">혜택 금액</p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(urgentPolicy.benefitAmount)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-100">자세히 보기</span>
                    <FiExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-red-100 text-center">
                💡 놓치지 마세요! 지금 바로 신청하세요
              </p>
            </Link>
          );
        })()}

        {/* 즐겨찾기 섹션 */}
        {bookmarkedPolicies.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiBookmark className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="text-lg font-bold text-gray-900">즐겨찾기한 정책</h2>
                <span className="text-sm text-gray-500">({bookmarkedPolicies.length})</span>
              </div>
              <Link
                href="/bookmarks"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                전체 보기 →
              </Link>
            </div>
            <div className="space-y-3">
              {bookmarkedPolicies.slice(0, 3).map((policy: any) => (
                <Link
                  key={policy.id}
                  href={`/policy/${policy.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{policy.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{policy.description}</p>
                    </div>
                    <FiBookmark className="w-5 h-5 text-yellow-500 fill-current ml-2 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 프로필 설정 안내 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-xl font-bold mb-2">프로필을 설정해주세요</h2>
          <p className="text-blue-100 mb-4">
            거주지, 소득, 자녀 정보를 입력하면 맞춤형 정책을 추천해드립니다
          </p>
          <Link
            href="/profile"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            프로필 설정하기
          </Link>
        </div>

        {/* 주요 기능 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/policies"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FiSearch className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">정책 찾기</h3>
            <p className="text-sm text-gray-600">
              맞춤형 정책 검색
            </p>
          </Link>

          <Link
            href="/calculator"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">혜택 계산</h3>
            <p className="text-sm text-gray-600">
              받을 수 있는 금액 계산
            </p>
          </Link>

          <Link
            href="/notifications"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <FiCalendar className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">D-Day 알림</h3>
            <p className="text-sm text-gray-600">
              신청 기한 알림 받기
            </p>
          </Link>

          <Link
            href="/reviews"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">커뮤니티</h3>
            <p className="text-sm text-gray-600">
              정책 리뷰 & 꿀팁
            </p>
          </Link>
        </div>

        {/* 서류 준비 가이드 */}
        <Link
          href="/documents"
          className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">서류 준비 가이드</h3>
              <p className="text-sm text-gray-600">
                정책 신청에 필요한 서류를 정부24에서 바로 발급받기
              </p>
            </div>
          </div>
        </Link>

        {/* 추천 정책 섹션 */}
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">추천 정책</h2>
            <Link
              href="/policies"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              전체 보기 →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.slice(0, 3).map((policy: any) => (
                <Link
                  key={policy.id}
                  href={`/policy/${policy.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{policy.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      policy.isCentralGov
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {policy.isCentralGov ? '중앙정부' : '지자체'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {policy.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      <span>
                        {policy.applicationEnd
                          ? `마감: ${new Date(policy.applicationEnd).toLocaleDateString('ko-KR')}`
                          : '상시 신청'}
                      </span>
                    </div>
                    {policy.benefitAmount && (
                      <span className="text-xs font-semibold text-blue-600">
                        {formatCurrency(policy.benefitAmount)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              
              {policies.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">정책이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Navbar />
    </div>
  );
}
