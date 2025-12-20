'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiCheck, FiCircle, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { getUserId, getUserProfile } from '@/lib/storage';
import { calculateMonthsOld } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  category?: string;
  isCompleted: boolean;
  dueDate?: string;
  priority?: string;
}

async function fetchChecklist(userId: string) {
  const response = await fetch(`/api/checklist?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch checklist');
  }
  const data = await response.json();
  return data.checklist || [];
}

async function toggleChecklistItem(userId: string, itemId: string, isCompleted: boolean) {
  const response = await fetch('/api/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, isCompleted: !isCompleted }),
  });
  if (!response.ok) {
    throw new Error('Failed to toggle checklist item');
  }
  return response.json();
}

export default function ChecklistPage() {
  const queryClient = useQueryClient();
  const userId = getUserId();
  const profile = getUserProfile();
  
  const { data: checklist = [], isLoading } = useQuery({
    queryKey: ['checklist', userId],
    queryFn: () => fetchChecklist(userId),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) =>
      toggleChecklistItem(userId, itemId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', userId] });
    },
  });

  // 프로필에 따라 체크리스트 자동 생성
  useEffect(() => {
    if (profile && (profile.isPregnant || profile.hasChildren) && checklist.length === 0 && !isLoading) {
      fetch('/api/checklist/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['checklist', userId] });
        })
        .catch(console.error);
    }
  }, [profile, checklist.length, userId, isLoading, queryClient]);

  const pregnancyChecklist = checklist.filter((item: ChecklistItem) => item.type === 'pregnancy');
  const postpartumChecklist = checklist.filter((item: ChecklistItem) => item.type === 'postpartum');

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="mr-4">
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">체크리스트</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 임신 중 체크리스트 */}
            {profile?.isPregnant && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiAlertCircle className="w-5 h-5 text-pink-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    임신 {profile.pregnancyWeek || 0}주 체크리스트
                  </h2>
                </div>
                {pregnancyChecklist.length === 0 ? (
                  <p className="text-sm text-gray-500">체크리스트 항목이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {pregnancyChecklist.map((item: ChecklistItem) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${
                          item.isCompleted
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleMutation.mutate({ itemId: item.id, isCompleted: item.isCompleted })}
                          className={`mt-0.5 ${
                            item.isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {item.isCompleted ? (
                            <FiCheck className="w-5 h-5" />
                          ) : (
                            <FiCircle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-medium ${
                                item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </h3>
                            {item.priority && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(
                                  item.priority
                                )}`}
                              >
                                {item.priority === 'high' ? '긴급' : item.priority === 'medium' ? '중요' : '일반'}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          {item.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FiCalendar className="w-3 h-3" />
                              <span>
                                {new Date(item.dueDate).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 출산 후 체크리스트 */}
            {profile?.hasChildren && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiAlertCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">출산 후 체크리스트</h2>
                  {profile.children && profile.children.length > 0 && (
                    <span className="text-sm text-gray-500">
                      (최연소: 생후 {Math.min(...profile.children.map((c: any) => {
                        const birthDate = c.birthDate instanceof Date ? c.birthDate : new Date(c.birthDate);
                        return calculateMonthsOld(birthDate);
                      }))}개월)
                    </span>
                  )}
                </div>
                {postpartumChecklist.length === 0 ? (
                  <p className="text-sm text-gray-500">체크리스트 항목이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {postpartumChecklist.map((item: ChecklistItem) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${
                          item.isCompleted
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleMutation.mutate({ itemId: item.id, isCompleted: item.isCompleted })}
                          className={`mt-0.5 ${
                            item.isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {item.isCompleted ? (
                            <FiCheck className="w-5 h-5" />
                          ) : (
                            <FiCircle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-medium ${
                                item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </h3>
                            {item.priority && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(
                                  item.priority
                                )}`}
                              >
                                {item.priority === 'high' ? '긴급' : item.priority === 'medium' ? '중요' : '일반'}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          {item.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FiCalendar className="w-3 h-3" />
                              <span>
                                {new Date(item.dueDate).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {!profile?.isPregnant && !profile?.hasChildren && (
              <div className="text-center py-12 bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 mb-2">체크리스트를 사용하려면 프로필을 설정해주세요.</p>
                <Link
                  href="/profile"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  프로필 설정하기
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

