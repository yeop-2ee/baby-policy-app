'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiExternalLink, FiCheckCircle } from 'react-icons/fi';

export default function DocumentsPage() {
  const documents = [
    {
      name: '주민등록등본',
      description: '가족 구성원 확인용',
      gov24Url: 'https://www.gov.kr/portal/service/serviceInfo/BAZ00000000000000333',
      requiredFor: ['아동수당', '출산 축하금'],
    },
    {
      name: '가족관계증명서',
      description: '가족 관계 확인용',
      gov24Url: 'https://www.gov.kr/portal/service/serviceInfo/BAZ00000000000000334',
      requiredFor: ['아동수당', '육아휴직 급여'],
    },
    {
      name: '소득증명원',
      description: '소득 수준 확인용',
      gov24Url: 'https://www.gov.kr/portal/service/serviceInfo/BAZ00000000000000335',
      requiredFor: ['소득 기반 정책'],
    },
    {
      name: '출생증명서',
      description: '자녀 출생 확인용',
      gov24Url: 'https://www.gov.kr/portal/service/serviceInfo/BAZ00000000000000336',
      requiredFor: ['출산 축하금'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="mr-4">
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">서류 준비 가이드</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            💡 정부24에서 대부분의 서류를 온라인으로 발급받을 수 있습니다. 
            모바일에서도 간편하게 발급 가능합니다.
          </p>
        </div>

        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-2">필요한 정책:</div>
                    <div className="flex flex-wrap gap-2">
                      {doc.requiredFor.map((policy, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {policy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={doc.gov24Url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <FiExternalLink className="w-4 h-4" />
                정부24에서 발급받기
              </a>
            </div>
          ))}
        </div>

        {/* 체크리스트 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">서류 준비 체크리스트</h2>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{doc.name}</div>
                  <div className="text-sm text-gray-500">{doc.description}</div>
                </div>
                <FiCheckCircle className="w-5 h-5 text-gray-400" />
              </label>
            ))}
          </div>
        </div>
      </main>

      <Navbar />
    </div>
  );
}

