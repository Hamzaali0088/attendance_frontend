'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquarePlus,
  User,
  Users,
  ClipboardList,
  BarChart3,
  CheckSquare,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';

const iconMap = {
  LayoutDashboard,
  CalendarCheck,
  MessageSquarePlus,
  User,
  Users,
  ClipboardList,
  BarChart3,
  CheckSquare,
  Settings,
};

const userNav = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/my-attendance', label: 'My Attendance', icon: 'CalendarCheck' },
  { href: '/excuse-request', label: 'Excuse Request', icon: 'MessageSquarePlus' },
  { href: '/profile', label: 'Profile', icon: 'User' },
];

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/employees', label: 'Employees', icon: 'Users' },
  { href: '/attendance-control', label: 'Attendance Control', icon: 'ClipboardList' },
  { href: '/reports', label: 'Reports', icon: 'BarChart3' },
];

const superadminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/excuse-approvals', label: 'Excuse Approvals', icon: 'CheckSquare' },
  { href: '/user-management', label: 'User Management', icon: 'Users' },
  { href: '/reports', label: 'Reports', icon: 'BarChart3' },
];

function getNav(role) {
  if (role === 'superadmin') return superadminNav;
  if (role === 'admin') return adminNav;
  return userNav;
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();
  const [open, setOpen] = useState(false);
  const nav = user ? getNav(user.role) : [];

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-black/10 shadow-card text-black"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-black/10 shadow-lg transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-2 border-b border-black/10 relative">
            <Image src="/images/logo.webp" alt="Attendance" width={500} height={500} className="object-contain h-11 w-auto" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-black/5 text-black"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {nav.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-black hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-black/10">
            <div className="px-3 py-2 text-xs text-black/60 mb-2">
              {user?.username} ({user?.role})
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-black/5 border border-black/10 hover:border-primary"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
