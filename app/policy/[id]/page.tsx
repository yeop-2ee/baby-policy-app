'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiExternalLink, FiBookmark, FiCalendar, FiDollarSign, FiFileText, FiUsers } from 'react-icons/fi';
import { formatDate, formatCurrency, calculateDDay } from '@/lib/utils';

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = params.id as string;
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 샘플 정책 데이터 (실제로는 API에서 가져옴)
  const policy = {
    id: policyId,
    title: '아동수당',
    description: '0~7세 아동에게 월 20만원을 지급하는 정책입니다. 소득 수준과 관계없이 모든 가구가 신청할 수 있습니다.',
    category: '육아',
    benefitAmount: 200000,
    benefitType: '현금',
    benefitDescription: '월 20만원씩 매달 지급되며, 아동이 8세가 되는 달까지 지급됩니다.',
    isCentralGov: true,
    govLevel: '중앙',
    applicationStart: null,
    applicationEnd: null,
    applicationUrl: 'https://www.gov.kr',
    requiredDocuments: JSON.stringify(['주민등록등본', '가족관계증명서', '신청서']),
    infographicUrl: null,
    cardImageUrl: null,
    targetCity: null,
    targetDistrict: null,
    minChildAge: 0,
    maxChildAge: 7,
  };

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
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg ${
              isBookmarked ? 'text-yellow-500' : 'text-gray-400'
            } hover:bg-gray-100`}
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

