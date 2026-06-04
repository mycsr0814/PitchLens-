import { useCallback, useEffect, useState } from 'react';
import useCompactLayout from '../hooks/useCompactLayout';
import {
  deleteUser,
  getAdminUsers,
  getMyInfo,
  updateUserRole,
} from '../utils/api';
import { formatDate } from '../utils/format';
import { page, table, badge, btn, listCard } from '../styles/adminStyles';

function RoleBadge({ role }) {
  return <span style={role === 'ADMIN' ? badge.admin : badge.user}>{role}</span>;
}

function UsersTable({ users, myId, busyId, onRoleChange, onDelete }) {
  return (
    <table style={table.table}>
      <thead>
        <tr>
          <th style={table.th}>ID</th>
          <th style={table.th}>이름</th>
          <th style={table.th}>이메일</th>
          <th style={table.th}>역할</th>
          <th style={table.th}>가입일</th>
          <th style={table.th}>관리</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.userId}>
            <td style={table.td}>{u.userId}</td>
            <td style={table.td}>{u.name}</td>
            <td style={table.td}>{u.email}</td>
            <td style={table.td}>
              <select
                value={u.role}
                disabled={busyId === u.userId || u.userId === myId}
                onChange={(e) => onRoleChange(u.userId, e.target.value)}
                style={btn.select}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </td>
            <td style={table.td}>{formatDate(u.createdAt)}</td>
            <td style={table.td}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <RoleBadge role={u.role} />
                <button
                  type="button"
                  disabled={busyId === u.userId || u.userId === myId}
                  onClick={() => onDelete(u)}
                  style={btn.danger}
                >
                  삭제
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsersMobileList({ users, myId, busyId, onRoleChange, onDelete }) {
  return (
    <div style={listCard.list}>
      {users.map((u) => (
        <div key={u.userId} style={listCard.item}>
          <div style={listCard.row}>
            <div>
              <p style={listCard.title}>{u.name || '(이름 없음)'}</p>
              <p style={listCard.sub}>{u.email}</p>
            </div>
            <RoleBadge role={u.role} />
          </div>
          <p style={listCard.sub}>ID {u.userId} · {formatDate(u.createdAt)}</p>
          <div style={listCard.actions}>
            <select
              value={u.role}
              disabled={busyId === u.userId || u.userId === myId}
              onChange={(e) => onRoleChange(u.userId, e.target.value)}
              style={{ ...btn.select, flex: 1 }}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              type="button"
              disabled={busyId === u.userId || u.userId === myId}
              onClick={() => onDelete(u)}
              style={btn.danger}
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsersPage() {
  const compact = useCompactLayout();
  const [users, setUsers] = useState([]);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, me] = await Promise.all([getAdminUsers(), getMyInfo()]);
      setUsers(list);
      setMyId(me.userId);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (userId, role) => {
    setBusyId(userId);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user) => {
    if (user.userId === myId) {
      alert('본인 계정은 삭제할 수 없습니다.');
      return;
    }
    if (!window.confirm(`"${user.email}" 회원을 삭제하시겠습니까?`)) return;

    setBusyId(user.userId);
    try {
      await deleteUser(user.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header style={page.header}>
        <p style={page.eyebrow}>USERS</p>
        <h1 style={page.title}>회원 관리</h1>
        <p style={page.sub}>가입 회원 목록, 역할 변경, 계정 삭제</p>
      </header>

      {error && <p style={{ color: 'var(--red)', marginBottom: 16, fontSize: 13 }}>{error}</p>}

      <div style={{ ...table.wrap, ...(compact ? { overflow: 'visible', background: 'transparent', border: 'none' } : {}) }}>
        {loading ? (
          <p style={table.empty}>불러오는 중...</p>
        ) : users.length === 0 ? (
          <p style={table.empty}>등록된 회원이 없습니다.</p>
        ) : compact ? (
          <UsersMobileList
            users={users}
            myId={myId}
            busyId={busyId}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        ) : (
          <UsersTable
            users={users}
            myId={myId}
            busyId={busyId}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
}
