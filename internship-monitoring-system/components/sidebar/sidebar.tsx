"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import menuIcon from '@/assets/Menu.svg';

const adminRoutes = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  {
    label: 'Registration',
    children: [
      { label: 'Archive List', href: '/admin/registration/archive-list' },
      { label: 'Registration List', href: '/admin/registration/registration-list' },
    ],
  },
  { label: 'Intern', href: '/admin/intern' },
  { label: 'OJT Coordinator', href: '/admin/ojt-coordinator' },
];

export default function Sidebar() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const pathname = usePathname();

  const isActiveLink = (href?: string) => pathname === href;
  const isGroupActive = (route: (typeof adminRoutes)[number]) =>
    Boolean(route.href && pathname === route.href) ||
    Boolean(route.children?.some((child) => pathname === child.href));

  return (
    <aside className='bg-white h-screen w-1/5 rounded-r-lg border-r border-slate-200 flex-none'>
      <div className='m-5'>
        <div className='py-10 rounded-md'>
          <h1 className='text-black text-center font-semibold'>Admin Panel</h1>
        </div>

        <nav className='mt-6'>
          <ul className='space-y-2'>
            {adminRoutes.map((route, idx) => (
              <li key={route.label + idx}>
                {route.children ? (
                  <div className={`flex items-center justify-between rounded-md px-3 py-2 ${
                        isGroupActive(route)
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      >
                    <button
                      type='button'
                      onClick={() =>
                        setOpen((s) => ({ ...s, [idx]: !s[idx] }))
                      }
                      className= 'flex-1 text-left text-sm font-medium'
                    >
                      {route.label}
                    </button>
                    <Image src={menuIcon} alt='Menu' width={20} height={20} className='ml-2 shrink-0' />
                  </div>
                ) : (
                  <Link
                    href={route.href || '#'}
                    aria-current={isActiveLink(route.href) ? 'page' : undefined}
                    className={`block rounded-md px-3 py-2 text-sm font-medium ${
                      isActiveLink(route.href)
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {route.label}
                  </Link>
                )}

                {route.children && open[idx] ? (
                  <ul className='ml-4 mt-2 space-y-1'>
                    {route.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={isActiveLink(child.href) ? 'page' : undefined}
                          className={`block rounded-md px-3 py-2 text-sm ${
                            isActiveLink(child.href)
                              ? 'bg-slate-100 text-slate-900'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}