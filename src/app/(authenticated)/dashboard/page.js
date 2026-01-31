'use client';

import { useEffect, useState } from 'react';
import {
  UserCheck,
  UserX,
  CalendarClock,
  Clock,
  Users,
  Loader2,
  CheckSquare,
  XCircle,
} from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import { getUser } from '@/lib/auth';
import { getAttendance, getAdminAllAttendance, getPendingExcuses } from '@/lib/api';
import { toDateKey, todayKey, formatElapsed, formatHoursToHMS } from '@/lib/dateUtils';
import PageHeader from '@/components/PageHeader';
import ClockComponent from '@/components/Clock';
import SummaryCard from '@/components/SummaryCard';
import AttendanceTable from '@/components/AttendanceTable';

export default function DashboardPage() {
  const user = getUser();
  const userId = user?.id;
  const userRole = user?.role;
  const [loading, setLoading] = useState(true);
  const [userSummary, setUserSummary] = useState(null);
  const [userAttendance, setUserAttendance] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [pendingExcuses, setPendingExcuses] = useState([]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (userRole === 'user') {
          const data = await getAttendance(null, 30);
          setUserSummary(data.summary || {});
          setUserAttendance(data.attendance || []);
        } else if (userRole === 'admin' || userRole === 'superadmin') {
          const [allAttendance, excuses] = await Promise.all([
            userRole === 'superadmin' ? getAdminAllAttendance(30) : getAdminAllAttendance(30),
            userRole === 'superadmin' ? getPendingExcuses() : Promise.resolve([]),
          ]);
          setAdminData(allAttendance || []);
          if (userRole === 'superadmin') setPendingExcuses(excuses || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, userRole]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;

  const todayAttendance = user.role === 'user' && userAttendance?.length
    ? userAttendance.find((r) => toDateKey(r.date) === todayKey())
    : null;
  const todayStatus = todayAttendance?.status ?? '—';

  const presentToday = adminData.filter(({ attendance }) => {
    const today = attendance?.find((r) => toDateKey(r.date) === todayKey());
    return today?.status === 'Present';
  }).length;
  const absentToday = adminData.length - presentToday;

  const formatTimeShort = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    const cardValue = (w = 'w-16') => <Skeleton className={`h-7 ${w}`} />;
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader title="Dashboard" />
        <div className="pt-2 space-y-8">
          <ClockComponent />

          {user.role === 'user' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard title="Total Present Days" value={cardValue()} icon={UserCheck} />
                <SummaryCard title="Total Absent Days" value={cardValue()} icon={UserX} />
                <SummaryCard title="Total Leaves" value={cardValue()} icon={CalendarClock} />
                <SummaryCard title="Total Office Hours" value={cardValue('w-28')} icon={Clock} />
              </div>

              <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-5">
                <h2 className="text-lg font-bold text-black mb-3">Today&apos;s Attendance</h2>
                <div className="space-y-2">
                  <p className="text-black/80">Status: <Skeleton className="inline-block h-4 w-16 align-middle ml-2" /></p>
                  <p className="text-black/80">Arrival: <Skeleton className="inline-block h-4 w-24 align-middle ml-2" /></p>
                  <p className="text-black/80">Exit: <Skeleton className="inline-block h-4 w-24 align-middle ml-2" /></p>
                  <p className="text-black/80">Today total working hours: <Skeleton className="inline-block h-4 w-28 align-middle ml-2" /></p>
                </div>
              </div>
            </>
          )}

          {(user.role === 'admin' || user.role === 'superadmin') && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard title="Total Employees" value={cardValue()} icon={Users} />
                <SummaryCard title="Present Today" value={cardValue()} icon={UserCheck} />
                <SummaryCard title="Absent Today" value={cardValue()} icon={UserX} />
                <SummaryCard title="Pending Excuses" value={cardValue()} icon={CheckSquare} />
              </div>

              {user.role === 'admin' && (
                <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
                  <h2 className="text-lg font-bold text-black p-5 pb-0">Today&apos;s Attendance Preview</h2>
                  <div className="p-5 overflow-auto max-h-[500px]">
                    <table className="min-w-full divide-y divide-black/10">
                      <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <tr key={i}>
                            <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                            <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {user.role === 'superadmin' && (
                <>
                  <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
                    <h2 className="text-lg font-bold text-black p-5 pb-0">Today&apos;s Attendance (All Employees)</h2>
                    <p className="text-sm text-black/70 px-5 pt-1">Showing today&apos;s status for all users.</p>
                    <div className="p-5 overflow-auto max-h-[500px]">
                      <table className="min-w-full divide-y divide-black/10">
                        <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Arrive</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Leave</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Today</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i}>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
                    <h2 className="text-lg font-bold text-black p-5 pb-0">Excuse Requests</h2>
                    <p className="text-sm text-black/70 px-5 pt-1">Pending: <Skeleton className="inline-block h-4 w-6 align-middle" /> — Use &quot;Excuse Approvals&quot; in the sidebar to approve or reject.</p>
                    <div className="p-5 overflow-auto max-h-[500px]">
                      <table className="min-w-full divide-y divide-black/10">
                        <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {[1, 2, 3, 4].map((i) => (
                            <tr key={i}>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-56" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Dashboard" />
      <div className="pt-2 space-y-8">
      <ClockComponent />

      {user.role === 'user' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              title="Total Present Days"
              value={userSummary?.presences ?? 0}
              icon={UserCheck}
            />
            <SummaryCard
              title="Total Absent Days"
              value={userSummary?.absences ?? 0}
              icon={UserX}
            />
            <SummaryCard
              title="Total Leaves"
              value={userSummary?.leaves ?? 0}
              icon={CalendarClock}
            />
            <SummaryCard
              title="Total Office Hours"
              value={formatHoursToHMS(userSummary?.totalOfficeHours) ?? '—'}
              icon={Clock}
            />
          </div>
          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-5">
            <h2 className="text-lg font-bold text-black mb-3">Today&apos;s Attendance</h2>
            <div className="space-y-2">
              <p className="text-black/80">
                Status: <span className={`font-semibold ${todayStatus === 'Present' ? 'text-primary' : todayStatus === 'Excused' ? 'text-primary/80' : 'text-black'}`}>{todayStatus}</span>
              </p>
              {todayAttendance?.loginTime && (
                <p className="text-black/80">
                  Arrival: <span className="font-medium text-black">{new Date(todayAttendance.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </p>
              )}
              {todayStatus === 'Present' && !todayAttendance?.logoutTime && todayAttendance?.loginTime && (
                <p className="text-black/80">
                  Today office time: <span className="font-mono font-semibold text-primary">{formatElapsed(now - new Date(todayAttendance.loginTime).getTime())}</span>
                </p>
              )}
              {todayAttendance?.logoutTime && (
                <>
                  <p className="text-black/80">
                    Exit: <span className="font-medium text-black">{new Date(todayAttendance.logoutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </p>
                  <p className="text-black/80">
                    Today total working hours: <span className="font-semibold text-primary">{formatHoursToHMS(todayAttendance.workingHours)}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {(user.role === 'admin' || user.role === 'superadmin') && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              title="Total Employees"
              value={adminData.length}
              icon={Users}
            />
            <SummaryCard
              title="Present Today"
              value={presentToday}
              icon={UserCheck}
            />
            <SummaryCard
              title="Absent Today"
              value={absentToday}
              icon={UserX}
            />
            <SummaryCard
              title="Pending Excuses"
              value={user.role === 'superadmin' ? pendingExcuses.length : 0}
              icon={CheckSquare}
            />
          </div>

          {user.role === 'admin' && adminData.length > 0 && (
            <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
              <h2 className="text-lg font-bold text-black p-5 pb-0">Today&apos;s Attendance Preview</h2>
              <div className="p-5 overflow-auto max-h-[500px]">
                <table className="min-w-full divide-y divide-black/10">
                  <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {adminData.slice(0, 10).map(({ user: emp, attendance }) => {
                      const today = attendance?.find((r) => toDateKey(r.date) === todayKey());
                      return (
                        <tr key={emp._id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-black">{emp.username}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              today?.status === 'Present' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-black/10 text-black border-black/20'
                            }`}>
                              {today?.status ?? '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {user.role === 'superadmin' && (
            <>
              {adminData.length > 0 && (
                <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
                  <h2 className="text-lg font-bold text-black p-5 pb-0">Today&apos;s Attendance (All Employees)</h2>
                  <p className="text-sm text-black/70 px-5 pt-1">
                    Showing today&apos;s status for all users.
                  </p>
                  <div className="p-5 overflow-auto max-h-[500px]">
                    <table className="min-w-full divide-y divide-black/10">
                      <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Arrive</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Leave</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Today</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {adminData.map(({ user: emp, attendance }) => {
                          const today = attendance?.find((r) => toDateKey(r.date) === todayKey());
                          const status = today?.status ?? '—';
                          const isPresent = status === 'Present';
                          const hasLeft = !!today?.logoutTime;
                          const todayValue = hasLeft
                            ? formatHoursToHMS(today?.workingHours)
                            : today?.loginTime
                              ? formatElapsed(now - new Date(today.loginTime).getTime())
                              : '—';
                          return (
                            <tr key={emp._id} className="hover:bg-primary/5 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-black">{emp.username}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    isPresent
                                      ? 'bg-primary/10 text-primary border-primary/30'
                                      : 'bg-black/10 text-black border-black/20'
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-black/80">{formatTimeShort(today?.loginTime)}</td>
                              <td className="px-4 py-3 text-sm text-black/80">{formatTimeShort(today?.logoutTime)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-black">{todayValue}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
                <h2 className="text-lg font-bold text-black p-5 pb-0">Excuse Requests</h2>
                <p className="text-sm text-black/70 px-5 pt-1">
                  Pending: {pendingExcuses.length} — Use &quot;Excuse Approvals&quot; in the sidebar to approve or reject.
                </p>
                {pendingExcuses.length > 0 && (
                  <div className="p-5 overflow-auto max-h-[500px]">
                    <table className="min-w-full divide-y divide-black/10">
                      <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {pendingExcuses.slice(0, 5).map((excuse) => (
                          <tr key={excuse._id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-black">{excuse.userId?.username ?? '—'}</td>
                            <td className="px-4 py-3 text-sm text-black/80">
                              {new Date(excuse.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-black/80 max-w-xs truncate">{excuse.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      </div>
    </div>
  );
}
