'use client';

import { formatHoursToHMS } from '@/lib/dateUtils';

function statusClass(status) {
  if (status === 'Present') return 'bg-primary/10 text-primary border-primary/30';
  if (status === 'Absent') return 'bg-black/10 text-black border-black/20';
  return 'bg-primary/5 text-primary/90 border-primary/20';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AttendanceTable({ attendance, showHours = true, compact = false }) {
  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {attendance?.map((row) => (
          <div
            key={row.date}
            className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-black/70 uppercase">Date</p>
                <p className="text-sm font-medium text-black truncate">{formatDate(row.date)}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass(
                  row.status
                )}`}
              >
                {row.status}
              </span>
            </div>

            {showHours && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-black/70 uppercase">In</p>
                  <p className="text-sm text-black">{formatTime(row.loginTime)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-black/70 uppercase">Out</p>
                  <p className="text-sm text-black">{formatTime(row.logoutTime)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-black/70 uppercase">Hours</p>
                  <p className="text-sm font-medium text-black">
                    {row.workingHours != null ? formatHoursToHMS(row.workingHours) : '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-auto max-h-[500px] rounded-xl border border-black/10 bg-white shadow-card">
        <table className="min-w-full divide-y divide-black/10">
          <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                Status
              </th>
              {showHours && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    Hours
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {attendance?.map((row) => (
              <tr key={row.date} className="hover:bg-primary/5 transition-colors">
                <td className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-black`}>
                  {formatDate(row.date)}
                </td>
                <td className={`px-4 ${compact ? 'py-2' : 'py-3'}`}>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
                {showHours && (
                  <>
                    <td className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-black/80`}>
                      {formatTime(row.loginTime)}
                    </td>
                    <td className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-black/80`}>
                      {formatTime(row.logoutTime)}
                    </td>
                    <td className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm font-medium text-black`}>
                      {row.workingHours != null ? formatHoursToHMS(row.workingHours) : '-'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
