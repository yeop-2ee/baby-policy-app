'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiArrowLeft, FiBell, FiCalendar, FiCheck } from 'react-icons/fi';
import { formatDate, calculateDDay } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'application_start',
      title: '아동수당 신청 시작',
      message: '아동수당 신청이 시작되었습니다. 지금 바로 신청하세요!',
      policyId: '1',
      relatedDate: new Date('2024-12-25'),
      isRead: false,
      createdAt: new Date('2024-12-20'),
    },
    {
      id: '2',
      type: 'application_end',
      title: '출산 축하금 신청 마감 임박',
      message: '출산 축하금 신청이 3일 후 마감됩니다.',
      policyId: '2',
      relatedDate: new Date('2024-12-23'),
      isRead: false,
      createdAt: new Date('2024-12-20'),
    },
    {
      id: '3',
      type: 'age_change',
      title: '새로운 정책 혜택 알림',
      message: '아이가 3세가 되어 새로운 정책 혜택을 받을 수 있습니다.',
      policyId: null,
      relatedDate: null,
      isRead: true,
      createdAt: new Date('2024-12-15'),
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <FiArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">알림</h1>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const dDay = notification.relatedDate ? calculateDDay(notification.relatedDate) : null;
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                    notification.isRead 
                      ? 'border-gray-200 opacity-75' 
                      : notification.type === 'application_end' 
                        ? 'border-red-500' 
                        : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        {dDay !== null && (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            <span className={dDay <= 7 ? 'text-red-600 font-semibold' : ''}>
                              {dDay < 0 ? '마감됨' : dDay === 0 ? '오늘' : `D-${dDay}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {notification.policyId && (
                        <Link
                          href={`/policy/${notification.policyId}`}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          보기
                        </Link>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="읽음 처리"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

