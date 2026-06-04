import { useState } from 'react';
import useCompactLayout from '../hooks/useCompactLayout';
import { login } from '../utils/api';
import { login as s } from '../styles/adminStyles';

const FEATURES = [
  '전체 회원 및 역할 관리',
  '발표·피드백 현황 모니터링',
  '서비스 통계 대시보드',
];

export default function LoginPage({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const compact = useCompactLayout();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...s.page, ...(compact ? s.pageCompact : {}) }}>
      <div style={{ ...s.brand, ...(compact ? s.brandCompact : {}) }}>
        {!compact && <div style={s.glow} />}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={s.eyebrow}>PITCHLENS</p>
          <h1 style={{ ...s.heroTitle, ...(compact ? s.heroTitleCompact : {}) }}>
            관리자<br />
            <span style={{ color: 'var(--teal)' }}>콘솔</span>
          </h1>
          <p style={{ ...s.heroSub, ...(compact ? s.heroSubCompact : {}) }}>
            {compact
              ? 'ADMIN 역할 계정으로 로그인하세요.'
              : '일반 사용자 앱과 분리된 관리 전용 화면입니다.'}
          </p>
          {!compact && (
            <ul style={s.featureList}>
              {FEATURES.map((f) => (
                <li key={f} style={s.featureItem}>
                  <span style={s.featureDot} />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ ...s.formSide, ...(compact ? s.formSideCompact : {}) }}>
        <div style={s.formWrap}>
          <p style={s.eyebrow}>ADMIN</p>
          <h2 style={s.title}>관리자 로그인</h2>
          <p style={s.sub}>ADMIN 역할이 부여된 계정만 접속할 수 있습니다.</p>

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                style={s.input}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                autoComplete="current-password"
                style={s.input}
              />
            </div>

            {error && <div style={s.error}>{error}</div>}

            <button type="submit" disabled={loading} style={s.submit}>
              {loading ? '확인 중...' : '관리자 로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
