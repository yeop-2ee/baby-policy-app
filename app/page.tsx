import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiSearch, FiCalendar, FiTrendingUp, FiUsers, FiFileText } from 'react-icons/fi';

export default function Home() {
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">추천 정책</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">아동수당</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  중앙정부
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                0~7세 아동에게 월 20만원 지급
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <FiCalendar className="w-4 h-4 mr-1" />
                <span>상시 신청</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">출산 축하금</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  지자체
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                첫째 50만원, 둘째 100만원, 셋째 이상 200만원
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <FiCalendar className="w-4 h-4 mr-1" />
                <span>출생 후 1년 이내</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Navbar />
    </div>
  );
}
