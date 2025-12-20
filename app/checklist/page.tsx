'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiCheck, FiCircle, FiCalendar, FiAlertCircle, FiPlus, FiX } from 'react-icons/fi';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    type: profile?.isPregnant ? 'pregnancy' : profile?.hasChildren ? 'postpartum' : 'pregnancy',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: '',
  });
  
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

  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...item }),
      });
      if (!response.ok) {
        throw new Error('Failed to add checklist item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', userId] });
      setShowAddModal(false);
      setNewItem({
        type: profile?.isPregnant ? 'pregnancy' : profile?.hasChildren ? 'postpartum' : 'pregnancy',
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        dueDate: '',
      });
    },
    onError: (error) => {
      alert(`체크리스트 추가 실패: ${error.message}`);
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <FiArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">체크리스트</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>추가</span>
          </button>
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

        {/* 항목 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">체크리스트 항목 추가</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newItem.title.trim()) {
                    alert('제목을 입력해주세요.');
                    return;
                  }
                  addItemMutation.mutate(newItem);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    유형
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="pregnancy">임신 중</option>
                    <option value="postpartum">출산 후</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 산전 진료 예약"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명 (선택사항)
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="상세 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 (선택사항)
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="의료">의료</option>
                    <option value="행정">행정</option>
                    <option value="건강">건강</option>
                    <option value="준비물">준비물</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우선순위
                  </label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">일반</option>
                    <option value="medium">중요</option>
                    <option value="high">긴급</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    마감일 (선택사항)
                  </label>
                  <input
                    type="date"
                    value={newItem.dueDate}
                    onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={addItemMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {addItemMutation.isPending ? '추가 중...' : '추가하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

