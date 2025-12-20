'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiBell, FiDollarSign, FiMessageSquare, FiBookmark, FiCheckSquare } from 'react-icons/fi';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '홈', icon: FiHome },
    { href: '/policies', label: '정책', icon: FiMessageSquare },
    { href: '/bookmarks', label: '즐겨찾기', icon: FiBookmark },
    { href: '/checklist', label: '체크리스트', icon: FiCheckSquare },
    { href: '/profile', label: '프로필', icon: FiUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

