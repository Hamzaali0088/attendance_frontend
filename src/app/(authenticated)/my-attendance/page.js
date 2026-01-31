'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import Skeleton, { TableSkeleton } from '@/components/Skeleton';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getAttendance, sendExcuse } from '@/lib/api';
import { formatHoursToHMS } from '@/lib/dateUtils';
import PageHeader from '@/components/PageHeader';
import ClockComponent from '@/components/Clock';
import SummaryCard from '@/components/SummaryCard';
import AttendanceTable from '@/components/AttendanceTable';
import ExcuseModal from '@/components/ExcuseModal';
import { UserCheck, UserX, CalendarClock, Clock } from 'lucide-react';

export default function MyAttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [excuseModalOpen, setExcuseModalOpen] = useState(false);
  const [excuseLoading, setExcuseLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    if (user?.role !== 'user') {
      router.replace('/dashboard');
      return;
    }
    load();
  }, [router]);

  const load = async () => {
    try {
      const data = await getAttendance(null, 30);
      setAttendance(data.attendance || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendExcuse = async ({ date, message }) => {
    setExcuseLoading(true);
    try {
      await sendExcuse(date, message);
      await load();
      setExcuseModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setExcuseLoading(false);
    }
  };

  const user = getUser();
  if (!user) return null;

  const sendExcuseButton = (
    <button
      type="button"
      onClick={() => setExcuseModalOpen(true)}
      title="Send Excuse (if absent)"
      className="flex items-center justify-center p-2 rounded-lg bg-primary text-white hover:bg-primary/90 border border-primary shadow-card transition-colors"
      aria-label="Send Excuse (if absent)"
    >
      <MessageSquarePlus className="w-5 h-5" />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="My Attendance" actions={sendExcuseButton} />
      <ClockComponent />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Presences" value={loading ? <Skeleton className="h-7 w-16" /> : (summary?.presences ?? 0)} icon={UserCheck} />
        <SummaryCard title="Absences" value={loading ? <Skeleton className="h-7 w-16" /> : (summary?.absences ?? 0)} icon={UserX} />
        <SummaryCard title="Leaves" value={loading ? <Skeleton className="h-7 w-16" /> : (summary?.leaves ?? 0)} icon={CalendarClock} />
        <SummaryCard title="Total Office Hours" value={loading ? <Skeleton className="h-7 w-28" /> : (formatHoursToHMS(summary?.totalOfficeHours) ?? '—')} icon={Clock} />
      </div>

      <h2 className="text-lg font-bold text-black">Attendance (last 30 days)</h2>
      {loading ? (
        <>
          {/* Mobile cards skeleton */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border border-black/10 border-t-4 border-t-primary bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-20 mt-1" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-20 mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table skeleton */}
          <div className="hidden md:block">
            <TableSkeleton
              rows={8}
              cols={5}
              headers={['Date', 'Status', 'In', 'Out', 'Hours']}
            />
          </div>
        </>
      ) : (
        <AttendanceTable attendance={attendance} showHours />
      )}

      <ExcuseModal
        isOpen={excuseModalOpen}
        onClose={() => setExcuseModalOpen(false)}
        onSubmit={handleSendExcuse}
        loading={excuseLoading}
      />
    </div>
  );
}
