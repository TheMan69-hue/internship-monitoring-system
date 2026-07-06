"use client";

import Link from 'next/link';

const adminRoutes = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  {
    label: 'Registration',
    href: '/admin/registration',
    children: [
      { label: 'Archive List', href: '/admin/registration/archive-list' },
      { label: 'Registration List', href: '/admin/registration/registration-list' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className='bg-white h-screen w-1/5 rounded-r-lg border-r border-slate-200 flex-none'>
      <div className='m-5'>
        <div className='py-4 bg-blue-500 rounded-md'>
          <h1 className='text-black text-center font-semibold'>Admin Panel</h1>
        </div>

        <nav className='mt-6'>
          <ul className='space-y-2'>
            {adminRoutes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className='block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
                >
                  {route.label}
                </Link>
                {route.children ? (
                  <ul className='ml-4 mt-2 space-y-1'>
                    {route.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className='block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100'
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