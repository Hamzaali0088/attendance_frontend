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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="My Attendance" />
      <ClockComponent />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-w-0">
          <SummaryCard title="Presences" value={summary?.presences ?? 0} icon={UserCheck} />
          <SummaryCard title="Absences" value={summary?.absences ?? 0} icon={UserX} />
          <SummaryCard title="Leaves" value={summary?.leaves ?? 0} icon={CalendarClock} />
          <SummaryCard title="Total Office Hours" value={formatHoursToHMS(summary?.totalOfficeHours) ?? '—'} icon={Clock} />
        </div>
        <button
          type="button"
          onClick={() => setExcuseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 border border-primary shadow-card"
        >
          <MessageSquarePlus className="w-5 h-5" />
          Send Excuse (if absent)
        </button>
      </div>

      {loading ? (
        <>
          <Skeleton className="h-6 w-48" />
          <TableSkeleton rows={8} cols={5} />
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-black">Attendance (last 30 days)</h2>
          <AttendanceTable attendance={attendance} showHours />
        </>
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
