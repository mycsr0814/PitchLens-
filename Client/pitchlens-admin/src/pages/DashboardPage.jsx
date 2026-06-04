import { useEffect, useState } from 'react';
import { getAdminStats } from '../utils/api';
import { formatNumber } from '../utils/format';
import { page, card } from '../styles/adminStyles';

const STAT_ITEMS = [
  { key: 'totalUsers', label: '전체 회원', color: 'var(--text)' },
  { key: 'userCount', label: '일반 사용자', color: 'var(--teal)' },
  { key: 'adminCount', label: '관리자', color: 'var(--gold)' },
  { key: 'totalPresentations', label: '전체 발표', color: 'var(--text)' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setStats(await getAdminStats());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <header style={page.header}>
        <p style={page.eyebrow}>OVERVIEW</p>
        <h1 style={page.title}>대시보드</h1>
        <p style={page.sub}>PitchLens 서비스 현황을 한눈에 확인합니다.</p>
      </header>

      {error && <p style={{ color: 'var(--red)', marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>불러오는 중...</p>
      ) : (
        <div style={card.grid}>
          {STAT_ITEMS.map((item) => (
            <div key={item.key} style={card.stat}>
              <p style={card.statLabel}>{item.label}</p>
              <p style={{ ...card.statValue, color: item.color }}>
                {formatNumber(stats?.[item.key])}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card.stat, maxWidth: 560 }}>
        <p style={card.statLabel}>안내</p>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
          관리자 계정은 DB에서 <code style={{ color: 'var(--teal)' }}>role = ADMIN</code>으로
          지정된 사용자입니다. 회원 관리에서 역할을 변경하거나, 발표 관리에서 전체 발표
          이력을 확인할 수 있습니다.
        </p>
      </div>
    </>
  );
}
