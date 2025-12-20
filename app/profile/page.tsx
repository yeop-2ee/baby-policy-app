'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { getUserId, saveUserProfile, getUserProfile, clearUserData } from '@/lib/storage';

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    neighborhood: '',
    incomeLevel: '',
    childCount: 0,
    dualIncome: false,
    multiChild: false,
    hasChildren: false, // 출산 여부
    isPregnant: false, // 임신 여부
    pregnancyWeek: 0, // 임신 주수
    planningPregnancy: false, // 출산 계획 여부
  });
  const [children, setChildren] = useState<Array<{ name: string; birthDate: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 프로필 정보 로드
  useEffect(() => {
    const loadProfile = async () => {
      const userId = getUserId();
      
      // 먼저 localStorage에서 로드
      const savedProfile = getUserProfile();
      if (savedProfile) {
        setFormData({
          city: savedProfile.city || '',
          district: savedProfile.district || '',
          neighborhood: savedProfile.neighborhood || '',
          incomeLevel: savedProfile.incomeLevel || '',
          childCount: savedProfile.childCount || 0,
          dualIncome: savedProfile.dualIncome || false,
          multiChild: savedProfile.multiChild || false,
          hasChildren: savedProfile.hasChildren || false,
          isPregnant: savedProfile.isPregnant || false,
          pregnancyWeek: savedProfile.pregnancyWeek || 0,
          planningPregnancy: savedProfile.planningPregnancy || false,
        });
        if (savedProfile.children) {
          setChildren(savedProfile.children.map((child: any) => ({
            name: child.name || '',
            birthDate: child.birthDate ? new Date(child.birthDate).toISOString().split('T')[0] : '',
          })));
        }
      }
      
      // 데이터베이스에서도 프로필 로드 (더 최신 정보가 있을 수 있음)
      try {
        const response = await fetch(`/api/profile?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user?.profile) {
            const profile = data.user.profile;
            setFormData({
              city: profile.city || '',
              district: profile.district || '',
              neighborhood: profile.neighborhood || '',
              incomeLevel: profile.incomeLevel || '',
              childCount: profile.childCount || 0,
              dualIncome: profile.dualIncome || false,
              multiChild: profile.multiChild || false,
              hasChildren: profile.hasChildren || false,
              isPregnant: profile.isPregnant || false,
              pregnancyWeek: profile.pregnancyWeek || 0,
              planningPregnancy: profile.planningPregnancy || false,
            });
            if (profile.children && profile.children.length > 0) {
              setChildren(profile.children.map((child: any) => ({
                name: child.name || '',
                birthDate: child.birthDate ? new Date(child.birthDate).toISOString().split('T')[0] : '',
              })));
            }
            
            // localStorage에도 저장
            saveUserProfile({
              ...profile,
              children: profile.children || [],
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile from database:', error);
      }
      
      setIsLoading(false);
    };
    
    loadProfile();
  }, []);

  const cities = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];
  const districts: Record<string, string[]> = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = getUserId();

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          incomeLevel: formData.incomeLevel,
          childCount: formData.hasChildren ? (children.length || formData.childCount) : 0,
          dualIncome: formData.dualIncome,
          hasChildren: formData.hasChildren,
          isPregnant: formData.isPregnant,
          pregnancyWeek: formData.pregnancyWeek || null,
          planningPregnancy: formData.planningPregnancy,
          children: formData.hasChildren ? children : [],
        }),
      });

      if (!response.ok) {
        throw new Error('프로필 저장에 실패했습니다.');
      }

      const result = await response.json();
      
      // localStorage에 프로필 정보 저장 (city와 district가 필수)
      const profileData = {
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood || '',
        incomeLevel: formData.incomeLevel,
        childCount: formData.hasChildren ? children.length : 0,
        dualIncome: formData.dualIncome,
        multiChild: formData.hasChildren && children.length >= 3,
        hasChildren: formData.hasChildren,
        isPregnant: formData.isPregnant,
        pregnancyWeek: formData.pregnancyWeek,
        planningPregnancy: formData.planningPregnancy,
        children: formData.hasChildren ? children : [],
        profileId: result.profile?.id,
      };
      
      saveUserProfile(profileData);

      // 커스텀 이벤트 발생 (홈 페이지에서 감지)
      if (typeof window !== 'undefined') {
        // 커스텀 이벤트로 프로필 저장 알림
        window.dispatchEvent(new CustomEvent('profileSaved', { detail: profileData }));
        
        // storage 이벤트도 발생 (다른 탭 동기화용)
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'baby-policy-user-profile',
          newValue: JSON.stringify(profileData),
          storageArea: localStorage,
        }));
      }

      alert('프로필이 저장되었습니다!');
      
      // 홈으로 이동 (약간의 딜레이를 주어 이벤트가 전달되도록)
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const addChild = () => {
    setChildren([...children, { name: '', birthDate: '' }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: 'name' | 'birthDate', value: string) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  // 프로필 초기화 함수
  const handleResetProfile = async () => {
    // 확인 다이얼로그
    const confirmed = window.confirm(
      '프로필을 초기화하시겠습니까?\n\n모든 프로필 정보(거주지, 소득, 자녀 정보 등)가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    try {
      const userId = getUserId();

      // API에서 프로필 삭제
      const response = await fetch(`/api/profile?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('프로필 초기화에 실패했습니다.');
      }

      // localStorage에서 프로필 정보 삭제
      clearUserData();

      // 폼 초기화
      setFormData({
        city: '',
        district: '',
        neighborhood: '',
        incomeLevel: '',
        childCount: 0,
        dualIncome: false,
        multiChild: false,
        hasChildren: false,
        isPregnant: false,
        pregnancyWeek: 0,
        planningPregnancy: false,
      });
      setChildren([]);

      // 커스텀 이벤트 발생 (홈 페이지에서 감지)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profileSaved', { detail: null }));
      }

      alert('프로필이 초기화되었습니다.');
    } catch (error) {
      console.error('Error resetting profile:', error);
      alert('프로필 초기화 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="mr-4">
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">프로필 설정</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">프로필 정보를 불러오는 중...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* 거주지 정보 */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">거주지 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시/도
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {formData.city && districts[formData.city] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구/군
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">선택하세요</option>
                    {districts[formData.city].map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  동/읍/면 (선택사항)
                </label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 역삼동"
                />
              </div>
            </div>
          </section>

          {/* 출산 상태 */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">출산 상태</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 상태
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasChildren"
                      checked={formData.hasChildren === true}
                      onChange={() => {
                        setFormData({
                          ...formData,
                          hasChildren: true,
                          isPregnant: false,
                          pregnancyWeek: 0,
                          planningPregnancy: false,
                        });
                        setChildren([]);
                      }}
                      className="mr-2"
                    />
                    <span>출산 후 (자녀가 있음)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasChildren"
                      checked={formData.hasChildren === false}
                      onChange={() => {
                        setFormData({
                          ...formData,
                          hasChildren: false,
                          childCount: 0,
                          multiChild: false,
                        });
                        setChildren([]);
                      }}
                      className="mr-2"
                    />
                    <span>출산 전</span>
                  </label>
                </div>
              </div>

              {/* 출산 전인 경우 */}
              {!formData.hasChildren && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={formData.isPregnant}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            isPregnant: e.target.checked,
                            pregnancyWeek: e.target.checked ? formData.pregnancyWeek : 0,
                            planningPregnancy: e.target.checked ? false : formData.planningPregnancy,
                          });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">임신 중입니다</span>
                    </label>
                    {formData.isPregnant && (
                      <div className="mt-2">
                        <label className="block text-sm text-gray-600 mb-1">
                          임신 주수
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="42"
                          value={formData.pregnancyWeek || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pregnancyWeek: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="예: 20"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          현재 임신 주수를 입력하세요 (1-42주)
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.planningPregnancy && !formData.isPregnant}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            planningPregnancy: e.target.checked,
                            isPregnant: e.target.checked ? false : formData.isPregnant,
                            pregnancyWeek: e.target.checked ? 0 : formData.pregnancyWeek,
                          });
                        }}
                        disabled={formData.isPregnant}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        출산 계획이 있습니다
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 가구 정보 */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">가구 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소득 수준
                </label>
                <select
                  value={formData.incomeLevel}
                  onChange={(e) => setFormData({ ...formData, incomeLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="하위50%">하위 50%</option>
                  <option value="중위50-100%">중위 50-100%</option>
                  <option value="상위10%">상위 10%</option>
                </select>
              </div>

              {/* 출산 후인 경우만 자녀 수 표시 */}
              {formData.hasChildren && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자녀 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.childCount || children.length}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        childCount: count,
                        multiChild: count >= 3,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dualIncome"
                  checked={formData.dualIncome}
                  onChange={(e) => setFormData({ ...formData, dualIncome: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="dualIncome" className="ml-2 text-sm text-gray-700">
                  맞벌이 가구입니다
                </label>
              </div>
            </div>
          </section>

          {/* 자녀 정보 - 출산 후인 경우만 표시 */}
          {formData.hasChildren && (
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">가족 구성원 (자녀 정보)</h2>
              <button
                type="button"
                onClick={addChild}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <FiPlus className="w-5 h-5 mr-1" />
                <span className="text-sm">추가</span>
              </button>
            </div>

            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      자녀 {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="이름 (선택사항)"
                      value={child.name}
                      onChange={(e) => updateChild(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={child.birthDate}
                      onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              ))}

              {children.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  자녀 정보를 추가해주세요
                </p>
              )}
            </div>
            </section>
          )}

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
          >
            프로필 저장하기
          </button>
        </form>
        )}

        {/* 프로필 초기화 버튼 */}
        {!isLoading && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleResetProfile}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-200"
            >
              <FiTrash2 className="w-5 h-5" />
              프로필 초기화
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              모든 프로필 정보를 삭제합니다
            </p>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

