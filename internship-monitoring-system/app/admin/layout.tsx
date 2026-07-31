"use client";

import { useState } from 'react';
import { TextAlignJustify } from 'lucide-react';
import ActiveSchoolYear from '@/components/layout/ActiveSchoolYear';
import SideBar from '@/components/sidebar/AdminSidebar';
import UserProfileModal from '@/components/layout/UserProfileModal';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-gray-100'>
      <header className="bg-white w-full border-b-slate-200 border-b-1">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="cursor-pointer p-1"
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <TextAlignJustify className='text-slate-400' />
            </button>
            <ActiveSchoolYear />
          </div>
          
          <UserProfileModal role="admin" containerClassName="pr-2" buttonClassName="bg-gray-50" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-70 translate-x-0' : 'w-0 -translate-x-full'
          }`}
        >
          <SideBar/>
        </div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
