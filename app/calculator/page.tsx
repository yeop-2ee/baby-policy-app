'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';

export default function CalculatorPage() {
  const [calculationType, setCalculationType] = useState<'monthly' | 'parental_leave' | 'total'>('monthly');
  const [inputs, setInputs] = useState({
    childCount: 1,
    monthlyIncome: 3000000,
    parentalLeaveMonths: 12,
    isDualIncome: false,
  });
  const [result, setResult] = useState<{
    monthlyBenefit: number;
    parentalLeaveBenefit: number;
    totalBenefit: number;
  } | null>(null);

  const calculateBenefits = () => {
    // 아동수당 계산 (0~7세 기준, 월 20만원)
    const monthlyBenefit = inputs.childCount * 200000;

    // 육아휴직 급여 계산 (평균임금의 80%, 최대 150만원)
    const averageWage = inputs.monthlyIncome;
    const parentalLeaveDaily = Math.min(averageWage / 30 * 0.8, 50000); // 일 최대 5만원
    const parentalLeaveBenefit = parentalLeaveDaily * 30 * inputs.parentalLeaveMonths;

    // 총 혜택 계산
    const totalBenefit = monthlyBenefit * 12 + (inputs.isDualIncome ? parentalLeaveBenefit * 2 : parentalLeaveBenefit);

    setResult({
      monthlyBenefit,
      parentalLeaveBenefit,
      totalBenefit,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="mr-4">
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">혜택 계산기</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 계산 유형 선택 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">계산 유형 선택</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setCalculationType('monthly')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                calculationType === 'monthly'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <FiDollarSign className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">월 혜택</div>
            </button>
            <button
              onClick={() => setCalculationType('parental_leave')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                calculationType === 'parental_leave'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <FiCalendar className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">육아휴직</div>
            </button>
            <button
              onClick={() => setCalculationType('total')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                calculationType === 'total'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              <FiDollarSign className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">총 혜택</div>
            </button>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">정보 입력</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자녀 수
              </label>
              <input
                type="number"
                min="0"
                value={inputs.childCount}
                onChange={(e) => setInputs({ ...inputs, childCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {calculationType === 'parental_leave' || calculationType === 'total' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 평균 소득 (원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inputs.monthlyIncome}
                    onChange={(e) => setInputs({ ...inputs, monthlyIncome: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    육아휴직 기간 (개월)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={inputs.parentalLeaveMonths}
                    onChange={(e) => setInputs({ ...inputs, parentalLeaveMonths: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dualIncome"
                    checked={inputs.isDualIncome}
                    onChange={(e) => setInputs({ ...inputs, isDualIncome: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="dualIncome" className="ml-2 text-sm text-gray-700">
                    맞벌이 가구 (부모 모두 휴직 시)
                  </label>
                </div>
              </>
            ) : null}
          </div>

          <button
            onClick={calculateBenefits}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            계산하기
          </button>
        </div>

        {/* 결과 */}
        {result && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-bold mb-4">계산 결과</h2>
            <div className="space-y-3">
              {calculationType === 'monthly' || calculationType === 'total' ? (
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">월 아동수당</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(result.monthlyBenefit)}
                  </div>
                </div>
              ) : null}

              {(calculationType === 'parental_leave' || calculationType === 'total') && (
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">육아휴직 급여</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(result.parentalLeaveBenefit)}
                  </div>
                </div>
              )}

              {calculationType === 'total' && (
                <div className="bg-white/30 rounded-lg p-4 border-2 border-white/50">
                  <div className="text-sm opacity-90 mb-1">연간 총 혜택 예상액</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(result.totalBenefit)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm opacity-90">
              * 실제 수령액은 개인 상황에 따라 달라질 수 있습니다.
            </div>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

