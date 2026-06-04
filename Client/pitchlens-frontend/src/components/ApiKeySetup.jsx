import React, { useState } from 'react';

const SESSION_KEY = 'pfb_openai_key';
export function getOpenAIKey() { return sessionStorage.getItem(SESSION_KEY) || ''; }
export function setOpenAIKey(key) { sessionStorage.setItem(SESSION_KEY, key); }

export default function ApiKeySetup({ onSave }) {
  const [key, setKey]         = useState(getOpenAIKey());
  const [visible, setVisible] = useState(false);
  const [saved, setSaved]     = useState(false);

  const handleSave = () => {
    if (!key.trim()) return;
    setOpenAIKey(key.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave?.(); }, 800);
  };

  return (
    <div style={s.page}>
      {/* 배경 스포트라이트 */}
      <div style={s.spotlight} />

      <div style={s.wrap}>
        {/* 로고 */}
        <div style={s.logoArea}>
          <div style={s.logoIcon}>
            <MicIcon />
          </div>
          <h1 style={s.logoText}>PITCH<span style={{ color: 'var(--gold)' }}>LENS</span></h1>
          <p style={s.tagline}>AI 발표 코치 · 실력을 숫자로 증명하세요</p>
        </div>

        {/* 카드 */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardDot} />
            <span style={s.cardLabel}>API 연결</span>
          </div>

          <p style={s.desc}>
            OpenAI API 키를 입력하면 시작할 수 있습니다.<br />
            키는 이 세션에만 보관되며 서버로 전송되지 않습니다.
          </p>

          <div style={s.inputWrap}>
            <span style={s.inputIcon}>🔑</span>
            <input
              type={visible ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-..."
              style={s.input}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button style={s.eyeBtn} onClick={() => setVisible(v => !v)}>
              {visible ? '●' : '○'}
            </button>
          </div>

          <button
            style={{ ...s.btn, ...(saved ? s.btnDone : {}), opacity: key.trim() ? 1 : 0.4 }}
            onClick={handleSave}
            disabled={!key.trim()}
          >
            {saved ? '✓  연결 완료' : '연결하고 시작하기  →'}
          </button>
        </div>

        {/* 흐름 안내 */}
        <div style={s.flowRow}>
          {[
            { icon: '🖥', t: '브라우저', s: '키 보관' },
            { icon: '→', t: '', s: '' },
            { icon: '⚙️', t: '백엔드', s: '헤더 전달' },
            { icon: '→', t: '', s: '' },
            { icon: '🤖', t: 'OpenAI', s: 'Whisper · GPT-4' },
          ].map((item, i) =>
            item.t ? (
              <div key={i} style={s.flowItem}>
                <span style={s.flowIcon}>{item.icon}</span>
                <span style={s.flowLabel}>{item.t}</span>
                <span style={s.flowSub}>{item.s}</span>
              </div>
            ) : <span key={i} style={s.flowArrow}>{item.icon}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="11" y="2" width="10" height="16" rx="5" fill="var(--gold)" opacity="0.9"/>
      <path d="M6 16a10 10 0 0020 0" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="30" x2="21" y2="30" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' },
  spotlight: { position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  wrap: { width: '100%', maxWidth: 480, animation: 'fadeUp 0.6s ease' },
  logoArea: { textAlign: 'center', marginBottom: 40 },
  logoIcon: { width: 72, height: 72, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px var(--gold-glow)', animation: 'glow 3s ease infinite' },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: 4, color: 'var(--text)', marginBottom: 8 },
  tagline: { fontSize: 13, color: 'var(--text2)', letterSpacing: 1 },
  card: { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '32px 36px', marginBottom: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' },
  cardLabel: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 2 },
  desc: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 },
  inputWrap: { display: 'flex', alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '0 14px', marginBottom: 16, gap: 10 },
  inputIcon: { fontSize: 16, flexShrink: 0 },
  input: { flex: 1, background: 'none', border: 'none', padding: '14px 0', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-mono)' },
  eyeBtn: { background: 'none', border: 'none', color: 'var(--text3)', fontSize: 14, cursor: 'pointer', padding: '0 4px' },
  btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--gold), var(--gold2))', color: '#000', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: 1, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' },
  btnDone: { background: 'linear-gradient(135deg, var(--teal), #00A896)' },
  flowRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 },
  flowItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  flowIcon: { fontSize: 18 },
  flowLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text2)' },
  flowSub: { fontSize: 10, color: 'var(--text3)' },
  flowArrow: { fontSize: 14, color: 'var(--text3)', marginTop: -10 },
};
