'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Save, X } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getRules, updateRules } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Skeleton from '@/components/Skeleton';

function formatUpdatedAt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RulesPage() {
  const router = useRouter();
  const user = getUser();
  const isSuperAdmin = user?.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getRules();
      setDoc(data);
      setDraft(data?.content ?? '');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const meta = useMemo(() => {
    if (!doc) return null;
    const updatedBy = doc.updatedBy?.username ? doc.updatedBy.username : '—';
    const updatedAt = formatUpdatedAt(doc.updatedAt);
    return { updatedBy, updatedAt };
  }, [doc]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateRules(draft);
      setDoc(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Office Rules" />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full rounded-xl border border-black/10" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-black/70">
                Last updated: <span className="text-black">{meta?.updatedAt ?? '—'}</span>
              </p>
              <p className="text-sm text-black/70">
                Updated by: <span className="text-black">{meta?.updatedBy ?? '—'}</span>
              </p>
            </div>

            {isSuperAdmin && (
              <div className="flex gap-2">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 border border-primary shadow-card"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Rules
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setDraft(doc?.content ?? '');
                        setError('');
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-black/20 bg-white text-black font-medium hover:bg-black/5 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 border border-primary shadow-card disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
            {editing ? (
              <div className="p-5">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={18}
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black font-mono text-sm whitespace-pre-wrap"
                  placeholder="Write office rules here..."
                />
                <p className="text-xs text-black/60 mt-2">
                  Tip: You can paste the full policy text here. Formatting is preserved.
                </p>
              </div>
            ) : (
              <div className="p-5">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-black/90">
                  {doc?.content ?? '—'}
                </pre>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

