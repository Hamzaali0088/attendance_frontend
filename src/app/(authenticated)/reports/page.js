'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Reports" />
      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-8 text-center">
        <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-lg font-bold text-black mb-2">Reports</h2>
        <p className="text-black/70 text-sm">Reports and analytics can be added here.</p>
      </div>
    </div>
  );
}
