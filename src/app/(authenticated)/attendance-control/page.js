'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getAdminAllAttendance, markArrival, markExit } from '@/lib/api';
import { toDateKey, todayKey, formatHoursToHMS } from '@/lib/dateUtils';
import PageHeader from '@/components/PageHeader';
import { CardRowSkeleton } from '@/components/Skeleton';

function formatElapsed(loginTime) {
  if (!loginTime) return '00:00:00';
  const start = new Date(loginTime).getTime();
  const elapsed = Date.now() - start;
  if (elapsed < 0) return '00:00:00';
  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function AttendanceControlPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [, setTick] = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

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
      const result = await getAdminAllAttendance(1);
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleConfirmArrival = async () => {
    if (!confirmModal || confirmModal.type !== 'arrival') return;
    const userId = confirmModal.userId;
    setConfirmModal(null);
    setActionLoading(userId + '-arrival');
    try {
      await markArrival(userId);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmExit = async () => {
    if (!confirmModal || confirmModal.type !== 'exit') return;
    const userId = confirmModal.userId;
    setConfirmModal(null);
    setActionLoading(userId + '-exit');
    try {
      await markExit(userId);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const user = getUser();
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Attendance Control" />
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <CardRowSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.map(({ user: emp, attendance }) => {
            const todayRecord = attendance?.find((r) => toDateKey(r.date) === todayKey());
            const status = todayRecord?.status ?? 'Absent';
            const isPresent = status === 'Present';
            const hasLeft = todayRecord?.logoutTime != null;
            const workingHours = todayRecord?.workingHours;
            return (
              <div
                key={emp._id}
                className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="px-5 py-4 bg-black/5 border-b border-black/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-black">{emp.username}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isPresent
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-black/10 text-black border-black/20'
                      }`}
                    >
                      {status}
                    </span>
                    <span className="text-sm text-black/70">
                      Today — Arrive: {formatTime(todayRecord?.loginTime)}
                      {hasLeft ? (
                        <>
                          {' · Leave: '}
                          {formatTime(todayRecord?.logoutTime)}
                          {workingHours != null && (
                            <span className="ml-2 font-medium text-black">· {formatHoursToHMS(workingHours)} worked</span>
                          )}
                        </>
                      ) : todayRecord?.loginTime ? (
                        <span className="ml-2 font-medium text-primary">
                          · Today office time: {formatElapsed(todayRecord.loginTime)}
                        </span>
                      ) : (
                        ' · Leave: —'
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({
                          type: 'arrival',
                          userId: emp._id,
                          username: emp.username,
                          currentTime: getCurrentTime(),
                        })
                      }
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary"
                    >
                      {actionLoading === emp._id + '-arrival' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      Arrival
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({
                          type: 'exit',
                          userId: emp._id,
                          username: emp.username,
                          officeTime: formatElapsed(todayRecord?.loginTime),
                        })
                      }
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-primary bg-white text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-50"
                    >
                      {actionLoading === emp._id + '-exit' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-black mb-2">
              {confirmModal.type === 'arrival' ? 'Confirm Arrival' : 'Confirm Exit'}
            </h3>
            <p className="text-sm text-black/80 mb-2">
              Employee: <span className="font-semibold text-black">{confirmModal.username}</span>
            </p>
            {confirmModal.type === 'arrival' ? (
              <>
                <p className="text-sm text-black/80 mb-1">
                  Current time: <span className="font-mono font-semibold text-primary">{confirmModal.currentTime}</span>
                </p>
                <p className="text-black/90 mt-3">Are you sure you want to mark arrival (starting)?</p>
              </>
            ) : (
              <>
                <p className="text-sm text-black/80 mb-1">
                  Today office time: <span className="font-mono font-semibold text-primary">{confirmModal.officeTime}</span>
                </p>
                <p className="text-black/90 mt-3">Are you sure you want to mark exit?</p>
              </>
            )}
            <div className="flex gap-2 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg border border-black/20 bg-white text-black text-sm font-medium hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.type === 'arrival' ? handleConfirmArrival : handleConfirmExit}
                disabled={!!actionLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : confirmModal.type === 'arrival' ? (
                  'Confirm Arrival'
                ) : (
                  'Confirm Exit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
