"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { LayoutDashboard, 
          UserPlus, 
          Users, 
          UserStar, 
          FileUser, 
          ChevronDown 
        } from 'lucide-react';

interface AdminRoute {
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: Array<{ label: string; href: string; icon?: ReactNode }>;
}

const adminRoutes: AdminRoute[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard/> },
  {
    label: 'Registration', icon: <UserPlus/>,
    children: [
      { label: 'Archive List', href: '/admin/registration/archive-list', icon: <FileUser/> },
      { label: 'Registration List', href: '/admin/registration/registration-list', icon: <FileUser/> },
    ],
  },
  { label: 'Intern', href: '/admin/intern', icon: <Users/> },
  { label: 'OJT Coordinator', href: '/admin/ojt-coordinator', icon: <UserStar/> },
];

export default function Sidebar() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const pathname = usePathname();

  const isActiveLink = (href?: string) => pathname === href;
  const isGroupActive = (route: (typeof adminRoutes)[number]) =>
    Boolean(route.href && pathname === route.href) ||
    Boolean(route.children?.some((child) => pathname === child.href));

  return (
    <aside className='bg-white h-full overflow-y-auto shrink-0 w-70 rounded-r-lg border-r border-slate-200 flex-none'>
      <div className='m-5'>
        <div className='py-10 rounded-md'>
          <h1 className='text-black text-center font-semibold'>Admin Panel</h1>
        </div>

        <nav className='mt-6'>
          <ul className='space-y-2'>
            {adminRoutes.map((route, idx) => (
              <li key={route.label + idx}>
                {route.children ? (
                  <div className='flex items-center justify-between rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100'>
                    <button
                      type='button'
                      onClick={() =>
                        setOpen((s) => ({ ...s, [idx]: !s[idx] }))
                      }
                      className='flex flex-1 items-center gap-2 text-left text-sm font-medium'
                    >
                      {route.icon ? <span className='flex items-center'>{route.icon}</span> : null}
                      <span>{route.label}</span>
                      <ChevronDown className='flex w-[15] h-[15] ml-auto'/>
                    </button>
                  </div>
                ) : (
                  <Link
                    href={route.href || '#'}
                    aria-current={isActiveLink(route.href) ? 'page' : undefined}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      isActiveLink(route.href)
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {route.icon ? <span className='flex items-center'>{route.icon}</span> : null}
                    <span>{route.label}</span>
                  </Link>
                )}

                {route.children ? (
                  <div className={`ml-4 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    open[idx] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <ul className='space-y-1'>
                      {route.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={isActiveLink(child.href) ? 'page' : undefined}
                            className={`flex gap-2 items-center block rounded-md px-3 py-2 text-sm ${
                              isActiveLink(child.href)
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {child.icon ? <span className='flex items-center'>{child.icon}</span> : null}
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}