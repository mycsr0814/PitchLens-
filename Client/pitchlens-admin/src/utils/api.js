export const API_BASE = import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'pitchlens_admin_token';
const NAME_KEY  = 'pitchlens_admin_name';
const ROLE_KEY  = 'pitchlens_admin_role';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function getAdminName() {
  return localStorage.getItem(NAME_KEY) || '';
}

export function getAdminRole() {
  return localStorage.getItem(ROLE_KEY) || '';
}

async function parseError(res) {
  const err = await res.json().catch(() => ({}));
  return err?.message || err?.detail || `서버 오류: ${res.status}`;
}

async function authFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return null;
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));

  const data = await res.json();
  const raw = data.token || '';
  setToken(raw.startsWith('Bearer ') ? raw.slice(7) : raw);
  if (data.name) localStorage.setItem(NAME_KEY, data.name);

  const role = data.role || (await getMyInfo()).role;
  localStorage.setItem(ROLE_KEY, role);

  if (role !== 'ADMIN') {
    removeToken();
    throw new Error('관리자 계정만 접속할 수 있습니다.');
  }

  return data;
}

export async function getMyInfo() {
  return authFetch('/api/v1/users/me');
}

function pickNumber(obj, ...keys) {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return null;
}

function countRoles(users) {
  let adminCount = 0;
  for (const u of users) {
    if (String(u.role || '').toUpperCase() === 'ADMIN') adminCount += 1;
  }
  return {
    adminCount,
    userCount: users.length - adminCount,
  };
}

/** 통계 API + 회원 목록으로 역할별 인원 보정 (서버 응답 필드 누락 대비) */
export async function getAdminStats() {
  const [raw, users] = await Promise.all([
    authFetch('/api/v1/admin/stats').catch(() => ({})),
    getAdminUsers().catch(() => []),
  ]);

  const fromUsers = countRoles(users);
  const totalUsers =
    pickNumber(raw, 'totalUsers', 'total_users', 'totalUser', 'userTotal') ??
    users.length;

  let adminCount = pickNumber(raw, 'adminCount', 'admin_count', 'admins', 'adminTotal');
  let userCount = pickNumber(raw, 'userCount', 'user_count', 'users', 'regularUsers');

  if (adminCount == null || userCount == null) {
    adminCount = fromUsers.adminCount;
    userCount = fromUsers.userCount;
  }

  const totalPresentations = pickNumber(
    raw,
    'totalPresentations',
    'total_presentations',
    'presentationCount',
  ) ?? 0;

  return {
    totalUsers,
    adminCount,
    userCount,
    totalPresentations,
  };
}

export async function getAdminUsers() {
  return authFetch('/api/v1/admin/users');
}

function normalizePresentation(row) {
  const content = row.feedbackContent ?? row.feedback_content ?? null;
  const hasFromApi = row.hasFeedback ?? row.has_feedback;
  const hasResult =
    row.hasFeedbackResult === true ||
    row.has_feedback_result === true ||
    row.feedbackResultId != null;

  const hasContent =
    content != null && String(content).trim() !== '';

  const hasFeedback = hasFromApi === true || hasResult || hasContent;

  return {
    ...row,
    presentationId: row.presentationId ?? row.presentation_id ?? row.id,
    feedbackContent: content,
    hasFeedback: Boolean(hasFeedback),
  };
}

export async function getAdminPresentations() {
  const list = await authFetch('/api/v1/admin/presentations');
  return (Array.isArray(list) ? list : []).map(normalizePresentation);
}

export async function getAdminPresentationDetail(presentationId) {
  return authFetch(`/api/v1/admin/presentations/${presentationId}`);
}

export async function updateUserRole(userId, role) {
  return authFetch(`/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId) {
  return authFetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/api/v1/users/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch {
    /* ignore */
  }
  removeToken();
}
