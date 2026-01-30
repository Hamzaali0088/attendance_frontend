'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { sendExcuse } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

export default function ExcuseRequestPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendExcuse(date, message);
      setSuccess(true);
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send excuse');
    } finally {
      setLoading(false);
    }
  };

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
  }, [router]);

  const user = getUser();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader title="Excuse Request" />
      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-6">
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/30">
            Excuse submitted successfully.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Date of absence</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Reason for absence..."
              className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black placeholder:text-black/50"
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Sending...' : 'Submit Excuse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
