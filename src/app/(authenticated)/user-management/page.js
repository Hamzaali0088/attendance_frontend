'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, UserPlus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import { getUsers, updateUserRole, createUser, updateUser, deleteUser } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { TableSkeleton } from '@/components/Skeleton';
import Modal from '@/components/Modal';

const ROLES = ['user', 'admin', 'superadmin'];

export default function AdminManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [addUserError, setAddUserError] = useState('');
  const [addUserShowPassword, setAddUserShowPassword] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', role: 'user', password: '' });
  const [editUserError, setEditUserError] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserShowPassword, setEditUserShowPassword] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteConfirmError, setDeleteConfirmError] = useState('');

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
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(userId);
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setRoleLoading(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    if (addUserForm.password.length < 6) {
      setAddUserError('Password must be at least 6 characters');
      return;
    }
    setAddUserLoading(true);
    try {
      await createUser(addUserForm.username, addUserForm.email, addUserForm.password, addUserForm.role);
      setAddUserOpen(false);
      setAddUserForm({ username: '', email: '', password: '', role: 'user' });
      await loadUsers();
    } catch (err) {
      setAddUserError(err.message || 'Failed to create user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const openEditUser = (u) => {
    setEditingUserId(u._id);
    setEditUserForm({ username: u.username, email: u.email, role: u.role, password: '' });
    setEditUserError('');
    setEditUserOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditUserError('');
    if (editUserForm.password.length > 0 && editUserForm.password.length < 6) {
      setEditUserError('Password must be at least 6 characters');
      return;
    }
    setEditUserLoading(true);
    try {
      await updateUser(editingUserId, {
        username: editUserForm.username,
        email: editUserForm.email,
        role: editUserForm.role,
        password: editUserForm.password || undefined,
      });
      setEditUserOpen(false);
      setEditingUserId(null);
      await loadUsers();
    } catch (err) {
      setEditUserError(err.message || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeleteConfirmError('');
    setDeleteLoading(userId);
    try {
      await deleteUser(userId);
      await loadUsers();
      setDeleteConfirmUser(null);
    } catch (err) {
      setDeleteConfirmError(err.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  const currentUser = getUser();
  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="User Management" />
      <div className="flex flex-wrap items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            setAddUserOpen(true);
            setAddUserError('');
            setAddUserForm({ username: '', email: '', password: '', role: 'user' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 border border-primary shadow-card"
        >
          <UserPlus className="w-5 h-5" />
          Add user
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary overflow-hidden">
        {usersLoading ? (
          <>
            {/* Mobile skeleton cards */}
            <div className="md:hidden p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-black/10 border-t-4 border-t-primary bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-black/10 animate-pulse" />
                      <div className="h-4 w-40 rounded bg-black/10 animate-pulse" />
                    </div>
                    <div className="h-9 w-24 rounded-lg bg-black/10 animate-pulse" />
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <div className="h-9 w-full rounded-lg bg-black/10 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-9 w-20 rounded-lg bg-black/10 animate-pulse" />
                      <div className="h-9 w-20 rounded-lg bg-black/10 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table skeleton */}
            <div className="hidden md:block">
              <TableSkeleton
                rows={6}
                cols={5}
                headers={['Username', 'Email', 'Role', 'Change role', 'Actions']}
                className="max-h-[500px]"
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {users.map((u) => (
                <div key={u._id} className="rounded-xl border border-black/10 border-t-4 border-t-primary bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-black truncate">{u.username}</p>
                      <p className="text-sm text-black/70 truncate">{u.email}</p>
                    </div>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30 shrink-0">
                      {u.role}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-black/70 uppercase mb-1">Change role</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={!!roleLoading}
                          className="flex-1 rounded-lg border border-black/20 text-sm px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        {roleLoading === u._id && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditUser(u)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-black/20 bg-white text-black text-sm font-medium hover:bg-black/5"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmUser(u);
                          setDeleteConfirmError('');
                        }}
                        disabled={deleteLoading === u._id || String(currentUser?.id) === String(u._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary bg-white text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-50"
                        title={String(currentUser?.id) === String(u._id) ? 'Cannot delete yourself' : 'Delete user'}
                      >
                        {deleteLoading === u._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-black/10">
                <thead className="bg-white sticky top-0 z-[1] border-b border-black/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Change role</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-black">{u.username}</td>
                      <td className="px-4 py-3 text-sm text-black/80">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={!!roleLoading}
                          className="rounded-lg border border-black/20 text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary focus:border-primary text-black disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        {roleLoading === u._id && (
                          <Loader2 className="w-4 h-4 inline-block ml-2 animate-spin text-primary" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditUser(u)}
                            className="p-2 rounded-lg text-black hover:bg-primary/10 hover:text-primary"
                            title="Edit user"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmUser(u);
                              setDeleteConfirmError('');
                            }}
                            disabled={deleteLoading === u._id || String(currentUser?.id) === String(u._id)}
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-50"
                            title={String(currentUser?.id) === String(u._id) ? 'Cannot delete yourself' : 'Delete user'}
                          >
                            {deleteLoading === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {deleteConfirmUser && (
        <Modal
          open={!!deleteConfirmUser}
          onClose={() => {
            if (!deleteLoading) {
              setDeleteConfirmUser(null);
              setDeleteConfirmError('');
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-black mb-2">Delete user</h3>
            <p className="text-sm text-black/80 mb-1">
              You are about to delete:{' '}
              <span className="font-semibold text-black">
                {deleteConfirmUser.username} ({deleteConfirmUser.email})
              </span>
            </p>
            <p className="text-sm text-black/70 mt-2">
              This action cannot be undone.
            </p>

            {deleteConfirmError && (
              <div className="mt-4 p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">
                {deleteConfirmError}
              </div>
            )}

            <div className="flex gap-2 mt-6 justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmUser(null);
                  setDeleteConfirmError('');
                }}
                disabled={!!deleteLoading}
                className="px-4 py-2 rounded-lg border border-black/20 bg-white text-black text-sm font-medium hover:bg-black/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser._id)}
                disabled={!!deleteLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary"
              >
                {deleteLoading === deleteConfirmUser._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {addUserOpen && (
        <Modal open={!!addUserOpen} onClose={() => setAddUserOpen(false)}>
          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">Add user</h3>
              <button type="button" onClick={() => setAddUserOpen(false)} className="p-2 rounded-lg hover:bg-black/5 text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              {addUserError && (
                <div className="p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">{addUserError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Username</label>
                <input
                  type="text"
                  value={addUserForm.username}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Password</label>
                <div className="relative">
                  <input
                    type={addUserShowPassword ? 'text' : 'password'}
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full rounded-lg border border-black/20 px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setAddUserShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-black/60 hover:text-black"
                    aria-label={addUserShowPassword ? 'Hide password' : 'Show password'}
                  >
                    {addUserShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Role</label>
                <select
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAddUserOpen(false)} className="flex-1 py-2 rounded-lg border border-primary bg-white text-primary font-medium hover:bg-primary/5">
                  Cancel
                </button>
                <button type="submit" disabled={addUserLoading} className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary">
                  {addUserLoading ? 'Creating...' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {editUserOpen && (
        <Modal open={!!editUserOpen} onClose={() => setEditUserOpen(false)}>
          <div className="bg-white rounded-xl shadow-card border border-black/10 border-t-4 border-t-primary max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">Edit user</h3>
              <button type="button" onClick={() => setEditUserOpen(false)} className="p-2 rounded-lg hover:bg-black/5 text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editUserError && (
                <div className="p-3 rounded-lg bg-black/10 text-black text-sm border border-black/20">{editUserError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Username</label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">New password (leave blank to keep)</label>
                <div className="relative">
                  <input
                    type={editUserShowPassword ? 'text' : 'password'}
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-black/20 px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setEditUserShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-black/60 hover:text-black"
                    aria-label={editUserShowPassword ? 'Hide password' : 'Show password'}
                  >
                    {editUserShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-black/20 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-black"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditUserOpen(false)} className="flex-1 py-2 rounded-lg border border-primary bg-white text-primary font-medium hover:bg-primary/5">
                  Cancel
                </button>
                <button type="submit" disabled={editUserLoading} className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 border border-primary">
                  {editUserLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
