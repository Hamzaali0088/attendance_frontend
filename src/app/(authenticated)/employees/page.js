'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getAdminAllAttendance } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import AttendanceTable from '@/components/AttendanceTable';
import { CardRowSkeleton } from '@/components/Skeleton';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      router.replace('/dashboard');
      return;
    }
    load();
  }, [router]);

  const load = async () => {
    try {
      const result = await getAdminAllAttendance(30);
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const user = getUser();
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Employees" />
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <CardRowSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.map(({ user: emp, attendance }) => {
            const isExpanded = expandedId === emp._id;
            return (
              <div
                key={emp._id}
                className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden hover:border-primary/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : emp._id)}
                  className="w-full px-5 py-4 bg-black/5 border-b border-black/10 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-black/10 transition-colors"
                >
                  <div>
                    <span className="font-bold text-black">{emp.username}</span>
                    <span className="text-sm text-black/70 ml-2">{emp.email}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <AttendanceTable attendance={attendance} showHours />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
