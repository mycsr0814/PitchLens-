import React, { useState } from 'react';
import useCompactLayout from '../hooks/useCompactLayout';
import { login } from '../utils/api';

export default function LoginPage({ onSuccess, onRegister }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');
  const compact                  = useCompactLayout();

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
    <div className="auth-page" style={{ ...s.page, ...(compact ? s.pageCompact : {}) }}>
      {/* ── 왼쪽 브랜드 패널 ── */}
      <div className="auth-brand" style={{ ...s.brand, ...(compact ? s.brandCompact : {}) }}>
        <div className="auth-brand-desktop-only" style={s.glow} />
        <div className="auth-brand-content" style={{ ...s.brandContent, ...(compact ? s.brandContentCompact : {}) }}>
          <div style={{ ...s.logo, ...(compact ? s.logoCompact : {}) }}>
            <MicIcon />
            <span style={{ ...s.logoText, ...(compact ? s.logoTextCompact : {}) }}>PITCH<span style={{ color: 'var(--gold)' }}>LENS</span></span>
          </div>
          <p className="auth-tagline auth-tagline--mobile" style={{ ...s.tagline, ...s.taglineCompact }}>
            발표를 분석하고 <span style={{ color: 'var(--gold)' }}>성장하세요.</span>
          </p>
          <div className="auth-tagline auth-tagline--desktop">
            <p style={s.tagline}>발표를 분석하고</p>
            <p style={{ ...s.tagline, color: 'var(--gold)', marginTop: -6 }}>성장하세요.</p>
          </div>
          <div className="auth-brand-desktop-only" style={s.featureList}>
            {FEATURES.map(f => (
              <div key={f} style={s.feature}>
                <div style={s.featureDot} />
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
          <div className="auth-brand-desktop-only"><Waveform /></div>
        </div>
        <span className="auth-brand-desktop-only" style={s.brandTag}>AI-Powered Presentation Coach</span>
      </div>

      {/* ── 오른쪽 폼 패널 ── */}
      <div className="auth-form-side" style={{ ...s.formSide, ...(compact ? s.formSideCompact : {}) }}>
        <div className="auth-form-wrap" style={{ ...s.formWrap, ...(compact ? s.formWrapCompact : {}) }}>
          <p style={{ ...s.eyebrow, ...(compact ? s.eyebrowCompact : {}) }}>ACCOUNT</p>
          <h2 style={{ ...s.formTitle, ...(compact ? s.formTitleCompact : {}) }}>로그인</h2>
          <p style={{ ...s.formSub, ...(compact ? s.formSubCompact : {}) }}>계속하려면 계정에 로그인하세요.</p>

          <form onSubmit={handleSubmit} style={{ ...s.form, ...(compact ? s.formCompact : {}) }}>
            <div style={s.field}>
              <label style={s.label}>이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                required
                style={{ ...s.input, ...(compact ? s.inputCompact : {}), ...(focused === 'email' ? s.inputFocused : {}) }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                required
                style={{ ...s.input, ...(compact ? s.inputCompact : {}), ...(focused === 'password' ? s.inputFocused : {}) }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
              />
            </div>

            {error && <div style={s.error}>{error}</div>}

            <button type="submit" disabled={loading} style={{ ...s.btn, ...(compact ? s.btnCompact : {}), ...(loading ? s.btnDisabled : {}) }}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div style={{ ...s.divider, ...(compact ? s.dividerCompact : {}) }}>
            <div style={s.divLine} />
            <span style={s.divText}>또는</span>
            <div style={s.divLine} />
          </div>

          <p style={{ ...s.registerRow, ...(compact ? s.registerRowCompact : {}) }}>
            계정이 없으신가요?{' '}
            <button onClick={onRegister} style={s.linkBtn}>회원가입 →</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  '슬라이드별 발표 녹음 및 전사',
  'GPT-4 기반 맞춤형 피드백',
  '발표 속도 · 필러어 자동 분석',
  '발표 이력 및 성장 추적',
];

function MicIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <rect x="11" y="2" width="10" height="16" rx="5" fill="var(--gold)" opacity="0.9"/>
      <path d="M6 16a10 10 0 0020 0" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="30" x2="21" y2="30" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function Waveform() {
  const heights = [12, 20, 32, 24, 44, 28, 16, 36, 22, 14, 30, 18, 38, 24, 10, 28, 20, 40];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.18, marginTop: 8 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: 'var(--gold)' }} />
      ))}
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh' },
  pageCompact: {
    minHeight: '100svh',
    flexDirection: 'column',
    padding: '50px 20px 22px',
    overflowY: 'auto',
    background: 'linear-gradient(180deg, #0B0F17 0%, #080A0E 54%, #0B0F17 100%)',
  },

  brand: {
    width: '44%',
    background: 'linear-gradient(145deg, #0D1117 0%, var(--surface) 40%, #0D1520 100%)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 52px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandCompact: {
    width: '100%',
    borderRight: 'none',
    padding: 0,
    background: 'transparent',
    overflow: 'visible',
    flexShrink: 0,
  },
  glow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,166,35,0.13) 0%, transparent 68%)',
    pointerEvents: 'none',
  },
  brandContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
    position: 'relative',
    zIndex: 1,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  brandContentCompact: {
    gap: 12,
    marginTop: 0,
    marginBottom: 0,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoCompact: { gap: 9 },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: 40,
    letterSpacing: 4,
    color: 'var(--text)',
  },
  logoTextCompact: {
    fontSize: 30,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.3,
    fontFamily: 'var(--font-body)',
  },
  taglineCompact: {
    maxWidth: 300,
    fontSize: 22,
    lineHeight: 1.25,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 13 },
  feature: { display: 'flex', alignItems: 'center', gap: 12 },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--teal)',
    flexShrink: 0,
    boxShadow: '0 0 8px var(--teal)',
  },
  featureText: { fontSize: 14, color: 'var(--text2)', fontFamily: 'var(--font-body)' },
  brandTag: {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text3)',
    letterSpacing: 2,
    position: 'relative',
    zIndex: 1,
  },

  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    background: 'var(--bg)',
  },
  formSideCompact: {
    display: 'block',
    padding: '26px 0 0',
    background: 'transparent',
    flex: '0 1 auto',
  },
  formWrap: { width: '100%', maxWidth: 420 },
  formWrapCompact: {
    maxWidth: 'none',
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--gold)',
    letterSpacing: 3,
    marginBottom: 12,
  },
  eyebrowCompact: {
    marginBottom: 8,
    letterSpacing: 2.5,
  },
  formTitle: { fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  formTitleCompact: {
    fontSize: 34,
    lineHeight: 1.1,
  },
  formSub: {
    fontSize: 13,
    color: 'var(--text2)',
    fontFamily: 'var(--font-mono)',
    marginBottom: 36,
  },
  formSubCompact: {
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 1.55,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  formCompact: { gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text2)', letterSpacing: 1 },
  input: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputCompact: {
    minHeight: 52,
    padding: '14px 16px',
    fontSize: 16,
  },
  inputFocused: {
    border: '1px solid var(--gold)',
    boxShadow: '0 0 0 3px rgba(245,166,35,0.10)',
  },
  error: {
    background: 'rgba(255,80,80,0.08)',
    border: '1px solid rgba(255,80,80,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#ff6b6b',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
  },
  btn: {
    background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '14px',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 0 28px var(--gold-glow)',
    marginTop: 4,
    width: '100%',
  },
  btnCompact: {
    minHeight: 52,
    padding: '15px 16px',
    fontSize: 16,
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.72,
    cursor: 'wait',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' },
  dividerCompact: { margin: '22px 0' },
  divLine: { flex: 1, height: 1, background: 'var(--border)' },
  divText: { fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', flexShrink: 0 },
  registerRow: { fontSize: 14, color: 'var(--text2)', textAlign: 'center' },
  registerRowCompact: { fontSize: 15 },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--gold)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 34,
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    padding: '2px 4px',
    fontWeight: 600,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  },
};
