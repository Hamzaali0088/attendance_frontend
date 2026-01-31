'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    if (user?.role !== 'user') {
      router.replace('/dashboard');
      return;
    }
  }, [router, user?.role]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader title="Profile" />
      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">{user.username}</h2>
            <p className="text-sm text-black/70">{user.email}</p>
            <p className="text-xs text-black/60 mt-1">Role: {user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
