'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { getUserId, saveUserProfile, getUserProfile } from '@/lib/storage';

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
          childCount: formData.childCount,
          dualIncome: formData.dualIncome,
          children: children,
        }),
      });

      if (!response.ok) {
        throw new Error('프로필 저장에 실패했습니다.');
      }

      const result = await response.json();
      
      // localStorage에 프로필 정보 저장
      saveUserProfile({
        ...formData,
        children: children,
        profileId: result.profile?.id,
      });

      alert('프로필이 저장되었습니다!');
      router.push('/');
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자녀 수
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.childCount}
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

          {/* 자녀 정보 */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">자녀 정보</h2>
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

          {/* 저장 버튼 */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            프로필 저장하기
          </button>
        </form>
        )}
      </main>

      <Navbar />
    </div>
  );
}

