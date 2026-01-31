/**
 * API client – all routes must match backend.
 *
 * Auth (mount: /api)
 *   POST /api/login                    → login()
 *   POST /api/register                 → signup()
 *
 * Attendance (mount: /api/attendance)
 *   GET /api/attendance                 → getAttendance(null, days)
 *   GET /api/attendance/:userId        → getAttendance(userId, days)
 *   GET /api/attendance/admin/all      → getAdminAllAttendance(days)
 *   POST /api/attendance/mark-arrival  → markArrival(userId, date)
 *   POST /api/attendance/mark-exit     → markExit(userId, date)
 *
 * Excuses (mount: /api/excuses)
 *   POST /api/excuses                  → sendExcuse(date, message)
 *   GET /api/excuses/pending           → getPendingExcuses()
 *   PATCH /api/excuses/:id             → updateExcuseStatus(id, status)
 *
 * Users (mount: /api/users)
 *   GET /api/users                     → getUsers()
 *   POST /api/users                    → createUser(...)
 *   PATCH /api/users/:userId          → updateUser(userId, {...})
 *   PATCH /api/users/:userId/role     → updateUserRole(userId, role)
 *   DELETE /api/users/:userId         → deleteUser(userId)
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://attendancebackend-production-a8b2.up.railway.app';
};

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

async function parseJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: res.ok ? 'Invalid response' : 'Server error. Please try again.' };
  }
}

/** Local YYYY-MM-DD (avoids UTC date shift). */
function getLocalDateString(d = new Date()) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function login(email, password) {
  const res = await fetch(`${getBaseUrl()}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function signup(username, email, password) {
  const res = await fetch(`${getBaseUrl()}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function getAttendance(userId = null, days = 30) {
  const url = userId
    ? `${getBaseUrl()}/api/attendance/${userId}?days=${days}`
    : `${getBaseUrl()}/api/attendance?days=${days}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch attendance');
  return data;
}

export async function getAdminAllAttendance(days = 30) {
  const res = await fetch(`${getBaseUrl()}/api/attendance/admin/all?days=${days}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch attendance');
  return data;
}

export async function markArrival(userId, date = null) {
  const res = await fetch(`${getBaseUrl()}/api/attendance/mark-arrival`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ userId, date: date || getLocalDateString() }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to mark arrival');
  return data;
}

export async function markExit(userId, date = null) {
  const res = await fetch(`${getBaseUrl()}/api/attendance/mark-exit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ userId, date: date || getLocalDateString() }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to mark exit');
  return data;
}

export async function sendExcuse(date, message) {
  const res = await fetch(`${getBaseUrl()}/api/excuses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ date, message }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to send excuse');
  return data;
}

export async function getPendingExcuses() {
  const res = await fetch(`${getBaseUrl()}/api/excuses/pending`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch excuses');
  return data;
}

export async function updateExcuseStatus(id, status) {
  const res = await fetch(`${getBaseUrl()}/api/excuses/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update excuse');
  return data;
}

export async function getUsers() {
  const res = await fetch(`${getBaseUrl()}/api/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
  return data;
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${getBaseUrl()}/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ role }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update role');
  return data;
}

export async function createUser(username, email, password, role = 'user') {
  const res = await fetch(`${getBaseUrl()}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ username, email, password, role }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to create user');
  return data;
}

export async function updateUser(userId, { username, email, role, password }) {
  const body = { username, email, role };
  if (password != null && password.length > 0) body.password = password;
  const res = await fetch(`${getBaseUrl()}/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update user');
  return data;
}

export async function deleteUser(userId) {
  const res = await fetch(`${getBaseUrl()}/api/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to delete user');
  return data;
}

// Rules / Policy (mount: /api/rules)
export async function getRules() {
  const res = await fetch(`${getBaseUrl()}/api/rules`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch rules');
  return data;
}

export async function updateRules(content) {
  const res = await fetch(`${getBaseUrl()}/api/rules`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ content }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update rules');
  return data;
}

// Me / Account (mount: /api/me)
export async function updateMe(username) {
  const res = await fetch(`${getBaseUrl()}/api/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ username }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

export async function updateMyPassword(currentPassword, newPassword) {
  const res = await fetch(`${getBaseUrl()}/api/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update password');
  return data;
}
