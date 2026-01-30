'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getPendingExcuses, updateExcuseStatus } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { TableSkeleton } from '@/components/Skeleton';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExcuseApprovalsPage() {
  const router = useRouter();
  const [excuses, setExcuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const user = getUser();
    if (user?.role !== 'superadmin') {
      router.replace('/dashboard');
      return;
    }
    load();
  }, [router]);

  const load = async () => {
    try {
      const data = await getPendingExcuses();
      setExcuses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApprove = async () => {
    if (!confirmModal || confirmModal.action !== 'approve') return;
    const id = confirmModal.excuse._id;
    setConfirmModal(null);
    setActionLoading(id);
    try {
      await updateExcuseStatus(id, 'Approved');
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!confirmModal || confirmModal.action !== 'reject') return;
    const id = confirmModal.excuse._id;
    setConfirmModal(null);
    setActionLoading(id);
    try {
      await updateExcuseStatus(id, 'Rejected');
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
      <PageHeader title="Excuse Approvals" />
      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={4} className="max-h-[500px]" />
        ) : excuses.length === 0 ? (
          <div className="p-8 text-center text-black/70">No pending excuses.</div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-black/10">
              <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Message</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {excuses.map((excuse) => (
                  <tr key={excuse._id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-black">{excuse.userId?.username ?? '—'}</p>
                        <p className="text-sm text-black/70">{excuse.userId?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{formatDate(excuse.date)}</td>
                    <td className="px-4 py-3 text-sm text-black/80 max-w-xs">{excuse.message}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ action: 'approve', excuse })}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary"
                        >
                          {actionLoading === excuse._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ action: 'reject', excuse })}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-primary bg-white text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-50"
                        >
                          {actionLoading === excuse._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-black mb-2">
              {confirmModal.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
            </h3>
            <p className="text-sm text-black/80 mb-1">
              Employee: <span className="font-semibold text-black">{confirmModal.excuse.userId?.username ?? '—'}</span>
            </p>
            <p className="text-sm text-black/80 mb-1">
              Date: <span className="text-black">{formatDate(confirmModal.excuse.date)}</span>
            </p>
            {confirmModal.excuse.message && (
              <p className="text-sm text-black/80 mb-3 line-clamp-2">Message: {confirmModal.excuse.message}</p>
            )}
            <p className="text-black/90 mt-2">
              {confirmModal.action === 'approve'
                ? 'Are you sure you want to approve this excuse?'
                : 'Are you sure you want to reject this excuse?'}
            </p>
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
                onClick={confirmModal.action === 'approve' ? handleConfirmApprove : handleConfirmReject}
                disabled={!!actionLoading}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 border ${
                  confirmModal.action === 'approve'
                    ? 'bg-primary hover:bg-primary/90 border-primary'
                    : 'bg-black hover:bg-black/90 border-black'
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : confirmModal.action === 'approve' ? (
                  'Confirm Approve'
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
