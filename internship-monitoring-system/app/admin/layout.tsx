"use client";

import { useState } from 'react';
import Image from 'next/image';
import menuIcon from '@/assets/Menu.svg';
import Sidebar from '@/components/sidebar/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <header className="bg-white py-1">
        <div className="flex justify-between items-center px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="cursor-pointer p-1"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Image src={menuIcon} alt="Menu" width={24} height={24} />
          </button>

          <div className="profile menu">
            <h2 className="text-black">Hello World</h2>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && <Sidebar />}
        <main className="m-5 flex-1">{children}</main>
      </div>
    </div>
  );
}