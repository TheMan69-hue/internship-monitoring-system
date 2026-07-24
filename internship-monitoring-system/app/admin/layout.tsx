"use client";

import { useState, useRef, useEffect } from 'react';
import { TextAlignJustify, User } from 'lucide-react';
import Sidebar from '@/components/sidebar/sidebar';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('admin@example.com');

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserEmail(user.email ?? 'admin@example.com');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-gray-100'>
      <header className="bg-white w-full border-b-slate-200 border-b-1">
        <div className="flex justify-between items-center px-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="cursor-pointer p-1"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <TextAlignJustify className='text-slate-400' />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <User className="w-5 h-5 text-gray-600" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`shrink-0 overflow-hidden transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-70 translate-x-0' : 'w-0 -translate-x-full'
          }`}
        >
          <Sidebar />
        </div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
