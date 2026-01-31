'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Save, Shield } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getToken, getUser, isAuthenticated, setAuth } from '@/lib/auth';
import { updateMe, updateMyPassword } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const user = getUser();

  const [username, setUsername] = useState(user?.username ?? '');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    // keep form in sync if localStorage user changes
    const u = getUser();
    if (u?.username) setUsername(u.username);
  }, []);

  const canSaveUsername = useMemo(() => {
    if (!user) return false;
    return username.trim().length > 0 && username.trim() !== user.username;
  }, [user, username]);

  const canSavePassword = useMemo(() => {
    return (
      currentPassword.length > 0 &&
      newPassword.length >= 6 &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword
    );
  }, [currentPassword, newPassword, confirmPassword]);

  const saveUsername = async (e) => {
    e.preventDefault();
    setUsernameMsg('');
    if (!canSaveUsername) return;
    setUsernameSaving(true);
    try {
      const updated = await updateMe(username.trim());
      // Update localStorage user so sidebar/header reflect instantly
      setAuth(getToken(), updated);
      setUsernameMsg('Username updated.');
    } catch (err) {
      setUsernameMsg(err.message || 'Failed to update username');
    } finally {
      setUsernameSaving(false);
      setTimeout(() => setUsernameMsg(''), 3000);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (!canSavePassword) {
      setPasswordMsg('Please enter current password and a new password (min 6) and confirm it.');
      return;
    }
    setPasswordSaving(true);
    try {
      await updateMyPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg('Password updated.');
    } catch (err) {
      setPasswordMsg(err.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordMsg(''), 4000);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Settings" />

      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-6">
        <h2 className="text-lg font-bold text-black mb-1">Profile</h2>
        <p className="text-sm text-black/70 mb-4">Update your username.</p>

        <form onSubmit={saveUsername} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
              placeholder="Your name"
            />
          </div>

          {usernameMsg && (
            <div className="p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">
              {usernameMsg}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSaveUsername || usernameSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 border border-primary shadow-card disabled:opacity-50"
            >
              {usernameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save username
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary p-6">
        <h2 className="text-lg font-bold text-black mb-1">Password</h2>
        <p className="text-sm text-black/70 mb-4">
          To change your own password, you must enter your current password.
          <span className="inline-flex items-center gap-1 ml-2 text-black/70">
            <Shield className="w-4 h-4 text-primary" /> Secure
          </span>
        </p>

        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-black/20 px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-black/60 hover:text-black"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">New password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-black/20 px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                placeholder="Min 6 characters"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-black/60 hover:text-black"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-black/20 px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                placeholder="Repeat new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-black/60 hover:text-black"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-primary mt-1">Passwords do not match.</p>
            )}
          </div>

          {passwordMsg && (
            <div className="p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">
              {passwordMsg}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSavePassword || passwordSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 border border-primary shadow-card disabled:opacity-50"
            >
              {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

