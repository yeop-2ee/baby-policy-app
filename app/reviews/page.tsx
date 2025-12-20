'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiStar, FiThumbsUp, FiEdit3 } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';

export default function ReviewsPage() {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const policies = [
    { id: '1', title: '아동수당' },
    { id: '2', title: '출산 축하금' },
    { id: '3', title: '육아휴직 급여' },
  ];

  const reviews = [
    {
      id: '1',
      policyId: '1',
      policyTitle: '아동수당',
      userName: '김맘',
      rating: 5,
      title: '정말 도움이 되었어요!',
      content: '신청 절차가 생각보다 간단했고, 매달 꾸준히 받을 수 있어서 좋습니다.',
      tips: '온라인 신청이 훨씬 빠르고 편해요. 서류는 주민등록등본만 준비하면 됩니다.',
      additionalDocs: '가족관계증명서도 함께 준비하시면 더 빠르게 처리됩니다.',
      helpfulCount: 12,
      createdAt: new Date('2024-12-15'),
      isVerified: true,
    },
    {
      id: '2',
      policyId: '2',
      policyTitle: '출산 축하금',
      userName: '이맘',
      rating: 4,
      title: '좋은 정책이에요',
      content: '둘째 출산 축하금을 받았는데 생각보다 금액이 커서 놀랐어요.',
      tips: '출생신고 후 1년 이내에 신청해야 하니 미리미리 준비하세요!',
      additionalDocs: null,
      helpfulCount: 8,
      createdAt: new Date('2024-12-10'),
      isVerified: false,
    },
  ];

  const filteredReviews = selectedPolicy
    ? reviews.filter(r => r.policyId === selectedPolicy)
    : reviews;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="mr-4">
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">정책 리뷰 & 꿀팁</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 정책 필터 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedPolicy(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                !selectedPolicy
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              전체
            </button>
            {policies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => setSelectedPolicy(policy.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedPolicy === policy.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {policy.title}
              </button>
            ))}
          </div>
        </div>

        {/* 리뷰 작성 버튼 */}
        <Link
          href="/reviews/new"
          className="block mb-6 bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
        >
          <FiEdit3 className="inline w-5 h-5 mr-2" />
          리뷰 작성하기
        </Link>

        {/* 리뷰 목록 */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{review.title}</h3>
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        검증됨
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">{review.userName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{review.policyTitle}</span>
                    <div className="flex items-center gap-1 ml-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{review.content}</p>

              {review.tips && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-3">
                  <div className="text-sm font-semibold text-blue-900 mb-1">💡 꿀팁</div>
                  <div className="text-sm text-blue-800">{review.tips}</div>
                </div>
              )}

              {review.additionalDocs && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mb-3">
                  <div className="text-sm font-semibold text-yellow-900 mb-1">📄 추가 서류</div>
                  <div className="text-sm text-yellow-800">{review.additionalDocs}</div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                  <FiThumbsUp className="w-4 h-4" />
                  <span className="text-sm">도움됨 {review.helpfulCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">리뷰가 없습니다</p>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

